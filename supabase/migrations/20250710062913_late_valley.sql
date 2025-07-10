-- Check if the policy already exists before creating it
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_notes' AND policyname = 'Users can manage their own notes'
  ) THEN
    -- Create policy for users to manage their own notes
    CREATE POLICY "Users can manage their own notes"
      ON user_notes
      FOR ALL
      TO authenticated
      USING (user_id = auth.uid())
      WITH CHECK (user_id = auth.uid());
  END IF;
END
$$;

-- Create indexes for faster lookups if they don't exist
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