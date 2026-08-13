// src/app/api/categories/[id]/route.ts
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { ZodUUID } from '@/lib/validations/common';

const categoryUpdateSchema = z.object({
  name: z.string().min(1, 'Category name is required').max(100, 'Category name cannot exceed 100 characters').optional(),
  active: z.boolean().optional(),
  business_id: ZodUUID, // Required for security/ownership check
});

// GET /api/categories/[id]
// Fetch a single category by ID
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerSupabaseClient();
  const { id: categoryId } = await params;
  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get('businessId');

  if (!businessId) {
    return NextResponse.json({ message: 'Business ID is required.' }, { status: 400 });
  }

  try {
    const { data: category, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', categoryId)
      .eq('business_id', businessId)
      .single();

    if (error) {
      console.error('Error fetching category:', error);
      return NextResponse.json({ message: 'Category not found.' }, { status: 404 });
    }

    return NextResponse.json(category, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in GET /api/categories/[id]:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}

// PUT /api/categories/[id]
// Update an existing category
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerSupabaseClient();
  const { id: categoryId } = await params;

  try {
    const body = await req.json();
    const validatedData = categoryUpdateSchema.parse(body);

    const { business_id, ...updatePayload } = validatedData; // Extract business_id for query

    const { data: updatedCategory, error } = await supabase
      .from('categories')
      .update(updatePayload)
      .eq('id', categoryId)
      .eq('business_id', business_id) // Ensure ownership
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ message: 'A category with this name already exists.' }, { status: 409 });
      }
      console.error('Error updating category:', error);
      return NextResponse.json({ message: 'Failed to update category.' }, { status: 500 });
    }

    return NextResponse.json(updatedCategory, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation Error', errors: error.flatten() }, { status: 400 });
    }
    console.error('Unexpected error in PUT /api/categories/[id]:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}

// DELETE /api/categories/[id]
// Delete a category
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerSupabaseClient();
  const { id: categoryId } = await params;
  const { searchParams } = new URL(req.url);
  const businessId = searchParams.get('businessId');

  if (!businessId) {
    return NextResponse.json({ message: 'Business ID is required.' }, { status: 400 });
  }

  try {
    // Check if any products are associated with this category
    const { count, error: productCountError } = await supabase
      .from('products')
      .select('id', { count: 'exact' })
      .eq('category_id', categoryId)
      .eq('business_id', businessId)
      .limit(1); // We only need to know if at least one exists

    if (productCountError) {
      console.error('Error checking associated products:', productCountError);
      return NextResponse.json({ message: 'Failed to check product associations.' }, { status: 500 });
    }

    if (count && count > 0) {
      return NextResponse.json({
        message: 'Cannot delete category: products are still assigned to it. Reassign products or deactivate the category first.'
      }, { status: 409 }); // Conflict
    }

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId)
      .eq('business_id', businessId); // Ensure ownership

    if (error) {
      console.error('Error deleting category:', error);
      return NextResponse.json({ message: 'Failed to delete category.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Category deleted successfully.' }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in DELETE /api/categories/[id]:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
