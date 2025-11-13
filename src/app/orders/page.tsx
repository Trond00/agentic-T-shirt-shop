'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Order } from '@/lib/types';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const router = useRouter();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const response = await fetch(`/api/orders?email=${encodeURIComponent(email)}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
        setSubmitted(true);
      } else {
        console.error('Failed to fetch orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (amount: number, currency: string) => {
    const price = amount / 100;
    return new Intl.NumberFormat('no-NO', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'paid': return 'bg-green-500';
      case 'shipped': return 'bg-blue-500';
      case 'delivered': return 'bg-purple-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (!submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-lg p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-light text-black mb-4">View Your Orders</h1>
            <p className="text-gray-600">
              Enter your email address to view your order history
            </p>
          </div>

          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="your@email.com"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-black text-white py-3 px-4 rounded-md hover:bg-gray-800 transition-colors font-medium"
            >
              View Orders
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/catalog"
              className="text-sm text-gray-600 hover:text-black"
            >
              Continue Shopping →
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <nav className="text-sm text-gray-600 mb-4">
            <Link href="/" className="hover:text-black">Home</Link>
            <span className="mx-2">/</span>
            <span className="text-black">Order History</span>
          </nav>
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-light text-black">Your Orders</h1>
            <button
              onClick={() => {
                setSubmitted(false);
                setEmail('');
                setOrders([]);
              }}
              className="text-sm text-gray-600 hover:text-black"
            >
              Search Different Email
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="text-center py-12">
            <div className="text-gray-500">Loading orders...</div>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-8">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h2 className="text-xl font-light text-gray-600 mb-2">No orders found</h2>
              <p className="text-gray-500">
                We couldn't find any orders for {email}
              </p>
            </div>
            <Link
              href="/catalog"
              className="inline-block bg-black text-white px-6 py-3 text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-black">
                      Order #{order.id.slice(-8).toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(order.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(order.status)}`}></div>
                      <span className="text-sm font-medium capitalize">{order.status}</span>
                    </div>
                    <p className="text-lg font-semibold text-black">
                      {formatPrice(order.total_amount, order.currency)}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="flex gap-4 overflow-x-auto">
                    {order.items?.slice(0, 3).map((item) => (
                      <div key={item.id} className="flex gap-3 min-w-0 flex-shrink-0">
                        <div className="w-12 h-12 relative bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                          {item.product?.image_url ? (
                            <Image
                              src={item.product.image_url}
                              alt={item.product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-black truncate">
                            {item.product?.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            Qty: {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                    {order.items && order.items.length > 3 && (
                      <div className="flex items-center text-sm text-gray-500">
                        +{order.items.length - 3} more
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                  <Link
                    href={`/orders/${order.id}`}
                    className="text-sm text-black hover:underline font-medium"
                  >
                    View Details →
                  </Link>
                  <a
                    href="mailto:orders@example.com"
                    className="text-sm text-gray-600 hover:text-black"
                  >
                    Contact Support
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
