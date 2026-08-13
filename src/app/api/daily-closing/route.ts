import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { dailyClosingFormSchema } from "@/lib/validations/dailyClosing";
import { z } from "zod";

export async function GET(request: Request) {
  const businessId = new URL(request.url).searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ message: "Business ID is required." }, { status: 400 });
  const { data, error } = await createAdminClient().from("daily_closings").select("*").eq("business_id", businessId).order("closing_date", { ascending: false }).limit(30);
  return error ? NextResponse.json({ message: error.message }, { status: 500 }) : NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const businessId = z.string().uuid().parse(body.business_id);
    const values = dailyClosingFormSchema.parse(body);
    const db = createAdminClient();
    const { data: sales, error: salesError } = await db.from("sales").select("total_amount, payment_method").eq("business_id", businessId).eq("payment_method", "cash").gte("created_at", `${values.closing_date}T00:00:00`).lt("created_at", `${values.closing_date}T23:59:59.999`);
    if (salesError) throw salesError;
    const expected = (sales ?? []).reduce((sum, sale) => sum + Number(sale.total_amount), 0);
    const { data, error } = await db.from("daily_closings").upsert({ business_id: businessId, ...values, expected_cash: expected, difference: Number(values.actual_cash) - expected }, { onConflict: "business_id,closing_date" }).select().single();
    return error ? NextResponse.json({ message: error.message }, { status: 500 }) : NextResponse.json(data, { status: 201 });
  } catch (error) { return NextResponse.json({ message: error instanceof z.ZodError ? "Please enter a valid date and cash amount." : "Unable to save closing." }, { status: 400 }); }
}
