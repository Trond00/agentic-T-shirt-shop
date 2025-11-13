'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getProductBySlug } from '@/lib/supabase/products';
import { ProductWithReviews } from '@/lib/types';
import Checkout from '@/components/checkout';

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const productSlug = searchParams.get('product');

  const [product, setProduct] = useState<ProductWithReviews | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!productSlug) {
      router.push('/catalog');
      return;
    }

    const loadProduct = async () => {
      const productData = await getProductBySlug(productSlug);
      if (!productData) {
        router.push('/catalog');
        return;
      }
      setProduct(productData);
      setLoading(false);
    };

    loadProduct();
  }, [productSlug, router]);

  const formatPrice = (amount: number, currency: string) => {
    const price = amount / 100;
    return new Intl.NumberFormat('no-NO', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading checkout...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light text-black mb-4">Product not found</h1>
          <Link
            href="/catalog"
            className="inline-block bg-black text-white px-6 py-3 text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            Back to catalog
          </Link>
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
            <Link href="/catalog" className="hover:text-black">Catalog</Link>
            <span className="mx-2">/</span>
            <span className="text-black">Checkout</span>
          </nav>
          <h1 className="text-3xl font-light text-black">Checkout</h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Order Summary */}
          <div>
            <h2 className="text-xl font-medium text-black mb-6">Order Summary</h2>
            <div className="bg-white rounded-lg p-6">
              <div className="flex gap-4">
                <div className="w-20 h-20 relative bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                  {product.image_url ? (
                    <Image
                      src={product.image_url}
                      alt={product.name}
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
                  <h3 className="font-medium text-black mb-1">{product.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">Quantity: 1</p>
                  <p className="text-lg font-semibold text-black">
                    {formatPrice(product.unit_amount, product.currency)}
                  </p>
                </div>
              </div>
            </div>

            {/* Order Total */}
            <div className="bg-white rounded-lg p-6 mt-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(product.unit_amount, product.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(product.unit_amount, product.currency)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stripe Checkout */}
          <div>
            <h2 className="text-xl font-medium text-black mb-6">Payment</h2>
            <div className="bg-white rounded-lg p-6">
            <Checkout priceId={product.stripe_price_id!} productId={product.id} quantity={1} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
