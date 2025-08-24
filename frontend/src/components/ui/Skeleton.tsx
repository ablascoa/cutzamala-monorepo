'use client';

import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
}

/**
 * Skeleton loading component
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-md bg-muted',
        className
      )}
    />
  );
}

/**
 * Chart skeleton with animated placeholder
 */
export function ChartSkeleton({ height = 400 }: { height?: number }) {
  return (
    <div 
      className="w-full rounded-lg bg-muted animate-pulse flex items-center justify-center"
      style={{ height }}
    >
      <div className="text-muted-foreground text-sm">
        Cargando gráfico...
      </div>
    </div>
  );
}

/**
 * Card skeleton for status cards
 */
export function StatusCardSkeleton() {
  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-20" />
    </div>
  );
}