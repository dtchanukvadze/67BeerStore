// src/components/layout/DesktopSidebar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils/cn'; // Assuming you have cn utility
import { SidebarNavLink } from '@/lib/types/navigation';

interface DesktopSidebarProps {
  navLinks: SidebarNavLink[];
  currentPath: string;
}

export default function DesktopSidebar({ navLinks, currentPath }: DesktopSidebarProps) {
  return (
    <aside className="hidden md:flex flex-col w-64 border-r border-gray-800 bg-gray-900 p-4">
      <div className="flex items-center justify-center h-16 mb-4">
        <span className="text-2xl font-bold text-amber-500">67 Beer</span>
      </div>
      <nav className="flex flex-col flex-1 space-y-2">
        {navLinks.filter(link => link.desktopOnly).map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-gray-400 transition-all hover:text-gray-50",
              currentPath === link.href && "bg-gray-800 text-gray-50"
            )}
          >
            <link.icon className="h-5 w-5" />
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}