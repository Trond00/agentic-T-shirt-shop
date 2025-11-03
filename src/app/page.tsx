import Link from 'next/link';
import { getProducts, getCategories } from '@/lib/supabase/products';
import { ProductCard } from '@/components/ProductCard';
import { Product, Category } from '@/lib/types';

async function getFeaturedProducts(): Promise<Product[]> {
  const { products } = await getProducts({
    search: '',
    category: '',
    sort: 'newest',
    page: 1,
    limit: 8
  });
  return products;
}

async function getAllCategories(): Promise<Category[]> {
  return await getCategories();
}

export default async function Home() {
  const [featuredProducts, categories] = await Promise.all([
    getFeaturedProducts(),
    getAllCategories()
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-white">
        <div className="max-w-7xl mx-auto px-4 py-20 lg:py-32">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-light text-black mb-6">
              Shop the collection
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Discover quality essentials designed for everyday style
            </p>
            <Link
              href="/catalog"
              className="inline-block bg-black text-white px-8 py-4 text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Browse catalog
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-2xl font-light text-black">Featured products</h2>
            <Link
              href="/catalog"
              className="text-sm text-gray-600 hover:text-black transition-colors"
            >
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-light text-black mb-12 text-center">Shop by category</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group bg-gray-50 hover:bg-gray-100 transition-colors p-6 text-center"
              >
                <div className="text-sm font-medium text-black group-hover:text-gray-600 transition-colors">
                  {category.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="max-w-md mx-auto">
            <div className="flex items-center justify-center gap-1 mb-4">
              {Array.from({ length: 5 }, (_, i) => (
                <svg
                  key={i}
                  className="w-5 h-5 text-yellow-400 fill-current"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              ))}
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Trusted by customers worldwide
            </p>
            <p className="text-xs text-gray-500">
              Quality products, exceptional service
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
