-- Fix user_notes policy by dropping it first if it exists
DROP POLICY IF EXISTS "Users can manage their own notes" ON user_notes;
CREATE POLICY "Users can manage their own notes" ON user_notes
FOR ALL USING (user_id = auth.uid());