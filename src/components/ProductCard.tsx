import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const formatPrice = (amount: number, currency: string) => {
    const price = amount / 100; // Convert from øre/cents to currency units
    return new Intl.NumberFormat('no-NO', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  return (
    <div className="group bg-white border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="aspect-square relative overflow-hidden bg-gray-50">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={`${product.name} - High quality ${product.category?.name || 'product'} from Agentic Shop`}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-200"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{product.name}</h3>
          <p className="text-lg font-semibold text-black">
            {formatPrice(product.unit_amount, product.currency)}
          </p>
        </div>
      </Link>
      <div className="px-4 pb-4">
        {product.inventory_count > 0 ? (
          <Link
            href={`/checkout?product=${product.slug}`}
            className="block w-full bg-black text-white py-2 px-4 hover:bg-gray-800 transition-colors duration-200 text-sm font-medium text-center"
          >
            Buy
          </Link>
        ) : (
          <button
            className="w-full py-2 px-4 text-center font-medium bg-gray-300 text-gray-500 cursor-not-allowed text-sm"
            disabled
          >
            Out of stock
          </button>
        )}
      </div>
    </div>
  );
}
