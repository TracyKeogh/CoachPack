/*
  # Safely create user_notes policy

  1. Security
    - Checks if policy already exists before creating it
    - Ensures users can only manage their own notes
    - Enables row level security on the user_notes table
*/

-- Safely create the user_notes policy if it doesn't exist
DO $$    
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'user_notes'
    AND policyname = 'Users can manage their own notes'
  ) THEN
    CREATE POLICY "Users can manage their own notes" ON user_notes
    FOR ALL USING (auth.uid() = user_id);
  END IF;
END     $$;

-- Ensure RLS is enabled on user_notes table
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;