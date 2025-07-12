/*
  # Create user notes policy

  1. Security
     - Drop existing policy if it exists to avoid conflicts
     - Create policy for authenticated users to manage their own notes
*/

-- Drop the policy if it exists to avoid conflicts
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policy 
    WHERE polname = 'Users can manage their own notes' AND polrelid = 'user_notes'::regclass
  ) THEN
    DROP POLICY "Users can manage their own notes" ON user_notes;
  END IF;
END $$;

-- Create the policy
CREATE POLICY "Users can manage their own notes"
  ON user_notes
  FOR ALL
  TO authenticated
  USING (user_id = uid())
  WITH CHECK (user_id = uid());