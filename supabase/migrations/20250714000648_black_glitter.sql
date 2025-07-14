/*
  # Email Collection Setup

  1. New Tables
    - `users` - Stores user information including email, name, and plan details
  
  2. Security
    - Enable RLS on `users` table
    - Add policy for authenticated users to read their own data
    - Add policy for authenticated users to insert their own data
    - Add policy for service role to manage all data
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  name VARCHAR NOT NULL,
  plan_type VARCHAR DEFAULT 'complete',
  signup_date TIMESTAMP DEFAULT NOW(),
  email_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own data"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Service role can manage all data"
  ON users
  FOR ALL
  TO service_role
  USING (true);

-- Create admin view for user statistics
CREATE OR REPLACE VIEW user_statistics AS
SELECT
  COUNT(*) AS total_users,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) AS signups_last_24h,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '7 days' THEN 1 END) AS signups_last_7d,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) AS signups_last_30d,
  COUNT(CASE WHEN email_verified = true THEN 1 END) AS verified_users,
  COUNT(CASE WHEN plan_type = 'complete' THEN 1 END) AS complete_plan_users
FROM users;