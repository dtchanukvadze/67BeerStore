// src/app/api/categories/route.ts
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { ZodUUID } from '@/lib/validations/common';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Category name cannot exceed 100 characters'),
  business_id: ZodUUID,
  active: z.boolean().optional().default(true),
});

// GET /api/categories
// Fetch all categories for a given business
export async function GET(req: Request) {
  const supabase = await createServerSupabaseClient();
  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get('businessId');
  const activeStatus = searchParams.get('active'); // 'true', 'false', or null/undefined for all

  if (!businessId) {
    return NextResponse.json({ message: 'Business ID is required.' }, { status: 400 });
  }

  try {
    let query = supabase
      .from('categories')
      .select('*')
      .eq('business_id', businessId)
      .order('name', { ascending: true });

    if (activeStatus !== null) {
      query = query.eq('active', activeStatus === 'true');
    }

    const { data: categories, error } = await query;

    if (error) {
      console.error('Error fetching categories:', error);
      return NextResponse.json({ message: 'Failed to fetch categories.' }, { status: 500 });
    }

    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in GET /api/categories:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}

// POST /api/categories
// Create a new category
export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient();

  try {
    const body = await req.json();
    const validatedData = categorySchema.parse(body);

    const { data: newCategory, error } = await supabase
      .from('categories')
      .insert(validatedData)
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique violation error code
        return NextResponse.json({ message: 'A category with this name already exists.' }, { status: 409 });
      }
      console.error('Error creating category:', error);
      return NextResponse.json({ message: 'Failed to create category.' }, { status: 500 });
    }

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation Error', errors: error.flatten() }, { status: 400 });
    }
    console.error('Unexpected error in POST /api/categories:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
