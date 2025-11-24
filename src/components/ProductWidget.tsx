import React from 'react';

interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  price: string;
  currency: string;
  category: string;
  product_url: string;
  in_stock: boolean;
  stock_count: number;
}

interface ProductWidgetProps {
  product: Product | null;
  baseURL: string;
}

const ProductWidget: React.FC<ProductWidgetProps> = ({ product, baseURL }) => {
  if (!product) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg text-center">
        <p className="text-gray-500">Product not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-sm mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      {product.image_url && (
        <div className="aspect-square bg-gray-100">
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="p-4">
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
          <p className="text-sm text-gray-500 capitalize">{product.category}</p>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-3">
          {product.description || 'No description available'}
        </p>

        <div className="flex items-center justify-between mb-3">
          <span className="text-xl font-bold text-green-600">
            {product.price} {product.currency}
          </span>
          <span className={`text-sm px-2 py-1 rounded ${
            product.in_stock
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {product.in_stock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>

        {product.product_url && (
          <a
            href={product.product_url}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center block"
          >
            View Product
          </a>
        )}
      </div>
    </div>
  );
};

export default ProductWidget;
