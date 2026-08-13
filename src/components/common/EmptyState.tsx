// src/components/common/EmptyState.tsx
import React from 'react';
import { Package } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: React.ElementType;
}

export default function EmptyState({ title, message, icon: Icon = Package }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
      <Icon className="h-16 w-16 text-gray-600 mb-4" />
      <h3 className="text-xl font-semibold text-gray-300 mb-2">{title}</h3>
      <p className="text-gray-400">{message}</p>
    </div>
  );
}