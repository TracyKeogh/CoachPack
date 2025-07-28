-- Grant admin privileges to a user by email
-- Replace 'user@example.com' with the actual email address

UPDATE user_profiles 
SET is_admin = true, 
    updated_at = now()
WHERE email = 'user@example.com';

-- Verify the update
SELECT email, is_admin, updated_at 
FROM user_profiles 
WHERE email = 'user@example.com';