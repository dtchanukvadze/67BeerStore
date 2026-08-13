"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Beer, LockKeyhole, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { useAccessCode } from "@/lib/hooks/useAccessCode";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AccessCodePage() {
  const [code, setCode] = useState("");
  const router = useRouter();
  const { hasAccess, isReady, grantAccess } = useAccessCode();
  useEffect(() => { if (isReady && hasAccess) router.replace("/dashboard"); }, [hasAccess, isReady, router]);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (code === process.env.NEXT_PUBLIC_ACCESS_CODE) { grantAccess(); toast.success("Access granted"); router.replace("/dashboard"); }
    else toast.error("That access code is not correct.");
    setCode("");
  }

  if (!isReady || hasAccess) return <div className="grid min-h-screen place-items-center bg-[#080b12] text-gray-400">Loading…</div>;

  return <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080b12] px-4 text-white">
    <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-amber-500/20 blur-3xl" />
    <div className="absolute -bottom-48 -right-32 h-96 w-96 rounded-full bg-orange-700/20 blur-3xl" />
    <div className="relative w-full max-w-md rounded-3xl border border-white/10 bg-gray-900/85 p-8 shadow-2xl shadow-black/40 backdrop-blur sm:p-10">
      <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-2xl bg-amber-400 text-gray-950 shadow-lg shadow-amber-500/20"><Beer size={32} /></div>
      <p className="text-center text-xs font-bold tracking-[0.24em] text-amber-400">67 BEER SHOP</p>
      <h1 className="mt-3 text-center text-3xl font-bold tracking-tight">Welcome back</h1>
      <p className="mt-2 text-center text-sm text-gray-400">Enter your private access code to open the POS.</p>
      <form onSubmit={submit} className="mt-8 space-y-4"><Input type="password" placeholder="••••••" value={code} onChange={event => setCode(event.target.value)} className="h-13 text-center text-lg tracking-[0.45em] bg-gray-950 border-gray-700 focus:border-amber-400 focus:ring-amber-400 text-white" maxLength={10} autoFocus /><Button type="submit" className="h-12 w-full rounded-xl bg-amber-400 font-bold text-gray-950 hover:bg-amber-300"><LockKeyhole className="mr-2 h-4 w-4" /> Unlock POS</Button></form>
      <div className="mt-7 flex items-center justify-center gap-2 text-xs text-gray-500"><ShieldCheck size={14} /> Session locks automatically after inactivity</div>
    </div>
  </div>;
}
