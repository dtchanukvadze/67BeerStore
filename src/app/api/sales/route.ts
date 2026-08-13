// For /api/sales - POST to create a new sale
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin'; // Use admin client for RPC call
import { completeSaleSchema } from '@/lib/validations/sale';
import { z } from 'zod';

export async function GET() {
  const supabaseAdmin = createAdminClient();
  const { data, error } = await supabaseAdmin.from('sales').select('id, sale_number, payment_method, total_amount, created_at').order('created_at', { ascending: false }).limit(100);
  return error ? NextResponse.json({ message: error.message }, { status: 500 }) : NextResponse.json(data);
}

export async function POST(req: Request) {
  try {
    const supabaseAdmin = createAdminClient();
    const body = await req.json();

    // Validate request body using Zod
    const validatedData = completeSaleSchema.parse(body);

    const { payment_method, cart_items } = validatedData;

    // Call the Supabase RPC function for atomic sale creation
    const { data, error } = await supabaseAdmin.rpc('create_sale_transaction', {
      p_payment_method: payment_method,
      p_cart_items: cart_items, // JSONB array is passed
    });

    if (error) {
      console.error('Error creating sale:', error);
      // Map database errors to user-friendly messages
      let errorMessage = 'Unable to complete sale. Please try again.';
      if (error.message.includes('Product with ID')) {
        errorMessage = error.message; // Propagate specific product error
      }
      return NextResponse.json({ message: errorMessage }, { status: 500 });
    }

    // Assuming the RPC function returns sale_id, sale_number, total_amount
    const { sale_id, sale_number, total_amount } = data[0];

    return NextResponse.json({
      message: 'Sale completed successfully!',
      saleId: sale_id,
      saleNumber: sale_number,
      totalAmount: total_amount,
    }, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation Error', errors: error.flatten() }, { status: 400 });
    }
    console.error('Unexpected error in /api/sales POST:', error);
    return NextResponse.json({ message: 'An unexpected error occurred.' }, { status: 500 });
  }
}
