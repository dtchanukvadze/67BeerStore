"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/layout/AppShell";
type Summary = { sales: number; revenue: number; products: number };
export default function DashboardPage() { const [summary, setSummary] = useState<Summary | null>(null); useEffect(() => { fetch("/api/dashboard").then(r => r.json()).then(setSummary); }, []); return <AppShell><h2 className="text-3xl font-bold">Dashboard</h2><div className="mt-6 grid gap-4 sm:grid-cols-3">{[["Today’s sales", summary?.sales], ["Today’s revenue", summary ? `₾${summary.revenue.toFixed(2)}` : null], ["Active products", summary?.products]].map(([label, value]) => <div key={String(label)} className="rounded-xl border border-gray-800 bg-gray-900 p-5"><p className="text-gray-400">{label}</p><p className="mt-2 text-3xl font-bold text-amber-500">{value ?? "—"}</p></div>)}</div></AppShell>; }
