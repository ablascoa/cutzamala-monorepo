'use client';

import {
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Brush
} from 'recharts';
import { formatNumber, formatDate, formatShortDate } from '@/lib/utils';
import { CutzamalaReading } from '@/types';

interface MultiRainfallChartProps {
  data: CutzamalaReading[];
  reservoirs: ('valle_bravo' | 'villa_victoria' | 'el_bosque')[];
  height?: number;
}

const RESERVOIR_CONFIG = {
  valle_bravo: {
    name: 'Valle de Bravo',
    color: '#3b82f6'
  },
  villa_victoria: {
    name: 'Villa Victoria',
    color: '#ef4444'
  },
  el_bosque: {
    name: 'El Bosque',
    color: '#10b981'
  }
};

export function MultiRainfallChart({ 
  data, 
  reservoirs, 
  height = 400 
}: MultiRainfallChartProps) {
  // Transform data to include rainfall data for all reservoirs
  const chartData = data.map(reading => ({
    ...reading,
    ...Object.fromEntries(
      reservoirs.map(reservoir => [
        `${reservoir}_rainfall`,
        reading.reservoirs[reservoir].rainfall
      ])
    )
  }));

  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
  }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium">{formatDate(label || '')}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {formatNumber(entry.value)} mm
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold">
          Comparación de Precipitación por Embalse
        </h3>
        <p className="text-sm text-muted-foreground">
          Niveles de lluvia registrados en cada reservorio
        </p>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <ComposedChart 
            data={chartData} 
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            
            <XAxis 
              dataKey="date"
              tickFormatter={(value) => formatShortDate(value)}
              angle={-45}
              textAnchor="end"
              height={60}
              interval="preserveStartEnd"
            />
            
            <YAxis 
              domain={['dataMin - 5', 'dataMax + 5']}
              tickFormatter={(value) => `${Math.round(value)} mm`}
              label={{ 
                value: 'Precipitación (mm)', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Legend />

            {/* Render lines for each reservoir */}
            {reservoirs.map((reservoir) => (
              <Line
                key={reservoir}
                type="monotone"
                dataKey={`${reservoir}_rainfall`}
                stroke={RESERVOIR_CONFIG[reservoir].color}
                strokeWidth={2}
                name={RESERVOIR_CONFIG[reservoir].name}
                dot={{ r: 2 }}
                activeDot={{ r: 4 }}
                connectNulls={false}
              />
            ))}

            <Brush 
              dataKey="date" 
              height={30}
              tickFormatter={(value) => formatShortDate(value)}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      {/* Summary statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
        <div className="bg-muted p-3 rounded-lg">
          <div className="font-medium text-primary">Período</div>
          <div className="text-muted-foreground">
            {data.length} días de datos
          </div>
        </div>
        {reservoirs.map(reservoir => {
          const totalRainfall = data.reduce(
            (sum, reading) => sum + reading.reservoirs[reservoir].rainfall, 
            0
          );
          return (
            <div key={reservoir} className="bg-muted p-3 rounded-lg">
              <div className="font-medium" style={{ color: RESERVOIR_CONFIG[reservoir].color }}>
                {RESERVOIR_CONFIG[reservoir].name}
              </div>
              <div className="text-muted-foreground">
                {formatNumber(totalRainfall)} mm total
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}