import { createClient } from './client';
import { Product, Category, CatalogFilters, ProductWithReviews, Review } from '@/lib/types';

// Client-side functions for use in client components
export async function getCategories(): Promise<Category[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data || [];
}

export async function getCategoriesWithCounts(): Promise<(Category & { productCount: number })[]> {
  const supabase = createClient();

  // Get categories with product counts
  const { data, error } = await supabase
    .from('categories')
    .select(`
      *,
      products:products(count)
    `)
    .order('name');

  if (error) {
    console.error('Error fetching categories with counts:', error);
    return [];
  }

  return (data || []).map(category => ({
    ...category,
    productCount: category.products?.[0]?.count || 0
  }));
}

export async function getFeaturedProductsByCategory(categoryId: string, limit: number = 3): Promise<Product[]> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      category:categories(*)
    `)
    .eq('published', true)
    .eq('category_id', categoryId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching featured products by category:', error);
    return [];
  }

  return data || [];
}

export async function getProducts(filters: CatalogFilters): Promise<{
  products: Product[];
  totalCount: number;
}> {
  const supabase = createClient();

  let query = supabase
    .from('products')
    .select(`
      *,
      category:categories(*)
    `, { count: 'exact' })
    .eq('published', true);

  // Apply category filter
  if (filters.category) {
    query = query.eq('category_id', filters.category);
  }

  // Apply search filter
  if (filters.search) {
    query = query.ilike('name', `%${filters.search}%`);
  }

  // Apply sorting
  switch (filters.sort) {
    case 'name-asc':
      query = query.order('name', { ascending: true });
      break;
    case 'name-desc':
      query = query.order('name', { ascending: false });
      break;
    case 'price-asc':
      query = query.order('unit_amount', { ascending: true });
      break;
    case 'price-desc':
      query = query.order('unit_amount', { ascending: false });
      break;
    case 'newest':
    default:
      query = query.order('created_at', { ascending: false });
      break;
  }

  // Apply pagination
  const from = (filters.page - 1) * filters.limit;
  const to = from + filters.limit - 1;
  query = query.range(from, to);

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching products:', error);
    return { products: [], totalCount: 0 };
  }

  return {
    products: data || [],
    totalCount: count || 0
  };
}

export async function getProductBySlug(slug: string): Promise<ProductWithReviews | null> {
  const supabase = createClient();

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

export async function getRelatedProducts(productId: string, categoryId: string, limit: number = 4): Promise<Product[]> {
  const supabase = createClient();

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
