import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'Coach Pack Integration',
    version: '1.0.0',
  },
});

// Helper function to create responses with CORS headers
function corsResponse(body: string | object | null, status = 200) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': '*',
  };

  // For 204 No Content, don't include Content-Type or body
  if (status === 204) {
    return new Response(null, { status, headers });
  }

  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...headers,
      'Content-Type': 'application/json',
    },
  });
}

Deno.serve(async (req) => {
  try {
    console.log('🚀 Stripe checkout function called');
    console.log('📥 Request method:', req.method);
    console.log('📥 Request headers:', Object.fromEntries(req.headers.entries()));
    
    if (req.method === 'OPTIONS') {
      console.log('✅ Handling OPTIONS request (CORS preflight)');
      return corsResponse({}, 204);
    }

    if (req.method !== 'POST') {
      console.log('❌ Invalid method:', req.method);
      return corsResponse({ error: 'Method not allowed' }, 405);
    }

    console.log('📋 Parsing request body...');
    const requestBody = await req.json();
    console.log('📋 Full request body:', JSON.stringify(requestBody, null, 2));
    
    const { price_id, success_url, cancel_url, mode } = requestBody;
    console.log('🔍 Extracted parameters:', {
      price_id,
      success_url,
      cancel_url,
      mode
    });

    const error = validateParameters(
      { price_id, success_url, cancel_url, mode },
      {
        cancel_url: 'string',
        price_id: 'string',
        success_url: 'string',
        mode: { values: ['payment', 'subscription'] },
      },
    );

    if (error) {
      console.log('❌ Parameter validation failed:', error);
      return corsResponse({ error }, 400);
    }
    
    console.log('✅ Parameter validation passed');

    const authHeader = req.headers.get('Authorization')!;
    console.log('🔐 Auth header present:', !!authHeader);
    
    const token = authHeader.replace('Bearer ', '');
    console.log('🔐 Extracted token length:', token.length);
    
    const {
      data: { user },
      error: getUserError,
    } = await supabase.auth.getUser(token);

    if (getUserError) {
      console.log('❌ Failed to authenticate user:', getUserError);
      return corsResponse({ error: 'Failed to authenticate user' }, 401);
    }

    if (!user) {
      console.log('❌ No user found in token');
      return corsResponse({ error: 'User not found' }, 404);
    }
    
    console.log('✅ User authenticated:', {
      id: user.id,
      email: user.email
    });

    console.log('🔍 Looking up existing customer for user:', user.id);
    const { data: customer, error: getCustomerError } = await supabase
      .from('stripe_customers')
      .select('customer_id')
      .eq('user_id', user.id)
      .is('deleted_at', null)
      .maybeSingle();

    if (getCustomerError) {
      console.error('❌ Failed to fetch customer information from the database:', getCustomerError);

      return corsResponse({ error: 'Failed to fetch customer information' }, 500);
    }
    
    console.log('🔍 Customer lookup result:', customer);

    let customerId;

    /**
     * In case we don't have a mapping yet, the customer does not exist and we need to create one.
     */
    if (!customer || !customer.customer_id) {
      console.log('🆕 Creating new Stripe customer for user:', user.id);
      console.log('🆕 Customer creation parameters:', {
        email: user.email,
        metadata: { userId: user.id }
      });
      const newCustomer = await stripe.customers.create({
        email: user.email,
        metadata: {
          userId: user.id,
        },
      });

      console.log('✅ Created new Stripe customer:', {
        customerId: newCustomer.id,
        userId: user.id,
        email: user.email
      });

      console.log('💾 Saving customer mapping to database...');
      const { error: createCustomerError } = await supabase.from('stripe_customers').insert({
        user_id: user.id,
        customer_id: newCustomer.id,
      });

      if (createCustomerError) {
        console.error('❌ Failed to save customer information in the database:', createCustomerError);

        // Try to clean up both the Stripe customer and subscription record
        try {
          console.log('🧹 Cleaning up failed customer creation...');
          await stripe.customers.del(newCustomer.id);
          await supabase.from('stripe_subscriptions').delete().eq('customer_id', newCustomer.id);
          console.log('✅ Cleanup completed');
        } catch (deleteError) {
          console.error('❌ Failed to clean up after customer mapping error:', deleteError);
        }

        return corsResponse({ error: 'Failed to create customer mapping' }, 500);
      }
      
      console.log('✅ Customer mapping saved to database');

      if (mode === 'subscription') {
        console.log('💳 Creating subscription record for new customer...');
        const { error: createSubscriptionError } = await supabase.from('stripe_subscriptions').insert({
          customer_id: newCustomer.id,
          status: 'not_started',
        });

        if (createSubscriptionError) {
          console.error('❌ Failed to save subscription in the database:', createSubscriptionError);

          // Try to clean up the Stripe customer since we couldn't create the subscription
          try {
            console.log('🧹 Cleaning up failed subscription creation...');
            await stripe.customers.del(newCustomer.id);
            console.log('✅ Customer cleanup completed');
          } catch (deleteError) {
            console.error('❌ Failed to delete Stripe customer after subscription creation error:', deleteError);
          }

          return corsResponse({ error: 'Unable to save the subscription in the database' }, 500);
        }
        
        console.log('✅ Subscription record created');
      }

      customerId = newCustomer.id;

      console.log('✅ Successfully set up new customer:', customerId);
    } else {
      customerId = customer.customer_id;
      console.log('✅ Using existing customer:', customerId);

      if (mode === 'subscription') {
        console.log('🔍 Verifying subscription exists for existing customer...');
        // Verify subscription exists for existing customer
        const { data: subscription, error: getSubscriptionError } = await supabase
          .from('stripe_subscriptions')
          .select('status')
          .eq('customer_id', customerId)
          .maybeSingle();

        if (getSubscriptionError) {
          console.error('❌ Failed to fetch subscription information from the database:', getSubscriptionError);

          return corsResponse({ error: 'Failed to fetch subscription information' }, 500);
        }
        
        console.log('🔍 Existing subscription check result:', subscription);

        if (!subscription) {
          console.log('🆕 Creating missing subscription record for existing customer...');
          // Create subscription record for existing customer if missing
          const { error: createSubscriptionError } = await supabase.from('stripe_subscriptions').insert({
            customer_id: customerId,
            status: 'not_started',
          });

          if (createSubscriptionError) {
            console.error('❌ Failed to create subscription record for existing customer:', createSubscriptionError);

            return corsResponse({ error: 'Failed to create subscription record for existing customer' }, 500);
          }
          
          console.log('✅ Created missing subscription record');
        } else {
          console.log('✅ Subscription record already exists');
        }
      }
    }

    console.log('🛒 Creating Stripe checkout session...');
    console.log('🛒 Checkout session parameters:', {
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{ price: price_id, quantity: 1 }],
      mode,
      success_url,
      cancel_url
    });
    
    // create Checkout Session
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      mode,
      success_url,
      cancel_url,
    });

    console.log('✅ Checkout session created successfully:', {
      sessionId: session.id,
      customerId: customerId,
      url: session.url,
      payment_status: session.payment_status,
      status: session.status
    });
    
    console.log('📤 Returning session data to frontend...');
    const responseData = { sessionId: session.id, url: session.url };
    console.log('📤 Response data:', responseData);

    return corsResponse(responseData);
  } catch (error: any) {
    console.error('💥 CHECKOUT ERROR:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      type: error.type || 'Unknown'
    });
    
    // Log additional Stripe-specific error details if available
    if (error.type) {
      console.error('💳 Stripe error details:', {
        type: error.type,
        code: error.code,
        decline_code: error.decline_code,
        param: error.param,
        detail: error.detail
      });
    }
    
    return corsResponse({ error: error.message }, 500);
  }
});

type ExpectedType = 'string' | { values: string[] };
type Expectations<T> = { [K in keyof T]: ExpectedType };

function validateParameters<T extends Record<string, any>>(values: T, expected: Expectations<T>): string | undefined {
  for (const parameter in values) {
    const expectation = expected[parameter];
    const value = values[parameter];

    if (expectation === 'string') {
      if (value == null) {
        return `Missing required parameter ${parameter}`;
      }
      if (typeof value !== 'string') {
        return `Expected parameter ${parameter} to be a string got ${JSON.stringify(value)}`;
      }
    } else {
      if (!expectation.values.includes(value)) {
        return `Expected parameter ${parameter} to be one of ${expectation.values.join(', ')}`;
      }
    }
  }

  return undefined;
}