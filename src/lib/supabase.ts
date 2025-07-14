import { createClient } from '@supabase/supabase-js';

// Validate environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}

// Create Supabase client
export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// User types
export interface User {
  id: string;
  email: string;
  name: string;
  plan_type: string;
  signup_date: string;
  email_verified: boolean;
  created_at: string;
}

// Save user to database
export const saveUser = async (email: string, name: string, plan_type: string = 'complete'): Promise<{ data: User | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([
        { email, name, plan_type }
      ])
      .select()
      .single();
    
    if (error) {
      console.error('Error saving user:', error);
      return { data: null, error };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Exception saving user:', error);
    return { data: null, error: error as Error };
  }
};

// Get user by email
export const getUserByEmail = async (email: string): Promise<{ data: User | null; error: Error | null }> => {
  try {
    const { data, error } = await supabase
      .from('users')
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
      .from('users')
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