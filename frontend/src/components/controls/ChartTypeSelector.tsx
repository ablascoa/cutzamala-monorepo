'use client';

import { LineChart, AreaChart as AreaChartIcon, BarChart3, Gauge } from 'lucide-react';
import { cn } from '@/lib/utils';

export type ChartType = 'line' | 'area' | 'bar' | 'gauge';

interface ChartTypeSelectorProps {
  selectedType: ChartType;
  onTypeChange: (type: ChartType) => void;
  className?: string;
}

const chartTypes: Array<{
  type: ChartType;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
}> = [
  {
    type: 'line',
    icon: LineChart,
    label: 'Líneas',
    description: 'Gráfico de líneas para tendencias'
  },
  {
    type: 'area',
    icon: AreaChartIcon,
    label: 'Áreas',
    description: 'Gráfico de áreas apiladas'
  },
  {
    type: 'bar',
    icon: BarChart3,
    label: 'Barras',
    description: 'Gráfico de barras para comparaciones'
  },
  {
    type: 'gauge',
    icon: Gauge,
    label: 'Indicadores',
    description: 'Medidores de capacidad actual'
  }
];

export function ChartTypeSelector({ 
  selectedType, 
  onTypeChange, 
  className 
}: ChartTypeSelectorProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <label className="text-sm font-medium text-foreground">
        Tipo de Gráfico
      </label>
      <div className="flex flex-wrap gap-2">
        {chartTypes.map(({ type, icon: Icon, label, description }) => (
          <button
            key={type}
            onClick={() => onTypeChange(type)}
            className={cn(
              'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
              'border border-input hover:bg-accent hover:text-accent-foreground',
              selectedType === type
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-foreground'
            )}
            title={description}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}