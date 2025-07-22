import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  appInfo: {
    name: 'Coach Pack Integration',
    version: '1.0.0',
  },
});

function generateTemporaryPassword(length = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

Deno.serve(async (req) => {
  const signature = req.headers.get('stripe-signature')!;
  const body = await req.text();
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err) {
    console.log(`❌ Webhook signature verification failed:`, err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  console.log(`✅ Webhook verified: ${event.type}`);

  try {
    await processWebhookEvent(event);
    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return new Response(`Webhook Error: ${error.message}`, { status: 500 });
  }
});

async function processWebhookEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
      break;
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await handleSubscriptionChange(event.data.object as Stripe.Subscription);
      break;
    case 'payment_intent.succeeded':
      await handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;
  const { email, name } = session.metadata || {};
  
  if (!customerId) {
    console.error('No customer ID in checkout session');
    return;
  }

  console.log(`Processing checkout completion for customer: ${customerId}, email: ${email}, name: ${name}`);

  // Create Supabase user if they don't exist
  let userId = await ensureSupabaseUser(email, name, customerId);
  
  if (!userId) {
    console.error('Failed to create or find Supabase user');
    return;
  }

  if (session.mode === 'subscription') {
    await syncCustomerSubscription(customerId);
  } else if (session.mode === 'payment' && session.payment_status === 'paid') {
    await createOrderRecord(session);
  }
}

async function ensureSupabaseUser(email: string, name: string, customerId: string): Promise<string | null> {
  if (!email || !name) {
    console.error('Missing email or name from session metadata');
    return null;
  }

  try {
    // Check if user already exists by email
    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const userExists = existingUsers.users.find(user => user.email === email);

    let userId: string;

    if (userExists) {
      userId = userExists.id;
      console.log(`User already exists: ${userId}`);
    } else {
      // Create new user with temporary password
      const tempPassword = generateTemporaryPassword();
      
      const { data: newUser, error: createUserError } = await supabase.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: false, // Allow immediate login
        user_metadata: {
          full_name: name,
        },
      });

      if (createUserError || !newUser.user) {
        console.error('Failed to create user:', createUserError);
        return null;
      }

      userId = newUser.user.id;
      console.log(`Created new user: ${userId}`);

      // Send password reset email so they can set their own password
      const { error: resetError } = await supabase.auth.admin.generateLink({
        type: 'recovery',
        email,
      });

      if (resetError) {
        console.warn('Failed to send password reset email:', resetError);
      } else {
        console.log('Password reset email sent to:', email);
      }
    }

    // Ensure customer mapping exists
    const { error: customerError } = await supabase
      .from('stripe_customers')
      .upsert({
        user_id: userId,
        customer_id: customerId,
      }, {
        onConflict: 'customer_id'
      });

    if (customerError) {
      console.error('Failed to create customer mapping:', customerError);
    }

    // Create or update user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .upsert({
        user_id: userId,
        full_name: name,
        subscription_status: 'pro',
        created_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id'
      });

    if (profileError) {
      console.error('Failed to create user profile:', profileError);
    }

    return userId;
    
  } catch (error) {
    console.error('Error ensuring Supabase user:', error);
    return null;
  }
}

async function handleSubscriptionChange(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;
  
  if (!customerId) {
    console.error('No customer ID in subscription');
    return;
  }

  await syncCustomerSubscription(customerId);
}

async function handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent) {
  if (paymentIntent.invoice) return;

  const customerId = paymentIntent.customer as string;
  
  if (!customerId) {
    console.error('No customer ID in payment intent');
    return;
  }

  await updateUserAccessFromPayment(customerId);
}

async function syncCustomerSubscription(customerId: string) {
  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      status: 'all',
      expand: ['data.default_payment_method'],
    });

    if (subscriptions.data.length === 0) {
      console.log(`No subscriptions found for customer: ${customerId}`);
      return;
    }

    const subscription = subscriptions.data[0];

    const { error: subError } = await supabase.from('stripe_subscriptions').upsert(
      {
        customer_id: customerId,
        subscription_id: subscription.id,
        price_id: subscription.items.data[0]?.price?.id ?? null,
        current_period_start: subscription.current_period_start
          ? new Date(subscription.current_period_start * 1000).toISOString()
          : null,
        current_period_end: subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null,
        cancel_at_period_end: subscription.cancel_at_period_end ?? false,
        ...(subscription.default_payment_method?.type === 'card'
          ? {
              payment_method_brand: subscription.default_payment_method.card?.brand ?? null,
              payment_method_last4: subscription.default_payment_method.card?.last4 ?? null,
            }
          : {}),
        status: subscription.status,
      },
      {
        onConflict: 'customer_id',
      },
    );

    if (subError) {
      console.error('Error syncing subscription:', subError);
      throw new Error('Failed to sync subscription in database');
    }

    await updateUserAccessFromSubscription(customerId, subscription.status);
    
    console.info(`Successfully synced subscription for customer: ${customerId}`);
  } catch (error) {
    console.error(`Failed to sync subscription for customer ${customerId}:`, error);
    throw error;
  }
}

async function createOrderRecord(session: Stripe.Checkout.Session) {
  try {
    const {
      id: checkout_session_id,
      payment_intent,
      amount_subtotal,
      amount_total,
      currency,
      payment_status,
      customer: customerId,
    } = session;

    const { error: orderError } = await supabase.from('stripe_orders').insert({
      checkout_session_id,
      payment_intent_id: payment_intent as string,
      customer_id: customerId as string,
      amount_subtotal: amount_subtotal || 0,
      amount_total: amount_total || 0,
      currency: currency || 'usd',
      payment_status: payment_status || 'unpaid',
      status: 'completed',
    });

    if (orderError) {
      console.error('Error inserting order:', orderError);
      throw new Error('Failed to create order record');
    }

    await updateUserAccessFromPayment(customerId as string);
    
    console.info(`Successfully processed one-time payment for session: ${checkout_session_id}`);
  } catch (error) {
    console.error('Error processing one-time payment:', error);
    throw error;
  }
}

async function updateUserAccessFromSubscription(customerId: string, status: string) {
  try {
    const { data: customerData, error: customerError } = await supabase
      .from('stripe_customers')
      .select('user_id')
      .eq('customer_id', customerId)
      .single();

    if (customerError || !customerData) {
      console.error('Error fetching customer data:', customerError);
      return;
    }

    const userId = customerData.user_id;

    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        subscription_status: status === 'active' ? 'pro' : 'free',
        subscription_expires_at: status === 'active' ? null : new Date().toISOString(),
      })
      .eq('user_id', userId);

    if (profileError) {
      console.error('Error updating user profile:', profileError);
    }

    console.info(`Updated access for user ${userId}: ${status}`);
  } catch (error) {
    console.error('Error updating user access from subscription:', error);
  }
}

async function updateUserAccessFromPayment(customerId: string) {
  try {
    const { data: customerData, error: customerError } = await supabase
      .from('stripe_customers')
      .select('user_id')
      .eq('customer_id', customerId)
      .single();

    if (customerError || !customerData) {
      console.error('Error fetching customer data:', customerError);
      return;
    }

    const userId = customerData.user_id;

    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        subscription_status: 'pro',
        subscription_expires_at: null,
      })
      .eq('user_id', userId);

    if (profileError) {
      console.error('Error updating user profile:', profileError);
    }

    console.info(`Updated lifetime access for user ${userId}`);
  } catch (error) {
    console.error('Error updating user access from payment:', error);
  }
}