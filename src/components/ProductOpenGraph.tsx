import { ProductWithReviews } from '@/lib/types';

interface ProductOpenGraphProps {
  product: ProductWithReviews;
}

export function ProductOpenGraph({ product }: ProductOpenGraphProps) {
  const formatPrice = (amount: number, currency: string) => {
    const price = amount / 100;
    return new Intl.NumberFormat('no-NO', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const title = product.name;
  const description = product.description ||
    `${product.name} - High quality product from our collection. ${formatPrice(product.unit_amount, product.currency)}.`;

  // Use the product image if available, otherwise fallback to a default
  const imageUrl = product.image_url ||
    'https://agentic-t-shirt-shop.vercel.app/og-default.jpg'; // You can add a default OG image

  return (
    <>
      {/* Image preload for scrapers */}
      {product.image_url && (
        <link rel="preload" as="image" href={product.image_url} />
      )}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="product" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:alt" content={`${product.name} product image`} />
      <meta property="og:image:type" content="image/jpeg" />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:url" content={`https://agentic-t-shirt-shop.vercel.app/products/${product.slug}`} />
      <meta property="og:site_name" content="Agentic Shop" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content={`${product.name} product image`} />

      {/* Product specific meta tags */}
      <meta property="product:price:amount" content={(product.unit_amount / 100).toFixed(2)} />
      <meta property="product:price:currency" content={product.currency} />
      <meta property="product:availability" content={product.inventory_count > 0 ? 'in stock' : 'out of stock'} />
      {product.category && (
        <meta property="product:category" content={product.category.name} />
      )}
    </>
  );
}
