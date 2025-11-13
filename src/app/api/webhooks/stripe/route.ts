import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { createOrder, createOrderItem, updateProductInventory, getOrderByStripeSessionId } from '@/lib/supabase/orders';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const sig = (await headers()).get('stripe-signature');

    let event;

    try {
      event = stripe.webhooks.constructEvent(body, sig!, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  try {
    // Check if order already exists
    const existingOrder = await getOrderByStripeSessionId(session.id);
    if (existingOrder) {
      console.log('Order already exists for session:', session.id);
      return;
    }

    // Retrieve the full session with line items
    const fullSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items', 'customer_details']
    });

    if (!fullSession.line_items?.data) {
      throw new Error('No line items found in session');
    }

    // Create the order
    const order = await createOrder({
      stripe_session_id: session.id,
      stripe_payment_intent_id: session.payment_intent as string,
      customer_email: session.customer_details?.email || '',
      customer_name: session.customer_details?.name,
      total_amount: session.amount_total || 0,
      currency: session.currency || 'usd',
      shipping_address: session.shipping_details ? {
        line1: session.shipping_details.address?.line1 || '',
        line2: session.shipping_details.address?.line2,
        city: session.shipping_details.address?.city || '',
        state: session.shipping_details.address?.state,
        postal_code: session.shipping_details.address?.postal_code || '',
        country: session.shipping_details.address?.country || '',
      } : undefined,
    });

    // Create order items
    for (const item of fullSession.line_items.data) {
      // Use session metadata for product information
      const productId = session.metadata?.product_id;
      const quantity = parseInt(session.metadata?.quantity || '1');

      if (productId) {
        await createOrderItem({
          order_id: order.id,
          product_id: productId,
          quantity: quantity,
          unit_amount: item.price?.unit_amount || 0,
          currency: item.price?.currency || 'nok',
        });

        // Update inventory
        await updateProductInventory(productId, quantity);
      }
    }

    console.log('Order created successfully:', order.id);
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
    throw error;
  }
}
