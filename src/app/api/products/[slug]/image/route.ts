import { NextRequest, NextResponse } from 'next/server';
import { getProductBySlugServer } from '@/lib/supabase/products-server';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug } = params;

    // Get product data to find the image URL
    const product = await getProductBySlugServer(slug);

    if (!product || !product.image_url) {
      return NextResponse.json(
        { error: 'Product or image not found' },
        { status: 404 }
      );
    }

    // Fetch the image from Supabase
    const imageResponse = await fetch(product.image_url);

    if (!imageResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch image' },
        { status: 500 }
      );
    }

    // Get the image data
    const imageBuffer = await imageResponse.arrayBuffer();
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    // Return the image with proper headers for AI access
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Access-Control-Allow-Headers': 'Content-Type',
        // Additional headers that help AI systems
        'X-Image-Description': `${product.name} - ${product.category?.name || 'Product'} from Agentic Shop`,
        'X-Image-Alt': `${product.name} product image`,
        'X-Product-Name': product.name,
        'X-Product-Category': product.category?.name || 'General',
      },
    });

  } catch (error) {
    console.error('Image API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
