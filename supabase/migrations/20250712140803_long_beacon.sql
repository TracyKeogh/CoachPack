/*
  # Safe User Notes Policy Creation
  
  1. Policy Creation
    - Checks if the policy already exists before creating it
    - Uses system catalog tables to verify existence
    - Creates policy only if it doesn't already exist
  
  2. Security
    - Ensures users can only manage their own notes
    - Applies to ALL operations (SELECT, INSERT, UPDATE, DELETE)
*/

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