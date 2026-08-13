import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
export async function GET() { const supabase = await createServerSupabaseClient(); const { data, error } = await supabase.from("sales").select("id, sale_number, payment_method, total_amount, created_at").order("created_at", { ascending: false }).limit(100); return error ? NextResponse.json({ message: error.message }, { status: 500 }) : NextResponse.json(data); }
