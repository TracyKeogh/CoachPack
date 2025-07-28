-- Add is_admin column to user_profiles table
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS is_admin boolean DEFAULT false;

-- Create index for admin queries
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_admin 
ON user_profiles(is_admin) 
WHERE is_admin = true;

-- Add comment for documentation
COMMENT ON COLUMN user_profiles.is_admin IS 'Indicates if user has administrative privileges';