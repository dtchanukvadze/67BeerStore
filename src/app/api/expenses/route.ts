import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { expenseFormSchema } from "@/lib/validations/expense";
import { z } from "zod";

export async function GET(request: Request) {
  const businessId = new URL(request.url).searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ message: "Business ID is required." }, { status: 400 });
  const { data, error } = await createAdminClient().from("expenses").select("*, expense_categories(name)").eq("business_id", businessId).order("expense_date", { ascending: false }).limit(100);
  return error ? NextResponse.json({ message: error.message }, { status: 500 }) : NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const businessId = z.string().uuid().parse(body.business_id);
    const values = expenseFormSchema.parse(body);
    const { data, error } = await createAdminClient().from("expenses").insert({ business_id: businessId, ...values, description: values.description || null }).select().single();
    return error ? NextResponse.json({ message: error.message }, { status: 500 }) : NextResponse.json(data, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof z.ZodError ? "Please check the expense details." : "Unable to save expense." }, { status: 400 });
  }
}
