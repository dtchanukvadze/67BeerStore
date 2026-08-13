import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { expenseFormSchema } from "@/lib/validations/expense";
import { z } from "zod";

export async function GET() {
  const { data, error } = await createAdminClient().from("expenses").select("*, expense_categories(name)").order("expense_date", { ascending: false }).limit(100);
  return error ? NextResponse.json({ message: error.message }, { status: 500 }) : NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const values = expenseFormSchema.parse(body);
    const { data, error } = await createAdminClient().from("expenses").insert({ ...values, description: values.description || null }).select().single();
    return error ? NextResponse.json({ message: error.message }, { status: 500 }) : NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof z.ZodError ? "Please check the expense details." : "Unable to save expense." }, { status: 400 });
  }
}
