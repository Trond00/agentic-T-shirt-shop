import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

import { stripe } from '../../lib/stripe'
import { getOrderByStripeSessionId } from '../../lib/supabase/orders'
import { Order } from '../../lib/types'

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function Return({ searchParams }: PageProps) {
  const { session_id } = await searchParams

  if (!session_id || typeof session_id !== 'string')
    throw new Error('Please provide a valid session_id (`cs_test_...`)')

  const {
    status,
    customer_details
  } = await stripe.checkout.sessions.retrieve(session_id, {
    expand: ['line_items', 'payment_intent']
  })

  const customerEmail = customer_details?.email

  if (status === 'open') {
    return redirect('/')
  }

  if (status === 'complete') {
    // Try to get the order from our database
    const order = await getOrderByStripeSessionId(session_id)

    if (order) {
      return <OrderConfirmation order={order as Order} />
    } else {
      // Fallback for when webhook hasn't processed yet or failed
      return <PendingConfirmation customerEmail={customerEmail ?? undefined} />
    }
  }

  return redirect('/')
}

function OrderConfirmation({ order }: { order: Order }) {
  const formatPrice = (amount: number, currency: string) => {
    const price = amount / 100
    return new Intl.NumberFormat('no-NO', {
      style: 'currency',
      currency: currency,
    }).format(price)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <nav className="text-sm text-gray-600 mb-4">
            <Link href="/" className="hover:text-black">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-black">Order Confirmation</span>
          </nav>
          <h1 className="text-3xl font-light text-black">Order Confirmed!</h1>
          <p className="text-gray-600 mt-2">Order #{order.id.slice(-8).toUpperCase()}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Order Details */}
          <div>
            <h2 className="text-xl font-medium text-black mb-6">Order Details</h2>
            <div className="bg-white rounded-lg p-6">
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 relative bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product?.image_url ? (
                        <Image
                          src={item.product.image_url}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-black">{item.product?.name}</h3>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      <p className="text-sm font-semibold text-black">
                        {formatPrice(item.unit_amount, item.currency)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Total */}
              <div className="border-t border-gray-200 mt-6 pt-6">
                <div className="flex justify-between text-lg font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(order.total_amount, order.currency)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div>
            <h2 className="text-xl font-medium text-black mb-6">Customer Information</h2>
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-6">
                <h3 className="font-medium text-black mb-4">Contact Details</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p><span className="font-medium">Email:</span> {order.customer_email}</p>
                  {order.customer_name && (
                    <p><span className="font-medium">Name:</span> {order.customer_name}</p>
                  )}
                </div>
              </div>

              {order.shipping_address && (
                <div className="bg-white rounded-lg p-6">
                  <h3 className="font-medium text-black mb-4">Shipping Address</h3>
                  <div className="text-sm text-gray-600">
                    <p>{order.shipping_address.line1}</p>
                    {order.shipping_address.line2 && <p>{order.shipping_address.line2}</p>}
                    <p>{order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.postal_code}</p>
                    <p>{order.shipping_address.country}</p>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-lg p-6">
                <h3 className="font-medium text-black mb-4">Order Status</h3>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    order.status === 'paid' ? 'bg-green-500' :
                    order.status === 'shipped' ? 'bg-blue-500' :
                    order.status === 'delivered' ? 'bg-purple-500' : 'bg-gray-500'
                  }`}></div>
                  <span className="text-sm font-medium capitalize">{order.status}</span>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Ordered on {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">
            A confirmation email has been sent to {order.customer_email}
          </p>
          <div className="space-x-4">
            <Link
              href="/catalog"
              className="inline-block bg-black text-white px-6 py-3 text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Continue Shopping
            </Link>
            <a
              href="mailto:orders@example.com"
              className="inline-block border border-gray-300 text-gray-700 px-6 py-3 text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

function PendingConfirmation({ customerEmail }: { customerEmail?: string }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-light text-black mb-2">Payment Successful!</h1>
          <p className="text-gray-600">
            Your order is being processed. You'll receive a confirmation email shortly at {customerEmail}.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/catalog"
            className="block w-full bg-black text-white px-6 py-3 text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Continue Shopping
          </Link>
          <p className="text-xs text-gray-500">
            If you don't receive your confirmation email within a few minutes, please check your spam folder or contact support.
          </p>
        </div>
      </div>
    </div>
  )
}
