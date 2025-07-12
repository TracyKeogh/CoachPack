/*
  # Safe user_notes policy creation

  1. Security
    - Safely creates the user_notes policy if it doesn't exist
    - Uses auth.uid() to ensure users can only manage their own notes
    - Enables row level security on the user_notes table

  This migration uses a DO block to check if the policy already exists before
  attempting to create it, preventing errors when the policy is already present.
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
END $$;

-- Ensure RLS is enabled on user_notes table
ALTER TABLE user_notes ENABLE ROW LEVEL SECURITY;