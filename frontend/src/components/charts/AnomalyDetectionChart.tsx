'use client';

import React, { useMemo } from 'react';
import {
  ComposedChart,
  Line,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Area,
} from 'recharts';
import { format } from 'date-fns';
import { parseApiDate } from '@/lib/dateUtils';
import { RESERVOIR_COLORS, RESERVOIR_NAMES } from '@cutzamala/shared';
import type { CutzamalaReading } from '@cutzamala/shared';
import { formatNumber, formatDate } from '@/lib/utils';

interface AnomalyDetectionChartProps {
  data: CutzamalaReading[];
  reservoir: 'valle_bravo' | 'villa_victoria' | 'el_bosque' | 'system_total';
  height?: number;
  anomalyThreshold?: number; // Standard deviations from mean
  windowSize?: number; // Rolling window for trend calculation
}

interface AnomalyPoint {
  date: string;
  value: number;
  expected: number;
  anomalyScore: number;
  isAnomaly: boolean;
  severity: 'low' | 'medium' | 'high';
  trendValue: number;
  upperBound: number;
  lowerBound: number;
}

export function AnomalyDetectionChart({
  data,
  reservoir,
  height = 500,
  anomalyThreshold = 2,
  windowSize = 30,
}: AnomalyDetectionChartProps) {
  const config = {
    valle_bravo: { name: 'Valle de Bravo', color: RESERVOIR_COLORS.valle_bravo },
    villa_victoria: { name: 'Villa Victoria', color: RESERVOIR_COLORS.villa_victoria },
    el_bosque: { name: 'El Bosque', color: RESERVOIR_COLORS.el_bosque },
    system_total: { name: 'Sistema Total', color: RESERVOIR_COLORS.system_total },
  }[reservoir];

  const anomalyData = useMemo((): AnomalyPoint[] => {
    if (data.length < windowSize) return [];

    // Extract values for the selected reservoir
    const values = data.map(reading => ({
      date: reading.date,
      value: reservoir === 'system_total' 
        ? reading.system_totals.total_percentage
        : reading.reservoirs[reservoir].percentage,
    }));

    // Calculate rolling statistics and detect anomalies
    return values.map((point, index) => {
      // Get window around current point
      const windowStart = Math.max(0, index - Math.floor(windowSize / 2));
      const windowEnd = Math.min(values.length, windowStart + windowSize);
      const windowValues = values.slice(windowStart, windowEnd).map(p => p.value);
      
      // Calculate statistics for the window
      const mean = windowValues.reduce((sum, val) => sum + val, 0) / windowValues.length;
      const variance = windowValues.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / windowValues.length;
      const stdDev = Math.sqrt(variance);
      
      // Calculate trend using linear regression on the window
      const trend = calculateTrend(windowValues);
      const expected = mean + trend * (index - windowStart);
      
      // Calculate anomaly score
      const deviation = Math.abs(point.value - expected);
      const anomalyScore = stdDev > 0 ? deviation / stdDev : 0;
      
      // Classify anomaly severity
      let severity: 'low' | 'medium' | 'high' = 'low';
      if (anomalyScore > anomalyThreshold * 1.5) severity = 'high';
      else if (anomalyScore > anomalyThreshold) severity = 'medium';
      
      return {
        date: point.date,
        value: point.value,
        expected,
        anomalyScore,
        isAnomaly: anomalyScore > anomalyThreshold,
        severity,
        trendValue: expected,
        upperBound: expected + anomalyThreshold * stdDev,
        lowerBound: Math.max(0, expected - anomalyThreshold * stdDev),
      };
    });
  }, [data, reservoir, anomalyThreshold, windowSize]);

  // Helper function for trend calculation
  const calculateTrend = (values: number[]): number => {
    const n = values.length;
    if (n < 2) return 0;
    
    const xMean = (n - 1) / 2;
    const yMean = values.reduce((sum, val) => sum + val, 0) / n;
    
    let numerator = 0;
    let denominator = 0;
    
    values.forEach((y, x) => {
      numerator += (x - xMean) * (y - yMean);
      denominator += Math.pow(x - xMean, 2);
    });
    
    return denominator !== 0 ? numerator / denominator : 0;
  };

  const anomalies = anomalyData.filter(point => point.isAnomaly);
  const severityColors = {
    low: '#f59e0b',
    medium: '#ef4444', 
    high: '#dc2626',
  };

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: unknown[]; label?: string }) => {
    if (!active || !payload || !payload.length || !label) return null;

    const point = anomalyData.find(p => p.date === label);
    if (!point) return null;

    const date = format(parseApiDate(label), 'MMMM dd, yyyy');

    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200 min-w-[300px]">
        <p className="font-semibold text-gray-900 mb-3 border-b pb-2">{date}</p>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Valor observado:</span>
            <span className="font-semibold">{formatNumber(point.value)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Valor esperado:</span>
            <span className="font-semibold">{formatNumber(point.expected)}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Puntuación anomalía:</span>
            <span className="font-semibold">{formatNumber(point.anomalyScore)}σ</span>
          </div>
          <div className="flex justify-between items-center border-t pt-2">
            <span className="text-gray-600">Estado:</span>
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full"
                style={{ 
                  backgroundColor: point.isAnomaly 
                    ? severityColors[point.severity]
                    : '#10b981'
                }}
              />
              <span className={`font-semibold text-sm ${
                point.isAnomaly ? 'text-red-600' : 'text-green-600'
              }`}>
                {point.isAnomaly 
                  ? `Anomalía ${point.severity === 'high' ? 'Alta' : point.severity === 'medium' ? 'Media' : 'Baja'}`
                  : 'Normal'
                }
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold">
          Detección de Anomalías - {config.name}
        </h3>
        <p className="text-sm text-muted-foreground">
          Identificación de patrones inusuales en los niveles de almacenamiento
          (Umbral: {anomalyThreshold}σ, Ventana: {windowSize} días)
        </p>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <ComposedChart 
            data={anomalyData} 
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            
            <XAxis 
              dataKey="date"
              tickFormatter={(value) => format(parseApiDate(value), 'MMM dd')}
              tick={{ fontSize: 12 }}
            />
            
            <YAxis 
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              label={{ 
                value: 'Almacenamiento (%)', 
                angle: -90, 
                position: 'insideLeft' 
              }}
            />
            
            <Tooltip content={<CustomTooltip />} />
            
            <Legend />

            {/* Confidence bands */}
            <Area
              type="monotone"
              dataKey="upperBound"
              stackId="bounds"
              stroke="none"
              fill="#e5e7eb"
              fillOpacity={0.3}
              name="Límite Superior"
            />

            <Area
              type="monotone"
              dataKey="lowerBound"
              stackId="bounds"
              stroke="none"
              fill="white"
              fillOpacity={1}
              name=""
            />

            {/* Expected trend line */}
            <Line
              type="monotone"
              dataKey="trendValue"
              stroke="#6b7280"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Tendencia Esperada"
            />

            {/* Actual values */}
            <Line
              type="monotone"
              dataKey="value"
              stroke={config.color}
              strokeWidth={2}
              dot={false}
              name="Valores Reales"
              activeDot={{ r: 6 }}
            />

            {/* Anomaly points - scatter plot with different colors by severity */}
            {anomalies.map((anomaly, index) => (
              <Scatter
                key={`anomaly-${index}`}
                data={[anomaly]}
                fill={severityColors[anomaly.severity]}
                shape="circle"
              />
            ))}

            {/* Reference lines */}
            <ReferenceLine 
              y={25} 
              stroke="#ef4444" 
              strokeDasharray="8 8" 
              label={{ value: "Crítico", position: "top" }}
            />
            <ReferenceLine 
              y={50} 
              stroke="#f59e0b" 
              strokeDasharray="4 4" 
              label={{ value: "Alerta", position: "top" }}
            />

          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Anomaly summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="font-medium text-gray-800">Total de Anomalías</div>
          <div className="text-2xl font-bold text-gray-600">
            {anomalies.length}
          </div>
          <div className="text-xs text-gray-500">
            {((anomalies.length / anomalyData.length) * 100).toFixed(1)}% del período
          </div>
        </div>

        <div className="bg-yellow-50 p-3 rounded-lg">
          <div className="font-medium text-yellow-800">Severidad Baja</div>
          <div className="text-2xl font-bold text-yellow-600">
            {anomalies.filter(a => a.severity === 'low').length}
          </div>
        </div>

        <div className="bg-orange-50 p-3 rounded-lg">
          <div className="font-medium text-orange-800">Severidad Media</div>
          <div className="text-2xl font-bold text-orange-600">
            {anomalies.filter(a => a.severity === 'medium').length}
          </div>
        </div>

        <div className="bg-red-50 p-3 rounded-lg">
          <div className="font-medium text-red-800">Severidad Alta</div>
          <div className="text-2xl font-bold text-red-600">
            {anomalies.filter(a => a.severity === 'high').length}
          </div>
        </div>
      </div>

      {/* Recent anomalies list */}
      {anomalies.length > 0 && (
        <div className="bg-white border rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-3">Anomalías Recientes</h4>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {anomalies
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 10)
              .map((anomaly, index) => (
                <div key={index} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: severityColors[anomaly.severity] }}
                    />
                    <span className="font-medium">
                      {formatDate(anomaly.date)}
                    </span>
                  </div>
                  <div className="text-right">
                    <div>{formatNumber(anomaly.value)}%</div>
                    <div className="text-xs text-gray-500">
                      {formatNumber(anomaly.anomalyScore)}σ
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}