// src/components/layout/LockScreenButton.tsx
'use client';

import React from 'react';
import { useAccessCode } from '@/lib/hooks/useAccessCode';
import { Button } from '@/components/ui/button';
import { Lock } from 'lucide-react';

export default function LockScreenButton() {
  const { revokeAccess } = useAccessCode();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={revokeAccess}
      title="Lock Application"
      className="text-gray-400 hover:bg-gray-700 hover:text-amber-500"
    >
      <Lock className="h-5 w-5" />
    </Button>
  );
}