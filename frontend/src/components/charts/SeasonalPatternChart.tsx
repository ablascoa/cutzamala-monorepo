'use client';

import React, { useMemo } from 'react';
import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { RESERVOIR_COLORS, RESERVOIR_NAMES } from '@cutzamala/shared';
import type { CutzamalaReading } from '@cutzamala/shared';
import { formatNumber } from '@/lib/utils';

interface SeasonalPatternChartProps {
  data: CutzamalaReading[];
  reservoir: 'valle_bravo' | 'villa_victoria' | 'el_bosque' | 'system_total';
  years?: number[]; // Optional filter for specific years
  height?: number;
  showRainfall?: boolean;
  showConfidenceInterval?: boolean;
}

interface SeasonalData {
  month: number;
  monthName: string;
  avgPercentage: number;
  minPercentage: number;
  maxPercentage: number;
  stdDev: number;
  avgRainfall: number;
  maxRainfall: number;
  dataPoints: number;
  years: number[];
}

export function SeasonalPatternChart({
  data,
  reservoir,
  years,
  height = 400,
  showRainfall = true,
  showConfidenceInterval = true,
}: SeasonalPatternChartProps) {
  const config = {
    valle_bravo: { name: 'Valle de Bravo', color: RESERVOIR_COLORS.valle_bravo },
    villa_victoria: { name: 'Villa Victoria', color: RESERVOIR_COLORS.villa_victoria },
    el_bosque: { name: 'El Bosque', color: RESERVOIR_COLORS.el_bosque },
    system_total: { name: 'Sistema Total', color: RESERVOIR_COLORS.system_total },
  }[reservoir];

  const seasonalData = useMemo(() => {
    // Filter data by years if specified
    const filteredData = years 
      ? data.filter(reading => years.includes(reading.year))
      : data;

    // Group by month and calculate statistics
    const monthlyGroups = new Map<number, CutzamalaReading[]>();
    
    filteredData.forEach(reading => {
      const month = reading.month;
      if (!monthlyGroups.has(month)) {
        monthlyGroups.set(month, []);
      }
      monthlyGroups.get(month)!.push(reading);
    });

    const monthNames = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];

    return Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      const readings = monthlyGroups.get(month) || [];
      
      if (readings.length === 0) {
        return {
          month,
          monthName: monthNames[index],
          avgPercentage: 0,
          minPercentage: 0,
          maxPercentage: 0,
          stdDev: 0,
          avgRainfall: 0,
          maxRainfall: 0,
          dataPoints: 0,
          years: [],
        };
      }

      // Extract values based on reservoir
      const percentages = readings.map(r => 
        reservoir === 'system_total' 
          ? r.system_totals.total_percentage
          : r.reservoirs[reservoir].percentage
      );
      
      const rainfalls = readings.map(r => 
        reservoir === 'system_total'
          ? (r.reservoirs.valle_bravo.rainfall + r.reservoirs.villa_victoria.rainfall + r.reservoirs.el_bosque.rainfall) / 3
          : r.reservoirs[reservoir].rainfall
      );

      const years = [...new Set(readings.map(r => r.year))].sort();
      
      // Calculate statistics
      const avgPercentage = percentages.reduce((sum, val) => sum + val, 0) / percentages.length;
      const minPercentage = Math.min(...percentages);
      const maxPercentage = Math.max(...percentages);
      
      const variance = percentages.reduce((sum, val) => sum + Math.pow(val - avgPercentage, 2), 0) / percentages.length;
      const stdDev = Math.sqrt(variance);
      
      const avgRainfall = rainfalls.reduce((sum, val) => sum + val, 0) / rainfalls.length;
      const maxRainfall = Math.max(...rainfalls);

      return {
        month,
        monthName: monthNames[index],
        avgPercentage: Number(avgPercentage.toFixed(1)),
        minPercentage: Number(minPercentage.toFixed(1)),
        maxPercentage: Number(maxPercentage.toFixed(1)),
        stdDev: Number(stdDev.toFixed(1)),
        avgRainfall: Number(avgRainfall.toFixed(1)),
        maxRainfall: Number(maxRainfall.toFixed(1)),
        dataPoints: readings.length,
        years,
        // Confidence interval (±1 standard deviation)
        upperCI: Number((avgPercentage + stdDev).toFixed(1)),
        lowerCI: Number(Math.max(0, avgPercentage - stdDev).toFixed(1)),
      };
    });
  }, [data, reservoir, years]);

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: unknown[]; label?: string }) => {
    if (!active || !payload || !payload.length) return null;

    const monthData = seasonalData.find(d => d.monthName === label);
    if (!monthData) return null;

    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 min-w-[280px]">
        <p className="font-semibold text-gray-900 mb-3 border-b pb-2">
          {label} - {config.name}
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Promedio:</span>
            <span className="font-semibold">{monthData.avgPercentage}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Rango:</span>
            <span className="font-semibold">{monthData.minPercentage}% - {monthData.maxPercentage}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Desv. Estándar:</span>
            <span className="font-semibold">±{monthData.stdDev}%</span>
          </div>
          {showRainfall && (
            <div className="flex justify-between border-t pt-2">
              <span className="text-gray-600">Lluvia promedio:</span>
              <span className="font-semibold">{monthData.avgRainfall} mm</span>
            </div>
          )}
          <div className="flex justify-between text-xs text-gray-500 border-t pt-2">
            <span>Datos de {monthData.years.length} año{monthData.years.length !== 1 ? 's' : ''}</span>
            <span>{monthData.dataPoints} registros</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold">
          Patrón Estacional - {config.name}
        </h3>
        <p className="text-sm text-muted-foreground">
          Análisis de variaciones estacionales en el almacenamiento de agua
          {years && ` (${years.join(', ')})`}
        </p>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <ComposedChart 
            data={seasonalData} 
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            
            <XAxis 
              dataKey="monthName"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            
            <YAxis 
              yAxisId="storage"
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              label={{ 
                value: 'Almacenamiento (%)', 
                angle: -90, 
                position: 'insideLeft' 
              }}
            />
            
            {showRainfall && (
              <YAxis 
                yAxisId="rainfall"
                orientation="right"
                domain={[0, 'dataMax + 10']}
                tickFormatter={(value) => `${Math.round(value)} mm`}
                label={{ 
                  value: 'Precipitación (mm)', 
                  angle: 90, 
                  position: 'insideRight' 
                }}
              />
            )}
            
            <Tooltip content={<CustomTooltip />} />
            
            <Legend />

            {/* Confidence interval area */}
            {showConfidenceInterval && (
              <Area
                yAxisId="storage"
                type="monotone"
                dataKey="upperCI"
                stackId="ci"
                stroke="none"
                fill={config.color}
                fillOpacity={0.1}
                name="Intervalo de Confianza"
              />
            )}

            {showConfidenceInterval && (
              <Area
                yAxisId="storage"
                type="monotone"
                dataKey="lowerCI"
                stackId="ci"
                stroke="none"
                fill="white"
                fillOpacity={1}
                name=""
              />
            )}

            {/* Average line */}
            <Line
              yAxisId="storage"
              type="monotone"
              dataKey="avgPercentage"
              stroke={config.color}
              strokeWidth={3}
              name="Promedio Histórico"
              dot={{ r: 5, fill: config.color }}
              activeDot={{ r: 7 }}
            />

            {/* Min/Max reference lines */}
            <Line
              yAxisId="storage"
              type="monotone"
              dataKey="maxPercentage"
              stroke={config.color}
              strokeWidth={1}
              strokeDasharray="3 3"
              name="Máximo Histórico"
              dot={false}
            />

            <Line
              yAxisId="storage"
              type="monotone"
              dataKey="minPercentage"
              stroke={config.color}
              strokeWidth={1}
              strokeDasharray="3 3"
              name="Mínimo Histórico"
              dot={false}
            />

            {/* Rainfall bars */}
            {showRainfall && (
              <>
                <Area
                  yAxisId="rainfall"
                  type="monotone"
                  dataKey="avgRainfall"
                  fill="#60a5fa"
                  fillOpacity={0.3}
                  stroke="#3b82f6"
                  strokeWidth={1}
                  name="Lluvia Promedio"
                />
              </>
            )}

            {/* Reference lines for critical levels */}
            <ReferenceLine 
              yAxisId="storage"
              y={25} 
              stroke="#ef4444" 
              strokeDasharray="8 8" 
              label={{ value: "Crítico", position: "top" }}
            />
            <ReferenceLine 
              yAxisId="storage"
              y={50} 
              stroke="#f59e0b" 
              strokeDasharray="4 4" 
              label={{ value: "Alerta", position: "top" }}
            />

          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Summary statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="font-medium text-blue-800">Mes más alto</div>
          <div className="text-blue-600">
            {seasonalData.reduce((max, current) => 
              current.avgPercentage > max.avgPercentage ? current : max
            ).monthName}
          </div>
        </div>
        <div className="bg-red-50 p-3 rounded-lg">
          <div className="font-medium text-red-800">Mes más bajo</div>
          <div className="text-red-600">
            {seasonalData.reduce((min, current) => 
              current.avgPercentage < min.avgPercentage ? current : min
            ).monthName}
          </div>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="font-medium text-green-800">Mayor variabilidad</div>
          <div className="text-green-600">
            {seasonalData.reduce((max, current) => 
              current.stdDev > max.stdDev ? current : max
            ).monthName}
          </div>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <div className="font-medium text-purple-800">Años analizados</div>
          <div className="text-purple-600">
            {[...new Set(data.map(r => r.year))].length} años
          </div>
        </div>
      </div>
    </div>
  );
}