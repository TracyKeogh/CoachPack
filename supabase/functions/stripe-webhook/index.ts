import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'Coach Pack Integration',
    version: '1.0.0',
  },
});

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

Deno.serve(async (req) => {
  try {
    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
      return new Response(null, { 
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, stripe-signature',
        }
      });
    }

    if (req.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 });
    }

    // get the signature from the header
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return new Response('No signature found', { status: 400 });
    }

    // get the raw body
    const body = await req.text();

    // verify the webhook signature
    let event: Stripe.Event;

    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, stripeWebhookSecret);
    } catch (error: any) {
      console.error(`Webhook signature verification failed: ${error.message}`);
      return new Response(`Webhook signature verification failed: ${error.message}`, { status: 400 });
    }

    // Process the event asynchronously
    EdgeRuntime.waitUntil(handleEvent(event));

    return Response.json({ received: true }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, stripe-signature',
      }
    });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});

async function handleEvent(event: Stripe.Event) {
  const stripeData = event?.data?.object ?? {};

  if (!stripeData) {
    return;
  }

  console.log(`Processing webhook event: ${event.type}`);

  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutSessionCompleted(stripeData as Stripe.Checkout.Session);
      break;
    
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted':
      await handleSubscriptionChange(stripeData as Stripe.Subscription);
      break;
    
    case 'payment_intent.succeeded':
      await handlePaymentIntentSucceeded(stripeData as Stripe.PaymentIntent);
      break;
    
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const customerId = session.customer as string;
  
  if (!customerId) {
    console.error('No customer ID in checkout session');
    return;
  }

  if (session.mode === 'subscription') {
    // For subscriptions, we'll sync the subscription data
    await syncCustomerSubscription(customerId);
  } else if (session.mode === 'payment' && session.payment_status === 'paid') {
    // For one-time payments, create an order record
    await createOrderRecord(session);
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
  // If this is a payment for a subscription, it will be handled by the subscription events
  if (paymentIntent.invoice) return;

  // For one-time payments not associated with a checkout session
  const customerId = paymentIntent.customer as string;
  
  if (!customerId) {
    console.error('No customer ID in payment intent');
    return;
  }

  // Update user profile with access information
  await updateUserAccessFromPayment(customerId);
}

async function syncCustomerSubscription(customerId: string) {
  try {
    // Fetch latest subscription data from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: customerId,
      limit: 1,
      status: 'all',
      expand: ['data.default_payment_method'],
    });

    if (subscriptions.data.length === 0) {
      console.info(`No active subscriptions found for customer: ${customerId}`);
      const { error: noSubError } = await supabase.from('stripe_subscriptions').upsert(
        {
          customer_id: customerId,
          subscription_status: 'not_started',
        },
        {
          onConflict: 'customer_id',
        },
      );

      if (noSubError) {
        console.error('Error updating subscription status:', noSubError);
        throw new Error('Failed to update subscription status in database');
      }
      return;
    }

    // Get the subscription
    const subscription = subscriptions.data[0];

    // Update subscription in database
    const { error: subError } = await supabase.from('stripe_subscriptions').upsert(
      {
        customer_id: customerId,
        subscription_id: subscription.id,
        price_id: subscription.items.data[0].price.id,
        current_period_start: subscription.current_period_start,
        current_period_end: subscription.current_period_end,
        cancel_at_period_end: subscription.cancel_at_period_end,
        ...(subscription.default_payment_method && typeof subscription.default_payment_method !== 'string'
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

    // Update user profile with subscription status
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

    // Insert the order into the stripe_orders table
    const { error: orderError } = await supabase.from('stripe_orders').insert({
      checkout_session_id,
      payment_intent_id: payment_intent as string,
      customer_id: customerId as string,
      amount_subtotal: amount_subtotal || 0,
      amount_total: amount_total || 0,
      currency: currency || 'usd',
      payment_status: payment_status || 'unpaid',
      status: 'completed', // assuming we want to mark it as completed since payment is successful
    });

    if (orderError) {
      console.error('Error inserting order:', orderError);
      throw new Error('Failed to create order record');
    }

    // Update user profile with access information
    await updateUserAccessFromPayment(customerId as string);
    
    console.info(`Successfully processed one-time payment for session: ${checkout_session_id}`);
  } catch (error) {
    console.error('Error processing one-time payment:', error);
    throw error;
  }
}

async function updateUserAccessFromSubscription(customerId: string, status: string) {
  try {
    // Get the user_id from the stripe_customers table
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

    // Update the user's profile with subscription status
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        subscription_status: status === 'active' ? 'pro' : 'free',
        subscription_expires_at: status === 'active' ? null : new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (profileError) {
      console.error('Error updating user profile:', profileError);
    }

    // Add a record to user_subscriptions table
    if (status === 'active') {
      const { error: subError } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: userId,
          subscription_type: 'pro',
          status: 'active',
          stripe_subscription_id: customerId
        });

      if (subError) {
        console.error('Error creating user subscription record:', subError);
      }
    }
  } catch (error) {
    console.error('Error updating user access from subscription:', error);
  }
}

async function updateUserAccessFromPayment(customerId: string) {
  try {
    // Get the user_id from the stripe_customers table
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

    // Calculate expiration date (30 days from now)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Update the user's profile with lifetime access
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        subscription_status: 'lifetime',
        subscription_expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId);

    if (profileError) {
      console.error('Error updating user profile:', profileError);
    }

    // Add a record to user_subscriptions table
    const { error: subError } = await supabase
      .from('user_subscriptions')
      .insert({
        user_id: userId,
        subscription_type: 'lifetime',
        status: 'active',
        expires_at: expiresAt.toISOString()
      });

    if (subError) {
      console.error('Error creating user subscription record:', subError);
    }
  } catch (error) {
    console.error('Error updating user access from payment:', error);
  }
}