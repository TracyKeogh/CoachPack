import { createClient } from '@supabase/supabase-js';

// Validate environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Provide fallback values to prevent app from crashing
const FALLBACK_URL = 'https://placeholder.supabase.co';
const FALLBACK_KEY = 'placeholder-key';

if (!supabaseUrl || !supabaseAnonKey) {
  if (import.meta.env.PROD) {
    console.error('CRITICAL: Missing Supabase environment variables in production');
  } else {
    console.error('Missing Supabase environment variables in development');
    console.error('Required: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
  }
}

// Only log in development
if (import.meta.env.DEV && supabaseUrl && supabaseAnonKey) {
  console.log('Supabase connection configured for development');
}

// Create Supabase client
export const supabase = createClient(
  supabaseUrl || FALLBACK_URL,
  supabaseAnonKey || FALLBACK_KEY
);

// Test Supabase connection
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.auth.getSession();
    
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

// User types
export interface User {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  subscription_status: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
  is_admin: boolean; // Added for admin protection
}

// Save user to database
export const saveUser = async (email: string, name: string, subscription_status: string = 'free'): Promise<{ data: User | null; error: Error | null }> => {
  try {
    console.log('Attempting to save user to Supabase:', { email, name, subscription_status });
    
    // Retry getting authenticated user up to 3 times
    let user = null;
    let authError = null;
    
    for (let i = 0; i < 3; i++) {
      console.log(`Auth attempt ${i + 1}/3`);
      const { data: { user: authUser }, error } = await supabase.auth.getUser();
      if (authUser) {
        user = authUser;
        console.log('Authentication successful:', authUser.id);
        break;
      }
      authError = error;
      console.log(`Auth attempt ${i + 1} failed, retrying...`);
      await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms before retry
    }
    
    if (!user) {
      console.error('No authenticated user found after retries:', authError);
      return { data: null, error: new Error('User must be authenticated first') };
    }

    // First, test the connection
    const isConnected = await testSupabaseConnection();
    if (!isConnected) {
      console.error('Cannot save user - Supabase connection failed');
      return { data: null, error: new Error('Supabase connection failed') };
    }
    
    // Log the exact data being sent
    const userData = { 
      user_id: user.id,  // Use the authenticated user's ID
      email, 
      full_name: name, 
      subscription_status,
      onboarding_completed: false
    };
    console.log('Sending user data to Supabase:', JSON.stringify(userData));
    
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([userData])
      .select()
      .single();
    
    if (error) {
      console.error('Error saving user to Supabase:', error);
      console.error('Error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      return { data: null, error };
    }
    
    console.log('User saved successfully:', data);
    return { data, error: null };
  } catch (error) {
    console.error('Exception during user save operation:', error);
    return { data: null, error: error as Error };
  }
};

// Get user by email
export const getUserByEmail = async (email: string): Promise<{ data: User | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('email', email)
      .single();
    
    if (error) {
      console.error('Error getting user:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Exception getting user:', error);
    return { data: null, error: error as Error };
  }
};

// Get all users (for admin)
export const getAllUsers = async (): Promise<{ data: User[] | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error getting all users:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception getting all users:', error);
    return { data: null, error: error as Error };
  }
};

// Get user statistics
export const getUserStatistics = async (): Promise<{ data: any | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('user_statistics')
      .select('*')
      .single();
    
    if (error) {
      console.error('Error getting user statistics:', error);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (error) {
    console.error('Exception getting user statistics:', error);
    return { data: null, error: error as Error };
  }
};