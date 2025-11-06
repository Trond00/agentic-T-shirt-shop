import { ProductWithReviews } from '@/lib/types';

interface ProductJsonLdProps {
  product: ProductWithReviews;
}

export function ProductJsonLd({ product }: ProductJsonLdProps) {
  // Generate JSON-LD structured data for Product schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description || `${product.name} - High quality product from our collection`,
    image: product.image_url ? [product.image_url] : [],
    category: product.category?.name || 'General',
    brand: {
      '@type': 'Brand',
      name: 'Agentic Shop' // You can customize this
    },
    offers: {
      '@type': 'Offer',
      price: (product.unit_amount / 100).toFixed(2),
      priceCurrency: product.currency,
      availability: product.inventory_count > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Agentic Shop'
      }
    },
    ...(product.averageRating > 0 && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.averageRating.toFixed(1),
        reviewCount: product.reviewCount,
        bestRating: 5,
        worstRating: 1
      }
    }),
    ...(product.reviews.length > 0 && {
      review: product.reviews.slice(0, 5).map(review => ({
        '@type': 'Review',
        reviewRating: {
          '@type': 'Rating',
          ratingValue: review.rating,
          bestRating: 5,
          worstRating: 1
        },
        author: {
          '@type': 'Person',
          name: review.customer_email ? 'Verified Customer' : 'Anonymous'
        },
        reviewBody: review.comment || 'Great product!'
      }))
    })
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(jsonLd, null, 0)
      }}
    />
  );
}
