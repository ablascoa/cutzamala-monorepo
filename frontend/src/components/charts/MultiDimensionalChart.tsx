'use client';

import React, { useMemo, useState } from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import { formatNumber, formatDate } from '@/lib/utils';
import { RESERVOIR_COLORS, RESERVOIR_NAMES } from '@cutzamala/shared';
import type { CutzamalaReading } from '@cutzamala/shared';

interface MultiDimensionalChartProps {
  data: CutzamalaReading[];
  xAxis: 'storage' | 'percentage' | 'rainfall' | 'month' | 'year';
  yAxis: 'storage' | 'percentage' | 'rainfall' | 'system_total';
  sizeBy?: 'rainfall' | 'storage' | 'percentage' | null;
  colorBy?: 'reservoir' | 'season' | 'year' | 'month' | 'alert_level';
  reservoir?: 'valle_bravo' | 'villa_victoria' | 'el_bosque' | 'all';
  height?: number;
  showTrendLine?: boolean;
  showCorrelation?: boolean;
}

interface ScatterDataPoint {
  x: number;
  y: number;
  z?: number;
  date: string;
  reservoir: string;
  color: string;
  month: number;
  year: number;
  season: string;
  alertLevel: string;
  tooltip: {
    xLabel: string;
    yLabel: string;
    zLabel?: string;
    values: {
      reservoir: string;
      date: string;
      x: number;
      y: number;
      z?: number;
    };
  };
}

const AXIS_CONFIGS = {
  storage: { label: 'Almacenamiento (Mm³)', format: (val: number) => `${formatNumber(val)} Mm³` },
  percentage: { label: 'Porcentaje de Capacidad (%)', format: (val: number) => `${formatNumber(val)}%` },
  rainfall: { label: 'Precipitación (mm)', format: (val: number) => `${formatNumber(val)} mm` },
  system_total: { label: 'Sistema Total (%)', format: (val: number) => `${formatNumber(val)}%` },
  month: { label: 'Mes', format: (val: number) => ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][val] },
  year: { label: 'Año', format: (val: number) => val.toString() },
};

const SEASON_COLORS = {
  'Primavera': '#10b981', // green
  'Verano': '#f59e0b',    // amber
  'Otoño': '#ef4444',     // red
  'Invierno': '#3b82f6',  // blue
};

const ALERT_COLORS = {
  'Crítico': '#dc2626',   // red-600
  'Bajo': '#f59e0b',      // amber-500
  'Normal': '#10b981',    // green-500
  'Óptimo': '#3b82f6',    // blue-500
};

export function MultiDimensionalChart({
  data,
  xAxis,
  yAxis,
  sizeBy = null,
  colorBy = 'reservoir',
  reservoir = 'all',
  height = 500,
  showTrendLine = false,
  showCorrelation = true,
}: MultiDimensionalChartProps) {
  const [selectedPoints, setSelectedPoints] = useState<ScatterDataPoint[]>([]);

  const scatterData = useMemo((): ScatterDataPoint[] => {
    if (!data.length) return [];

    const getSeason = (month: number): string => {
      if (month >= 3 && month <= 5) return 'Primavera';
      if (month >= 6 && month <= 8) return 'Verano';
      if (month >= 9 && month <= 11) return 'Otoño';
      return 'Invierno';
    };

    const getAlertLevel = (percentage: number): string => {
      if (percentage < 25) return 'Crítico';
      if (percentage < 50) return 'Bajo';
      if (percentage < 75) return 'Normal';
      return 'Óptimo';
    };

    const getValue = (reading: CutzamalaReading, axis: string, reservoirKey: string) => {
      switch (axis) {
        case 'storage':
          return reservoirKey === 'system_total' 
            ? reading.system_totals.total_mm3 
            : reading.reservoirs[reservoirKey as keyof typeof reading.reservoirs].storage_mm3;
        case 'percentage':
          return reservoirKey === 'system_total' 
            ? reading.system_totals.total_percentage 
            : reading.reservoirs[reservoirKey as keyof typeof reading.reservoirs].percentage;
        case 'rainfall':
          return reservoirKey === 'system_total'
            ? (reading.reservoirs.valle_bravo.rainfall + reading.reservoirs.villa_victoria.rainfall + reading.reservoirs.el_bosque.rainfall) / 3
            : reading.reservoirs[reservoirKey as keyof typeof reading.reservoirs].rainfall;
        case 'system_total':
          return reading.system_totals.total_percentage;
        case 'month':
          return reading.month;
        case 'year':
          return reading.year;
        default:
          return 0;
      }
    };

    const getColor = (point: ScatterDataPoint): string => {
      switch (colorBy) {
        case 'reservoir':
          return RESERVOIR_COLORS[point.reservoir as keyof typeof RESERVOIR_COLORS] || '#6b7280';
        case 'season':
          return SEASON_COLORS[point.season as keyof typeof SEASON_COLORS];
        case 'alert_level':
          return ALERT_COLORS[point.alertLevel as keyof typeof ALERT_COLORS];
        case 'year':
          const yearRange = Math.max(...data.map(d => d.year)) - Math.min(...data.map(d => d.year));
          const yearNormalized = (point.year - Math.min(...data.map(d => d.year))) / Math.max(yearRange, 1);
          return `hsl(${240 + yearNormalized * 120}, 70%, 50%)`; // Blue to green gradient
        case 'month':
          return `hsl(${(point.month - 1) * 30}, 70%, 50%)`; // Color wheel
        default:
          return '#6b7280';
      }
    };

    const points: ScatterDataPoint[] = [];

    if (reservoir === 'all') {
      // Include all reservoirs
      ['valle_bravo', 'villa_victoria', 'el_bosque', 'system_total'].forEach(reservoirKey => {
        data.forEach(reading => {
          const x = getValue(reading, xAxis, reservoirKey);
          const y = getValue(reading, yAxis, reservoirKey);
          const z = sizeBy ? getValue(reading, sizeBy, reservoirKey) : undefined;
          
          const season = getSeason(reading.month);
          const alertLevel = getAlertLevel(
            reservoirKey === 'system_total' 
              ? reading.system_totals.total_percentage 
              : reading.reservoirs[reservoirKey as keyof typeof reading.reservoirs].percentage
          );

          const point = {
            x,
            y,
            z,
            date: reading.date,
            reservoir: reservoirKey,
            color: '',
            month: reading.month,
            year: reading.year,
            season,
            alertLevel,
            tooltip: {
              xLabel: AXIS_CONFIGS[xAxis].label,
              yLabel: AXIS_CONFIGS[yAxis].label,
              zLabel: sizeBy ? AXIS_CONFIGS[sizeBy].label : undefined,
              values: {
                reservoir: reservoirKey === 'system_total' ? 'Sistema Total' : RESERVOIR_NAMES[reservoirKey as keyof typeof RESERVOIR_NAMES],
                date: reading.date,
                x,
                y,
                z,
              },
            },
          };

          point.color = getColor(point);
          points.push(point);
        });
      });
    } else {
      // Single reservoir
      data.forEach(reading => {
        const x = getValue(reading, xAxis, reservoir);
        const y = getValue(reading, yAxis, reservoir);
        const z = sizeBy ? getValue(reading, sizeBy, reservoir) : undefined;
        
        const season = getSeason(reading.month);
        const percentage = (reservoir as string) === 'system_total' 
          ? reading.system_totals.total_percentage 
          : reading.reservoirs[reservoir as keyof typeof reading.reservoirs].percentage;
        const alertLevel = getAlertLevel(percentage);

        const point = {
          x,
          y,
          z,
          date: reading.date,
          reservoir,
          color: '',
          month: reading.month,
          year: reading.year,
          season,
          alertLevel,
          tooltip: {
            xLabel: AXIS_CONFIGS[xAxis].label,
            yLabel: AXIS_CONFIGS[yAxis].label,
            zLabel: sizeBy ? AXIS_CONFIGS[sizeBy].label : undefined,
            values: {
              reservoir: (reservoir as string) === 'system_total' ? 'Sistema Total' : RESERVOIR_NAMES[reservoir as keyof typeof RESERVOIR_NAMES],
              date: reading.date,
              x,
              y,
              z,
            },
          },
        };

        point.color = getColor(point);
        points.push(point);
      });
    }

    return points;
  }, [data, xAxis, yAxis, sizeBy, colorBy, reservoir]);

  // Calculate correlation coefficient
  const correlation = useMemo(() => {
    if (!showCorrelation || scatterData.length < 2) return null;
    
    const n = scatterData.length;
    const sumX = scatterData.reduce((sum, point) => sum + point.x, 0);
    const sumY = scatterData.reduce((sum, point) => sum + point.y, 0);
    const sumXY = scatterData.reduce((sum, point) => sum + point.x * point.y, 0);
    const sumXX = scatterData.reduce((sum, point) => sum + point.x * point.x, 0);
    const sumYY = scatterData.reduce((sum, point) => sum + point.y * point.y, 0);
    
    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    
    return denominator !== 0 ? numerator / denominator : 0;
  }, [scatterData, showCorrelation]);

  // Calculate trend line
  const trendLine = useMemo(() => {
    if (!showTrendLine || scatterData.length < 2) return null;
    
    const n = scatterData.length;
    const sumX = scatterData.reduce((sum, point) => sum + point.x, 0);
    const sumY = scatterData.reduce((sum, point) => sum + point.y, 0);
    const sumXY = scatterData.reduce((sum, point) => sum + point.x * point.y, 0);
    const sumXX = scatterData.reduce((sum, point) => sum + point.x * point.x, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    const minX = Math.min(...scatterData.map(p => p.x));
    const maxX = Math.max(...scatterData.map(p => p.x));
    
    return {
      start: { x: minX, y: slope * minX + intercept },
      end: { x: maxX, y: slope * maxX + intercept },
      slope,
      intercept,
    };
  }, [scatterData, showTrendLine]);

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: ScatterDataPoint }[] }) => {
    if (!active || !payload || !payload.length) return null;
    
    const data = payload[0].payload as ScatterDataPoint;
    
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 min-w-[250px]">
        <p className="font-semibold text-gray-900 mb-2 border-b pb-2">
          {data.tooltip.values.reservoir}
        </p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">{data.tooltip.xLabel}:</span>
            <span className="font-semibold">{AXIS_CONFIGS[xAxis].format(data.x)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">{data.tooltip.yLabel}:</span>
            <span className="font-semibold">{AXIS_CONFIGS[yAxis].format(data.y)}</span>
          </div>
          {data.z !== undefined && data.tooltip.zLabel && (
            <div className="flex justify-between">
              <span className="text-gray-600">{data.tooltip.zLabel}:</span>
              <span className="font-semibold">{AXIS_CONFIGS[sizeBy!].format(data.z)}</span>
            </div>
          )}
          <div className="flex justify-between border-t pt-1">
            <span className="text-gray-600">Fecha:</span>
            <span className="font-semibold">{formatDate(data.date)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Temporada:</span>
            <span className="font-semibold">{data.season}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Estado:</span>
            <span className="font-semibold" style={{ color: ALERT_COLORS[data.alertLevel as keyof typeof ALERT_COLORS] }}>
              {data.alertLevel}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Group data by color/category for legend
  const groupedData = useMemo(() => {
    const groups = new Map<string, ScatterDataPoint[]>();
    
    scatterData.forEach(point => {
      let key = '';
      switch (colorBy) {
        case 'reservoir':
          key = point.reservoir === 'system_total' ? 'Sistema Total' : RESERVOIR_NAMES[point.reservoir as keyof typeof RESERVOIR_NAMES];
          break;
        case 'season':
          key = point.season;
          break;
        case 'alert_level':
          key = point.alertLevel;
          break;
        case 'year':
          key = point.year.toString();
          break;
        case 'month':
          key = AXIS_CONFIGS.month.format(point.month);
          break;
        default:
          key = 'Datos';
      }
      
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(point);
    });
    
    return Array.from(groups.entries()).map(([name, points]) => ({
      name,
      data: points,
      color: points[0]?.color || '#6b7280',
    }));
  }, [scatterData, colorBy]);

  const minSize = 20;
  const maxSize = sizeBy ? 200 : 50;

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold">
          Análisis Multidimensional
        </h3>
        <p className="text-sm text-muted-foreground">
          Relación entre {AXIS_CONFIGS[xAxis].label.toLowerCase()} y {AXIS_CONFIGS[yAxis].label.toLowerCase()}
          {sizeBy && ` (tamaño por ${AXIS_CONFIGS[sizeBy].label.toLowerCase()})`}
          {colorBy !== 'reservoir' && ` • Coloreado por ${colorBy}`}
        </p>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            
            <XAxis 
              type="number"
              dataKey="x"
              tickFormatter={AXIS_CONFIGS[xAxis].format}
              label={{ 
                value: AXIS_CONFIGS[xAxis].label, 
                position: 'insideBottom',
                offset: -10 
              }}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            
            <YAxis 
              type="number"
              dataKey="y"
              tickFormatter={AXIS_CONFIGS[yAxis].format}
              label={{ 
                value: AXIS_CONFIGS[yAxis].label, 
                angle: -90, 
                position: 'insideLeft' 
              }}
              domain={['dataMin - 5', 'dataMax + 5']}
            />
            
            {sizeBy && (
              <ZAxis 
                type="number"
                dataKey="z"
                range={[minSize, maxSize]}
              />
            )}
            
            <Tooltip content={<CustomTooltip />} />
            
            <Legend />

            {/* Trend line */}
            {trendLine && (
              <ReferenceLine 
                x={trendLine.start.x}
                y={trendLine.start.y}
                x2={trendLine.end.x}
                y2={trendLine.end.y}
                stroke="#6b7280"
                strokeDasharray="5 5"
                strokeWidth={2}
              />
            )}

            {/* Render scatter plots by group */}
            {groupedData.map((group, index) => (
              <Scatter
                key={group.name}
                name={group.name}
                data={group.data}
                fill={group.color}
                fillOpacity={0.7}
                onClick={(data) => {
                  console.log('Point clicked:', data);
                  // Handle point selection
                }}
              >
                {group.data.map((point, pointIndex) => (
                  <Cell key={pointIndex} fill={point.color} />
                ))}
              </Scatter>
            ))}

          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Statistics panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="font-medium text-blue-800">Puntos de Datos</div>
          <div className="text-2xl font-bold text-blue-600">
            {scatterData.length}
          </div>
        </div>

        {correlation !== null && (
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="font-medium text-green-800">Correlación (r)</div>
            <div className="text-2xl font-bold text-green-600">
              {formatNumber(correlation)}
            </div>
            <div className="text-xs text-green-700">
              {Math.abs(correlation) > 0.7 ? 'Fuerte' : Math.abs(correlation) > 0.5 ? 'Moderada' : 'Débil'}
            </div>
          </div>
        )}

        {trendLine && (
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="font-medium text-purple-800">Pendiente</div>
            <div className="text-2xl font-bold text-purple-600">
              {formatNumber(trendLine.slope)}
            </div>
            <div className="text-xs text-purple-700">
              {trendLine.slope > 0 ? 'Tendencia positiva' : 'Tendencia negativa'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}