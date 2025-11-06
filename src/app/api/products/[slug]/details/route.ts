import { NextRequest, NextResponse } from 'next/server';
import { getProductBySlugServer, getRelatedProductsServer } from '@/lib/supabase/products-server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // Get detailed product information
    const product = await getProductBySlugServer(slug);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Get related products
    const relatedProducts = await getRelatedProductsServer(product.id, product.category_id, 4);

    // Transform for AI consumption
    const aiFriendlyProduct = {
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
      rating: product.averageRating,
      review_count: product.reviewCount,
      reviews: product.reviews.map(review => ({
        rating: review.rating,
        comment: review.comment,
        created_at: review.created_at,
      })),
      tags: [product.category?.name, 'clothing', 'fashion'].filter(Boolean),
      related_products: relatedProducts.map(related => ({
        id: related.id,
        name: related.name,
        slug: related.slug,
        price: (related.unit_amount / 100).toFixed(2),
        currency: related.currency,
        image_url: `${request.nextUrl.origin}/api/products/${related.slug}/image`,
        product_url: `${request.nextUrl.origin}/products/${related.slug}`,
      })),
    };

    return NextResponse.json({
      product: aiFriendlyProduct,
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
    console.error('Product details API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch product details',
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
