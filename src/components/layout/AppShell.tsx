"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAccessCode } from "@/lib/hooks/useAccessCode";
import { BarChart3, Beer, Calculator, LayoutDashboard, Package, ReceiptText, Settings, Wallet } from "lucide-react";
import { useEffect } from "react";

const links = [
  ["/dashboard", "Dashboard", LayoutDashboard], ["/pos", "POS", Beer], ["/sales", "Sales", ReceiptText],
  ["/expenses", "Expenses", Wallet], ["/products", "Products", Package], ["/daily-closing", "Closing", Calculator],
  ["/reports", "Reports", BarChart3], ["/settings", "Settings", Settings],
] as const;

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { hasAccess, isReady, revokeAccess } = useAccessCode();
  useEffect(() => { if (isReady && !hasAccess) router.replace("/"); }, [hasAccess, isReady, router]);
  if (!hasAccess) return <div className="grid min-h-screen place-items-center">Loading application…</div>;
  return <div className="min-h-screen bg-gray-950 text-gray-100 md:flex">
    <aside className="hidden w-60 shrink-0 border-r border-gray-800 bg-gray-900 p-4 md:block"><h1 className="mb-8 flex items-center gap-2 text-xl font-bold text-amber-500"><Beer />67 Beer Shop</h1><nav className="space-y-1">{links.map(([href, label, Icon]) => <Link key={href} href={href} className={`flex items-center gap-3 rounded-lg px-3 py-2 ${pathname === href ? "bg-amber-500 text-gray-950" : "text-gray-300 hover:bg-gray-800"}`}><Icon size={18}/>{label}</Link>)}</nav><button onClick={revokeAccess} className="mt-8 w-full rounded-lg border border-gray-700 px-3 py-2 text-sm hover:bg-gray-800">Lock</button></aside>
    <main className="mx-auto w-full max-w-7xl p-4 pb-24 md:p-8">{children}</main>
    <nav className="fixed inset-x-0 bottom-0 flex justify-around border-t border-gray-800 bg-gray-900 p-2 md:hidden">{links.slice(0, 5).map(([href, label, Icon]) => <Link key={href} href={href} className={`grid place-items-center text-xs ${pathname === href ? "text-amber-500" : "text-gray-400"}`}><Icon size={20}/>{label}</Link>)}</nav>
  </div>;
}
