// src/lib/types/navigation.ts
import { LucideIcon } from 'lucide-react';

export type SidebarNavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  desktopOnly: boolean; // Indicates if the link should only appear on desktop sidebar
};

export type MobileNavLink = {
  href: string;
  label: string;
  icon: LucideIcon;
  desktopOnly: boolean; // Indicates if the link should only appear on desktop sidebar
};