import Link from 'next/link';
import { getCategoriesWithCounts, getFeaturedProductsByCategory } from '@/lib/supabase/products';
import { ProductCard } from '@/components/ProductCard';
import { Product } from '@/lib/types';

type CategoryWithCount = {
  id: string;
  name: string;
  slug: string;
  productCount: number;
};

async function getCategoryDescription(categoryName: string): Promise<string> {
  const descriptions: Record<string, string> = {
    'T-Shirts': 'Essential tops for everyday wear, from casual basics to statement pieces',
    'Hoodies': 'Comfortable hoodies and sweatshirts perfect for layering and lounging',
    'Hats': 'Headwear essentials from beanies to baseball caps for every occasion',
    'Pants': 'Versatile pants and trousers for work, play, and everything in between',
    'Shoes': 'Footwear that combines style, comfort, and durability',
    'Accessories': 'The finishing touches that complete any outfit',
    'Jackets': 'Outerwear for all seasons and occasions',
    'Dresses': 'Elegant and casual dresses for every style and occasion',
    'Skirts': 'Flowy and fitted skirts to add movement to your wardrobe',
    'Shorts': 'Comfortable shorts for warm weather and casual days'
  };

  return descriptions[categoryName] || 'Quality products designed for everyday style';
}

export default async function Categories() {
  const categories = await getCategoriesWithCounts();

  // Get featured products for each category
  const categoriesWithProducts = await Promise.all(
    categories.map(async (category) => {
      const featuredProducts = await getFeaturedProductsByCategory(category.id, 3);
      const description = await getCategoryDescription(category.name);

      return {
        ...category,
        description,
        featuredProducts
      };
    })
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-3xl font-light text-black">Categories</h1>
          <p className="text-gray-600 mt-2">Explore our product categories</p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="space-y-16">
          {categoriesWithProducts.map((category) => (
            <div key={category.id} className="bg-white rounded-lg p-8">
              {/* Category Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-light text-black mb-2">{category.name}</h2>
                  <p className="text-gray-600 text-sm mb-2">{category.description}</p>
                  <p className="text-sm text-gray-500">
                    {category.productCount} {category.productCount === 1 ? 'product' : 'products'}
                  </p>
                </div>
                <Link
                  href={`/categories/${category.slug}`}
                  className="bg-black text-white px-6 py-3 text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Browse {category.name}
                </Link>
              </div>

              {/* Featured Products */}
              {category.featuredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.featuredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>No products in this category yet</p>
                </div>
              )}

              {/* View All Link */}
              {category.productCount > 3 && (
                <div className="text-center mt-8">
                  <Link
                    href={`/categories/${category.slug}`}
                    className="text-sm text-gray-600 hover:text-black transition-colors"
                  >
                    View all {category.productCount} products →
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
