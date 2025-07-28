# CoachPack Admin System

## Overview
The CoachPack application includes an admin dashboard for managing users, viewing analytics, and performing administrative tasks.

## Admin Access

### How it works
- Admin access is controlled by the `is_admin` boolean field in the `user_profiles` table
- Users with `is_admin = true` can access the admin dashboard at `/admin`
- The admin dashboard shows user statistics, user management, and system tools

### Granting Admin Access

1. **Through Supabase Dashboard:**
   - Go to your Supabase project dashboard
   - Navigate to Table Editor → user_profiles
   - Find the user by email
   - Set `is_admin` to `true`

2. **Through SQL:**
   ```sql
   UPDATE user_profiles 
   SET is_admin = true 
   WHERE email = 'your-admin-email@example.com';
   ```

3. **Using the provided scripts:**
   - Use `scripts/grant-admin.sql` for a single user
   - Use `scripts/admin-management.sql` for comprehensive management

### Admin Features

The admin dashboard (`/admin`) provides:
- **User Statistics**: Total users, recent signups, verified users
- **User Management**: Search, filter, and view all users
- **Email Testing**: Test email service functionality
- **Subscription Monitoring**: Track user subscription statuses

### Database Migration

The admin functionality requires the `is_admin` column in the `user_profiles` table. This is handled by the migration file:
`supabase/migrations/20250716124157_add_is_admin_to_user_profiles.sql`

### Security

- Admin routes are protected with authentication checks
- Users must be logged in AND have `is_admin = true`
- Non-admin users will see an unauthorized message when trying to access admin routes

## Troubleshooting

If admin access isn't working:
1. Verify the user exists in `user_profiles` table
2. Check that `is_admin` is set to `true`
3. Ensure the user is properly authenticated
4. Check browser console for any errors