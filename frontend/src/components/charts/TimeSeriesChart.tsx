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
  ReferenceLine,
} from 'recharts';
import { format } from 'date-fns';
import { parseApiDate, formatDateForDisplay } from '@/lib/dateUtils';
import type { CutzamalaReading } from '@/types/api';

interface TimeSeriesChartProps {
  data: CutzamalaReading[];
  showPercentage?: boolean;
  showStorage?: boolean;
  showPrecipitation?: boolean;
  reservoirs?: ('valle_bravo' | 'villa_victoria' | 'el_bosque')[];
  visibleLines?: string[];
  height?: number;
  className?: string;
  granularity?: string;
  showReferenceLines?: boolean;
}

const RESERVOIR_COLORS = {
  valle_bravo: '#2563eb', // blue
  villa_victoria: '#dc2626', // red
  el_bosque: '#16a34a', // green
  system: '#7c3aed', // purple
};

const PRECIPITATION_COLORS = {
  valle_bravo: '#93c5fd', // light blue
  villa_victoria: '#fca5a5', // light red  
  el_bosque: '#86efac', // light green
};

const RESERVOIR_NAMES = {
  valle_bravo: 'Valle de Bravo',
  villa_victoria: 'Villa Victoria',
  el_bosque: 'El Bosque',
};

export function TimeSeriesChart({
  data,
  showPercentage = true,
  showPrecipitation = false,
  reservoirs = ['valle_bravo', 'villa_victoria', 'el_bosque'],
  visibleLines = ['valle_bravo', 'villa_victoria', 'el_bosque', 'system_total'],
  height = 400,
  className = '',
  granularity = 'daily',
  showReferenceLines = true,
}: TimeSeriesChartProps) {
  // Transform data for Recharts (backend provides data in correct order)
  const chartData = data.map((reading) => ({
    date: reading.date,
    formattedDate: formatDateForDisplay(reading.date, granularity),
    // Percentage data
    valle_bravo_pct: reading.reservoirs.valle_bravo.percentage,
    villa_victoria_pct: reading.reservoirs.villa_victoria.percentage,
    el_bosque_pct: reading.reservoirs.el_bosque.percentage,
    system_pct: reading.system_totals.total_percentage,
    // Storage data (in Mm³)
    valle_bravo_storage: reading.reservoirs.valle_bravo.storage_mm3,
    villa_victoria_storage: reading.reservoirs.villa_victoria.storage_mm3,
    el_bosque_storage: reading.reservoirs.el_bosque.storage_mm3,
    system_storage: reading.system_totals.total_mm3,
    // Precipitation data (in mm)
    valle_bravo_rainfall: reading.reservoirs.valle_bravo.rainfall,
    villa_victoria_rainfall: reading.reservoirs.villa_victoria.rainfall,
    el_bosque_rainfall: reading.reservoirs.el_bosque.rainfall,
  }));

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{
      color: string;
      name: string;
      value: number;
    }>;
    label?: string;
  }) => {
    if (active && payload && payload.length && label) {
      const date = format(parseApiDate(label), 'MMMM dd, yyyy');
      
      return (
        <div className="bg-white p-4 rounded-lg shadow-lg border">
          <p className="font-semibold text-gray-900 mb-2">{date}</p>
          {payload.map((entry, index: number) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-700">
                {entry.name}: {entry.value?.toFixed(1)}
                {entry.name.includes('Lluvia') ? ' mm' : (showPercentage ? '%' : ' Mm³')}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const yAxisLabel = showPercentage ? 'Porcentaje (%)' : 'Almacenamiento (Mm³)';
  const dataKeySuffix = showPercentage ? '_pct' : '_storage';

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={chartData}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => {
              if (granularity === 'weekly' && value.includes(' to ')) {
                // For weekly, show start date only
                const startDate = value.split(' to ')[0];
                return format(new Date(startDate + 'T00:00:00'), 'MMM dd');
              }
              if (granularity === 'monthly') {
                return format(parseApiDate(value), 'MMM yyyy');
              }
              if (granularity === 'yearly') {
                return value;
              }
              return format(parseApiDate(value), 'MMM dd');
            }}
            stroke="#6b7280"
          />
          <YAxis
            yAxisId="left"
            tick={{ fontSize: 12 }}
            label={{ value: yAxisLabel, angle: -90, position: 'insideLeft' }}
            stroke="#6b7280"
            domain={showPercentage ? [0, 100] : ['dataMin - 10', 'dataMax + 10']}
          />
          {showPrecipitation && (
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 12 }}
              label={{ value: 'Precipitación (mm)', angle: 90, position: 'insideRight' }}
              stroke="#94a3b8"
              domain={[0, 'dataMax + 5']}
            />
          )}
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: '14px' }}
            iconType="line"
          />
          
          {reservoirs.includes('valle_bravo') && visibleLines.includes('valle_bravo') && (
            <Line
              yAxisId="left"
              type="monotone"
              dataKey={`valle_bravo${dataKeySuffix}`}
              stroke={RESERVOIR_COLORS.valle_bravo}
              strokeWidth={2}
              dot={false}
              name={RESERVOIR_NAMES.valle_bravo}
              connectNulls={false}
            />
          )}
          
          {reservoirs.includes('villa_victoria') && visibleLines.includes('villa_victoria') && (
            <Line
              yAxisId="left"
              type="monotone"
              dataKey={`villa_victoria${dataKeySuffix}`}
              stroke={RESERVOIR_COLORS.villa_victoria}
              strokeWidth={2}
              dot={false}
              name={RESERVOIR_NAMES.villa_victoria}
              connectNulls={false}
            />
          )}
          
          {reservoirs.includes('el_bosque') && visibleLines.includes('el_bosque') && (
            <Line
              yAxisId="left"
              type="monotone"
              dataKey={`el_bosque${dataKeySuffix}`}
              stroke={RESERVOIR_COLORS.el_bosque}
              strokeWidth={2}
              dot={false}
              name={RESERVOIR_NAMES.el_bosque}
              connectNulls={false}
            />
          )}
          
          {/* System total line (optional, shown when all reservoirs are selected) */}
          {reservoirs.length === 3 && visibleLines.includes('system_total') && (
            <Line
              yAxisId="left"
              type="monotone"
              dataKey={`system${dataKeySuffix}`}
              stroke={RESERVOIR_COLORS.system}
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={false}
              name="Sistema Total"
              connectNulls={false}
            />
          )}

          {/* Precipitation bars */}
          {showPrecipitation && reservoirs.includes('valle_bravo') && visibleLines.includes('valle_bravo') && (
            <Bar
              yAxisId="right"
              dataKey="valle_bravo_rainfall"
              fill={PRECIPITATION_COLORS.valle_bravo}
              opacity={0.6}
              name="Valle de Bravo (Lluvia)"
            />
          )}
          
          {showPrecipitation && reservoirs.includes('villa_victoria') && visibleLines.includes('villa_victoria') && (
            <Bar
              yAxisId="right"
              dataKey="villa_victoria_rainfall"
              fill={PRECIPITATION_COLORS.villa_victoria}
              opacity={0.6}
              name="Villa Victoria (Lluvia)"
            />
          )}
          
          {showPrecipitation && reservoirs.includes('el_bosque') && visibleLines.includes('el_bosque') && (
            <Bar
              yAxisId="right"
              dataKey="el_bosque_rainfall"
              fill={PRECIPITATION_COLORS.el_bosque}
              opacity={0.6}
              name="El Bosque (Lluvia)"
            />
          )}

          {/* Reference lines for critical levels (only for percentage view) */}
          {showPercentage && showReferenceLines && (
            <>
              <ReferenceLine 
                yAxisId="left"
                y={25} 
                stroke="#ef4444" 
                strokeDasharray="8 8" 
                label={{ value: "Nivel Crítico (25%)" }}
              />
              <ReferenceLine 
                yAxisId="left"
                y={50} 
                stroke="#f59e0b" 
                strokeDasharray="4 4" 
                label={{ value: "Nivel de Alerta (50%)" }}
              />
            </>
          )}

        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}