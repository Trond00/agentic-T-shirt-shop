import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/lib/supabase/products';
import { CatalogFilters } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const filters: CatalogFilters = {
      search: searchParams.get('q') || '',
      category: searchParams.get('category') || '',
      sort: (searchParams.get('sort') as CatalogFilters['sort']) || 'newest',
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '20'), 50), // Max 50 per page
    };

    // Get products
    const { products, totalCount } = await getProducts(filters);

    // Transform for AI consumption
    const aiFriendlyProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description || `${product.name} - High quality product from our collection`,
      price: (product.unit_amount / 100).toFixed(2),
      currency: product.currency,
      category: product.category?.name || 'General',
      image_url: `${request.nextUrl.origin}/api/products/${product.slug}/image`,
      image_alt: `${product.name} - ${product.category?.name || 'Product'} from Agentic Shop`,
      product_url: `${request.nextUrl.origin}/products/${product.slug}`,
      in_stock: product.inventory_count > 0,
      stock_count: product.inventory_count,
      rating: 0, // Will be populated if we fetch reviews
      review_count: 0, // Will be populated if we fetch reviews
      tags: [product.category?.name, 'clothing', 'fashion'].filter(Boolean),
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / filters.limit);

    return NextResponse.json({
      products: aiFriendlyProducts,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: totalCount,
        total_pages: totalPages,
        has_next: filters.page < totalPages,
        has_prev: filters.page > 1,
      },
      query: filters.search || null,
      category: filters.category || null,
      _metadata: {
        store_name: 'Agentic Shop',
        store_description: 'High-quality clothing and accessories',
        api_version: '1.0',
        generated_at: new Date().toISOString(),
        ai_friendly: true,
      }
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=300', // Cache for 5 minutes
      },
    });

  } catch (error) {
    console.error('Products API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch products',
        _metadata: {
          store_name: 'Agentic Shop',
          api_version: '1.0',
          error: true,
        }
      },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
        }
      }
    );
  }
}
