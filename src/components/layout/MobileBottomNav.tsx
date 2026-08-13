// src/components/layout/MobileBottomNav.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn';
import { MobileNavLink } from '@/lib/types/navigation';

interface MobileBottomNavProps {
  navLinks: MobileNavLink[];
  currentPath: string;
}

export default function MobileBottomNav({ navLinks, currentPath }: MobileBottomNavProps) {
  // Filter for links that are NOT desktopOnly
  const mobileLinks = navLinks.filter(link => !link.desktopOnly);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-around h-16 border-t border-gray-800 bg-gray-900 md:hidden">
      {mobileLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={cn(
            "flex flex-col items-center justify-center gap-1 text-xs font-medium text-gray-400 hover:text-gray-50 transition-all",
            currentPath === link.href && "text-amber-500"
          )}
        >
          <link.icon className="h-5 w-5" />
          {link.label}
        </Link>
      ))}
    </nav>
  );
}