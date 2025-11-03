import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getCategoriesWithCounts, getProducts } from '@/lib/supabase/products';
import { ProductCard } from '@/components/ProductCard';
import { CatalogFilters } from '@/components/CatalogFilters';
import { Pagination } from '@/components/Pagination';
import { Product, Category, CatalogFilters as CatalogFiltersType } from '@/lib/types';

async function getCategoryBySlug(slug: string) {
  const categories = await getCategoriesWithCounts();
  return categories.find(cat => cat.slug === slug);
}

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

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const description = await getCategoryDescription(category.name);

  // Get all categories for navigation
  const allCategories = await getCategoriesWithCounts();

  // Get products for this category (simplified - no client-side filtering for now)
  const { products, totalCount } = await getProducts({
    search: '',
    category: category.id,
    sort: 'newest',
    page: 1,
    limit: 24 // Show more products per page for category pages
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <nav className="text-sm text-gray-600 mb-4">
            <Link href="/" className="hover:text-black">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/categories" className="hover:text-black">Categories</Link>
            <span className="mx-2">/</span>
            <span className="text-black">{category.name}</span>
          </nav>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-light text-black">{category.name}</h1>
              <p className="text-gray-600 mt-2">{description}</p>
              <p className="text-sm text-gray-500 mt-1">
                {totalCount} {totalCount === 1 ? 'product' : 'products'}
              </p>
            </div>
            <Link
              href="/catalog"
              className="text-sm text-gray-600 hover:text-black transition-colors"
            >
              View all products →
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Category Navigation Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg p-6 sticky top-8">
              <h3 className="text-lg font-medium text-black mb-4">Categories</h3>
              <div className="space-y-2">
                {allCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/categories/${cat.slug}`}
                    className={`block px-3 py-2 text-sm rounded transition-colors ${
                      cat.id === category.id
                        ? 'bg-black text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{cat.name}</span>
                      <span className="text-xs opacity-75">
                        {cat.productCount}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
              <div className="mt-6 pt-4 border-t border-gray-200">
                <Link
                  href="/categories"
                  className="text-sm text-gray-600 hover:text-black transition-colors"
                >
                  View all categories →
                </Link>
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            {products.length === 0 ? (
              <div className="text-center py-16">
                <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-500 mb-4">This category doesn't have any products yet.</p>
                <Link
                  href="/catalog"
                  className="inline-block bg-black text-white px-6 py-3 text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Browse all products
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Simple pagination for now - could be enhanced later */}
                {totalCount > 24 && (
                  <div className="text-center mt-12">
                    <p className="text-sm text-gray-600 mb-4">
                      Showing {products.length} of {totalCount} products
                    </p>
                    <Link
                      href="/catalog"
                      className="inline-block bg-black text-white px-6 py-3 text-sm font-medium hover:bg-gray-800 transition-colors"
                    >
                      View all in catalog
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Generate static params for all categories
export async function generateStaticParams() {
  const categories = await getCategoriesWithCounts();

  return categories.map((category) => ({
    slug: category.slug,
  }));
}
