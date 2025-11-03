import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Product, Category } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (!query) {
      return NextResponse.json(
        { error: 'Search query is required', code: 'MISSING_QUERY' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Search products with category join
    const { data: products, error } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('published', true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('name')
      .limit(20); // Limit results for API

    if (error) {
      console.error('Search error:', error);
      return NextResponse.json(
        { error: 'Failed to search products', code: 'SEARCH_FAILED' },
        { status: 500 }
      );
    }

    // Format response for AI consumption
    const formattedProducts = products?.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.unit_amount / 100, // Convert to decimal
      currency: product.currency,
      image_url: product.image_url,
      category: product.category?.name,
      in_stock: product.inventory_count > 0,
      inventory_count: product.inventory_count
    })) || [];

    return NextResponse.json({
      products: formattedProducts,
      total: formattedProducts.length,
      query: query
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
