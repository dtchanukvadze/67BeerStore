// src/lib/supabase/client.ts

import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/db";

let browserClient: ReturnType<typeof createClient<Database>> | undefined;

export function createBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL environment variable."
    );
  }

  if (!supabaseAnonKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable."
    );
  }

  browserClient = createClient<Database>(
    supabaseUrl,
    supabaseAnonKey
  );

  return browserClient;
}