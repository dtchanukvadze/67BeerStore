import type { ReactNode } from "react";

// This route group keeps private operational screens separate from the lock screen
// without changing any public URLs.
export default function MainLayout({ children }: { children: ReactNode }) {
  return children;
}
