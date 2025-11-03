import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: categories, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Categories error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch categories', code: 'FETCH_FAILED' },
        { status: 500 }
      );
    }

    // Format response for AI consumption
    const formattedCategories = categories?.map(category => ({
      id: category.id,
      name: category.name,
      slug: category.slug
    })) || [];

    return NextResponse.json({
      categories: formattedCategories,
      total: formattedCategories.length
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}
