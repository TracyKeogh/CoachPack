/*
  # Email Templates Configuration

  1. Email Templates
    - Password Reset template
    - Email Confirmation template
    - Magic Link template
  
  2. Configuration
    - Set up custom email templates for authentication flows
    - Add Coach Pack branding and styling
*/

-- Update the password reset email template
UPDATE auth.templates
SET template = '
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Coach Pack Password</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.5;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(to right, #8b5cf6, #6366f1);
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .content {
      background-color: #fff;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-top: none;
      border-radius: 0 0 8px 8px;
    }
    .button {
      display: inline-block;
      background-color: #8b5cf6;
      color: white;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      color: #6b7280;
      font-size: 14px;
    }
    .note {
      background-color: #f3f4f6;
      padding: 15px;
      border-radius: 6px;
      margin-top: 20px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Coach Pack</h1>
      <p>Intentional Living Made Actionable</p>
    </div>
    <div class="content">
      <h2>Reset Your Password</h2>
      <p>Hello,</p>
      <p>We received a request to reset your password for your Coach Pack account. Click the button below to set a new password:</p>
      
      <div style="text-align: center;">
        <a href="{{ .ConfirmationURL }}" class="button">Reset Password</a>
      </div>
      
      <p>If you didn''t request this password reset, you can safely ignore this email.</p>
      
      <div class="note">
        <p><strong>Important:</strong></p>
        <ul>
          <li>This link will expire in 24 hours</li>
          <li>For security, this link can only be used once</li>
          <li>If you have any issues, please contact support@coachpack.org</li>
        </ul>
      </div>
    </div>
    <div class="footer">
      <p>&copy; 2025 Coach Pack. All rights reserved.</p>
      <p>If you have any questions, please contact our support team at support@coachpack.org</p>
    </div>
  </div>
</body>
</html>
'
WHERE type = 'recovery';

-- Update the email confirmation template
UPDATE auth.templates
SET template = '
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm Your Coach Pack Email</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.5;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(to right, #8b5cf6, #6366f1);
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .content {
      background-color: #fff;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-top: none;
      border-radius: 0 0 8px 8px;
    }
    .button {
      display: inline-block;
      background-color: #8b5cf6;
      color: white;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      color: #6b7280;
      font-size: 14px;
    }
    .welcome {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Coach Pack</h1>
      <p>Intentional Living Made Actionable</p>
    </div>
    <div class="content">
      <p class="welcome">Welcome to Coach Pack!</p>
      <p>Thank you for signing up. Please confirm your email address to get full access to your account.</p>
      
      <div style="text-align: center;">
        <a href="{{ .ConfirmationURL }}" class="button">Confirm Email Address</a>
      </div>
      
      <p>If you didn''t create an account with us, you can safely ignore this email.</p>
    </div>
    <div class="footer">
      <p>&copy; 2025 Coach Pack. All rights reserved.</p>
      <p>If you have any questions, please contact our support team at support@coachpack.org</p>
    </div>
  </div>
</body>
</html>
'
WHERE type = 'confirmation';

-- Update the magic link template
UPDATE auth.templates
SET template = '
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Sign In to Coach Pack</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      line-height: 1.5;
      color: #333;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(to right, #8b5cf6, #6366f1);
      color: white;
      padding: 20px;
      text-align: center;
      border-radius: 8px 8px 0 0;
    }
    .content {
      background-color: #fff;
      padding: 30px;
      border: 1px solid #e5e7eb;
      border-top: none;
      border-radius: 0 0 8px 8px;
    }
    .button {
      display: inline-block;
      background-color: #8b5cf6;
      color: white;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      color: #6b7280;
      font-size: 14px;
    }
    .note {
      background-color: #f3f4f6;
      padding: 15px;
      border-radius: 6px;
      margin-top: 20px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Coach Pack</h1>
      <p>Intentional Living Made Actionable</p>
    </div>
    <div class="content">
      <h2>Sign In to Coach Pack</h2>
      <p>Click the button below to sign in to your Coach Pack account. No password required!</p>
      
      <div style="text-align: center;">
        <a href="{{ .ConfirmationURL }}" class="button">Sign In</a>
      </div>
      
      <div class="note">
        <p><strong>Important:</strong></p>
        <ul>
          <li>This link will expire in 24 hours</li>
          <li>For security, this link can only be used once</li>
          <li>If you didn''t request this email, you can safely ignore it</li>
        </ul>
      </div>
    </div>
    <div class="footer">
      <p>&copy; 2025 Coach Pack. All rights reserved.</p>
      <p>If you have any questions, please contact our support team at support@coachpack.org</p>
    </div>
  </div>
</body>
</html>
'
WHERE type = 'magic_link';

-- Add a function to check email configuration
CREATE OR REPLACE FUNCTION check_email_configuration()
RETURNS boolean AS $$
DECLARE
  email_enabled boolean;
BEGIN
  -- Check if SMTP is configured in auth.config
  SELECT EXISTS (
    SELECT 1 FROM auth.config 
    WHERE name = 'smtp_admin_email' AND value IS NOT NULL AND value != ''
  ) INTO email_enabled;
  
  RETURN email_enabled;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to log password reset attempts
CREATE OR REPLACE FUNCTION log_password_reset_attempt(user_email text)
RETURNS void AS $$
BEGIN
  INSERT INTO public.password_reset_logs (email, attempted_at, ip_address)
  VALUES (user_email, now(), current_setting('request.headers', true)::json->>'x-real-ip');
EXCEPTION
  WHEN others THEN
    -- If table doesn't exist yet, create it
    CREATE TABLE IF NOT EXISTS public.password_reset_logs (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email text NOT NULL,
      attempted_at timestamp with time zone DEFAULT now(),
      ip_address text,
      success boolean DEFAULT false
    );
    
    -- Try insert again
    INSERT INTO public.password_reset_logs (email, attempted_at, ip_address)
    VALUES (user_email, now(), current_setting('request.headers', true)::json->>'x-real-ip');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on password_reset_logs
ALTER TABLE IF EXISTS public.password_reset_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for password_reset_logs
CREATE POLICY "Only admins can view password reset logs"
  ON public.password_reset_logs
  FOR SELECT
  TO authenticated
  USING (auth.jwt() ->> 'role' = 'service_role');