import { createClient } from '@supabase/supabase-js';

// Validate environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Validation function for environment variables
export const validateEnvironment = (): { valid: boolean; message: string } => {
  if (!supabaseUrl) {
    return { valid: false, message: 'Missing VITE_SUPABASE_URL environment variable' };
  }
  if (!supabaseAnonKey) {
    return { valid: false, message: 'Missing VITE_SUPABASE_ANON_KEY environment variable' };
  }
  return { valid: true, message: 'Environment variables are valid' };
};

// Create Supabase client with anon key (for regular operations)
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Create Supabase admin client with service role key (for setup operations)
// This should only be used in secure contexts (like server-side or admin tools)
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl || '', supabaseServiceKey)
  : null;

// Test Supabase connection
export const testConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    
    console.log('Supabase connection successful:', data);
    return true;
  } catch (error) {
    console.error('Exception during Supabase connection test:', error);
    return false;
  }
};

// Test if email service is properly configured
export const testEmailService = async (): Promise<boolean> => {
  try {
    // In development mode, we'll assume email is working
    if (import.meta.env.DEV) {
      console.log('Email service test: Development mode detected, assuming email works');
      return true;
    }
    
    // For production, we'll check if Supabase is properly configured
    const { data, error } = await supabase.rpc('check_email_configuration');
    
    if (error) {
      console.error('Email service test failed:', error);
      return false;
    }
    
    console.log('Email service configuration check result:', data);
    return !!data;
  } catch (error) {
    console.error('Exception during email service test:', error);
    // Default to true to avoid blocking user actions if the check fails
    return true;
  }
};

// Database setup function (should only be run in development or by admin)
export const setupDatabase = async (): Promise<{ success: boolean; message: string }> => {
  if (!supabaseAdmin) {
    return { 
      success: false, 
      message: 'Cannot setup database: Service role key is required' 
    };
  }

  try {
    console.log('Setting up database...');
    
    // Create profiles table if it doesn't exist
    const { error: profilesError } = await supabaseAdmin.rpc('create_profiles_table');
    
    if (profilesError) {
      console.error('Error creating profiles table:', profilesError);
      
      // If the error is because the table already exists, we can continue
      if (!profilesError.message.includes('already exists')) {
        return { 
          success: false, 
          message: `Failed to create profiles table: ${profilesError.message}` 
        };
      }
    }
    
    // Enable Row Level Security on profiles table
    const { error: rlsError } = await supabaseAdmin.rpc('enable_rls_on_profiles');
    
    if (rlsError) {
      console.error('Error enabling RLS on profiles table:', rlsError);
      return { 
        success: false, 
        message: `Failed to enable RLS: ${rlsError.message}` 
      };
    }
    
    // Create RLS policies
    const { error: policiesError } = await supabaseAdmin.rpc('create_profile_policies');
    
    if (policiesError) {
      console.error('Error creating RLS policies:', policiesError);
      return { 
        success: false, 
        message: `Failed to create RLS policies: ${policiesError.message}` 
      };
    }
    
    // Create trigger for automatic profile creation
    const { error: triggerError } = await supabaseAdmin.rpc('create_profile_trigger');
    
    if (triggerError) {
      console.error('Error creating profile trigger:', triggerError);
      return { 
        success: false, 
        message: `Failed to create profile trigger: ${triggerError.message}` 
      };
    }
    
    console.log('Database setup completed successfully');
    return { 
      success: true, 
      message: 'Database setup completed successfully' 
    };
  } catch (error) {
    console.error('Exception during database setup:', error);
    return { 
      success: false, 
      message: `Database setup failed: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
};

// Function to create a user profile manually (fallback if trigger fails)
export const createUserProfile = async (
  userId: string, 
  email: string, 
  fullName?: string
): Promise<{ success: boolean; error: Error | null }> => {
  try {
    console.log('Creating user profile manually:', { userId, email, fullName });
    
    const { error } = await supabase.from('profiles').insert({
      id: userId,
      user_id: userId,
      email,
      full_name: fullName || email.split('@')[0],
      updated_at: new Date().toISOString()
    });
    
    if (error) {
      // If it's a duplicate key error, it's not a critical failure
      if (error.message?.includes('duplicate key') || error.message?.includes('unique constraint')) {
        console.log('Profile already exists, not a critical error');
        return { success: true, error: null };
      }
      
      console.error('Error creating user profile:', error);
      return { success: false, error: new Error(error.message) };
    }
    
    return { success: true, error: null };
  } catch (error) {
    console.error('Exception creating user profile:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error : new Error(String(error)) 
    };
  }
};

// Function to check if a user profile exists
export const checkUserProfile = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single();
    
    if (error) {
      return false;
    }
    
    return !!data;
  } catch (error) {
    console.error('Error checking user profile:', error);
    return false;
  }
};

// SQL commands for database setup (for reference or manual execution)
export const SQL_COMMANDS = {
  CREATE_PROFILES_TABLE: `
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
  `,
  
  ENABLE_RLS: `
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
  `,
  
  CREATE_POLICIES: `
    -- Allow users to read their own profile
    CREATE POLICY "Users can read own profile"
      ON public.profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
    
    -- Allow users to update their own profile
    CREATE POLICY "Users can update own profile"
      ON public.profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);
    
    -- Allow users to insert their own profile
    CREATE POLICY "Users can insert own profile"
      ON public.profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);
  `,
  
  CREATE_TRIGGER: `
    -- Function to create a profile when a new user signs up
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
    
    -- Trigger to call the function when a new user is created
    DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
    CREATE TRIGGER on_auth_user_created
      AFTER INSERT ON auth.users
      FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
  `
};