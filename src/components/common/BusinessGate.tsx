"use client";

import { useEffect, useState } from "react";

export function useBusinessId() {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    fetch("/api/business").then(async response => {
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Could not load the business.");
      if (active) setBusinessId(result.id);
    }).catch(reason => { if (active) setError(reason instanceof Error ? reason.message : "Could not load the business."); });
    return () => { active = false; };
  }, []);
  return { businessId, error };
}
