/*
  # Create user notes table

  1. New Tables
    - `user_notes`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `content` (text)
      - `category` (text, enum-like check constraint)
      - `related_feature` (text, enum-like check constraint)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on `user_notes` table
    - Add policy for users to manage their own notes
    - Create index for faster lookups
*/

-- Only create the table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_notes') THEN
    -- Create user notes table
    CREATE TABLE user_notes (
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
    CREATE INDEX user_notes_user_id_idx ON user_notes(user_id);
    CREATE INDEX user_notes_related_feature_idx ON user_notes(related_feature);

    -- Add updated_at trigger
    CREATE TRIGGER update_user_notes_updated_at
      BEFORE UPDATE ON user_notes
      FOR EACH ROW
      EXECUTE FUNCTION update_updated_at();
  END IF;
END $$;