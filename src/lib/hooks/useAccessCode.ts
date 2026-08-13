import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const ACCESS_KEY = "67_beer_shop_access";
const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000;

export function useAccessCode() {
  const [hasAccess, setHasAccess] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const accessRef = useRef(false);
  const lastActivityRef = useRef(0);
  const router = useRouter();
  const grantAccess = useCallback(() => { sessionStorage.setItem(ACCESS_KEY, "true"); accessRef.current = true; lastActivityRef.current = Date.now(); setHasAccess(true); }, []);
  const revokeAccess = useCallback(() => { sessionStorage.removeItem(ACCESS_KEY); accessRef.current = false; setHasAccess(false); toast.error("Application locked."); router.replace("/"); }, [router]);
  useEffect(() => {
    const storedAccess = sessionStorage.getItem(ACCESS_KEY) === "true";
    accessRef.current = storedAccess; lastActivityRef.current = Date.now(); setHasAccess(storedAccess); setIsReady(true);
    const recordActivity = () => { lastActivityRef.current = Date.now(); };
    const events: (keyof WindowEventMap)[] = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach(event => window.addEventListener(event, recordActivity, { passive: true }));
    const timer = window.setInterval(() => { if (accessRef.current && Date.now() - lastActivityRef.current >= INACTIVITY_TIMEOUT_MS) revokeAccess(); }, 10_000);
    return () => { events.forEach(event => window.removeEventListener(event, recordActivity)); window.clearInterval(timer); };
  }, [revokeAccess]);
  return { hasAccess, isReady, grantAccess, revokeAccess };
}
