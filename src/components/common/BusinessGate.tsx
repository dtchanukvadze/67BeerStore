"use client";
import { useEffect, useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";

export function useBusinessId() {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { createBrowserClient().from("businesses").select("id").limit(1).single().then(({ data, error }) => { if (error || !data) setError("Add a business record in Supabase before using the POS."); else setBusinessId(data.id); }); }, []);
  return { businessId, error };
}
