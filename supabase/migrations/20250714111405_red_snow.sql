/*
  # Authentication Policies

  1. User Management
    - Allow public registration
    - Allow users to read and update their own profiles
    - Allow service role to manage all data
  
  2. Security
    - Enable RLS on all tables
    - Add appropriate policies for each table
*/

-- Enable public registration
CREATE POLICY "Allow public user registration" ON public.users
FOR INSERT TO anon, authenticated
WITH CHECK (true);

-- Allow users to read their own profile
CREATE POLICY "Users can read own profile" ON public.users
FOR SELECT TO authenticated
USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON public.users
FOR UPDATE TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Allow service role to manage all data
CREATE POLICY "Service role can manage all data" ON public.users
FOR ALL TO service_role
USING (true)
WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Add policy for anonymous users to read public data
CREATE POLICY "Anyone can read public data" ON public.users
FOR SELECT TO anon
USING (true);