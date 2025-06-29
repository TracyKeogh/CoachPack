/*
  # Core Application Schema
  
  This migration creates the core schema for the Coach Pack application.
  It includes tables for user data, wheel of life assessments, values clarification,
  vision boards, goals, and notes.
  
  All tables have row level security (RLS) enabled with appropriate policies.
*/

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create function to create user profile on signup
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (user_id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Wheel Signups (for free assessment)
CREATE TABLE IF NOT EXISTS public.wheel_signups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  completed_wheel BOOLEAN DEFAULT false,
  wheel_data JSONB,
  marketing_consent BOOLEAN DEFAULT true,
  last_activity TIMESTAMPTZ DEFAULT now(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Add indexes with IF NOT EXISTS checks
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'wheel_signups_email_idx') THEN
    CREATE INDEX wheel_signups_email_idx ON public.wheel_signups(email);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'wheel_signups_created_at_idx') THEN
    CREATE INDEX wheel_signups_created_at_idx ON public.wheel_signups(created_at);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.wheel_signups ENABLE ROW LEVEL SECURITY;

-- Policies for wheel_signups (drop if exists first)
DROP POLICY IF EXISTS "Anyone can create wheel signup" ON public.wheel_signups;
CREATE POLICY "Anyone can create wheel signup" 
  ON public.wheel_signups FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "Users can read own signup data" ON public.wheel_signups;
CREATE POLICY "Users can read own signup data" 
  ON public.wheel_signups FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "Users can update own signup data" ON public.wheel_signups;
CREATE POLICY "Users can update own signup data" 
  ON public.wheel_signups FOR UPDATE TO anon USING (true);

-- User Profiles
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'pro', 'lifetime')),
  subscription_expires_at TIMESTAMPTZ,
  marketing_consent BOOLEAN DEFAULT true,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'user_profiles_user_id_key') THEN
    CREATE UNIQUE INDEX user_profiles_user_id_key ON public.user_profiles(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'user_profiles_user_id_idx') THEN
    CREATE INDEX user_profiles_user_id_idx ON public.user_profiles(user_id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
CREATE POLICY "Users can insert own profile" 
  ON public.user_profiles FOR INSERT TO authenticated WITH CHECK (uid() = user_id);

DROP POLICY IF EXISTS "Users can read own profile" ON public.user_profiles;
CREATE POLICY "Users can read own profile" 
  ON public.user_profiles FOR SELECT TO authenticated USING (uid() = user_id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
CREATE POLICY "Users can update own profile" 
  ON public.user_profiles FOR UPDATE TO authenticated USING (uid() = user_id);

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON public.user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- User Subscriptions
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_type TEXT NOT NULL CHECK (subscription_type IN ('pro', 'lifetime')),
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'user_subscriptions_user_id_idx') THEN
    CREATE INDEX user_subscriptions_user_id_idx ON public.user_subscriptions(user_id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for user_subscriptions
DROP POLICY IF EXISTS "Users can insert own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users can insert own subscriptions" 
  ON public.user_subscriptions FOR INSERT TO authenticated WITH CHECK (uid() = user_id);

DROP POLICY IF EXISTS "Users can read own subscriptions" ON public.user_subscriptions;
CREATE POLICY "Users can read own subscriptions" 
  ON public.user_subscriptions FOR SELECT TO authenticated USING (uid() = user_id);

-- User Wheel Data
CREATE TABLE IF NOT EXISTS public.user_wheel_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  life_areas JSONB NOT NULL DEFAULT '[]'::jsonb,
  reflections JSONB DEFAULT '{}'::jsonb,
  completion_status JSONB DEFAULT '{}'::jsonb,
  last_updated TIMESTAMPTZ DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'user_wheel_data_user_id_key') THEN
    CREATE UNIQUE INDEX user_wheel_data_user_id_key ON public.user_wheel_data(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'user_wheel_data_user_id_idx') THEN
    CREATE INDEX user_wheel_data_user_id_idx ON public.user_wheel_data(user_id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.user_wheel_data ENABLE ROW LEVEL SECURITY;

-- Policies for user_wheel_data
DROP POLICY IF EXISTS "Users can manage own wheel data" ON public.user_wheel_data;
CREATE POLICY "Users can manage own wheel data" 
  ON public.user_wheel_data FOR ALL TO authenticated 
  USING (uid() = user_id) 
  WITH CHECK (uid() = user_id);

-- User Values Data
CREATE TABLE IF NOT EXISTS public.user_values_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  current_step INTEGER DEFAULT 1,
  discovery_responses JSONB DEFAULT '{}'::jsonb,
  selected_values JSONB DEFAULT '[]'::jsonb,
  core_values JSONB DEFAULT '[]'::jsonb,
  supporting_values JSONB DEFAULT '[]'::jsonb,
  ranked_core_values JSONB DEFAULT '[]'::jsonb,
  value_definitions JSONB DEFAULT '{}'::jsonb,
  last_updated TIMESTAMPTZ DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'user_values_data_user_id_key') THEN
    CREATE UNIQUE INDEX user_values_data_user_id_key ON public.user_values_data(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'user_values_data_user_id_idx') THEN
    CREATE INDEX user_values_data_user_id_idx ON public.user_values_data(user_id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.user_values_data ENABLE ROW LEVEL SECURITY;

-- Policies for user_values_data
DROP POLICY IF EXISTS "Users can manage own values data" ON public.user_values_data;
CREATE POLICY "Users can manage own values data" 
  ON public.user_values_data FOR ALL TO authenticated 
  USING (uid() = user_id) 
  WITH CHECK (uid() = user_id);

-- User Vision Data
CREATE TABLE IF NOT EXISTS public.user_vision_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  vision_items JSONB DEFAULT '[]'::jsonb,
  text_elements JSONB DEFAULT '[]'::jsonb,
  is_collage_edit_mode BOOLEAN DEFAULT false,
  last_updated TIMESTAMPTZ DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'user_vision_data_user_id_key') THEN
    CREATE UNIQUE INDEX user_vision_data_user_id_key ON public.user_vision_data(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'user_vision_data_user_id_idx') THEN
    CREATE INDEX user_vision_data_user_id_idx ON public.user_vision_data(user_id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.user_vision_data ENABLE ROW LEVEL SECURITY;

-- Policies for user_vision_data
DROP POLICY IF EXISTS "Users can manage own vision data" ON public.user_vision_data;
CREATE POLICY "Users can manage own vision data" 
  ON public.user_vision_data FOR ALL TO authenticated 
  USING (uid() = user_id) 
  WITH CHECK (uid() = user_id);

-- User Goals Data
CREATE TABLE IF NOT EXISTS public.user_goals_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  current_step TEXT DEFAULT 'annual',
  current_category_index INTEGER DEFAULT 0,
  categories JSONB DEFAULT '["business", "body", "balance"]'::jsonb,
  annual_snapshot JSONB DEFAULT '{}'::jsonb,
  category_goals JSONB DEFAULT '{}'::jsonb,
  last_updated TIMESTAMPTZ DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'user_goals_data_user_id_key') THEN
    CREATE UNIQUE INDEX user_goals_data_user_id_key ON public.user_goals_data(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'user_goals_data_user_id_idx') THEN
    CREATE INDEX user_goals_data_user_id_idx ON public.user_goals_data(user_id);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.user_goals_data ENABLE ROW LEVEL SECURITY;

-- Policies for user_goals_data
DROP POLICY IF EXISTS "Users can manage own goals data" ON public.user_goals_data;
CREATE POLICY "Users can manage own goals data" 
  ON public.user_goals_data FOR ALL TO authenticated 
  USING (uid() = user_id) 
  WITH CHECK (uid() = user_id);

-- User Notes
CREATE TABLE IF NOT EXISTS public.user_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('insight', 'action', 'reflection', 'gratitude', 'idea', 'other')),
  related_feature TEXT NOT NULL CHECK (related_feature IN ('wheel', 'values', 'vision', 'goals', 'calendar', 'general')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'user_notes_user_id_idx') THEN
    CREATE INDEX user_notes_user_id_idx ON public.user_notes(user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'user_notes_related_feature_idx') THEN
    CREATE INDEX user_notes_related_feature_idx ON public.user_notes(related_feature);
  END IF;
END $$;

-- Enable RLS
ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;

-- Policies for user_notes
DROP POLICY IF EXISTS "Users can manage their own notes" ON public.user_notes;
CREATE POLICY "Users can manage their own notes" 
  ON public.user_notes FOR ALL TO authenticated 
  USING (user_id = uid()) 
  WITH CHECK (user_id = uid());

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS update_user_notes_updated_at ON public.user_notes;
CREATE TRIGGER update_user_notes_updated_at
  BEFORE UPDATE ON public.user_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Create trigger to create user profile on signup (drop if exists first)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();