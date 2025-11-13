'use client'

import { useCallback } from 'react'
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider
} from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'

import { fetchClientSecret } from '../app/actions/stripe'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!)

interface CheckoutProps {
  priceId: string
  productId: string
  quantity?: number
}

export default function Checkout({ priceId, productId, quantity = 1 }: CheckoutProps) {
  const fetchClientSecretCallback = useCallback(() =>
    fetchClientSecret({ priceId, productId, quantity }),
    [priceId, productId, quantity]
  )

  const options = {
    fetchClientSecret: fetchClientSecretCallback
  }

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider
        stripe={stripePromise}
        options={options}
      >
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  )
}
