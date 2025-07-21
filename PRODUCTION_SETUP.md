# Coach Pack Production Setup Guide

## Environment Variables Required in Netlify

### Supabase Configuration
```
VITE_SUPABASE_URL=https://bqxypskdebsesfwpqrfv.supabase.co
VITE_SUPABASE_ANON_KEY=[your-supabase-anon-key]
VITE_SUPABASE_SERVICE_ROLE_KEY=[your-supabase-service-role-key]
```

### Stripe Configuration (LIVE MODE)
```
VITE_STRIPE_PUBLISHABLE_KEY=[your-stripe-live-publishable-key-pk_live_]
VITE_STRIPE_PRICE_ID=[your-stripe-live-price-id]
STRIPE_SECRET_KEY=[your-stripe-live-secret-key-sk_live_]
STRIPE_WEBHOOK_SECRET=[your-stripe-webhook-secret]
```

## How to Set Environment Variables in Netlify

1. **Log in to Netlify**: Go to https://app.netlify.com/
2. **Select your site**: Click on your Coach Pack site
3. **Go to Site settings**: Click "Site settings" button
4. **Navigate to Environment variables**: 
   - Click "Build & deploy" in sidebar
   - Click "Environment variables"
5. **Add each variable**:
   - Click "Add a variable"
   - Enter Key (e.g., `VITE_SUPABASE_URL`)
   - Enter Value (your actual key/URL)
   - Set scope to "All contexts" or "Production"
   - Click "Add variable"
6. **Trigger new deploy**: Go to "Deploys" tab and click "Trigger deploy"

## Production Checklist

### ✅ Environment Variables
- [ ] VITE_SUPABASE_URL set in Netlify
- [ ] VITE_SUPABASE_ANON_KEY set in Netlify
- [ ] VITE_SUPABASE_SERVICE_ROLE_KEY set in Netlify
- [ ] VITE_STRIPE_PUBLISHABLE_KEY set in Netlify (pk_live_)
- [ ] VITE_STRIPE_PRICE_ID set in Netlify
- [ ] STRIPE_SECRET_KEY set in Netlify (sk_live_)
- [ ] STRIPE_WEBHOOK_SECRET set in Netlify

### ✅ Supabase Email Configuration
1. Go to your Supabase project dashboard
2. Navigate to Authentication → Email Templates
3. Customize email templates for:
   - Email confirmation
   - Password reset
   - Magic link (if used)
4. Go to Authentication → Settings
5. Configure SMTP settings or use Supabase's email service
6. Test email delivery

### ✅ Stripe Configuration
1. Ensure you're using LIVE mode in Stripe dashboard
2. Create a product and price in Stripe
3. Copy the live price ID to VITE_STRIPE_PRICE_ID
4. Set up webhook endpoint: https://coachpack.org/functions/v1/stripe-webhook
5. Configure webhook events:
   - checkout.session.completed
   - customer.subscription.created
   - customer.subscription.updated
   - customer.subscription.deleted
   - payment_intent.succeeded

### ✅ Testing Production Flow
1. **Payment Flow**:
   - Go to https://coachpack.org/pricing
   - Click "Get Started Now"
   - Complete payment with real card (use small amount for testing)
   - Verify payment appears in Stripe dashboard

2. **User Registration**:
   - After payment, complete signup form
   - Check email for confirmation link
   - Click confirmation link
   - Verify redirect to login page

3. **Authentication**:
   - Sign in with new credentials
   - Verify access to dashboard
   - Test all features work

4. **Database Verification**:
   - Check Supabase dashboard for new user in auth.users
   - Verify user profile created in user_profiles table
   - Check payment data in Stripe tables

## Troubleshooting

### Blank Page Issues
- Check browser console for JavaScript errors
- Verify all environment variables are set in Netlify
- Ensure no typos in environment variable names
- Check that Supabase URL and keys are correct

### Email Not Sending
- Verify SMTP settings in Supabase
- Check Supabase logs for email delivery errors
- Test with different email providers
- Ensure email templates are configured

### Payment Issues
- Verify using live Stripe keys (pk_live_, sk_live_)
- Check webhook endpoint is accessible
- Verify price ID matches Stripe dashboard
- Test with real payment methods

### Authentication Issues
- Check Supabase RLS policies are enabled
- Verify user_profiles table exists and is accessible
- Check auth redirect URLs are correct
- Ensure session persistence is working

## Support
If you encounter issues, contact hello@coachpack.org with:
- Error messages from browser console
- Steps to reproduce the issue
- Environment (browser, device, etc.)