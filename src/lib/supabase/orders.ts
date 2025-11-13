import { createClient } from './server';
import { Order, OrderItem } from '@/lib/types';

export async function createOrder(orderData: {
  stripe_session_id: string;
  stripe_payment_intent_id?: string;
  customer_email: string;
  customer_name?: string;
  total_amount: number;
  currency: string;
  shipping_address?: Order['shipping_address'];
}): Promise<Order> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('orders')
    .insert({
      ...orderData,
      status: 'paid', // Since we're creating this after successful payment
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create order: ${error.message}`);
  }

  return data;
}

export async function createOrderItem(orderItemData: {
  order_id: string;
  product_id: string;
  quantity: number;
  unit_amount: number;
  currency: string;
}): Promise<OrderItem> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('order_items')
    .insert(orderItemData)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create order item: ${error.message}`);
  }

  return data;
}

export async function getOrderByStripeSessionId(stripeSessionId: string): Promise<Order | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(
        *,
        product:products(*)
      )
    `)
    .eq('stripe_session_id', stripeSessionId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
    throw new Error(`Failed to get order: ${error.message}`);
  }

  return data || null;
}

export async function getOrderById(orderId: string): Promise<Order | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(
        *,
        product:products(*)
      )
    `)
    .eq('id', orderId)
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to get order: ${error.message}`);
  }

  return data || null;
}

export async function getOrdersByCustomerEmail(customerEmail: string): Promise<Order[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('orders')
    .select(`
      *,
      items:order_items(
        *,
        product:products(*)
      )
    `)
    .eq('customer_email', customerEmail)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get orders: ${error.message}`);
  }

  return data || [];
}

export async function updateOrderStatus(orderId: string, status: Order['status']): Promise<Order> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('orders')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update order status: ${error.message}`);
  }

  return data;
}

export async function updateProductInventory(productId: string, quantityChange: number): Promise<void> {
  const supabase = await createClient();

  const { error } = await supabase.rpc('decrement_inventory', {
    product_id: productId,
    quantity: quantityChange
  });

  if (error) {
    throw new Error(`Failed to update inventory: ${error.message}`);
  }
}
