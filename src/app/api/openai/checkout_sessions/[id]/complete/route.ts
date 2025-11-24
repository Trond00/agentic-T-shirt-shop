import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/checkout-cart';
import { createOrder, createOrderItem } from '@/lib/supabase/orders';
import { CheckoutSession } from '@/lib/types';
import { stripe } from '@/lib/stripe';

interface CompleteCheckoutSessionRequest {
  payment_token?: string; // For delegated payment (Stripe token)
  email?: string; // Customer email for order
  name?: string; // Customer name for order
  idempotency_key?: string; // For future implementation
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const paramsData = await params;
  try {
    const sessionId = paramsData.id;
    const body: CompleteCheckoutSessionRequest = await request.json();

    // Get existing session
    const session = await getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'Checkout session not found' },
        { status: 404 }
      );
    }

    // Validate session can be completed
    if (session.status === 'completed') {
      return NextResponse.json(
        { error: 'Checkout session already completed' },
        { status: 400 }
      );
    }

    // For POC, we'll handle payment processing via Stripe
    // In OpenAI Agentic Commerce, this would receive a delegated payment token

    let paymentIntentId: string | undefined;
    let stripeSessionId: string | undefined;

    // If payment_token is provided (delegated payment), use it
    // For POC, we'll create a mock payment since we can't get real delegated tokens yet
    if (body.payment_token) {
      // TODO: Handle real delegated payment token
      // For now, simulate success
      console.log('Received delegated payment token:', body.payment_token);

      // Create a mock payment intent for testing
      const paymentIntent = await stripe.paymentIntents.create({
        amount: session.grand_total, // Amount in øre
        currency: session.currency.toLowerCase(),
        automatic_payment_methods: { enabled: true },
        metadata: {
          checkout_session_id: sessionId,
          items_count: session.items.length,
        },
      });

      paymentIntentId = paymentIntent.id;

      // Confirm the payment
      await stripe.paymentIntents.confirm(paymentIntentId);
    } else {
      // Create a Stripe checkout session for manual payment (fallback)
      const stripeSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: session.items.map(item => ({
          price_data: {
            currency: session.currency.toLowerCase(),
            product_data: {
              name: item.name,
            },
            unit_amount: item.unit_price, // Already in øre
          },
          quantity: item.quantity,
        })).concat([
          // Shipping as separate line item
          {
            price_data: {
              currency: session.currency.toLowerCase(),
              product_data: {
                name: 'Shipping',
              },
              unit_amount: session.shipping_amount,
            },
            quantity: 1,
          },
        ]),
        mode: 'payment',
        success_url: `${request.nextUrl.origin}/return?session_id={CHECKOUT_SESSION_ID}&order_id=${sessionId}`,
        cancel_url: `${request.nextUrl.origin}/checkout?canceled=true`,
        metadata: {
          checkout_session_id: sessionId,
        },
      });

      stripeSessionId = stripeSession.id;
    }

    // Create order in database
    // Expand minimal shipping address from session to full Order address format
    const fullShippingAddress = session.shipping_address ? {
      line1: '', // Not collected in Agentic Commerce spec
      line2: undefined,
      city: '', // Not collected in Agentic Commerce spec
      state: undefined,
      postal_code: session.shipping_address.postal_code,
      country: session.shipping_address.country,
    } : undefined;

    const orderData = {
      stripe_session_id: stripeSessionId || sessionId,
      stripe_payment_intent_id: paymentIntentId,
      customer_email: body.email || 'checkout@agentic.com',
      customer_name: body.name,
      total_amount: session.grand_total,
      currency: session.currency,
      shipping_address: fullShippingAddress,
    };

    const order = await createOrder(orderData);

    // Create order items
    for (const item of session.items) {
      await createOrderItem({
        order_id: order.id,
        product_id: item.sku,
        quantity: item.quantity,
        unit_amount: item.unit_price,
        currency: session.currency,
      });
    }

    // Update session status
    session.status = 'completed';
    session.updated_at = new Date().toISOString();

    // In real implementation, send webhooks here:
    // POST to ChatGPT webhook with order.created, then order.updated with status

    return NextResponse.json({
      order_id: order.id,
      status: 'completed',
      total: {
        subtotal: session.subtotal,
        shipping: session.shipping_amount,
        vat: session.vat_amount,
        grand_total: session.grand_total,
      },
      currency: session.currency,
      payment_url: stripeSessionId ? `https://checkout.stripe.com/pay/${stripeSessionId}` : null,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Checkout session complete error:', error);
    return NextResponse.json(
      {
        error: 'Failed to complete checkout session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
}

// Handle OPTIONS requests for CORS
export async function OPTIONS(request: NextRequest) {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
