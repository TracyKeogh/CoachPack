/*
  # Debug Users RLS Policies

  1. New Policies
    - Add more permissive policies for the users table to debug RLS issues
    - Allow anonymous inserts to the users table
    - Allow service role to manage all data
  
  2. Security
    - These policies are for debugging only and should be replaced with proper policies later
*/

-- First, check if RLS is enabled
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' AND tablename = 'users' AND rowsecurity = true
  ) THEN
    -- Drop existing policies to avoid conflicts
    DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
    DROP POLICY IF EXISTS "Users can read own data" ON public.users;
    DROP POLICY IF EXISTS "Service role can manage all data" ON public.users;
    
    -- Create more permissive policies for debugging
    CREATE POLICY "Anyone can insert data" 
      ON public.users
      FOR INSERT 
      TO anon, authenticated
      WITH CHECK (true);
      
    CREATE POLICY "Anyone can read data" 
      ON public.users
      FOR SELECT 
      TO anon, authenticated
      USING (true);
      
    CREATE POLICY "Service role can manage all data" 
      ON public.users
      FOR ALL 
      TO service_role
      USING (true)
      WITH CHECK (true);
      
    RAISE NOTICE 'Updated RLS policies for users table';
  ELSE
    RAISE NOTICE 'RLS is not enabled on the users table';
  END IF;
END $$;