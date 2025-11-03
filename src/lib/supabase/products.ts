import { createClient } from './client';
import { Product, Category, CatalogFilters } from '@/lib/types';

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
