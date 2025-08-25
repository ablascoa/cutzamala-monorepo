'use client';

import React, { useMemo, useState, useCallback } from 'react';
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
  Brush,
  ReferenceArea,
} from 'recharts';
import { format } from 'date-fns';
import { parseApiDate, formatDateForDisplay } from '@/lib/dateUtils';
import { RESERVOIR_COLORS, RESERVOIR_NAMES } from '@cutzamala/shared';
import type { CutzamalaReading } from '@cutzamala/shared';

interface EnhancedTimeSeriesChartProps {
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
  enableZoom?: boolean;
  enableBrush?: boolean;
  enableCrosshair?: boolean;
  onDataPointClick?: (data: CutzamalaReading) => void;
}

const PRECIPITATION_COLORS = {
  valle_bravo: '#93c5fd',
  villa_victoria: '#fca5a5',
  el_bosque: '#86efac',
};

export function EnhancedTimeSeriesChart({
  data,
  showPercentage = true,
  showPrecipitation = false,
  reservoirs = ['valle_bravo', 'villa_victoria', 'el_bosque'],
  visibleLines = ['valle_bravo', 'villa_victoria', 'el_bosque', 'system_total'],
  height = 400,
  className = '',
  granularity = 'daily',
  showReferenceLines = true,
  enableZoom = true,
  enableBrush = true,
  enableCrosshair = true,
  onDataPointClick,
}: EnhancedTimeSeriesChartProps) {
  // Zoom/selection state
  const [zoomDomain, setZoomDomain] = useState<{ left?: string; right?: string }>({});
  const [isSelecting, setIsSelecting] = useState(false);
  
  // Performance optimization: Memoize chart data transformation
  const chartData = useMemo(() => {
    return data.map((reading) => ({
      date: reading.date,
      formattedDate: formatDateForDisplay(reading.date, granularity),
      timestamp: new Date(reading.date).getTime(),
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
  }, [data, granularity]);

  // Apply zoom domain filtering
  const displayData = useMemo(() => {
    if (!zoomDomain.left && !zoomDomain.right) return chartData;
    
    return chartData.filter(item => {
      const itemTime = new Date(item.date).getTime();
      const leftTime = zoomDomain.left ? new Date(zoomDomain.left).getTime() : -Infinity;
      const rightTime = zoomDomain.right ? new Date(zoomDomain.right).getTime() : Infinity;
      return itemTime >= leftTime && itemTime <= rightTime;
    });
  }, [chartData, zoomDomain]);

  // Enhanced tooltip with trend indicators
  const CustomTooltip = useCallback(({ active, payload, label }: { active?: boolean; payload?: unknown[]; label?: string }) => {
    if (!active || !payload || !payload.length || !label) return null;

    const date = format(parseApiDate(label), 'MMMM dd, yyyy');
    const currentIndex = chartData.findIndex(item => item.date === label);
    const previousItem = currentIndex > 0 ? chartData[currentIndex - 1] : null;

    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 min-w-[240px]">
        <p className="font-semibold text-gray-900 mb-3 border-b pb-2">{date}</p>
        <div className="space-y-2">
          {(payload as unknown as { color: string; name: string; value: number; dataKey: string }[]).map((entry, index: number) => {
            const trend = previousItem && entry.dataKey.includes('pct') 
              ? entry.value - (previousItem as unknown as Record<string, number>)[entry.dataKey]
              : null;
            
            return (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: entry.color }}
                  />
                  <span className="text-sm text-gray-700 font-medium">
                    {entry.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold">
                    {entry.value?.toFixed(1)}
                    {entry.name.includes('Lluvia') ? ' mm' : (showPercentage ? '%' : ' Mm³')}
                  </span>
                  {trend !== null && Math.abs(trend) > 0.1 && (
                    <div className={`text-xs ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {trend > 0 ? '↗' : '↘'} {Math.abs(trend).toFixed(1)}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }, [chartData, showPercentage]);

  // Zoom handlers
  const handleMouseDown = useCallback((e: { activeLabel?: string }) => {
    if (!enableZoom) return;
    setIsSelecting(true);
    setZoomDomain({ left: e?.activeLabel });
  }, [enableZoom]);

  const handleMouseMove = useCallback((e: { activeLabel?: string }) => {
    if (!isSelecting || !enableZoom) return;
    setZoomDomain(prev => ({ ...prev, right: e?.activeLabel }));
  }, [isSelecting, enableZoom]);

  const handleMouseUp = useCallback(() => {
    if (!isSelecting) return;
    setIsSelecting(false);
  }, [isSelecting]);

  const resetZoom = useCallback(() => {
    setZoomDomain({});
  }, []);

  const dataKeySuffix = showPercentage ? '_pct' : '_storage';
  const yAxisLabel = showPercentage ? 'Porcentaje (%)' : 'Almacenamiento (Mm³)';

  return (
    <div className={className}>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-4">
          <span className="text-sm font-medium text-gray-700">
            Mostrando {displayData.length} de {chartData.length} puntos de datos
          </span>
          {(zoomDomain.left || zoomDomain.right) && (
            <button
              onClick={resetZoom}
              className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
            >
              Restablecer zoom
            </button>
          )}
        </div>
        <div className="flex items-center space-x-2 text-xs text-gray-500">
          {enableZoom && <span>📏 Arrastra para hacer zoom</span>}
          {enableBrush && <span>🖱️ Usa el brush para navegar</span>}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <ComposedChart
          data={displayData}
          margin={{ top: 5, right: 30, left: 20, bottom: enableBrush ? 60 : 5 }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickFormatter={(value) => {
              if (granularity === 'weekly' && value.includes(' to ')) {
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

          <Tooltip 
            content={<CustomTooltip />} 
            cursor={enableCrosshair ? { stroke: '#94a3b8', strokeDasharray: '3 3' } : false}
          />
          
          <Legend
            wrapperStyle={{ fontSize: '14px' }}
            iconType="line"
          />

          {/* Reference area for selection */}
          {isSelecting && zoomDomain.left && zoomDomain.right && (
            <ReferenceArea
              yAxisId="left"
              x1={zoomDomain.left}
              x2={zoomDomain.right}
              strokeOpacity={0.3}
              fill="#3b82f6"
              fillOpacity={0.1}
            />
          )}

          {/* Reservoir lines */}
          {reservoirs.includes('valle_bravo') && visibleLines.includes('valle_bravo') && (
            <Line
              yAxisId="left"
              type="monotone"
              dataKey={`valle_bravo${dataKeySuffix}`}
              stroke={RESERVOIR_COLORS.valle_bravo}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6, stroke: RESERVOIR_COLORS.valle_bravo, strokeWidth: 2, fill: 'white' }}
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
              activeDot={{ r: 6, stroke: RESERVOIR_COLORS.villa_victoria, strokeWidth: 2, fill: 'white' }}
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
              activeDot={{ r: 6, stroke: RESERVOIR_COLORS.el_bosque, strokeWidth: 2, fill: 'white' }}
              name={RESERVOIR_NAMES.el_bosque}
              connectNulls={false}
            />
          )}

          {/* System total line */}
          {reservoirs.length === 3 && visibleLines.includes('system_total') && (
            <Line
              yAxisId="left"
              type="monotone"
              dataKey={`system${dataKeySuffix}`}
              stroke={RESERVOIR_COLORS.system_total}
              strokeWidth={3}
              strokeDasharray="5 5"
              dot={false}
              activeDot={{ r: 8, stroke: RESERVOIR_COLORS.system_total, strokeWidth: 2, fill: 'white' }}
              name="Sistema Total"
              connectNulls={false}
            />
          )}

          {/* Precipitation bars */}
          {showPrecipitation && reservoirs.map(reservoir => 
            visibleLines.includes(reservoir) && (
              <Bar
                key={`${reservoir}_rainfall`}
                yAxisId="right"
                dataKey={`${reservoir}_rainfall`}
                fill={PRECIPITATION_COLORS[reservoir]}
                opacity={0.6}
                name={`${RESERVOIR_NAMES[reservoir]} (Lluvia)`}
              />
            )
          )}

          {/* Reference lines for critical levels */}
          {showPercentage && showReferenceLines && (
            <>
              <ReferenceLine 
                yAxisId="left"
                y={25} 
                stroke="#ef4444" 
                strokeDasharray="8 8" 
                label={{ value: "Nivel Crítico (25%)", position: "top" }}
              />
              <ReferenceLine 
                yAxisId="left"
                y={50} 
                stroke="#f59e0b" 
                strokeDasharray="4 4" 
                label={{ value: "Nivel de Alerta (50%)", position: "top" }}
              />
            </>
          )}

          {/* Brush for navigation */}
          {enableBrush && (
            <Brush 
              dataKey="date" 
              height={30}
              stroke="#3b82f6"
              tickFormatter={(value) => format(parseApiDate(value), 'MMM dd')}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}