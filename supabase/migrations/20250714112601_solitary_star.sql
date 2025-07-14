/*
  # Fix Authentication System

  1. Create Profiles Table
    - Creates a profiles table linked to auth.users
    - Adds necessary columns for user data
    - Sets up foreign key constraints

  2. Security
    - Enables Row Level Security on profiles table
    - Creates policies for authenticated users to manage their own profiles
    - Creates policy for public user registration

  3. Automation
    - Creates trigger function for automatic profile creation on signup
    - Sets up trigger on auth.users table
*/

-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text,
  avatar_url text,
  subscription_status text DEFAULT 'free'::text,
  subscription_expires_at timestamp with time zone,
  marketing_consent boolean DEFAULT true,
  onboarding_completed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profile management
DO $$
BEGIN
  -- Drop existing policies to avoid conflicts
  DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
  
  -- Create new policies
  CREATE POLICY "Users can read own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
  
  CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);
  
  CREATE POLICY "Users can insert own profile"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
END
$$;

-- Create trigger function for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- If the profile already exists, just return the new user
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create stored procedures for database setup
CREATE OR REPLACE FUNCTION create_profiles_table()
RETURNS void AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    user_id uuid UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email text NOT NULL,
    full_name text,
    avatar_url text,
    subscription_status text DEFAULT 'free'::text,
    subscription_expires_at timestamp with time zone,
    marketing_consent boolean DEFAULT true,
    onboarding_completed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION enable_rls_on_profiles()
RETURNS void AS $$
BEGIN
  ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_profile_policies()
RETURNS void AS $$
BEGIN
  -- Drop existing policies to avoid conflicts
  DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
  DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
  
  -- Create new policies
  CREATE POLICY "Users can read own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);
  
  CREATE POLICY "Users can update own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);
  
  CREATE POLICY "Users can insert own profile"
    ON public.profiles
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_profile_trigger()
RETURNS void AS $$
BEGIN
  -- Create trigger function
  CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS trigger AS $$
  BEGIN
    INSERT INTO public.profiles (id, user_id, email, full_name, avatar_url)
    VALUES (
      NEW.id,
      NEW.id,
      NEW.email,
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
  EXCEPTION
    WHEN unique_violation THEN
      -- If the profile already exists, just return the new user
      RETURN NEW;
  END;
  $$ LANGUAGE plpgsql SECURITY DEFINER;
  
  -- Create trigger
  DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
  CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
END;
$$ LANGUAGE plpgsql;

-- Fix the users table RLS policies
DO $$
BEGIN
  -- Drop existing policies to avoid conflicts
  DROP POLICY IF EXISTS "Allow public user registration" ON public.users;
  DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
  DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
  
  -- Create new policies
  CREATE POLICY "Allow public user registration"
    ON public.users
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);
  
  CREATE POLICY "Users can read own profile"
    ON public.users
    FOR SELECT
    TO anon, authenticated
    USING (true);
  
  CREATE POLICY "Users can update own profile"
    ON public.users
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);
END
$$;