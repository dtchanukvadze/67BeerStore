import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

export async function GET() {
  const { data, error } = await createAdminClient().from("expense_categories").select("*").eq("active", true).order("name");
  return error ? NextResponse.json({ message: error.message }, { status: 500 }) : NextResponse.json(data);
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    const categoryName = z.string().trim().min(1).max(80).parse(name);
    const { data, error } = await createAdminClient().from("expense_categories").insert({ name: categoryName }).select().single();
    return error ? NextResponse.json({ message: error.message }, { status: 500 }) : NextResponse.json(data, { status: 201 });
  } catch { return NextResponse.json({ message: "A valid category name is required." }, { status: 400 }); }
}
