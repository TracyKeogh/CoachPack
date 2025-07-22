import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;
const stripe = new Stripe(stripeSecret, {
  appInfo: {
    name: 'Coach Pack Integration',
    version: '1.0.0',
  },
});

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);

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
    
    const { price_id, success_url, cancel_url, mode, customer_email, customer_name } = requestBody;
    console.log('🔍 Extracted parameters:', {
      price_id,
      success_url,
      cancel_url,
      mode,
      customer_email,
      customer_name
    });

    // Validate required parameters
    if (!price_id || !success_url || !cancel_url || !customer_email || !customer_name) {
      const missing = [];
      if (!price_id) missing.push('price_id');
      if (!success_url) missing.push('success_url');
      if (!cancel_url) missing.push('cancel_url');
      if (!customer_email) missing.push('customer_email');
      if (!customer_name) missing.push('customer_name');
      
      console.log('❌ Missing required parameters:', missing);
      return corsResponse({ error: `Missing required parameters: ${missing.join(', ')}` }, 400);
    }

    if (!mode || !['payment', 'subscription'].includes(mode)) {
      console.log('❌ Invalid mode:', mode);
      return corsResponse({ error: 'Mode must be either "payment" or "subscription"' }, 400);
    }
    
    console.log('✅ Parameter validation passed');

    // Look for existing Stripe customer by email
    console.log('🔍 Looking up existing Stripe customer by email:', customer_email);
    
    let customerId;
    
    try {
      const existingCustomers = await stripe.customers.list({
        email: customer_email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        customerId = existingCustomers.data[0].id;
        console.log('✅ Found existing Stripe customer:', customerId);
      } else {
        console.log('🆕 Creating new Stripe customer');
        const newCustomer = await stripe.customers.create({
          email: customer_email,
          name: customer_name,
          metadata: {
            source: 'coach-pack-checkout',
            created_via: 'unauthenticated_flow'
          },
        });

        customerId = newCustomer.id;
        console.log('✅ Created new Stripe customer:', customerId);
      }
    } catch (stripeError) {
      console.error('❌ Error with Stripe customer operations:', stripeError);
      return corsResponse({ error: 'Failed to create or retrieve customer' }, 500);
    }

    console.log('🛒 Creating Stripe checkout session...');
    console.log('🛒 Checkout session parameters:', {
      customer: customerId,
      customer_email,
      payment_method_types: ['card'],
      line_items: [{ price: price_id, quantity: 1 }],
      mode,
      success_url,
      cancel_url
    });
    
    // Create Checkout Session with customer info in metadata
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customer_email,
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
      metadata: {
        customer_email: customer_email,
        customer_name: customer_name,
        source: 'coach-pack-checkout'
      },
      // For one-time payments, collect customer info
      ...(mode === 'payment' && {
        customer_creation: 'always',
      }),
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