import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  try {
    const database = createAdminClient();
    const { data: existing, error } = await database.from("businesses").select("id, name").order("created_at").limit(1).maybeSingle();
    if (error) return NextResponse.json({ message: error.message }, { status: 500 });
    if (existing) return NextResponse.json(existing);
    const { data: business, error: insertError } = await database.from("businesses").insert({ name: "67 Beer Shop" }).select("id, name").single();
    return insertError ? NextResponse.json({ message: insertError.message }, { status: 500 }) : NextResponse.json(business, { status: 201 });
  } catch {
    return NextResponse.json({ message: "Unable to connect to Supabase. Check your environment variables." }, { status: 500 });
  }
}
