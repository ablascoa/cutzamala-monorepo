'use client';

import {
  ComposedChart,
  Line,
  Bar,
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

interface RainfallCorrelationChartProps {
  data: CutzamalaReading[];
  reservoir: 'valle_bravo' | 'villa_victoria' | 'el_bosque' | 'system_total';
  height?: number;
}

const RESERVOIR_CONFIG = {
  valle_bravo: {
    name: 'Valle de Bravo',
    storageColor: '#3b82f6',
    rainfallColor: '#1d4ed8'
  },
  villa_victoria: {
    name: 'Villa Victoria',
    storageColor: '#ef4444',
    rainfallColor: '#dc2626'
  },
  el_bosque: {
    name: 'El Bosque',
    storageColor: '#10b981',
    rainfallColor: '#059669'
  },
  system_total: {
    name: 'Sistema Total',
    storageColor: '#8b5cf6',
    rainfallColor: '#7c3aed'
  }
};

export function RainfallCorrelationChart({ 
  data, 
  reservoir, 
  height = 400 
}: RainfallCorrelationChartProps) {
  const config = RESERVOIR_CONFIG[reservoir];

  // Backend provides data in correct ascending order

  // Transform data to include both storage percentage and rainfall
  const chartData = data.map(reading => {
    if (reservoir === 'system_total') {
      // Calculate average rainfall across all reservoirs
      const avgRainfall = (
        reading.reservoirs.valle_bravo.rainfall +
        reading.reservoirs.villa_victoria.rainfall +
        reading.reservoirs.el_bosque.rainfall
      ) / 3;
      
      return {
        ...reading,
        storagePercentage: reading.system_totals.total_percentage,
        rainfall: avgRainfall
      };
    }
    
    return {
      ...reading,
      storagePercentage: reading.reservoirs[reservoir].percentage,
      rainfall: reading.reservoirs[reservoir].rainfall
    };
  });

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
              {entry.name}: {entry.name === 'Almacenamiento' 
                ? `${formatNumber(entry.value)}%`
                : `${formatNumber(entry.value)} mm`
              }
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
          Correlación Almacenamiento-Lluvia: {config.name}
        </h3>
        <p className="text-sm text-muted-foreground">
          Relación entre niveles de almacenamiento y precipitación
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
            
            {/* Left Y-axis for storage percentage */}
            <YAxis 
              yAxisId="storage"
              orientation="left"
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              label={{ 
                value: 'Almacenamiento (%)', 
                angle: -90, 
                position: 'insideLeft',
                style: { textAnchor: 'middle' }
              }}
            />
            
            {/* Right Y-axis for rainfall */}
            <YAxis 
              yAxisId="rainfall"
              orientation="right"
              domain={['dataMin - 5', 'dataMax + 5']}
              tickFormatter={(value) => `${Math.round(value)} mm`}
              label={{ 
                value: 'Precipitación (mm)', 
                angle: 90, 
                position: 'insideRight',
                style: { textAnchor: 'middle' }
              }}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Legend />

            {/* Rainfall as bars */}
            <Bar
              yAxisId="rainfall"
              dataKey="rainfall"
              fill={config.rainfallColor}
              name="Precipitación"
              fillOpacity={0.6}
              barSize={20}
            />

            {/* Storage percentage as line */}
            <Line
              yAxisId="storage"
              type="monotone"
              dataKey="storagePercentage"
              stroke={config.storageColor}
              strokeWidth={2}
              name="Almacenamiento"
              dot={{ r: 2 }}
              activeDot={{ r: 4 }}
            />

            <Brush 
              dataKey="date" 
              height={30}
              tickFormatter={(value) => formatShortDate(value)}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      
      {/* Correlation insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="bg-muted p-3 rounded-lg">
          <div className="font-medium text-primary">Período de Análisis</div>
          <div className="text-muted-foreground">
            {formatDate(data[0]?.date)} - {formatDate(data[data.length - 1]?.date)}
          </div>
        </div>
        <div className="bg-muted p-3 rounded-lg">
          <div className="font-medium text-primary">Lluvia Total</div>
          <div className="text-muted-foreground">
            {formatNumber(
              chartData.reduce((sum, d) => sum + d.rainfall, 0)
            )} mm
          </div>
        </div>
        <div className="bg-muted p-3 rounded-lg">
          <div className="font-medium text-primary">Almacenamiento Promedio</div>
          <div className="text-muted-foreground">
            {formatNumber(
              chartData.reduce((sum, d) => sum + d.storagePercentage, 0) / chartData.length
            )}%
          </div>
        </div>
      </div>
    </div>
  );
}