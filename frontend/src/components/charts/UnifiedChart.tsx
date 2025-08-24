'use client';

import { TimeSeriesChart } from './TimeSeriesChart';
import { AreaChart } from './AreaChart';
import { BarChart } from './BarChart';
import { MultiGaugeChart } from './GaugeChart';
import { CutzamalaReading } from '@/types';
import { ChartType } from '@/components/controls/ChartTypeSelector';

interface UnifiedChartProps {
  data: CutzamalaReading[];
  showPercentage: boolean;
  reservoirs: ('valle_bravo' | 'villa_victoria' | 'el_bosque')[];
  visibleLines?: string[];
  chartType: ChartType;
  height?: number;
  granularity?: string;
}

export function UnifiedChart({
  data,
  showPercentage,
  reservoirs,
  visibleLines = ['valle_bravo', 'villa_victoria', 'el_bosque', 'system_total'],
  chartType,
  height = 500,
  granularity = 'daily'
}: UnifiedChartProps) {
  // For gauge charts, we need the latest reading
  const latestReading = data[data.length - 1];

  if (chartType === 'gauge' && latestReading) {
    const gaugeData = reservoirs.map(reservoir => {
      const config = {
        valle_bravo: { name: 'Valle de Bravo', color: '#3b82f6' },
        villa_victoria: { name: 'Villa Victoria', color: '#ef4444' },
        el_bosque: { name: 'El Bosque', color: '#10b981' }
      };

      return {
        title: config[reservoir].name,
        value: showPercentage 
          ? latestReading.reservoirs[reservoir].percentage
          : (latestReading.reservoirs[reservoir].storage_mm3 / 1000) * 100, // Convert to percentage for gauge display
        subtitle: showPercentage 
          ? `${latestReading.reservoirs[reservoir].storage_mm3.toFixed(1)} Mm³`
          : `${latestReading.reservoirs[reservoir].percentage.toFixed(1)}%`,
        color: config[reservoir].color
      };
    });

    return (
      <div style={{ height }}>
        <MultiGaugeChart data={gaugeData} height={height} />
      </div>
    );
  }

  // For other chart types, render the appropriate chart
  switch (chartType) {
    case 'area':
      return (
        <AreaChart
          data={data}
          showPercentage={showPercentage}
          reservoirs={reservoirs}
          height={height}
          granularity={granularity}
        />
      );
    case 'bar':
      return (
        <BarChart
          data={data}
          showPercentage={showPercentage}
          reservoirs={reservoirs}
          height={height}
          granularity={granularity}
        />
      );
    case 'line':
    default:
      return (
        <TimeSeriesChart
          data={data}
          showPercentage={showPercentage}
          reservoirs={reservoirs}
          visibleLines={visibleLines}
          height={height}
          granularity={granularity}
        />
      );
  }
}