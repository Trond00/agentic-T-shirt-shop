import { createClient as createServerClient, createServiceClient } from './server';
import { Product, ProductWithReviews } from '@/lib/types';

// Server-side functions for use in server components and API routes
export async function getProductBySlugServer(slug: string): Promise<ProductWithReviews | null> {
  const supabase = await createServerClient();

  // Get product with category
  const { data: product, error: productError } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('slug', slug)
    .eq('published', true)
    .single();

  if (productError || !product) {
    console.error('Error fetching product:', productError);
    return null;
  }

  // Get reviews
  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select('*')
    .eq('product_id', product.id)
    .order('created_at', { ascending: false });

  if (reviewsError) {
    console.error('Error fetching reviews:', reviewsError);
  }

  const reviewsData = reviews || [];
  const averageRating = reviewsData.length > 0
    ? reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsData.length
    : 0;

  return {
    ...product,
    reviews: reviewsData,
    averageRating,
    reviewCount: reviewsData.length
  };
}

export async function getRelatedProductsServer(productId: string, categoryId: string, limit: number = 4): Promise<Product[]> {
  const supabase = await createServerClient();

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('published', true)
    .eq('category_id', categoryId)
    .neq('id', productId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching related products:', error);
    return [];
  }

  return data || [];
}

export async function getAllProductSlugs(): Promise<{ slug: string }[]> {
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from('products')
    .select('slug')
    .eq('published', true);

  if (error) {
    console.error('Error fetching product slugs:', error);
    return [];
  }

  return data || [];
}
