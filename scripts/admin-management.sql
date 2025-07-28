-- Admin Management Scripts for CoachPack
-- Use these scripts carefully in your Supabase SQL editor or through psql

-- 1. Grant admin privileges to a user by email
-- UPDATE user_profiles SET is_admin = true WHERE email = 'admin@example.com';

-- 2. Remove admin privileges from a user by email  
-- UPDATE user_profiles SET is_admin = false WHERE email = 'user@example.com';

-- 3. List all current admin users
SELECT 
    email,
    full_name,
    is_admin,
    subscription_status,
    created_at,
    updated_at
FROM user_profiles 
WHERE is_admin = true
ORDER BY created_at;

-- 4. List all users with their admin status
SELECT 
    email,
    full_name,
    is_admin,
    subscription_status,
    onboarding_completed,
    created_at
FROM user_profiles 
ORDER BY is_admin DESC, created_at DESC;

-- 5. Count admin vs regular users
SELECT 
    is_admin,
    COUNT(*) as user_count
FROM user_profiles 
GROUP BY is_admin;