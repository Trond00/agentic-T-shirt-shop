import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Product ID is required', code: 'MISSING_ID' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Get product with category
    const { data: product, error: productError } = await supabase
      .from('products')
      .select(`
        *,
        category:categories(*)
      `)
      .eq('id', id)
      .eq('published', true)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found', code: 'PRODUCT_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Get reviews
    const { data: reviews, error: reviewsError } = await supabase
      .from('reviews')
      .select('*')
      .eq('product_id', id)
      .order('created_at', { ascending: false });

    if (reviewsError) {
      console.error('Reviews error:', reviewsError);
    }

    const reviewsData = reviews || [];
    const averageRating = reviewsData.length > 0
      ? reviewsData.reduce((sum, review) => sum + review.rating, 0) / reviewsData.length
      : 0;

    // Format response for AI consumption
    const formattedProduct = {
      id: product.id,
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.unit_amount / 100, // Convert to decimal
      currency: product.currency,
      image_url: product.image_url,
      category: product.category?.name,
      category_id: product.category_id,
      in_stock: product.inventory_count > 0,
      inventory_count: product.inventory_count,
      reviews: reviewsData.map(review => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        customer_email: review.customer_email,
        created_at: review.created_at
      })),
      average_rating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      review_count: reviewsData.length,
      created_at: product.created_at,
      updated_at: product.updated_at
    };

    return NextResponse.json({
      product: formattedProduct
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
