"use client";
import { useEffect, useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import { useBusinessId } from "@/components/common/BusinessGate";
type Product = { id: string; name: string; price: number };
type Cart = Product & { quantity: number };
export default function PosPage() {
  const { businessId, error } = useBusinessId(); const [products, setProducts] = useState<Product[]>([]); const [cart, setCart] = useState<Cart[]>([]); const [saving, setSaving] = useState(false);
  useEffect(() => { if (businessId) fetch(`/api/products?businessId=${businessId}&active=true`).then(r => r.json()).then(setProducts); }, [businessId]);
  const total = useMemo(() => cart.reduce((n, item) => n + item.price * item.quantity, 0), [cart]);
  const add = (product: Product) => setCart(items => items.some(i => i.id === product.id) ? items.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i) : [...items, { ...product, quantity: 1 }]);
  async function checkout() { if (!businessId || !cart.length) return; setSaving(true); const response = await fetch("/api/sales", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ business_id: businessId, payment_method: "cash", cart_items: cart.map(({ id, quantity, price }) => ({ product_id: id, quantity, unit_price: price })) }) }); setSaving(false); if (response.ok) { setCart([]); alert("Sale completed."); } else alert((await response.json()).message ?? "Sale failed."); }
  return <AppShell><h2 className="text-3xl font-bold">Point of Sale</h2>{error && <p className="mt-4 text-red-400">{error}</p>}<div className="mt-6 grid gap-6 lg:grid-cols-[1fr_340px]"><section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{products.map(product => <button onClick={() => add(product)} key={product.id} className="rounded-xl border border-gray-800 bg-gray-900 p-4 text-left hover:border-amber-500"><p className="font-semibold">{product.name}</p><p className="mt-2 text-amber-500">₾{Number(product.price).toFixed(2)}</p></button>)}</section><aside className="rounded-xl border border-gray-800 bg-gray-900 p-5"><h3 className="text-xl font-bold">Current sale</h3><div className="mt-4 space-y-3">{cart.map(item => <div key={item.id} className="flex justify-between"><span>{item.name} × {item.quantity}</span><span>₾{(item.price * item.quantity).toFixed(2)}</span></div>)}</div><div className="mt-6 border-t border-gray-700 pt-4 text-xl font-bold">Total <span className="float-right text-amber-500">₾{total.toFixed(2)}</span></div><button disabled={!cart.length || saving} onClick={checkout} className="mt-5 w-full rounded-lg bg-amber-500 py-3 font-bold text-gray-950 disabled:opacity-50">{saving ? "Completing…" : "Pay cash"}</button></aside></div></AppShell>;
}
