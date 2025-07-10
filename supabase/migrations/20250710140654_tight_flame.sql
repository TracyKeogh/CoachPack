/*
  # Fix user_notes policy creation

  1. Changes
     - Add conditional check before creating policy for user_notes table
     - Use DO block with PL/pgSQL to check if policy exists before creating it
     - Ensures policy is only created if it doesn't already exist

  This migration fixes the "policy already exists" error by checking if the policy
  exists before attempting to create it.
*/

-- Check if policy exists before creating it
DO $$ 
BEGIN
  -- Check if the policy already exists
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'user_notes' 
    AND policyname = 'Users can manage their own notes'
  ) THEN
    -- Create the policy only if it doesn't exist
    CREATE POLICY "Users can manage their own notes"
      ON public.user_notes
      FOR ALL
      TO authenticated
      USING (user_id = uid())
      WITH CHECK (user_id = uid());
  END IF;
END $$;

-- Ensure RLS is enabled (this is idempotent and won't cause errors if already enabled)
ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;

-- Ensure indexes exist (using IF NOT EXISTS to avoid errors)
CREATE INDEX IF NOT EXISTS user_notes_user_id_idx ON public.user_notes USING btree (user_id);
CREATE INDEX IF NOT EXISTS user_notes_related_feature_idx ON public.user_notes USING btree (related_feature);