// src/app/api/products/route.ts
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { productFormSchema } from '@/lib/validations/product';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid'; // For unique filenames

// GET /api/products
// Fetch all active products, with optional filtering and sorting
export async function GET(req: Request) {
  const supabase = await createServerSupabaseClient();
  const { searchParams } = new URL(req.url);

  const categoryId = searchParams.get('categoryId');
  const activeStatus = searchParams.get('active') ?? searchParams.get('activeStatus'); // 'true', 'false', or null/undefined for all
  const search = searchParams.get('search'); // Search by name or description
  const sortBy = searchParams.get('sortBy') || 'name'; // Default sort
  const sortOrder = searchParams.get('sortOrder') === 'desc' ? 'desc' : 'asc'; // Default asc

  try {
    let query = supabase
      .from('products')
      .select('*, categories(id, name)'); // Select category details

    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }
    if (activeStatus !== null) {
      query = query.eq('active', activeStatus === 'true');
    }
    if (search) {
      query = query.ilike('name', `%${search}%`) // Case-insensitive search
        .or(`description.ilike.%${search}%`);
    }

    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    const { data: products, error } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      return NextResponse.json({ message: 'Failed to fetch products.' }, { status: 500 });
    }

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in GET /api/products:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}

// POST /api/products
// Add a new product, including image upload to Supabase Storage
export async function POST(req: Request) {
  const supabase = await createServerSupabaseClient(); // For DB operations
  const supabaseAdmin = createAdminClient(); // For Storage operations (service_role)

  try {
    const formData = await req.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string | null;
    const price = formData.get('price') as string;
    const category_id = formData.get('category_id') as string | null;
    const active = formData.get('active') === 'true';
    const image_file = formData.get('image_file') as File | null;

    const parsedPrice = parseFloat(price); // Zod will re-validate

    // Validate using Zod schema
    const productData = {
      name,
      description: description || null,
      price: parsedPrice,
      category_id: category_id || null, // Ensure category_id is null if empty string
      active,
      image_file: image_file && image_file.size > 0 ? [image_file] : undefined, // Zod expects FileList-like array
    };

    const validatedData = productFormSchema.parse(productData);

    let imageUrl: string | null = null;
    const newProductId: string = uuidv4(); // Generate product ID early for image path

    // 1. Create product record first to get an ID for the image path
    const { data: newProduct, error: productError } = await supabase
      .from('products')
      .insert({
        id: newProductId, // Use pre-generated ID
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price,
        category_id: validatedData.category_id,
        active: validatedData.active,
        image_url: null, // Set null initially, update after upload
      })
      .select('id')
      .single();

    if (productError || !newProduct) {
      console.error('Error creating product:', productError);
      return NextResponse.json({ message: productError?.message || 'Failed to create product.' }, { status: 500 });
    }

    // 2. Upload image if provided
    if (image_file && image_file.size > 0) {
      const fileExtension = image_file.name.split('.').pop();
      const uniqueFileName = `${uuidv4()}.${fileExtension}`;
      const imagePath = `product-images/${newProduct.id}/${uniqueFileName}`;

      const { error: uploadError } = await supabaseAdmin.storage
        .from('product-images')
        .upload(imagePath, image_file, {
          cacheControl: '3600',
          upsert: false,
          contentType: image_file.type,
        });

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        // Clean up partially created product if image upload fails? Or leave without image.
        // For simplicity here, we leave the product and report error, user can re-upload.
        return NextResponse.json({ message: 'Product created, but image upload failed.', productId: newProduct.id }, { status: 201 });
      }

      // Get public URL and update product
      const { data: publicUrlData } = supabaseAdmin.storage.from('product-images').getPublicUrl(imagePath);
      imageUrl = publicUrlData.publicUrl;

      const { error: updateError } = await supabase
        .from('products')
        .update({ image_url: imageUrl })
        .eq('id', newProduct.id);

      if (updateError) {
        console.error('Error updating product image_url:', updateError);
        // Image is uploaded but DB update failed, log and report.
        return NextResponse.json({ message: 'Product created, image uploaded but DB update failed.' }, { status: 500 });
      }
    }

    return NextResponse.json({ message: 'Product created successfully!', productId: newProduct.id }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation Error', errors: error.flatten() }, { status: 400 });
    }
    console.error('Unexpected error in POST /api/products:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
