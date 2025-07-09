/*
  # Create user notes table

  1. New Tables
    - `user_notes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `title` (text, required)
      - `content` (text, required)
      - `category` (text, constrained values)
      - `related_feature` (text, constrained values)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_notes` table
    - Add policy for users to manage their own notes

  3. Indexes
    - Add indexes for user_id and related_feature for performance

  4. Triggers
    - Add updated_at trigger for automatic timestamp updates
*/

-- Create user notes table if it doesn't exist
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

-- Create policy for users to manage their own notes
CREATE POLICY "Users can manage their own notes"
  ON user_notes
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS user_notes_user_id_idx ON user_notes(user_id);
CREATE INDEX IF NOT EXISTS user_notes_related_feature_idx ON user_notes(related_feature);

-- Add updated_at trigger if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_user_notes_updated_at'
  ) THEN
    CREATE TRIGGER update_user_notes_updated_at
      BEFORE UPDATE ON user_notes
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END
$$;