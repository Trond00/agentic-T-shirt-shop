import { createClient } from './server';
import { CheckoutSession } from '@/lib/types';

export async function createCheckoutSession(sessionData: CheckoutSession): Promise<CheckoutSession> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('checkout_sessions')
    .insert({
      id: sessionData.id,
      status: sessionData.status,
      items: sessionData.items,
      shipping_address: sessionData.shipping_address,
      shipping_options: sessionData.shipping_options,
      selected_shipping: sessionData.selected_shipping,
      currency: sessionData.currency,
      vat_rate: sessionData.vat_rate,
      subtotal: sessionData.subtotal,
      shipping_amount: sessionData.shipping_amount,
      vat_amount: sessionData.vat_amount,
      grand_total: sessionData.grand_total,
      messages: sessionData.messages,
      idempotency_key: sessionData.idempotency_key,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create checkout session: ${error.message}`);
  }

  return data;
}

export async function getCheckoutSession(sessionId: string): Promise<CheckoutSession | null> {
  const supabase = await createClient();
console.log('Querying session:', sessionId);
  const { data, error } = await supabase
    .from('checkout_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();
console.log('Supabase result:', { data, error });
  if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
    throw new Error(`Failed to get checkout session: ${error.message}`);
  }

  return data || null;
}

export async function updateCheckoutSession(
  sessionId: string,
  updates: Partial<CheckoutSession>
): Promise<CheckoutSession | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('checkout_sessions')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', sessionId)
    .select()
    .single();

  if (error && error.code !== 'PGRST116') {
    throw new Error(`Failed to update checkout session: ${error.message}`);
  }

  return data || null;
}

export async function deleteExpiredSessions(): Promise<number> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from('checkout_sessions')
    .delete({ count: 'exact' })
    .lt('expires_at', new Date().toISOString())
    .not('status', 'eq', 'completed'); // Don't delete completed sessions immediately

  if (error) {
    throw new Error(`Failed to delete expired sessions: ${error.message}`);
  }

  return count || 0;
}
