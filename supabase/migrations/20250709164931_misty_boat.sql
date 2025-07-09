/*
  # Fix User Notes Table Migration

  This migration creates the user_notes table if it doesn't exist,
  and properly handles the case where policies and triggers might already exist.
  
  1. Features:
    - User notes with categories (insight, action, reflection, etc.)
    - Notes associated with specific features (wheel, values, vision, etc.)
    - Automatic timestamp updates
    
  2. Security:
    - Row Level Security (RLS) enabled
    - Policies to ensure users can only access their own notes
    
  3. Performance:
    - Indexes on user_id and related_feature for faster lookups
*/

-- Create user notes table
CREATE TABLE IF NOT EXISTS user_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  category text NOT NULL CHECK (category IN ('insight', 'action', 'reflection', 'gratitude', 'idea', 'other')),
  related_feature text NOT NULL CHECK (related_feature IN ('wheel', 'values', 'vision', 'goals', 'calendar', 'general')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists, then create new one
DROP POLICY IF EXISTS "Users can manage their own notes" ON user_notes;

CREATE POLICY "Users can manage their own notes"
  ON user_notes
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS user_notes_user_id_idx ON user_notes(user_id);
CREATE INDEX IF NOT EXISTS user_notes_related_feature_idx ON user_notes(related_feature);

-- Add updated_at trigger (only if the trigger doesn't already exist)
DROP TRIGGER IF EXISTS update_user_notes_updated_at ON user_notes;

CREATE TRIGGER update_user_notes_updated_at
  BEFORE UPDATE ON user_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();