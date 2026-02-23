'use client';

import React from 'react';
import { AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface MasonryGridProps {
  children: React.ReactNode;
  columns?: {
    default: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
}

export function MasonryGrid({
  children,
  columns,
  gap = 16,
}: MasonryGridProps) {
  const isList = columns?.default === 1 && !columns.sm;

  return (
    <div 
      className={cn(
        "w-full",
        isList ? "columns-1" : "columns-1 sm:columns-2 md:columns-3 lg:columns-4 xl:columns-5"
      )} 
      style={{ columnGap: `${gap}px` }}
    >
      <AnimatePresence>
        {children}
      </AnimatePresence>
    </div>
  );
}
