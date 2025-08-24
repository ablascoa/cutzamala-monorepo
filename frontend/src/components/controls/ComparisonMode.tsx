'use client';

import { GitCompare } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DateRangePicker } from './DateRangePicker';
import { cn } from '@/lib/utils';

interface ComparisonModeProps {
  isActive: boolean;
  onToggle: (active: boolean) => void;
  primaryRange: { start: Date | null; end: Date | null };
  onPrimaryRangeChange: (start: Date | null, end: Date | null) => void;
  comparisonRange?: { start: Date | null; end: Date | null };
  onComparisonRangeChange?: (start: Date | null, end: Date | null) => void;
  className?: string;
}

export function ComparisonMode({
  isActive,
  onToggle,
  primaryRange,
  onPrimaryRangeChange,
  comparisonRange,
  onComparisonRangeChange,
  className
}: ComparisonModeProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {/* Toggle Button */}
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">
          Modo Comparación
        </label>
        <Button
          variant={isActive ? "default" : "outline"}
          size="sm"
          onClick={() => onToggle(!isActive)}
          className="flex items-center space-x-2"
        >
          <GitCompare className="w-4 h-4" />
          <span>{isActive ? 'Desactivar' : 'Activar'}</span>
        </Button>
      </div>

      {/* Date Range Selectors */}
      {isActive && (
        <div className="space-y-4 p-4 border border-dashed border-primary/50 rounded-lg bg-primary/5">
          {/* Primary Range */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Período Principal
            </label>
            <DateRangePicker
              startDate={primaryRange.start}
              endDate={primaryRange.end}
              onDateChange={onPrimaryRangeChange}
            />
          </div>

          {/* Comparison Range */}
          {onComparisonRangeChange && (
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Período de Comparación
              </label>
              <DateRangePicker
                startDate={comparisonRange?.start || null}
                endDate={comparisonRange?.end || null}
                onDateChange={onComparisonRangeChange}
              />
            </div>
          )}

          {/* Quick Comparison Presets */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Comparaciones Rápidas
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => {
                  if (onComparisonRangeChange && primaryRange.start && primaryRange.end) {
                    const daysDiff = Math.ceil(
                      (primaryRange.end.getTime() - primaryRange.start.getTime()) / (1000 * 60 * 60 * 24)
                    );
                    const compEnd = new Date(primaryRange.start);
                    compEnd.setDate(compEnd.getDate() - 1);
                    const compStart = new Date(compEnd);
                    compStart.setDate(compEnd.getDate() - daysDiff);
                    onComparisonRangeChange(compStart, compEnd);
                  }
                }}
                className="px-3 py-1 text-xs rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80"
                disabled={!primaryRange.start || !primaryRange.end}
              >
                Período Anterior
              </button>
              <button
                onClick={() => {
                  if (onComparisonRangeChange && primaryRange.start && primaryRange.end) {
                    // Calculate previous year period
                    const compStart = new Date(primaryRange.start);
                    compStart.setFullYear(compStart.getFullYear() - 1);
                    const compEnd = new Date(primaryRange.end);
                    compEnd.setFullYear(compEnd.getFullYear() - 1);
                    
                    onComparisonRangeChange(compStart, compEnd);
                  }
                }}
                className="px-3 py-1 text-xs rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80"
                disabled={!primaryRange.start || !primaryRange.end}
              >
                Mismo Período - Año Anterior
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}