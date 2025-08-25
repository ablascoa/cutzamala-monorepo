'use client';

import React, { useMemo } from 'react';
import { formatNumber, formatDate } from '@/lib/utils';
import { RESERVOIR_NAMES, RESERVOIR_COLORS } from '@cutzamala/shared';
import type { CutzamalaReading } from '@cutzamala/shared';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  Droplets,
  AlertTriangle,
  Info,
} from 'lucide-react';

interface SummaryStatisticsTableProps {
  data: CutzamalaReading[];
  selectedReservoirs?: ('valle_bravo' | 'villa_victoria' | 'el_bosque')[];
  period?: string;
}

interface ReservoirStats {
  name: string;
  color: string;
  current: {
    percentage: number;
    storage: number;
    date: string;
  };
  statistics: {
    average: number;
    minimum: number;
    maximum: number;
    standardDeviation: number;
    trend: number; // Change from first to last reading
    volatility: number; // Coefficient of variation
  };
  rainfall: {
    total: number;
    average: number;
    maximum: number;
  };
  alerts: {
    criticalDays: number; // Days below 25%
    lowDays: number; // Days below 50%
    percentage: number; // Percentage of time in alert
  };
}

export function SummaryStatisticsTable({
  data,
  selectedReservoirs = ['valle_bravo', 'villa_victoria', 'el_bosque'],
  period = 'Período seleccionado',
}: SummaryStatisticsTableProps) {
  const statistics = useMemo((): ReservoirStats[] => {
    if (!data.length) return [];

    const reservoirStats = selectedReservoirs.map(reservoir => {
      const values = data.map(reading => reading.reservoirs[reservoir].percentage);
      const storageValues = data.map(reading => reading.reservoirs[reservoir].storage_mm3);
      const rainfallValues = data.map(reading => reading.reservoirs[reservoir].rainfall);
      
      const latest = data[data.length - 1];
      const first = data[0];
      
      // Basic statistics
      const sum = values.reduce((acc, val) => acc + val, 0);
      const average = sum / values.length;
      const minimum = Math.min(...values);
      const maximum = Math.max(...values);
      
      // Standard deviation
      const variance = values.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) / values.length;
      const standardDeviation = Math.sqrt(variance);
      
      // Trend (percentage change from first to last)
      const trend = ((latest.reservoirs[reservoir].percentage - first.reservoirs[reservoir].percentage) / first.reservoirs[reservoir].percentage) * 100;
      
      // Volatility (coefficient of variation)
      const volatility = (standardDeviation / average) * 100;
      
      // Rainfall statistics
      const totalRainfall = rainfallValues.reduce((acc, val) => acc + val, 0);
      const averageRainfall = totalRainfall / rainfallValues.length;
      const maxRainfall = Math.max(...rainfallValues);
      
      // Alert statistics
      const criticalDays = values.filter(val => val < 25).length;
      const lowDays = values.filter(val => val < 50).length;
      const alertPercentage = (lowDays / values.length) * 100;

      return {
        name: RESERVOIR_NAMES[reservoir],
        color: RESERVOIR_COLORS[reservoir],
        current: {
          percentage: latest.reservoirs[reservoir].percentage,
          storage: latest.reservoirs[reservoir].storage_mm3,
          date: latest.date,
        },
        statistics: {
          average,
          minimum,
          maximum,
          standardDeviation,
          trend,
          volatility,
        },
        rainfall: {
          total: totalRainfall,
          average: averageRainfall,
          maximum: maxRainfall,
        },
        alerts: {
          criticalDays,
          lowDays,
          percentage: alertPercentage,
        },
      };
    });

    return reservoirStats;
  }, [data, selectedReservoirs]);

  const systemStats = useMemo(() => {
    if (!data.length) return null;

    const systemValues = data.map(reading => reading.system_totals.total_percentage);
    const systemStorage = data.map(reading => reading.system_totals.total_mm3);
    
    const latest = data[data.length - 1];
    const first = data[0];
    
    const sum = systemValues.reduce((acc, val) => acc + val, 0);
    const average = sum / systemValues.length;
    const minimum = Math.min(...systemValues);
    const maximum = Math.max(...systemValues);
    
    const variance = systemValues.reduce((acc, val) => acc + Math.pow(val - average, 2), 0) / systemValues.length;
    const standardDeviation = Math.sqrt(variance);
    
    const trend = ((latest.system_totals.total_percentage - first.system_totals.total_percentage) / first.system_totals.total_percentage) * 100;
    const volatility = (standardDeviation / average) * 100;
    
    const criticalDays = systemValues.filter(val => val < 25).length;
    const lowDays = systemValues.filter(val => val < 50).length;
    const alertPercentage = (lowDays / systemValues.length) * 100;

    return {
      current: {
        percentage: latest.system_totals.total_percentage,
        storage: latest.system_totals.total_mm3,
        date: latest.date,
      },
      statistics: {
        average,
        minimum,
        maximum,
        standardDeviation,
        trend,
        volatility,
      },
      alerts: {
        criticalDays,
        lowDays,
        percentage: alertPercentage,
      },
    };
  }, [data]);

  if (!data.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay datos disponibles para mostrar estadísticas
      </div>
    );
  }

  const TrendIndicator = ({ value }: { value: number }) => {
    if (Math.abs(value) < 0.1) return <span className="text-gray-400">Sin cambio</span>;
    
    return (
      <div className={`flex items-center space-x-1 ${value > 0 ? 'text-green-600' : 'text-red-600'}`}>
        {value > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
        <span className="font-medium">{value > 0 ? '+' : ''}{formatNumber(value)}%</span>
      </div>
    );
  };

  const StatusIndicator = ({ percentage }: { percentage: number }) => {
    if (percentage < 25) return <span className="text-red-600 font-medium">Crítico</span>;
    if (percentage < 50) return <span className="text-yellow-600 font-medium">Bajo</span>;
    if (percentage < 75) return <span className="text-green-600 font-medium">Normal</span>;
    return <span className="text-blue-600 font-medium">Óptimo</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Estadísticas Resumidas del Sistema Cutzamala
        </h3>
        <p className="text-sm text-gray-500">
          {period} • {data.length} registros • 
          Período: {formatDate(data[0]?.date)} - {formatDate(data[data.length - 1]?.date)}
        </p>
      </div>

      {/* System Total Summary */}
      {systemStats && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border border-purple-200">
          <h4 className="font-medium text-purple-900 mb-3 flex items-center space-x-2">
            <BarChart3 className="w-5 h-5" />
            <span>Sistema Total</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {formatNumber(systemStats.current.percentage)}%
              </div>
              <div className="text-xs text-gray-600">Nivel Actual</div>
              <div className="text-xs">
                <StatusIndicator percentage={systemStats.current.percentage} />
              </div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">
                {formatNumber(systemStats.statistics.average)}%
              </div>
              <div className="text-xs text-gray-600">Promedio</div>
              <div className="text-xs text-gray-500">
                ±{formatNumber(systemStats.statistics.standardDeviation)}%
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm">
                <TrendIndicator value={systemStats.statistics.trend} />
              </div>
              <div className="text-xs text-gray-600">Tendencia Total</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-orange-600">
                {systemStats.alerts.lowDays}
              </div>
              <div className="text-xs text-gray-600">Días en Alerta</div>
              <div className="text-xs text-gray-500">
                {formatNumber(systemStats.alerts.percentage)}% del período
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Individual Reservoirs Table */}
      <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
        <table className="min-w-full divide-y divide-gray-300">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Embalse
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nivel Actual
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estadísticas
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precipitación
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Alertas
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {statistics.map((reservoir, index) => (
              <tr key={reservoir.name} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                {/* Reservoir Name */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: reservoir.color }}
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {reservoir.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {formatDate(reservoir.current.date)}
                      </div>
                    </div>
                  </div>
                </td>

                {/* Current Level */}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="text-2xl font-bold" style={{ color: reservoir.color }}>
                    {formatNumber(reservoir.current.percentage)}%
                  </div>
                  <div className="text-xs text-gray-600">
                    {formatNumber(reservoir.current.storage)} Mm³
                  </div>
                  <div className="text-xs mt-1">
                    <StatusIndicator percentage={reservoir.current.percentage} />
                  </div>
                </td>

                {/* Statistics */}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="space-y-1 text-xs">
                    <div>
                      <span className="font-medium">Promedio:</span> {formatNumber(reservoir.statistics.average)}%
                    </div>
                    <div>
                      <span className="font-medium">Rango:</span> {formatNumber(reservoir.statistics.minimum)}% - {formatNumber(reservoir.statistics.maximum)}%
                    </div>
                    <div>
                      <span className="font-medium">Volatilidad:</span> {formatNumber(reservoir.statistics.volatility)}%
                    </div>
                    <div>
                      <TrendIndicator value={reservoir.statistics.trend} />
                    </div>
                  </div>
                </td>

                {/* Rainfall */}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-center space-x-1">
                      <Droplets className="w-3 h-3 text-blue-500" />
                      <span className="font-medium">{formatNumber(reservoir.rainfall.total)} mm</span>
                    </div>
                    <div className="text-gray-600">
                      Promedio: {formatNumber(reservoir.rainfall.average)} mm
                    </div>
                    <div className="text-gray-600">
                      Máximo: {formatNumber(reservoir.rainfall.maximum)} mm
                    </div>
                  </div>
                </td>

                {/* Alerts */}
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-center space-x-1">
                      <AlertTriangle className="w-3 h-3 text-red-500" />
                      <span className="font-medium text-red-600">{reservoir.alerts.criticalDays}</span>
                      <span className="text-gray-600">críticos</span>
                    </div>
                    <div className="flex items-center justify-center space-x-1">
                      <Info className="w-3 h-3 text-yellow-500" />
                      <span className="font-medium text-yellow-600">{reservoir.alerts.lowDays}</span>
                      <span className="text-gray-600">en alerta</span>
                    </div>
                    <div className="text-gray-600">
                      {formatNumber(reservoir.alerts.percentage)}% del período
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Key Insights */}
      <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">Puntos Clave del Análisis</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="font-medium text-blue-800 mb-1">Tendencias Generales:</div>
            <ul className="text-blue-700 space-y-1">
              {systemStats && (
                <li>
                  • Sistema total {systemStats.statistics.trend > 0 ? 'aumentó' : 'disminuyó'} {formatNumber(Math.abs(systemStats.statistics.trend))}%
                </li>
              )}
              <li>
                • Embalse más estable: {statistics.reduce((min, current) => 
                  current.statistics.volatility < min.statistics.volatility ? current : min
                ).name}
              </li>
              <li>
                • Mayor variabilidad: {statistics.reduce((max, current) => 
                  current.statistics.volatility > max.statistics.volatility ? current : max
                ).name}
              </li>
            </ul>
          </div>
          <div>
            <div className="font-medium text-blue-800 mb-1">Situación de Alertas:</div>
            <ul className="text-blue-700 space-y-1">
              <li>
                • Total días críticos: {statistics.reduce((sum, r) => sum + r.alerts.criticalDays, 0)}
              </li>
              <li>
                • Total días en alerta: {statistics.reduce((sum, r) => sum + r.alerts.lowDays, 0)}
              </li>
              <li>
                • Lluvia total acumulada: {formatNumber(statistics.reduce((sum, r) => sum + r.rainfall.total, 0))} mm
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}