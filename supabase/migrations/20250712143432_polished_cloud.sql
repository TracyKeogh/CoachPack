/*
  # Safe user_notes policy creation

  1. Security
    - Safely creates the "Users can manage their own notes" policy only if it doesn't exist
    - Ensures row level security is enabled on the user_notes table
    - Uses auth.uid() to restrict access to only the user's own notes
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
END   $$;

-- Ensure RLS is enabled on user_notes table
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;