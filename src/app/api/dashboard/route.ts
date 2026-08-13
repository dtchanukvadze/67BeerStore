import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
export async function GET() {
  const supabase = await createServerSupabaseClient(); const start = new Date(); start.setHours(0, 0, 0, 0);
  const [{ data: sales, error: salesError }, { count, error: productError }] = await Promise.all([supabase.from("sales").select("total_amount").gte("created_at", start.toISOString()), supabase.from("products").select("id", { count: "exact", head: true }).eq("active", true)]);
  if (salesError || productError) return NextResponse.json({ message: "Could not load dashboard." }, { status: 500 });
  return NextResponse.json({ sales: sales?.length ?? 0, revenue: (sales ?? []).reduce((total, sale) => total + Number(sale.total_amount), 0), products: count ?? 0 });
}
