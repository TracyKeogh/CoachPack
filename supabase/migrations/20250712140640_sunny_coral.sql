/*
  # Safe user_notes policy creation

  1. Changes
     - Safely creates the "Users can manage their own notes" policy
     - Uses DROP IF EXISTS to prevent errors with existing policies
     - Ensures policy is only created once

  2. Security
     - Maintains row level security for user_notes table
     - Ensures users can only access their own notes
*/

-- First drop the policy if it exists to avoid conflicts
DROP POLICY IF EXISTS "Users can manage their own notes" ON public.user_notes;

-- Create the policy with proper user isolation
CREATE POLICY "Users can manage their own notes" ON public.user_notes
FOR ALL USING (user_id = auth.uid());