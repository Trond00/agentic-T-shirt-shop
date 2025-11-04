'use server'

import { headers } from 'next/headers'

import { stripe } from '../../lib/stripe'

interface ProductData {
  priceId: string
  quantity?: number
}

export async function fetchClientSecret(productData: ProductData) {
  const origin = (await headers()).get('origin')

  // Create Checkout Sessions from body params.
  const session = await stripe.checkout.sessions.create({
    ui_mode: 'embedded',
    line_items: [
      {
        price: productData.priceId,
        quantity: productData.quantity || 1
      }
    ],
    mode: 'payment',
    return_url: `${origin}/return?session_id={CHECKOUT_SESSION_ID}`,
  })

  return session.client_secret!
}
