import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

export async function GET(request: Request) {
  const businessId = new URL(request.url).searchParams.get("businessId");
  if (!businessId) return NextResponse.json({ message: "Business ID is required." }, { status: 400 });
  const { data, error } = await createAdminClient().from("expense_categories").select("*").eq("business_id", businessId).eq("active", true).order("name");
  return error ? NextResponse.json({ message: error.message }, { status: 500 }) : NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const { business_id, name } = await request.json();
    const businessId = z.string().uuid().parse(business_id);
    const categoryName = z.string().trim().min(1).max(80).parse(name);
    const { data, error } = await createAdminClient().from("expense_categories").insert({ business_id: businessId, name: categoryName }).select().single();
    return error ? NextResponse.json({ message: error.message }, { status: 500 }) : NextResponse.json(data, { status: 201 });
  } catch { return NextResponse.json({ message: "A valid category name is required." }, { status: 400 }); }
}
