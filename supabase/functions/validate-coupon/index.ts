import 'jsr:@supabase/functions-js/edge-runtime.d.ts';
import Stripe from 'npm:stripe@17.7.0';

const stripeSecret = Deno.env.get('STRIPE_SECRET_KEY')!;

if (!stripeSecret) {
  console.error('STRIPE_SECRET_KEY environment variable is not set');
}

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
    console.log('Coupon validation request received:', req.method);

    if (req.method === 'OPTIONS') {
      return corsResponse({}, 204);
    }

    if (req.method !== 'POST') {
      return corsResponse({ error: 'Method not allowed' }, 405);
    }

    if (!stripeSecret) {
      return corsResponse({ error: 'Stripe not configured' }, 500);
    }

    const requestBody = await req.json();
    const { coupon_code } = requestBody;

    if (!coupon_code) {
      return corsResponse({ 
        valid: false,
        error: 'Coupon code is required' 
      }, 400);
    }

    console.log(`Validating coupon: ${coupon_code}`);

    try {
      // Retrieve coupon from Stripe
      const coupon = await stripe.coupons.retrieve(coupon_code);
      
      console.log('Coupon retrieved:', {
        id: coupon.id,
        valid: coupon.valid,
        percent_off: coupon.percent_off,
        amount_off: coupon.amount_off
      });

      if (!coupon.valid) {
        return corsResponse({
          valid: false,
          error: 'Coupon is not valid'
        });
      }

      // Check if coupon has usage limits
      if (coupon.max_redemptions && coupon.times_redeemed >= coupon.max_redemptions) {
        return corsResponse({
          valid: false,
          error: 'Coupon has reached its usage limit'
        });
      }

      // Check if coupon is expired
      if (coupon.redeem_by && new Date() > new Date(coupon.redeem_by * 1000)) {
        return corsResponse({
          valid: false,
          error: 'Coupon has expired'
        });
      }

      // Format discount description
      let discountText = '';
      if (coupon.percent_off) {
        discountText = `${coupon.percent_off}% off`;
      } else if (coupon.amount_off) {
        const amount = (coupon.amount_off / 100).toFixed(2);
        const currency = coupon.currency?.toUpperCase() || 'USD';
        discountText = `${currency === 'USD' ? '$' : currency}${amount} off`;
      }

      return corsResponse({
        valid: true,
        discount: discountText,
        coupon_id: coupon.id,
        percent_off: coupon.percent_off,
        amount_off: coupon.amount_off,
        currency: coupon.currency,
        duration: coupon.duration,
        name: coupon.name
      });

    } catch (stripeError: any) {
      console.log(`Coupon validation failed: ${stripeError.message}`);
      
      if (stripeError.code === 'resource_missing') {
        return corsResponse({
          valid: false,
          error: 'Coupon code not found'
        });
      }

      return corsResponse({
        valid: false,
        error: 'Invalid coupon code'
      });
    }

  } catch (error: any) {
    console.error(`Coupon validation error: ${error.message}`);
    console.error('Error stack:', error.stack);
    return corsResponse({ 
      valid: false,
      error: 'Failed to validate coupon' 
    }, 500);
  }
});