import { createClient } from './supabase/server';
import { Product, CheckoutSession, CheckoutSessionItem, ShippingOption } from './types';
import { createCheckoutSession, getCheckoutSession, updateCheckoutSession } from './supabase/checkout-sessions';

export interface CartCalculationResult {
  items: CheckoutSessionItem[];
  subtotal: number;
  shipping_amount: number;
  vat_amount: number;
  grand_total: number;
  shipping_options: ShippingOption[];
  messages: string[];
}

// Default shipping options for Norway (in øre)
const NORWEGIAN_SHIPPING_OPTIONS: ShippingOption[] = [
  { id: 'standard', label: 'Standard levering', amount: 4900 }, // 49 NOK
  { id: 'express', label: 'Ekspress levering', amount: 9900 }, // 99 NOK
];

// VAT rate for Norway
const NORWAY_VAT_RATE = 0.25;

/**
 * Calculate cart totals with Norwegian VAT and shipping
 */
export async function calculateCart(
  lineItems: Array<{ sku: string; quantity: number }>,
  shippingAddress?: { postal_code: string; country: string },
  selectedShippingId?: string
): Promise<CartCalculationResult> {
  const supabase = await createClient();
  const messages: string[] = [];

  // Fetch products for all SKUs
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .in('id', lineItems.map(item => item.sku))
    .eq('published', true);

  if (error) {
    throw new Error(`Failed to fetch products: ${error.message}`);
  }

  const productsMap = new Map(products?.map(p => [p.id, p]) ?? []);

  // Build cart items and validate
  const validItems: CheckoutSessionItem[] = [];
  let subtotal = 0;

  for (const lineItem of lineItems) {
    const product = productsMap.get(lineItem.sku);

    if (!product) {
      messages.push(`Product ${lineItem.sku} not found`);
      continue;
    }

    if (product.inventory_count < lineItem.quantity) {
      messages.push(`Insufficient stock for ${product.name}. Available: ${product.inventory_count}`);
      // Use available stock instead of requested quantity
      lineItem.quantity = Math.min(lineItem.quantity, product.inventory_count);
    }

    const unitPrice = product.unit_amount; // stored in øre
    const vatRate = product.currency === 'NOK' ? NORWAY_VAT_RATE : 0; // Only VAT for Norwegian products

    const item: CheckoutSessionItem = {
      sku: product.id,
      name: product.name,
      unit_price: unitPrice,
      quantity: lineItem.quantity,
      vat_rate: vatRate,
    };

    validItems.push(item);
    subtotal += unitPrice * lineItem.quantity;
  }

  // Calculate shipping based on address (Norway only for now)
  const shippingOptions = shippingAddress?.country === 'NO' ? NORWEGIAN_SHIPPING_OPTIONS : [];

  // Default to standard shipping if available and no selection
  const selectedOption = selectedShippingId
    ? shippingOptions.find(opt => opt.id === selectedShippingId)
    : shippingOptions.find(opt => opt.id === 'standard');

  const shippingAmount = selectedOption?.amount ?? 0;

  // Calculate VAT on the entire order (simplified - should be per item in real VAT)
  // For Norway, VAT is applied to the total before shipping
  const vatBase = subtotal;
  const vatAmount = Math.round(vatBase * NORWAY_VAT_RATE);
  const grandTotal = subtotal + shippingAmount + vatAmount;

  return {
    items: validItems,
    subtotal,
    shipping_amount: shippingAmount,
    vat_amount: vatAmount,
    grand_total: grandTotal,
    shipping_options: shippingOptions,
    messages,
  };
}

// Database-backed session storage (production-ready)
export async function createSession(calculation: CartCalculationResult, address?: { postal_code: string; country: string }): Promise<CheckoutSession> {
  const id = 'cs_' + Date.now() + Math.random().toString(36).substr(2, 9);

  const session: CheckoutSession = {
    id,
    status: 'created',
    items: calculation.items,
    shipping_address: address,
    shipping_options: calculation.shipping_options,
    currency: 'NOK',
    vat_rate: NORWAY_VAT_RATE,
    subtotal: calculation.subtotal,
    shipping_amount: calculation.shipping_amount,
    vat_amount: calculation.vat_amount,
    grand_total: calculation.grand_total,
    messages: calculation.messages,
    idempotency_key: '', // Will be set by caller
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return await createCheckoutSession(session);
}

export async function getSession(sessionId: string): Promise<CheckoutSession | null> {
  return await getCheckoutSession(sessionId);
}

export async function updateSession(sessionId: string, updates: Partial<CheckoutSession>): Promise<CheckoutSession | null> {
  return await updateCheckoutSession(sessionId, updates);
}
