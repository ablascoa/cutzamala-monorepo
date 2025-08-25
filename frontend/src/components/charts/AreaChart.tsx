'use client';

import { 
  ComposedChart,
  Area,
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
import { parseApiDate } from '@/lib/dateUtils';
import { CutzamalaReading } from '@/types';

interface AreaChartProps {
  data: CutzamalaReading[];
  showPercentage: boolean;
  showPrecipitation?: boolean;
  reservoirs: ('valle_bravo' | 'villa_victoria' | 'el_bosque')[];
  height?: number;
  granularity?: string;
}

const RESERVOIR_CONFIG = {
  valle_bravo: {
    name: 'Valle de Bravo',
    color: '#3b82f6', // blue
    fillOpacity: 0.6
  },
  villa_victoria: {
    name: 'Villa Victoria',
    color: '#ef4444', // red
    fillOpacity: 0.6
  },
  el_bosque: {
    name: 'El Bosque',
    color: '#10b981', // green
    fillOpacity: 0.6
  }
};

const PRECIPITATION_COLORS = {
  valle_bravo: '#93c5fd', // light blue
  villa_victoria: '#fca5a5', // light red  
  el_bosque: '#86efac', // light green
};

export function AreaChart({ data, showPercentage, showPrecipitation = false, reservoirs, height = 400, granularity = 'daily' }: AreaChartProps) {
  // Transform data for chart (backend provides data in correct ascending order)
  const chartData = data.map((reading) => ({
    date: reading.date,
    // Storage/percentage data
    ...Object.fromEntries(
      reservoirs.map(reservoir => [
        `${reservoir}_${showPercentage ? 'percentage' : 'storage'}`,
        showPercentage 
          ? reading.reservoirs[reservoir].percentage
          : reading.reservoirs[reservoir].storage_mm3
      ])
    ),
    // Precipitation data
    ...Object.fromEntries(
      reservoirs.map(reservoir => [
        `${reservoir}_rainfall`,
        reading.reservoirs[reservoir].rainfall
      ])
    )
  }));

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

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer>
        <ComposedChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <CartesianGrid strokeDasharray="3 3" />
          
          <XAxis 
            dataKey="date"
            tickFormatter={(value) => {
              if (granularity === 'weekly' && value.includes(' to ')) {
                const startDate = value.split(' to ')[0];
                return formatShortDate(startDate);
              }
              if (granularity === 'monthly') {
                return parseApiDate(value).toLocaleDateString('es-ES', { month: 'short', year: 'numeric' });
              }
              if (granularity === 'yearly') {
                return value;
              }
              return formatShortDate(parseApiDate(value).toISOString().split('T')[0]);
            }}
            angle={-45}
            textAnchor="end"
            height={60}
            interval="preserveStartEnd"
          />
          
          <YAxis 
            yAxisId="left"
            tickFormatter={formatTickValue}
            domain={getYAxisDomain()}
            label={{ 
              value: showPercentage ? 'Porcentaje (%)' : 'Almacenamiento (Mm³)', 
              angle: -90, 
              position: 'insideLeft' 
            }}
          />
          
          {showPrecipitation && (
            <YAxis
              yAxisId="right"
              orientation="right"
              label={{ value: 'Precipitación (mm)', angle: 90, position: 'insideRight' }}
              domain={[0, 'dataMax + 5']}
            />
          )}
          
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
              <ReferenceLine yAxisId="left" y={25} stroke="#f59e0b" strokeDasharray="5 5" label="Crítico (25%)" />
              <ReferenceLine yAxisId="left" y={50} stroke="#f97316" strokeDasharray="5 5" label="Bajo (50%)" />
            </>
          )}

          {/* Area charts for storage/percentage data */}
          {reservoirs.map((reservoir) => (
            <Area
              key={reservoir}
              yAxisId="left"
              type="monotone"
              dataKey={`${reservoir}_${showPercentage ? 'percentage' : 'storage'}`}
              stackId="1"
              stroke={RESERVOIR_CONFIG[reservoir].color}
              fill={RESERVOIR_CONFIG[reservoir].color}
              fillOpacity={RESERVOIR_CONFIG[reservoir].fillOpacity}
              name={RESERVOIR_CONFIG[reservoir].name}
            />
          ))}

          {/* Precipitation bars */}
          {showPrecipitation && reservoirs.map((reservoir) => (
            <Bar
              key={`${reservoir}_rainfall`}
              yAxisId="right"
              dataKey={`${reservoir}_rainfall`}
              fill={PRECIPITATION_COLORS[reservoir]}
              opacity={0.6}
              name={`${RESERVOIR_CONFIG[reservoir].name} (Lluvia)`}
            />
          ))}

        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}