import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
export async function GET(request: Request) {
  const businessId = new URL(request.url).searchParams.get("businessId"); if (!businessId) return NextResponse.json({ message: "Business ID is required." }, { status: 400 });
  const supabase = await createServerSupabaseClient(); const start = new Date(); start.setHours(0, 0, 0, 0);
  const [{ data: sales, error: salesError }, { count, error: productError }] = await Promise.all([supabase.from("sales").select("total_amount").eq("business_id", businessId).gte("created_at", start.toISOString()), supabase.from("products").select("id", { count: "exact", head: true }).eq("business_id", businessId).eq("active", true)]);
  if (salesError || productError) return NextResponse.json({ message: "Could not load dashboard." }, { status: 500 });
  return NextResponse.json({ sales: sales?.length ?? 0, revenue: (sales ?? []).reduce((total, sale) => total + Number(sale.total_amount), 0), products: count ?? 0 });
}
