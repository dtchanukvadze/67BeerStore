"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useBusinessId } from "@/components/common/BusinessGate";

type Summary = { sales: number; revenue: number; products: number };
export default function DashboardPage() {
  const { businessId, error } = useBusinessId(); const [summary, setSummary] = useState<Summary | null>(null);
  useEffect(() => { if (businessId) fetch(`/api/dashboard?businessId=${businessId}`).then(r => r.json()).then(setSummary); }, [businessId]);
  return <AppShell><h2 className="text-3xl font-bold">Dashboard</h2><p className="mt-1 text-gray-400">Today&apos;s beer shop snapshot</p>{error ? <p className="mt-6 text-red-400">{error}</p> : !summary ? <p className="mt-6">Loading…</p> : <div className="mt-6 grid gap-4 sm:grid-cols-3">{[["Sales today", summary.sales], ["Revenue today", `₾${summary.revenue.toFixed(2)}`], ["Active products", summary.products]].map(([label, value]) => <div key={String(label)} className="rounded-xl border border-gray-800 bg-gray-900 p-5"><p className="text-sm text-gray-400">{label}</p><p className="mt-2 text-3xl font-bold text-amber-500">{value}</p></div>)}</div>}</AppShell>;
}
