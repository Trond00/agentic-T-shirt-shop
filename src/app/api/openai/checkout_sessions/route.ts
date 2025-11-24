import { NextRequest, NextResponse } from 'next/server';
import { calculateCart, createSession, updateSession } from '@/lib/checkout-cart';
import { CheckoutSession } from '@/lib/types';

interface CreateCheckoutSessionRequest {
  items: Array<{
    sku: string; // Product ID
    quantity: number;
  }>;
  shipping_address?: {
    postal_code: string;
    country: string;
  };
  currency: string;
  idempotency_key?: string; // For future implementation
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateCheckoutSessionRequest = await request.json();

    // Validate required fields
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: 'Items array is required and must not be empty' },
        { status: 400 }
      );
    }

    if (!body.currency) {
      return NextResponse.json(
        { error: 'Currency is required' },
        { status: 400 }
      );
    }

    if (body.currency !== 'NOK') {
      return NextResponse.json(
        { error: 'Only NOK currency is supported' },
        { status: 400 }
      );
    }

    // Validate item structure
    for (const item of body.items) {
      if (!item.sku || typeof item.sku !== 'string') {
        return NextResponse.json(
          { error: 'Each item must have a valid sku string' },
          { status: 400 }
        );
      }
      if (!item.quantity || typeof item.quantity !== 'number' || item.quantity <= 0) {
        return NextResponse.json(
          { error: 'Each item must have a positive quantity number' },
          { status: 400 }
        );
      }
    }

    // Calculate cart totals
    const calculation = await calculateCart(body.items, body.shipping_address);

    // Create session
    const session = await createSession(calculation, body.shipping_address);

    // Set idempotency key if provided (update the session)
    if (body.idempotency_key) {
      await updateSession(session.id, { idempotency_key: body.idempotency_key });
      // Note: For simplicity, we don't wait for this update to complete
      // The idempotency key will be set asynchronously
    }

    return NextResponse.json(session, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Checkout session creation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
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
