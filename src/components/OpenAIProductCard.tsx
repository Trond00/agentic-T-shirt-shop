import Image from 'next/image';
import Link from 'next/link';
import { OpenAIProduct } from '@/lib/openai-product-feed';

interface OpenAIProductCardProps {
  product: OpenAIProduct;
}

export function OpenAIProductCard({ product }: OpenAIProductCardProps) {
  const isAvailable = product.availability === 'in_stock';

  const formatPrice = (price: string) => price;

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'in_stock': return 'text-green-600 bg-green-50';
      case 'out_of_stock': return 'text-red-600 bg-red-50';
      case 'preorder': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="bg-white border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      {/* Product Image */}
      <div className="aspect-square relative overflow-hidden bg-gray-50">
        <Image
          src={product.image_link}
          alt={`${product.title} - ${product.brand}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = '/placeholder-image.jpg';
          }}
        />

        {/* Availability Badge */}
        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(product.availability)}`}>
          {product.availability.replace('_', ' ').toUpperCase()}
        </div>

        {/* OpenAI Compliance Badge */}
        <div className="absolute top-2 left-2">
          <div className="bg-blue-600 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            OpenAI
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{product.title}</h3>

        <div className="space-y-1 mb-3">
          <p className="text-sm text-gray-600">{product.brand}</p>
          <p className="text-sm text-gray-500">{product.product_category}</p>
          <p className="text-sm text-gray-500">ID: {product.id}</p>
          {product.gtin && <p className="text-sm text-gray-500">GTIN: {product.gtin}</p>}
        </div>

        <div className="flex items-center justify-between mb-3">
          <span className="text-lg font-semibold text-black">
            {formatPrice(product.price)}
          </span>
          <span className="text-sm text-gray-500">
            Stock: {product.inventory_quantity}
          </span>
        </div>

        {/* OpenAI-specific fields */}
        <div className="space-y-1 mb-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${product.enable_search ? 'bg-green-500' : 'bg-red-500'}`}></span>
            Search: {product.enable_search ? 'Enabled' : 'Disabled'}
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${product.enable_checkout ? 'bg-green-500' : 'bg-red-500'}`}></span>
            Checkout: {product.enable_checkout ? 'Enabled' : 'Disabled'}
          </div>
          <div>Weight: {product.weight}</div>
          <div>Condition: {product.condition}</div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <Link
            href={product.link}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full bg-black text-white py-2 px-4 hover:bg-gray-800 transition-colors duration-200 text-sm font-medium text-center"
          >
            View Product
          </Link>
        </div>
      </div>
    </div>
  );
}
