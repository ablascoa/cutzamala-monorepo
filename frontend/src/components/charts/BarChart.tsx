'use client';

import { 
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import { formatNumber, formatDate, formatShortDate } from '@/lib/utils';
import { CutzamalaReading } from '@/types';

interface BarChartProps {
  data: CutzamalaReading[];
  showPercentage: boolean;
  reservoirs: ('valle_bravo' | 'villa_victoria' | 'el_bosque')[];
  height?: number;
}

const RESERVOIR_CONFIG = {
  valle_bravo: {
    name: 'Valle de Bravo',
    color: '#3b82f6' // blue
  },
  villa_victoria: {
    name: 'Villa Victoria',
    color: '#ef4444' // red
  },
  el_bosque: {
    name: 'El Bosque',
    color: '#10b981' // green
  }
};

export function BarChart({ data, showPercentage, reservoirs, height = 400 }: BarChartProps) {
  // Backend provides data in correct ascending order

  const formatTooltipValue = (value: number) => {
    return showPercentage 
      ? `${formatNumber(value)}%` 
      : `${formatNumber(value)} Mm³`;
  };

  const formatTickValue = (value: number) => {
    return showPercentage 
      ? `${Math.round(value)}%` 
      : `${Math.round(value)}`;
  };

  const getYAxisDomain = () => {
    if (showPercentage) {
      return [0, 100];
    }
    return ['dataMin - 5', 'dataMax + 5'];
  };

  // Sample every nth data point to avoid overcrowding in bar charts
  const sampleData = (data: CutzamalaReading[], maxPoints = 30) => {
    if (data.length <= maxPoints) return data;
    const step = Math.ceil(data.length / maxPoints);
    return data.filter((_, index) => index % step === 0);
  };

  const sampledData = sampleData(data);

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <RechartsBarChart data={sampledData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          
          <XAxis 
            dataKey="date"
            tickFormatter={(value) => formatShortDate(value)}
            angle={-45}
            textAnchor="end"
            height={60}
            interval={0}
          />
          
          <YAxis 
            tickFormatter={formatTickValue}
            domain={getYAxisDomain()}
            label={{ 
              value: showPercentage ? 'Porcentaje (%)' : 'Almacenamiento (Mm³)', 
              angle: -90, 
              position: 'insideLeft' 
            }}
          />
          
          <Tooltip 
            labelFormatter={(value) => `Fecha: ${formatDate(value)}`}
            formatter={(value: number, name: string) => [
              formatTooltipValue(value),
              RESERVOIR_CONFIG[name as keyof typeof RESERVOIR_CONFIG]?.name || name
            ]}
            contentStyle={{
              backgroundColor: 'var(--background)',
              border: '1px solid var(--border)',
              borderRadius: '8px'
            }}
          />
          
          <Legend />

          {/* Reference lines for percentage view */}
          {showPercentage && (
            <>
              <ReferenceLine y={25} stroke="#f59e0b" strokeDasharray="5 5" label="Crítico (25%)" />
              <ReferenceLine y={50} stroke="#f97316" strokeDasharray="5 5" label="Bajo (50%)" />
            </>
          )}

          {reservoirs.map((reservoir) => (
            <Bar
              key={reservoir}
              dataKey={showPercentage 
                ? `reservoirs.${reservoir}.percentage` 
                : `reservoirs.${reservoir}.storage_mm3`
              }
              fill={RESERVOIR_CONFIG[reservoir].color}
              name={reservoir}
              maxBarSize={60}
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  );
}