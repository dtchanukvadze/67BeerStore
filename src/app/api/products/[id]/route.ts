// src/app/api/products/[id]/route.ts
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { productUpdateSchema } from '@/lib/validations/product';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import type { TablesUpdate } from '@/lib/types/db';

// GET /api/products/[id]
// Fetch a single product by ID
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerSupabaseClient();
  const { id: productId } = await params;

  try {
    const { data: product, error } = await supabase
      .from('products')
      .select('*, categories(id, name)')
      .eq('id', productId)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
    }

    return NextResponse.json(product, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in GET /api/products/[id]:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}

// PUT /api/products/[id]
// Update an existing product, including image replacement/removal
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerSupabaseClient();
  const supabaseAdmin = createAdminClient();
  const { id: productId } = await params;

  try {
    const formData = await req.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string | null;
    const price = formData.get('price') as string;
    const category_id = formData.get('category_id') as string | null;
    const active = formData.get('active') === 'true';
    const image_file = formData.get('image_file') as File | null; // New image file
    const existing_image_url = formData.get('existing_image_url') as string | null; // Current image URL if exists
    const remove_image = formData.get('remove_image') === 'true'; // Flag to remove existing image

    const parsedPrice = parseFloat(price);

    const productData = {
      name,
      description: description || null,
      price: parsedPrice,
      category_id: category_id || null,
      active,
      image_file: image_file && image_file.size > 0 ? [image_file] : undefined,
    };

    const validatedData = productUpdateSchema.parse(productData);

    let finalImageUrl: string | null = existing_image_url; // Start with existing URL

    // Handle image removal first
    if (remove_image && existing_image_url) {
      const oldImagePath = existing_image_url.split('/public/')[1];
      if (oldImagePath) {
        const { error: deleteError } = await supabaseAdmin.storage.from('product-images').remove([oldImagePath]);
        if (deleteError) console.error('Error deleting old image:', deleteError);
      }
      finalImageUrl = null; // Image is removed
    }

    // Handle new image upload
    if (image_file && image_file.size > 0) {
      // If there was an old image and a new one is uploaded, delete the old one first
      if (existing_image_url && !remove_image) { // Don't delete if it was already marked for removal
        const oldImagePath = existing_image_url.split('/public/')[1];
        if (oldImagePath) {
          const { error: deleteError } = await supabaseAdmin.storage.from('product-images').remove([oldImagePath]);
          if (deleteError) console.error('Error deleting existing image before new upload:', deleteError);
        }
      }

      const fileExtension = image_file.name.split('.').pop();
      const uniqueFileName = `${uuidv4()}.${fileExtension}`;
      const imagePath = `product-images/${productId}/${uniqueFileName}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from('product-images')
        .upload(imagePath, image_file, {
          cacheControl: '3600',
          upsert: false,
          contentType: image_file.type,
        });

      if (uploadError) {
        console.error('Error uploading new image:', uploadError);
        // Keep previous image_url or null if it was removed, report error to user
        finalImageUrl = existing_image_url; // Revert to old if upload fails
        // Consider toast.error here for frontend feedback
      } else {
        const { data: publicUrlData } = supabaseAdmin.storage.from('product-images').getPublicUrl(imagePath);
        finalImageUrl = publicUrlData.publicUrl;
      }
    }

    // Prepare update object, only include fields that were provided/changed
    const updatePayload: TablesUpdate<'products'> = {};
    if (validatedData.name !== undefined) updatePayload.name = validatedData.name;
    if (validatedData.description !== undefined) updatePayload.description = validatedData.description;
    if (validatedData.price !== undefined) updatePayload.price = validatedData.price;
    if (validatedData.category_id !== undefined) updatePayload.category_id = validatedData.category_id;
    if (validatedData.active !== undefined) updatePayload.active = validatedData.active;
    // Always update image_url based on image handling logic
    updatePayload.image_url = finalImageUrl;

    const { data: updatedProduct, error: updateError } = await supabase
      .from('products')
      .update(updatePayload)
      .eq('id', productId)
      .select('id')
      .single();

    if (updateError || !updatedProduct) {
      console.error('Error updating product in DB:', updateError);
      return NextResponse.json({ message: updateError?.message || 'Failed to update product.' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Product updated successfully!', productId: updatedProduct.id }, { status: 200 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation Error', errors: error.flatten() }, { status: 400 });
    }
    console.error('Unexpected error in PUT /api/products/[id]:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}

// DELETE /api/products/[id]
// Delete a product (only if no sales history) and its associated image
export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerSupabaseClient();
  const supabaseAdmin = createAdminClient();
  const { id: productId } = await params;

  try {
    // 1. Check for sales history
    const { count, error: countError } = await supabase
      .from('sale_items')
      .select('id', { count: 'exact' })
      .eq('product_id', productId);

    if (countError) {
      console.error('Error checking sales history:', countError);
      return NextResponse.json({ message: 'Failed to check product sales history.' }, { status: 500 });
    }

    if (count && count > 0) {
      return NextResponse.json({
        message: 'This product has sales history and cannot be deleted. Deactivate it instead.'
      }, { status: 403 }); // Forbidden
    }

    // 2. Get product details to delete image
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('image_url')
      .eq('id', productId)
      .single();

    if (productError || !product) {
      return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
    }

    // 3. Delete product from database
    const { error: deleteProductError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (deleteProductError) {
      console.error('Error deleting product:', deleteProductError);
      return NextResponse.json({ message: 'Failed to delete product.' }, { status: 500 });
    }

    // 4. Delete image from Supabase Storage if it exists
    if (product.image_url) {
      const imagePath = product.image_url.split('/public/')[1];
      if (imagePath) {
        const { error: storageError } = await supabaseAdmin.storage
          .from('product-images')
          .remove([imagePath]);

        if (storageError) {
          console.error('Error deleting image from storage:', storageError);
          // Log error but don't fail the whole deletion if DB delete was successful
        }
      }
    }

    return NextResponse.json({ message: 'Product deleted successfully.' }, { status: 200 });

  } catch (error) {
    console.error('Unexpected error in DELETE /api/products/[id]:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
