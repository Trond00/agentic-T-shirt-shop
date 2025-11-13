import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getOrderById } from '@/lib/supabase/orders';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailsPage({ params }: PageProps) {
  const { id } = await params;

  const order = await getOrderById(id);

  if (!order) {
    notFound();
  }

  const formatPrice = (amount: number, currency: string) => {
    const price = amount / 100;
    return new Intl.NumberFormat('no-NO', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-500';
      case 'shipped': return 'bg-blue-500';
      case 'delivered': return 'bg-purple-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <nav className="text-sm text-gray-600 mb-4">
            <Link href="/" className="hover:text-black">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/orders" className="hover:text-black">Orders</Link>
            <span className="mx-2">/</span>
            <span className="text-black">Order #{order.id.slice(-8).toUpperCase()}</span>
          </nav>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-light text-black">
              Order Details
            </h1>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(order.status)}`}></div>
              <span className="text-sm font-medium capitalize">{order.status}</span>
            </div>
          </div>
          <p className="text-gray-600 mt-2">
            Ordered on {new Date(order.created_at).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Order Items */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-medium text-black mb-6">Items Ordered</h2>
            <div className="space-y-4">
              {order.items?.map((item) => (
                <div key={item.id} className="bg-white rounded-lg p-6">
                  <div className="flex gap-4">
                    <div className="w-20 h-20 relative bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product?.image_url ? (
                        <Image
                          src={item.product.image_url}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-black mb-1">{item.product?.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-lg font-semibold text-black">
                        {formatPrice(item.unit_amount * item.quantity, item.currency)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatPrice(item.unit_amount, item.currency)} each
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="bg-white rounded-lg p-6 mt-6">
              <h3 className="font-medium text-black mb-4">Order Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.total_amount, order.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(order.total_amount, order.currency)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Order Information */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="font-medium text-black mb-4">Customer Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Email</p>
                  <p className="text-gray-600">{order.customer_email}</p>
                </div>
                {order.customer_name && (
                  <div>
                    <p className="font-medium text-gray-700">Name</p>
                    <p className="text-gray-600">{order.customer_name}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Address */}
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

            {/* Payment Information */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="font-medium text-black mb-4">Payment Information</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-gray-700">Payment Method</p>
                  <p className="text-gray-600">Credit Card (via Stripe)</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Payment ID</p>
                  <p className="text-gray-600 font-mono text-xs">{order.stripe_payment_intent_id}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-700">Order Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(order.status)}`}></div>
                    <span className="capitalize">{order.status}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg p-6">
              <h3 className="font-medium text-black mb-4">Need Help?</h3>
              <div className="space-y-3">
                <Link
                  href="/catalog"
                  className="block w-full text-center bg-black text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Continue Shopping
                </Link>
                <a
                  href="mailto:orders@example.com"
                  className="block w-full text-center border border-gray-300 text-gray-700 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  Contact Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
