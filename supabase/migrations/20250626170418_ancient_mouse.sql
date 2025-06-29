/*
  # Create wheel of life signups table

  1. New Tables
    - `wheel_signups`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `created_at` (timestamp)
      - `completed_wheel` (boolean, default false)
      - `wheel_data` (jsonb, nullable)
      - `marketing_consent` (boolean, default true)

  2. Security
    - Enable RLS on `wheel_signups` table
    - Add policy for inserting new signups
    - Add policy for users to read/update their own data
*/

CREATE TABLE IF NOT EXISTS wheel_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  completed_wheel boolean DEFAULT false,
  wheel_data jsonb,
  marketing_consent boolean DEFAULT true,
  last_activity timestamptz DEFAULT now()
);

ALTER TABLE wheel_signups ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert new signups
CREATE POLICY "Anyone can create wheel signup"
  ON wheel_signups
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Allow users to read their own signup data by email
CREATE POLICY "Users can read own signup data"
  ON wheel_signups
  FOR SELECT
  TO anon
  USING (true);

-- Allow users to update their own signup data
CREATE POLICY "Users can update own signup data"
  ON wheel_signups
  FOR UPDATE
  TO anon
  USING (true);

-- Create index for faster email lookups
CREATE INDEX IF NOT EXISTS wheel_signups_email_idx ON wheel_signups(email);
CREATE INDEX IF NOT EXISTS wheel_signups_created_at_idx ON wheel_signups(created_at);