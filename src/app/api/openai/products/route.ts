import { NextRequest, NextResponse } from 'next/server';
import { getProducts } from '@/lib/supabase/products';
import { CatalogFilters } from '@/lib/types';
import { transformToOpenAIProductFeed } from '@/lib/openai-product-feed';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters for filtering
    const filters: CatalogFilters = {
      search: searchParams.get('q') || '',
      category: searchParams.get('category') || '',
      sort: (searchParams.get('sort') as CatalogFilters['sort']) || 'newest',
      page: parseInt(searchParams.get('page') || '1'),
      limit: Math.min(parseInt(searchParams.get('limit') || '1000'), 5000), // Higher limit for feeds
    };

    // Get all published products (ignore pagination for feed)
    const { products } = await getProducts({
      ...filters,
      page: 1,
      limit: 5000 // Get up to 5000 products for the feed
    });

    // Transform products to OpenAI Product Feed format
    const openAIProducts = await transformToOpenAIProductFeed(products, request);

    // Return OpenAI-compliant product feed
    return NextResponse.json({
      products: openAIProducts,
      _metadata: {
        feed_format: 'OpenAI Product Feed v1.0',
        total_products: openAIProducts.length,
        generated_at: new Date().toISOString(),
        store_name: 'Agentic Shop',
        store_url: `${request.nextUrl.origin}`,
        feed_url: `${request.nextUrl.origin}/api/openai/products`,
        specification: 'https://developers.openai.com/commerce/specs/feed'
      }
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=1800', // Cache for 30 minutes
        'Content-Type': 'application/json',
      },
    });

  } catch (error) {
    console.error('OpenAI Product Feed API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to generate OpenAI product feed',
        _metadata: {
          feed_format: 'OpenAI Product Feed v1.0',
          error: true,
          generated_at: new Date().toISOString(),
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
