import { NextRequest, NextResponse } from 'next/server';
import { calculateCart, getSession, updateSession } from '@/lib/checkout-cart';
import { CheckoutSession } from '@/lib/types';

interface UpdateCheckoutSessionRequest {
  items?: Array<{
    sku: string; // Product ID
    quantity: number;
  }>;
  shipping_option?: string; // shipping option ID
  shipping_address?: {
    postal_code: string;
    country: string;
  };
  idempotency_key?: string; // For future implementation
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const paramsData = await params;
  try {
    const sessionId = paramsData.id;
    const body: UpdateCheckoutSessionRequest = await request.json();

    // Get existing session
    const existingSession = await getSession(sessionId);
    if (!existingSession) {
      return NextResponse.json(
        { error: 'Checkout session not found' },
        { status: 404 }
      );
    }

    // Validate request - at least one update field must be provided
    if (!body.items && !body.shipping_option && !body.shipping_address) {
      return NextResponse.json(
        { error: 'At least one update field (items, shipping_option, or shipping_address) is required' },
        { status: 400 }
      );
    }

    // Prepare update data
    let updatedItems = existingSession.items;
    let updatedShippingAddress = existingSession.shipping_address;
    let selectedShippingId = existingSession.selected_shipping;

    // Handle items update
    if (body.items) {
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

      // Use new address if provided, otherwise existing
      const addressToUse = body.shipping_address || updatedShippingAddress;

      // Recalculate cart with new items
      const calculation = await calculateCart(body.items, addressToUse, body.shipping_option);
      updatedItems = calculation.items;

      // Update session with new calculation
      const statusUpdate: Partial<CheckoutSession> = {
        items: updatedItems,
        subtotal: calculation.subtotal,
        shipping_amount: calculation.shipping_amount,
        vat_amount: calculation.vat_amount,
        grand_total: calculation.grand_total,
        shipping_options: calculation.shipping_options,
        messages: calculation.messages,
        status: 'updated',
      };

      if (body.shipping_option) {
        statusUpdate.selected_shipping = body.shipping_option;
        selectedShippingId = body.shipping_option;
      }

      if (body.shipping_address) {
        statusUpdate.shipping_address = body.shipping_address;
        updatedShippingAddress = body.shipping_address;
      }

      const updatedSession = await updateSession(sessionId, statusUpdate);

      if (!updatedSession) {
        return NextResponse.json(
          { error: 'Failed to update checkout session' },
          { status: 500 }
        );
      }

      // Recalculate shipping with new address if needed
      if (body.shipping_address && (body.items || body.shipping_option)) {
        const finalCalculation = await calculateCart(
          body.items || existingSession.items.map(item => ({ sku: item.sku, quantity: item.quantity })),
          body.shipping_address,
          body.shipping_option || selectedShippingId
        );

        const finalUpdate: Partial<CheckoutSession> = {
          subtotal: finalCalculation.subtotal,
          shipping_amount: finalCalculation.shipping_amount,
          vat_amount: finalCalculation.vat_amount,
          grand_total: finalCalculation.grand_total,
          shipping_options: finalCalculation.shipping_options,
        };

        const finalSession = await updateSession(sessionId, finalUpdate);
        if (finalSession) {
          updatedSession.shipping_options = finalSession.shipping_options;
          updatedSession.subtotal = finalSession.subtotal;
          updatedSession.shipping_amount = finalSession.shipping_amount;
          updatedSession.vat_amount = finalSession.vat_amount;
          updatedSession.grand_total = finalSession.grand_total;
        }
      }

      return NextResponse.json(updatedSession, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Content-Type': 'application/json',
        },
      });
    }

    // Handle shipping/address updates without changing items
    const addressToUse = body.shipping_address || updatedShippingAddress;
    const shippingIdToUse = body.shipping_option || selectedShippingId;

    const calculationForShipping = await calculateCart(
      existingSession.items.map(item => ({ sku: item.sku, quantity: item.quantity })),
      addressToUse,
      shippingIdToUse
    );

    const shippingUpdate: Partial<CheckoutSession> = {
      shipping_amount: calculationForShipping.shipping_amount,
      shipping_options: calculationForShipping.shipping_options,
      grand_total: calculationForShipping.subtotal + calculationForShipping.shipping_amount + calculationForShipping.vat_amount,
      status: 'updated',
    };

    if (body.shipping_option) {
      shippingUpdate.selected_shipping = body.shipping_option;
    }

    if (body.shipping_address) {
      shippingUpdate.shipping_address = body.shipping_address;
    }

    const updatedShippingSession = await updateSession(sessionId, shippingUpdate);

    if (!updatedShippingSession) {
      return NextResponse.json(
        { error: 'Failed to update checkout session' },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedShippingSession, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('Checkout session update error:', error);
    return NextResponse.json(
      {
        error: 'Failed to update checkout session',
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

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const paramsData = await params;
  try {
    const sessionId = paramsData.id;
    console.log('GET request for session:', sessionId);
    const session = await getSession(sessionId);
    console.log('Retrieved session:', session);
    if (!session) {
      return NextResponse.json(
        { error: 'Checkout session not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(session, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Checkout session retrieve error:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve checkout session',
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
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
