import Link from 'next/link';
import { Product } from '@/lib/types';
import { ProductCard } from './ProductCard';

interface RelatedProductsProps {
  products: Product[];
}

export function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) return null;

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-light text-black mb-8">You might also like</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      <div className="mt-8 text-center">
        <Link
          href="/catalog"
          className="inline-block px-6 py-3 border border-gray-300 hover:border-black transition-colors text-sm font-medium"
        >
          View all products
        </Link>
      </div>
    </div>
  );
}
