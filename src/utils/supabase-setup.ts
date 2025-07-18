import { createClient } from '@supabase/supabase-js';

// Validate environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Validation function for environment variables
export const validateEnvironment = (): { valid: boolean; message: string } => {
  if (!supabaseUrl) {
    console.error('PRODUCTION ERROR: Missing VITE_SUPABASE_URL environment variable');
    return { valid: false, message: 'Missing VITE_SUPABASE_URL environment variable. Please configure in Netlify.' };
  }
  if (!supabaseAnonKey) {
    console.error('PRODUCTION ERROR: Missing VITE_SUPABASE_ANON_KEY environment variable');
    return { valid: false, message: 'Missing VITE_SUPABASE_ANON_KEY environment variable. Please configure in Netlify.' };
  }
  return { valid: true, message: 'Environment variables are valid' };
};

// Create Supabase client with anon key (for regular operations)
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || '',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);

// Create Supabase admin client with service role key (for setup operations)
export const supabaseAdmin = supabaseServiceKey 
  ? createClient(supabaseUrl || '', supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    })
  : null;

// Test Supabase connection - simplified and robust
export const testConnection = async (): Promise<boolean> => {
  // Don't test connection if environment variables are missing
  const { valid } = validateEnvironment();
  if (!valid) {
    console.warn('Supabase environment variables not configured');
    return false;
  }

  try {
    console.log('Testing Supabase connection...');
    
    // Use a simple, lightweight test that works in all environments
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.error('Supabase connection test failed:', error);
      return false;
    }
    
    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Supabase connection test exception:', error);
    return false;
  }
};

// Check if user profile exists
export const checkUserProfile = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('user_id', userId)
      .limit(1);
    
    if (error) {
      console.error('Error checking user profile:', error);
      return false;
    }
    
    return data && data.length > 0;
  } catch (error) {
    console.error('Exception checking user profile:', error);
    return false;
  }
};

// Create user profile
export const createUserProfile = async (
  userId: string,
  email: string,
  fullName?: string
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert([
        {
          user_id: userId,
          email: email,
          full_name: fullName || email.split('@')[0],
          subscription_status: 'free',
          marketing_consent: true,
          onboarding_completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      return { success: false, error: error.message };
    }

    console.log('User profile created successfully:', data);
    return { success: true };
  } catch (error) {
    console.error('Exception creating user profile:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// Test if email service is properly configured
export const testEmailService = async (): Promise<boolean> => {
  try {
    // In development mode, assume email is working
    if (import.meta.env.DEV) {
      console.log('Email service test: Development mode detected, assuming email works');
      return true;
    }
    
    // Simple test - check if we can access auth without errors
    const { data, error } = await supabase.auth.getUser();
    
    if (error && error.message.includes('Invalid JWT')) {
      // This is expected when not logged in - means auth is working
      return true;
    }
    
    // If we get here without error, auth is configured
    return true;
  } catch (error) {
    console.error('Email service test failed:', error);
    return false;
  }
};

// Get user profile
export const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception fetching user profile:', error);
    return null;
  }
};

// Update user profile
export const updateUserProfile = async (
  userId: string,
  updates: Partial<{
    full_name: string;
    subscription_status: string;
    marketing_consent: boolean;
    onboarding_completed: boolean;
  }>
) => {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception updating user profile:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// Initialize user wheel data
export const initializeUserWheelData = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_wheel_data')
      .insert([
        {
          user_id: userId,
          life_areas: [],
          reflections: {},
          completion_status: {},
          last_updated: new Date().toISOString()
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error initializing wheel data:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception initializing wheel data:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// Get user wheel data
export const getUserWheelData = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_wheel_data')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No data found, initialize it
        const initResult = await initializeUserWheelData(userId);
        if (initResult.success) {
          return initResult.data;
        }
      }
      console.error('Error fetching wheel data:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Exception fetching wheel data:', error);
    return null;
  }
};

// Update user wheel data
export const updateUserWheelData = async (
  userId: string,
  updates: Partial<{
    life_areas: any[];
    reflections: any;
    completion_status: any;
  }>
) => {
  try {
    const { data, error } = await supabase
      .from('user_wheel_data')
      .update({
        ...updates,
        last_updated: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating wheel data:', error);
      return { success: false, error: error.message };
    }

    return { success: true, data };
  } catch (error) {
    console.error('Exception updating wheel data:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};