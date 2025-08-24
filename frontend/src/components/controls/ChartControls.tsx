'use client';

import { TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ChartTypeSelector, ChartType } from './ChartTypeSelector';

interface ChartControlsProps {
  showPercentage: boolean;
  onTogglePercentage: () => void;
  granularity: 'daily' | 'weekly' | 'monthly' | 'yearly';
  onGranularityChange: (granularity: 'daily' | 'weekly' | 'monthly' | 'yearly') => void;
  chartType?: ChartType;
  onChartTypeChange?: (type: ChartType) => void;
  className?: string;
}

const GRANULARITY_OPTIONS = [
  { value: 'daily' as const, label: 'Diario' },
  { value: 'weekly' as const, label: 'Semanal' },
  { value: 'monthly' as const, label: 'Mensual' },
  { value: 'yearly' as const, label: 'Anual' },
];

export function ChartControls({
  showPercentage,
  onTogglePercentage,
  granularity,
  onGranularityChange,
  chartType = 'line',
  onChartTypeChange,
  className = '',
}: ChartControlsProps) {
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Chart Type Selector */}
      {onChartTypeChange && (
        <ChartTypeSelector
          selectedType={chartType}
          onTypeChange={onChartTypeChange}
        />
      )}
      
      <div className="flex flex-wrap items-center gap-4">
        {/* Data Type Toggle */}
        <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Mostrar:</span>
        <Button
          variant={showPercentage ? "default" : "outline"}
          size="sm"
          onClick={onTogglePercentage}
          className="flex items-center space-x-1"
        >
          <TrendingUp className="w-4 h-4" />
          <span>{showPercentage ? 'Porcentaje' : 'Almacenamiento'}</span>
        </Button>
      </div>

      {/* Granularity Selector */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Período:</span>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {GRANULARITY_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => onGranularityChange(option.value)}
              className={`px-3 py-1 text-sm transition-colors ${
                granularity === option.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      </div>
    </div>
  );
}