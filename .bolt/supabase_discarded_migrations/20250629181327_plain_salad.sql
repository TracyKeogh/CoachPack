/*
  # Coach Pack Database Schema

  1. New Tables
    - `wheel_signups` - Stores email signups for the free wheel assessment
    - `user_profiles` - Extended user information and subscription status
    - `user_subscriptions` - Subscription details for paid users
    - `user_wheel_data` - Wheel of Life assessment data
    - `user_values_data` - Values clarification data
    - `user_vision_data` - Vision board data
    - `user_goals_data` - Goals and actions data
    - `user_notes` - User notes for different features
    - `stripe_customers` - Stripe customer mapping
    - `stripe_subscriptions` - Stripe subscription details
    - `stripe_orders` - One-time payment orders

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for anonymous users to create wheel signups
*/

-- Create enum types for subscription statuses
CREATE TYPE stripe_subscription_status AS ENUM (
  'not_started', 'incomplete', 'incomplete_expired', 'trialing', 
  'active', 'past_due', 'canceled', 'unpaid', 'paused'
);

CREATE TYPE stripe_order_status AS ENUM (
  'pending', 'completed', 'canceled'
);

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

CREATE INDEX wheel_signups_email_idx ON public.wheel_signups(email);
CREATE INDEX wheel_signups_created_at_idx ON public.wheel_signups(created_at);

-- Enable RLS
ALTER TABLE public.wheel_signups ENABLE ROW LEVEL SECURITY;

-- Policies for wheel_signups
CREATE POLICY "Anyone can create wheel signup" 
  ON public.wheel_signups FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Users can read own signup data" 
  ON public.wheel_signups FOR SELECT TO anon USING (true);

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

CREATE UNIQUE INDEX user_profiles_user_id_key ON public.user_profiles(user_id);
CREATE INDEX user_profiles_user_id_idx ON public.user_profiles(user_id);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Policies for user_profiles
CREATE POLICY "Users can insert own profile" 
  ON public.user_profiles FOR INSERT TO authenticated WITH CHECK (uid() = user_id);

CREATE POLICY "Users can read own profile" 
  ON public.user_profiles FOR SELECT TO authenticated USING (uid() = user_id);

CREATE POLICY "Users can update own profile" 
  ON public.user_profiles FOR UPDATE TO authenticated USING (uid() = user_id);

-- Create trigger for updated_at
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
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX user_subscriptions_user_id_idx ON public.user_subscriptions(user_id);

-- Enable RLS
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for user_subscriptions
CREATE POLICY "Users can insert own subscriptions" 
  ON public.user_subscriptions FOR INSERT TO authenticated WITH CHECK (uid() = user_id);

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

CREATE UNIQUE INDEX user_wheel_data_user_id_key ON public.user_wheel_data(user_id);
CREATE INDEX user_wheel_data_user_id_idx ON public.user_wheel_data(user_id);

-- Enable RLS
ALTER TABLE public.user_wheel_data ENABLE ROW LEVEL SECURITY;

-- Policies for user_wheel_data
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

CREATE UNIQUE INDEX user_values_data_user_id_key ON public.user_values_data(user_id);
CREATE INDEX user_values_data_user_id_idx ON public.user_values_data(user_id);

-- Enable RLS
ALTER TABLE public.user_values_data ENABLE ROW LEVEL SECURITY;

-- Policies for user_values_data
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

CREATE UNIQUE INDEX user_vision_data_user_id_key ON public.user_vision_data(user_id);
CREATE INDEX user_vision_data_user_id_idx ON public.user_vision_data(user_id);

-- Enable RLS
ALTER TABLE public.user_vision_data ENABLE ROW LEVEL SECURITY;

-- Policies for user_vision_data
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

CREATE UNIQUE INDEX user_goals_data_user_id_key ON public.user_goals_data(user_id);
CREATE INDEX user_goals_data_user_id_idx ON public.user_goals_data(user_id);

-- Enable RLS
ALTER TABLE public.user_goals_data ENABLE ROW LEVEL SECURITY;

-- Policies for user_goals_data
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

CREATE INDEX user_notes_user_id_idx ON public.user_notes(user_id);
CREATE INDEX user_notes_related_feature_idx ON public.user_notes(related_feature);

-- Enable RLS
ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;

-- Policies for user_notes
CREATE POLICY "Users can manage their own notes" 
  ON public.user_notes FOR ALL TO authenticated 
  USING (user_id = uid()) 
  WITH CHECK (user_id = uid());

-- Create trigger for updated_at
CREATE TRIGGER update_user_notes_updated_at
  BEFORE UPDATE ON public.user_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Stripe Customers
CREATE TABLE IF NOT EXISTS public.stripe_customers (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  customer_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX stripe_customers_user_id_key ON public.stripe_customers(user_id);

-- Enable RLS
ALTER TABLE public.stripe_customers ENABLE ROW LEVEL SECURITY;

-- Policies for stripe_customers
CREATE POLICY "Users can view their own customer data" 
  ON public.stripe_customers FOR SELECT TO authenticated 
  USING (user_id = uid() AND deleted_at IS NULL);

-- Stripe Subscriptions
CREATE TABLE IF NOT EXISTS public.stripe_subscriptions (
  id BIGSERIAL PRIMARY KEY,
  customer_id TEXT NOT NULL UNIQUE,
  subscription_id TEXT,
  price_id TEXT,
  current_period_start BIGINT,
  current_period_end BIGINT,
  cancel_at_period_end BOOLEAN DEFAULT false,
  payment_method_brand TEXT,
  payment_method_last4 TEXT,
  status stripe_subscription_status NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.stripe_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for stripe_subscriptions
CREATE POLICY "Users can view their own subscription data" 
  ON public.stripe_subscriptions FOR SELECT TO authenticated 
  USING (
    customer_id IN (
      SELECT customer_id FROM stripe_customers 
      WHERE user_id = uid() AND deleted_at IS NULL
    ) AND deleted_at IS NULL
  );

-- Stripe Orders (for one-time payments)
CREATE TABLE IF NOT EXISTS public.stripe_orders (
  id BIGSERIAL PRIMARY KEY,
  checkout_session_id TEXT NOT NULL,
  payment_intent_id TEXT NOT NULL,
  customer_id TEXT NOT NULL,
  amount_subtotal BIGINT NOT NULL,
  amount_total BIGINT NOT NULL,
  currency TEXT NOT NULL,
  payment_status TEXT NOT NULL,
  status stripe_order_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE public.stripe_orders ENABLE ROW LEVEL SECURITY;

-- Policies for stripe_orders
CREATE POLICY "Users can view their own order data" 
  ON public.stripe_orders FOR SELECT TO authenticated 
  USING (
    customer_id IN (
      SELECT customer_id FROM stripe_customers 
      WHERE user_id = uid() AND deleted_at IS NULL
    ) AND deleted_at IS NULL
  );

-- Create views for easier access to user data
CREATE OR REPLACE VIEW stripe_user_subscriptions AS
  SELECT 
    c.customer_id,
    s.subscription_id,
    s.status as subscription_status,
    s.price_id,
    s.current_period_start,
    s.current_period_end,
    s.cancel_at_period_end,
    s.payment_method_brand,
    s.payment_method_last4
  FROM 
    stripe_customers c
    JOIN stripe_subscriptions s ON c.customer_id = s.customer_id
  WHERE 
    c.deleted_at IS NULL AND s.deleted_at IS NULL;

CREATE OR REPLACE VIEW stripe_user_orders AS
  SELECT 
    c.customer_id,
    o.id as order_id,
    o.checkout_session_id,
    o.payment_intent_id,
    o.amount_subtotal,
    o.amount_total,
    o.currency,
    o.payment_status,
    o.status as order_status,
    o.created_at as order_date
  FROM 
    stripe_customers c
    JOIN stripe_orders o ON c.customer_id = o.customer_id
  WHERE 
    c.deleted_at IS NULL AND o.deleted_at IS NULL;

-- Set security definer on views
ALTER VIEW stripe_user_subscriptions OWNER TO postgres;
ALTER VIEW stripe_user_subscriptions SET SECURITY DEFINER;

ALTER VIEW stripe_user_orders OWNER TO postgres;
ALTER VIEW stripe_user_orders SET SECURITY DEFINER;

-- Create trigger to create user profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_user_profile();