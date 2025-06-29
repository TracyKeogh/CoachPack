/*
  # Authentication System for Coach Pack

  1. New Tables
    - `user_profiles` - Extended user information beyond Supabase auth
    - `user_subscriptions` - Track user subscription status
    - Update `wheel_signups` to link with authenticated users

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users only
    - Secure data access based on user ownership

  3. Features
    - User profiles with subscription tracking
    - Secure data isolation per user
    - Marketing consent tracking
*/

-- Create user profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  subscription_status text DEFAULT 'free' CHECK (subscription_status IN ('free', 'pro', 'lifetime')),
  subscription_expires_at timestamptz,
  marketing_consent boolean DEFAULT true,
  onboarding_completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Create user subscriptions table for tracking subscription history
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  subscription_type text NOT NULL CHECK (subscription_type IN ('pro', 'lifetime')),
  status text DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at timestamptz DEFAULT now(),
  expires_at timestamptz,
  stripe_subscription_id text,
  created_at timestamptz DEFAULT now()
);

-- Create user data tables for each feature
CREATE TABLE IF NOT EXISTS user_wheel_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  life_areas jsonb NOT NULL DEFAULT '[]',
  reflections jsonb DEFAULT '{}',
  completion_status jsonb DEFAULT '{}',
  last_updated timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS user_values_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  current_step integer DEFAULT 1,
  discovery_responses jsonb DEFAULT '{}',
  selected_values jsonb DEFAULT '[]',
  core_values jsonb DEFAULT '[]',
  supporting_values jsonb DEFAULT '[]',
  ranked_core_values jsonb DEFAULT '[]',
  value_definitions jsonb DEFAULT '{}',
  last_updated timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS user_vision_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  vision_items jsonb DEFAULT '[]',
  text_elements jsonb DEFAULT '[]',
  is_collage_edit_mode boolean DEFAULT false,
  last_updated timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

CREATE TABLE IF NOT EXISTS user_goals_data (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  current_step text DEFAULT 'annual',
  current_category_index integer DEFAULT 0,
  categories jsonb DEFAULT '["business", "body", "balance"]',
  annual_snapshot jsonb DEFAULT '{}',
  category_goals jsonb DEFAULT '{}',
  last_updated timestamptz DEFAULT now(),
  UNIQUE(user_id)
);

-- Update wheel_signups to optionally link with authenticated users
ALTER TABLE wheel_signups ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wheel_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_values_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_vision_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_goals_data ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can read own profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON user_profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policies for user_subscriptions
CREATE POLICY "Users can read own subscriptions"
  ON user_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own subscriptions"
  ON user_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Policies for user_wheel_data
CREATE POLICY "Users can manage own wheel data"
  ON user_wheel_data
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for user_values_data
CREATE POLICY "Users can manage own values data"
  ON user_values_data
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for user_vision_data
CREATE POLICY "Users can manage own vision data"
  ON user_vision_data
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policies for user_goals_data
CREATE POLICY "Users can manage own goals data"
  ON user_goals_data
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;
CREATE TRIGGER create_user_profile_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_profile();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add updated_at triggers
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS user_profiles_user_id_idx ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS user_subscriptions_user_id_idx ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS user_wheel_data_user_id_idx ON user_wheel_data(user_id);
CREATE INDEX IF NOT EXISTS user_values_data_user_id_idx ON user_values_data(user_id);
CREATE INDEX IF NOT EXISTS user_vision_data_user_id_idx ON user_vision_data(user_id);
CREATE INDEX IF NOT EXISTS user_goals_data_user_id_idx ON user_goals_data(user_id);