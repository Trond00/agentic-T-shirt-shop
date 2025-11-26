import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getProductBySlugServer, getRelatedProductsServer, getAllProductSlugs } from '@/lib/supabase/products-server';
import { ProductWithReviews, Product as ProductType } from '@/lib/types';
import { ReviewCard } from '@/components/ReviewCard';
import { RelatedProducts } from '@/components/RelatedProducts';
import { ProductJsonLd } from '@/components/ProductJsonLd';
import { ProductOpenGraph } from '@/components/ProductOpenGraph';

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default async function Product({ params }: ProductPageProps) {
  const { slug } = await params;

  const product = await getProductBySlugServer(slug);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getRelatedProductsServer(product.id, product.category_id);

  const formatPrice = (amount: number, currency: string) => {
    const price = amount / 100; // Convert from øre/cents to currency units
    return new Intl.NumberFormat('no-NO', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
        viewBox="0 0 24 24"
      >
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ));
  };

  return (
    <>
      <ProductJsonLd product={product} />
      <ProductOpenGraph product={product} />
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <nav className="text-sm text-gray-600 mb-4">
            <Link href="/" className="hover:text-black">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/catalog" className="hover:text-black">Catalog</Link>
            <span className="mx-2">/</span>
            <span className="text-black">{product.name}</span>
          </nav>
          <h1 className="text-3xl font-light text-black">{product.name}</h1>
        </div>
      </div>

      {/* Product Details */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image */}
          <div className="aspect-square relative overflow-hidden bg-gray-50 rounded-lg">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={`${product.name} - ${product.category?.name || 'Product'} from Agentic Shop. ${product.description ? product.description.substring(0, 100) + '...' : 'High quality product'}`}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-light text-black mb-2">{product.name}</h2>
              <div className="flex items-center gap-4 mb-4">
                <span className="text-3xl font-semibold text-black">
                  {formatPrice(product.unit_amount, product.currency)}
                </span>
                {product.averageRating > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex">{renderStars(Math.round(product.averageRating))}</div>
                    <span className="text-sm text-gray-600">
                      ({product.reviewCount} review{product.reviewCount !== 1 ? 's' : ''})
                    </span>
                  </div>
                )}
              </div>

              {/* Availability */}
              <div className="mb-6">
                <span className={`text-sm font-medium ${product.inventory_count > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {product.inventory_count > 0 ? 'In stock' : 'Out of stock'}
                </span>
                {product.inventory_count > 0 && (
                  <span className="text-sm text-gray-600 ml-2">
                    ({product.inventory_count} available)
                  </span>
                )}
              </div>

              {/* Description */}
              {product.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-black mb-3">Description</h3>
                  <p className="text-gray-700 leading-relaxed">{product.description}</p>
                </div>
              )}

              {/* Category */}
              {product.category && (
                <div className="mb-6">
                  <span className="text-sm text-gray-600">Category: </span>
                  <Link
                    href={`/categories/${product.category.slug}`}
                    className="text-sm text-black hover:underline"
                  >
                    {product.category.name}
                  </Link>
                  <span className="text-sm text-gray-600 ml-4">•</span>
                  <Link
                    href={`/categories/${product.category.slug}`}
                    className="text-sm text-gray-600 hover:text-black transition-colors ml-4"
                  >
                    View other {product.category.name} →
                  </Link>
                </div>
              )}

              {/* Buy Button */}
              {product.inventory_count > 0 ? (
                <Link
                  href={`/checkout?product=${product.slug}`}
                  className="block w-full bg-black text-white py-4 px-6 text-center font-medium hover:bg-gray-800 transition-colors"
                >
                  Buy
                </Link>
              ) : (
                <button
                  className="w-full py-4 px-6 text-center font-medium bg-gray-300 text-gray-500 cursor-not-allowed"
                  disabled
                >
                  Out of stock
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        {product.reviews.length > 0 && (
          <div className="mt-16 border-t border-gray-200 pt-16">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-light text-black">Reviews</h2>
              <div className="flex items-center gap-2">
                <div className="flex">{renderStars(Math.round(product.averageRating))}</div>
                <span className="text-sm text-gray-600">
                  {product.averageRating.toFixed(1)} ({product.reviewCount} review{product.reviewCount !== 1 ? 's' : ''})
                </span>
              </div>
            </div>
            <div className="space-y-6">
              {product.reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))}
            </div>
          </div>
        )}

        {/* Related Products */}
        <RelatedProducts products={relatedProducts} />
      </div>
    </div>
    </>
  );
}

export async function generateStaticParams() {
  const productSlugs = await getAllProductSlugs();

  return productSlugs.map(({ slug }) => ({
    slug,
  }));
}
