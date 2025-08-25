'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/TabsNew';
import { EnhancedTimeSeriesChart } from '@/components/charts/EnhancedTimeSeriesChart';
import { SeasonalPatternChart } from '@/components/charts/SeasonalPatternChart';
import { AnomalyDetectionChart } from '@/components/charts/AnomalyDetectionChart';
import { MultiDimensionalChart } from '@/components/charts/MultiDimensionalChart';
import { RainfallCorrelationChart } from '@/components/charts/RainfallCorrelationChart';
import { CutzamalaDataTable } from '@/components/tables/CutzamalaDataTable';
import { SummaryStatisticsTable } from '@/components/tables/SummaryStatisticsTable';
import type { CutzamalaReading } from '@cutzamala/shared';
import {
  TrendingUp,
  BarChart3,
  Zap,
  Layers,
  Calendar,
  Table,
  Download,
  Settings,
  Filter,
  Eye,
  AlertTriangle,
  Info,
  Maximize2,
  Minimize2,
} from 'lucide-react';

interface AdvancedDashboardLayoutProps {
  data: CutzamalaReading[];
  selectedReservoirs: ('valle_bravo' | 'villa_victoria' | 'el_bosque')[];
  showPercentage: boolean;
  showPrecipitation: boolean;
  granularity: string;
  loading?: boolean;
  onExportData?: (format: 'csv' | 'json') => void;
  onConfigurationChange?: (config: DashboardConfig) => void;
}

interface DashboardConfig {
  layout: 'grid' | 'tabs' | 'single-column';
  defaultTab: string;
  enabledCharts: string[];
  chartHeights: Record<string, number>;
  showAdvancedAnalysis: boolean;
}

interface ChartConfig {
  id: string;
  name: string;
  icon: React.ReactNode;
  component: React.ComponentType<Record<string, unknown>>;
  description: string;
  category: 'time-series' | 'analysis' | 'correlation' | 'data';
  defaultHeight: number;
  requiresReservoirSelection?: boolean;
}

export function AdvancedDashboardLayout({
  data,
  selectedReservoirs,
  showPercentage,
  showPrecipitation,
  granularity,
  loading = false,
  onExportData,
  onConfigurationChange,
}: AdvancedDashboardLayoutProps) {
  const [config, setConfig] = useState<DashboardConfig>({
    layout: 'tabs',
    defaultTab: 'overview',
    enabledCharts: ['enhanced-time-series', 'seasonal-pattern', 'correlation', 'data-table'],
    chartHeights: {},
    showAdvancedAnalysis: true,
  });

  const [expandedChart, setExpandedChart] = useState<string | null>(null);
  const [selectedReservoirForAnalysis, setSelectedReservoirForAnalysis] = useState<'valle_bravo' | 'villa_victoria' | 'el_bosque' | 'system_total'>('valle_bravo');

  // Chart configurations
  const chartConfigs: ChartConfig[] = [
    {
      id: 'enhanced-time-series',
      name: 'Serie Temporal Avanzada',
      icon: <TrendingUp className="w-5 h-5" />,
      component: EnhancedTimeSeriesChart,
      description: 'Gráfico de series temporales con zoom, brush y análisis de tendencias',
      category: 'time-series',
      defaultHeight: 500,
    },
    {
      id: 'seasonal-pattern',
      name: 'Patrones Estacionales',
      icon: <Calendar className="w-5 h-5" />,
      component: SeasonalPatternChart,
      description: 'Análisis de variaciones estacionales y promedios históricos',
      category: 'analysis',
      defaultHeight: 450,
      requiresReservoirSelection: true,
    },
    {
      id: 'anomaly-detection',
      name: 'Detección de Anomalías',
      icon: <Zap className="w-5 h-5" />,
      component: AnomalyDetectionChart,
      description: 'Identificación automática de patrones anómalos en los datos',
      category: 'analysis',
      defaultHeight: 500,
      requiresReservoirSelection: true,
    },
    {
      id: 'multi-dimensional',
      name: 'Análisis Multidimensional',
      icon: <Layers className="w-5 h-5" />,
      component: MultiDimensionalChart,
      description: 'Análisis de correlaciones entre múltiples variables',
      category: 'correlation',
      defaultHeight: 500,
    },
    {
      id: 'rainfall-correlation',
      name: 'Correlación Lluvia-Almacenamiento',
      icon: <BarChart3 className="w-5 h-5" />,
      component: RainfallCorrelationChart,
      description: 'Análisis de la relación entre precipitación y niveles de agua',
      category: 'correlation',
      defaultHeight: 450,
      requiresReservoirSelection: true,
    },
    {
      id: 'data-table',
      name: 'Tabla de Datos',
      icon: <Table className="w-5 h-5" />,
      component: CutzamalaDataTable,
      description: 'Vista tabular completa de todos los datos con filtros y exportación',
      category: 'data',
      defaultHeight: 600,
    },
    {
      id: 'summary-statistics',
      name: 'Estadísticas Resumidas',
      icon: <Info className="w-5 h-5" />,
      component: SummaryStatisticsTable,
      description: 'Resumen estadístico completo del período seleccionado',
      category: 'data',
      defaultHeight: 800,
    },
  ];

  // Filter charts by category and enabled status
  const chartsByCategory = useMemo(() => {
    const categories = {
      'time-series': chartConfigs.filter(c => c.category === 'time-series' && config.enabledCharts.includes(c.id)),
      'analysis': chartConfigs.filter(c => c.category === 'analysis' && config.enabledCharts.includes(c.id)),
      'correlation': chartConfigs.filter(c => c.category === 'correlation' && config.enabledCharts.includes(c.id)),
      'data': chartConfigs.filter(c => c.category === 'data' && config.enabledCharts.includes(c.id)),
    };
    return categories;
  }, [config.enabledCharts]);

  // Get chart height with override support
  const getChartHeight = (chartId: string, defaultHeight: number): number => {
    if (expandedChart === chartId) return 700;
    return config.chartHeights[chartId] || defaultHeight;
  };

  // Render a chart component with error boundary and loading state
  const renderChart = (chartConfig: ChartConfig, additionalProps: Record<string, unknown> = {}) => {
    const ChartComponent = chartConfig.component;
    const height = getChartHeight(chartConfig.id, chartConfig.defaultHeight);
    
    const baseProps = {
      data,
      height,
      ...additionalProps,
    };

    // Add specific props based on chart type
    if (chartConfig.id === 'enhanced-time-series') {
      Object.assign(baseProps, {
        showPercentage,
        showPrecipitation,
        reservoirs: selectedReservoirs,
        granularity,
        enableZoom: true,
        enableBrush: true,
        enableCrosshair: true,
      });
    } else if (chartConfig.requiresReservoirSelection) {
      Object.assign(baseProps, {
        reservoir: selectedReservoirForAnalysis,
      });
    } else if (chartConfig.id === 'multi-dimensional') {
      Object.assign(baseProps, {
        xAxis: 'rainfall',
        yAxis: 'percentage',
        sizeBy: 'storage',
        colorBy: 'reservoir',
        reservoir: 'all',
        showTrendLine: true,
        showCorrelation: true,
      });
    } else if (chartConfig.id === 'data-table') {
      Object.assign(baseProps, {
        onExport: onExportData,
        showTrends: true,
      });
    } else if (chartConfig.id === 'summary-statistics') {
      Object.assign(baseProps, {
        selectedReservoirs,
        period: granularity,
      });
    }

    return (
      <div className="relative">
        {/* Chart header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            {chartConfig.icon}
            <div>
              <h4 className="font-semibold">{chartConfig.name}</h4>
              <p className="text-xs text-gray-500">{chartConfig.description}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {chartConfig.requiresReservoirSelection && (
              <select
                value={selectedReservoirForAnalysis}
                onChange={(e) => setSelectedReservoirForAnalysis(e.target.value as 'valle_bravo' | 'villa_victoria' | 'el_bosque' | 'system_total')}
                className="text-xs border border-gray-300 rounded-md px-2 py-1"
              >
                <option value="valle_bravo">Valle de Bravo</option>
                <option value="villa_victoria">Villa Victoria</option>
                <option value="el_bosque">El Bosque</option>
                <option value="system_total">Sistema Total</option>
              </select>
            )}
            <button
              onClick={() => setExpandedChart(expandedChart === chartConfig.id ? null : chartConfig.id)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
              title={expandedChart === chartConfig.id ? 'Contraer' : 'Expandir'}
            >
              {expandedChart === chartConfig.id ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center" style={{ height }}>
            <div className="text-center text-gray-500">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
              <p>No hay datos disponibles</p>
            </div>
          </div>
        ) : (
          <ChartComponent {...baseProps} />
        )}
      </div>
    );
  };

  // Tab-based layout
  const TabLayout = () => {
    return (
      <Tabs defaultValue={config.defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vista General</TabsTrigger>
          <TabsTrigger value="analysis">Análisis</TabsTrigger>
          <TabsTrigger value="correlations">Correlaciones</TabsTrigger>
          <TabsTrigger value="data">Datos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          {chartsByCategory['time-series'].map(chart => (
            <Card key={chart.id}>
              <CardContent className="pt-6">
                {renderChart(chart)}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="analysis" className="space-y-6">
          {chartsByCategory['analysis'].map(chart => (
            <Card key={chart.id}>
              <CardContent className="pt-6">
                {renderChart(chart)}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="correlations" className="space-y-6">
          {chartsByCategory['correlation'].map(chart => (
            <Card key={chart.id}>
              <CardContent className="pt-6">
                {renderChart(chart)}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
        
        <TabsContent value="data" className="space-y-6">
          {chartsByCategory['data'].map(chart => (
            <Card key={chart.id}>
              <CardContent className="pt-6">
                {renderChart(chart)}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    );
  };

  // Grid layout
  const GridLayout = () => (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {config.enabledCharts.map(chartId => {
        const chart = chartConfigs.find(c => c.id === chartId);
        if (!chart) return null;
        
        return (
          <Card key={chart.id} className={expandedChart === chart.id ? 'xl:col-span-2' : ''}>
            <CardContent className="pt-6">
              {renderChart(chart)}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  // Single column layout
  const SingleColumnLayout = () => (
    <div className="space-y-6">
      {config.enabledCharts.map(chartId => {
        const chart = chartConfigs.find(c => c.id === chartId);
        if (!chart) return null;
        
        return (
          <Card key={chart.id}>
            <CardContent className="pt-6">
              {renderChart(chart)}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Dashboard header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Dashboard Avanzado del Sistema Cutzamala
          </h2>
          <p className="text-sm text-gray-500">
            Análisis completo con {data.length} registros • 
            Granularidad: {granularity} • 
            Embalses: {selectedReservoirs.length}
          </p>
        </div>

        {/* Layout controls */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Vista:</label>
            <select
              value={config.layout}
              onChange={(e) => setConfig(prev => ({ ...prev, layout: e.target.value as 'grid' | 'tabs' | 'single-column' }))}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            >
              <option value="tabs">Pestañas</option>
              <option value="grid">Cuadrícula</option>
              <option value="single-column">Columna única</option>
            </select>
          </div>

          {onExportData && (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onExportData('csv')}
                className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
              >
                <Download className="w-4 h-4" />
                <span>CSV</span>
              </button>
              <button
                onClick={() => onExportData('json')}
                className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                <Download className="w-4 h-4" />
                <span>JSON</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Render appropriate layout */}
      {config.layout === 'tabs' && <TabLayout />}
      {config.layout === 'grid' && <GridLayout />}
      {config.layout === 'single-column' && <SingleColumnLayout />}
    </div>
  );
}