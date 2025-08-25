'use client';

import { useMemo, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatusCardSkeleton, ChartSkeleton } from '@/components/ui/Skeleton';
import { WaterLevel } from '@/components/ui/StorageIndicator';
import { ErrorState } from '@/components/ui/ErrorState';
import { UnifiedChart } from '@/components/charts/UnifiedChart';
import { EmptyChart } from '@/components/charts/EmptyChart';
import { AdvancedDashboardLayout } from '@/components/dashboard/AdvancedDashboardLayout';
import { DateRangePicker } from '@/components/controls/DateRangePicker';
import { ReservoirSelector } from '@/components/controls/ReservoirSelector';
import { useDateRangeData } from '@/hooks/useCutzamalaData';
import { useUrlState } from '@/hooks/useUrlState';
import { formatNumber, formatDate, calculatePercentageChange } from '@/lib/utils';
import { 
  TrendingUp, 
  TrendingDown, 
  RotateCcw, 
  Cloud, 
  AlertTriangle, 
  Calendar,
  Droplets,
  Activity,
  Info,
  Download
} from 'lucide-react';
import { ChartErrorBoundary } from '@/components/error-boundaries';
import type { CutzamalaReading } from '@cutzamala/shared';


// Helper function to calculate trends between current and previous readings
const calculateTrend = (current: number, previous: number): { value: number; direction: 'up' | 'down' | 'stable' } => {
  if (Math.abs(current - previous) < 0.1) return { value: 0, direction: 'stable' };
  const change = calculatePercentageChange(current, previous);
  return {
    value: Math.abs(change),
    direction: change > 0 ? 'up' : 'down'
  };
};

// Helper function to get alert level based on storage percentage
const getAlertLevel = (percentage: number): { level: 'critical' | 'warning' | 'normal'; message: string } => {
  if (percentage < 30) return { level: 'critical', message: 'Nivel crítico' };
  if (percentage < 50) return { level: 'warning', message: 'Nivel bajo' };
  return { level: 'normal', message: 'Nivel normal' };
};

function HomeContent() {
  const {
    state: { startDate, endDate, selectedReservoirs, visibleLines, showPercentage, showPrecipitation, granularity, chartType },
    setShowPercentage,
    setShowPrecipitation,
    setGranularity,
    setVisibleLines,
    updateState,
    resetState
  } = useUrlState();

  // Fetch data based on current filters
  const { data, loading, error, refresh } = useDateRangeData(
    startDate?.toISOString().split('T')[0] || '',
    endDate?.toISOString().split('T')[0] || '',
    granularity
  );

  // Filter data by selected reservoirs
  const filteredData = useMemo(() => {
    if (!data?.readings) return [];
    return data.readings;
  }, [data]);

  const latestReading = filteredData.length > 0 ? filteredData[filteredData.length - 1] : null;
  const previousReading = filteredData.length > 1 ? filteredData[filteredData.length - 2] : null;

  // Calculate trends
  const trends = useMemo(() => {
    if (!latestReading || !previousReading) return null;
    
    return {
      valle_bravo: calculateTrend(
        latestReading.reservoirs.valle_bravo.percentage,
        previousReading.reservoirs.valle_bravo.percentage
      ),
      villa_victoria: calculateTrend(
        latestReading.reservoirs.villa_victoria.percentage,
        previousReading.reservoirs.villa_victoria.percentage
      ),
      el_bosque: calculateTrend(
        latestReading.reservoirs.el_bosque.percentage,
        previousReading.reservoirs.el_bosque.percentage
      ),
      system_total: calculateTrend(
        latestReading.system_totals.total_percentage,
        previousReading.system_totals.total_percentage
      )
    };
  }, [latestReading, previousReading]);

  // Get alert levels
  const alerts = useMemo(() => {
    if (!latestReading) return null;
    
    return {
      valle_bravo: getAlertLevel(latestReading.reservoirs.valle_bravo.percentage),
      villa_victoria: getAlertLevel(latestReading.reservoirs.villa_victoria.percentage),
      el_bosque: getAlertLevel(latestReading.reservoirs.el_bosque.percentage),
      system_total: getAlertLevel(latestReading.system_totals.total_percentage)
    };
  }, [latestReading]);

  // Handle export functionality
  const handleExportData = (format: 'csv' | 'json') => {
    if (!data?.readings) return;
    
    if (format === 'csv') {
      const headers = [
        'Fecha',
        'Valle de Bravo (%)', 'Valle de Bravo (Mm³)', 'Valle de Bravo Lluvia (mm)',
        'Villa Victoria (%)', 'Villa Victoria (Mm³)', 'Villa Victoria Lluvia (mm)',
        'El Bosque (%)', 'El Bosque (Mm³)', 'El Bosque Lluvia (mm)',
        'Sistema Total (%)', 'Sistema Total (Mm³)',
      ];
      
      const csvContent = [
        headers.join(','),
        ...data.readings.map(reading => [
          reading.date,
          reading.reservoirs.valle_bravo.percentage,
          reading.reservoirs.valle_bravo.storage_mm3,
          reading.reservoirs.valle_bravo.rainfall,
          reading.reservoirs.villa_victoria.percentage,
          reading.reservoirs.villa_victoria.storage_mm3,
          reading.reservoirs.villa_victoria.rainfall,
          reading.reservoirs.el_bosque.percentage,
          reading.reservoirs.el_bosque.storage_mm3,
          reading.reservoirs.el_bosque.rainfall,
          reading.system_totals.total_percentage,
          reading.system_totals.total_mm3,
        ].join(','))
      ].join('\n');
      
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cutzamala-data-${granularity}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else if (format === 'json') {
      const jsonContent = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cutzamala-data-${granularity}-${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Enhanced Header with Key Information */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center space-x-3">
              <Droplets className="w-8 h-8 text-blue-600" />
              <span>Dashboard del Sistema Cutzamala</span>
            </h1>
            <p className="text-muted-foreground text-lg">
              Monitoreo en tiempo real del almacenamiento de agua en los embalses principales
            </p>
          </div>
          
          {/* Last Update & Export Actions */}
          <div className="text-right">
            {latestReading && (
              <div className="bg-blue-50 dark:bg-blue-950 px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2 text-blue-800 dark:text-blue-200">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">Última actualización</span>
                </div>
                <div className="text-lg font-bold text-blue-900 dark:text-blue-100">
                  {formatDate(latestReading.date)}
                </div>
              </div>
            )}
            
            {data?.readings && (
              <div className="mt-4 flex items-center space-x-2">
                <button
                  onClick={() => handleExportData('csv')}
                  className="flex items-center space-x-1 px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>CSV</span>
                </button>
                <button
                  onClick={() => handleExportData('json')}
                  className="flex items-center space-x-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                >
                  <Download className="w-4 h-4" />
                  <span>JSON</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Current Status Cards with Trends and Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {loading ? (
          <>
            <StatusCardSkeleton />
            <StatusCardSkeleton />
            <StatusCardSkeleton />
            <StatusCardSkeleton />
          </>
        ) : latestReading ? (
          <>
            {/* Valle de Bravo */}
            <Card className={`relative border-l-4 ${alerts?.valle_bravo.level === 'critical' ? 'border-l-red-500' : alerts?.valle_bravo.level === 'warning' ? 'border-l-yellow-500' : 'border-l-blue-500'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-blue-700 flex items-center space-x-2">
                    <span>Valle de Bravo</span>
                    {alerts?.valle_bravo.level !== 'normal' && (
                      <AlertTriangle className={`w-4 h-4 ${alerts?.valle_bravo.level === 'critical' ? 'text-red-500' : 'text-yellow-500'}`} />
                    )}
                  </CardTitle>
                  {trends?.valle_bravo && trends.valle_bravo.direction !== 'stable' && (
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                      trends.valle_bravo.direction === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {trends.valle_bravo.direction === 'up' ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <span>{formatNumber(trends.valle_bravo.value)}%</span>
                    </div>
                  )}
                </div>
                {alerts?.valle_bravo.level !== 'normal' && (
                  <p className={`text-xs font-medium ${alerts?.valle_bravo.level === 'critical' ? 'text-red-600' : 'text-yellow-600'}`}>
                    {alerts.valle_bravo.message}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-blue-600">
                      {formatNumber(latestReading.reservoirs.valle_bravo.percentage)}%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatNumber(latestReading.reservoirs.valle_bravo.storage_mm3)} Mm³
                    </p>
                    {latestReading.reservoirs.valle_bravo.rainfall > 0 && (
                      <p className="text-xs text-blue-600 flex items-center space-x-1 mt-1">
                        <Cloud className="w-3 h-3" />
                        <span>{formatNumber(latestReading.reservoirs.valle_bravo.rainfall)}mm</span>
                      </p>
                    )}
                  </div>
                  <WaterLevel percentage={latestReading.reservoirs.valle_bravo.percentage} />
                </div>
              </CardContent>
            </Card>

            {/* Villa Victoria */}
            <Card className={`relative border-l-4 ${alerts?.villa_victoria.level === 'critical' ? 'border-l-red-500' : alerts?.villa_victoria.level === 'warning' ? 'border-l-yellow-500' : 'border-l-red-500'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-red-700 flex items-center space-x-2">
                    <span>Villa Victoria</span>
                    {alerts?.villa_victoria.level !== 'normal' && (
                      <AlertTriangle className={`w-4 h-4 ${alerts?.villa_victoria.level === 'critical' ? 'text-red-500' : 'text-yellow-500'}`} />
                    )}
                  </CardTitle>
                  {trends?.villa_victoria && trends.villa_victoria.direction !== 'stable' && (
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                      trends.villa_victoria.direction === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {trends.villa_victoria.direction === 'up' ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <span>{formatNumber(trends.villa_victoria.value)}%</span>
                    </div>
                  )}
                </div>
                {alerts?.villa_victoria.level !== 'normal' && (
                  <p className={`text-xs font-medium ${alerts?.villa_victoria.level === 'critical' ? 'text-red-600' : 'text-yellow-600'}`}>
                    {alerts.villa_victoria.message}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-red-600">
                      {formatNumber(latestReading.reservoirs.villa_victoria.percentage)}%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatNumber(latestReading.reservoirs.villa_victoria.storage_mm3)} Mm³
                    </p>
                    {latestReading.reservoirs.villa_victoria.rainfall > 0 && (
                      <p className="text-xs text-blue-600 flex items-center space-x-1 mt-1">
                        <Cloud className="w-3 h-3" />
                        <span>{formatNumber(latestReading.reservoirs.villa_victoria.rainfall)}mm</span>
                      </p>
                    )}
                  </div>
                  <WaterLevel percentage={latestReading.reservoirs.villa_victoria.percentage} />
                </div>
              </CardContent>
            </Card>

            {/* El Bosque */}
            <Card className={`relative border-l-4 ${alerts?.el_bosque.level === 'critical' ? 'border-l-red-500' : alerts?.el_bosque.level === 'warning' ? 'border-l-yellow-500' : 'border-l-green-500'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-green-700 flex items-center space-x-2">
                    <span>El Bosque</span>
                    {alerts?.el_bosque.level !== 'normal' && (
                      <AlertTriangle className={`w-4 h-4 ${alerts?.el_bosque.level === 'critical' ? 'text-red-500' : 'text-yellow-500'}`} />
                    )}
                  </CardTitle>
                  {trends?.el_bosque && trends.el_bosque.direction !== 'stable' && (
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                      trends.el_bosque.direction === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {trends.el_bosque.direction === 'up' ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <span>{formatNumber(trends.el_bosque.value)}%</span>
                    </div>
                  )}
                </div>
                {alerts?.el_bosque.level !== 'normal' && (
                  <p className={`text-xs font-medium ${alerts?.el_bosque.level === 'critical' ? 'text-red-600' : 'text-yellow-600'}`}>
                    {alerts.el_bosque.message}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-green-600">
                      {formatNumber(latestReading.reservoirs.el_bosque.percentage)}%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatNumber(latestReading.reservoirs.el_bosque.storage_mm3)} Mm³
                    </p>
                    {latestReading.reservoirs.el_bosque.rainfall > 0 && (
                      <p className="text-xs text-blue-600 flex items-center space-x-1 mt-1">
                        <Cloud className="w-3 h-3" />
                        <span>{formatNumber(latestReading.reservoirs.el_bosque.rainfall)}mm</span>
                      </p>
                    )}
                  </div>
                  <WaterLevel percentage={latestReading.reservoirs.el_bosque.percentage} />
                </div>
              </CardContent>
            </Card>

            {/* Sistema Total */}
            <Card className={`relative border-l-4 ${alerts?.system_total.level === 'critical' ? 'border-l-red-500' : alerts?.system_total.level === 'warning' ? 'border-l-yellow-500' : 'border-l-purple-500'}`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-purple-700 flex items-center space-x-2">
                    <span>Sistema Total</span>
                    {alerts?.system_total.level !== 'normal' && (
                      <AlertTriangle className={`w-4 h-4 ${alerts?.system_total.level === 'critical' ? 'text-red-500' : 'text-yellow-500'}`} />
                    )}
                  </CardTitle>
                  {trends?.system_total && trends.system_total.direction !== 'stable' && (
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                      trends.system_total.direction === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {trends.system_total.direction === 'up' ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : (
                        <TrendingDown className="w-3 h-3" />
                      )}
                      <span>{formatNumber(trends.system_total.value)}%</span>
                    </div>
                  )}
                </div>
                {alerts?.system_total.level !== 'normal' && (
                  <p className={`text-xs font-medium ${alerts?.system_total.level === 'critical' ? 'text-red-600' : 'text-yellow-600'}`}>
                    {alerts.system_total.message}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-3xl font-bold text-purple-600">
                      {formatNumber(latestReading.system_totals.total_percentage)}%
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatNumber(latestReading.system_totals.total_mm3)} Mm³
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Capacidad total del sistema
                    </p>
                  </div>
                  <WaterLevel percentage={latestReading.system_totals.total_percentage} />
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          // Empty state cards - always show structure
          <>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">Valle de Bravo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-400">--</div>
                    <p className="text-xs text-muted-foreground">Sin datos</p>
                  </div>
                  <WaterLevel percentage={0} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-red-700">Villa Victoria</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-400">--</div>
                    <p className="text-xs text-muted-foreground">Sin datos</p>
                  </div>
                  <WaterLevel percentage={0} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-700">El Bosque</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-400">--</div>
                    <p className="text-xs text-muted-foreground">Sin datos</p>
                  </div>
                  <WaterLevel percentage={0} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-purple-700">Sistema Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-400">--</div>
                    <p className="text-xs text-muted-foreground">Sin datos</p>
                  </div>
                  <WaterLevel percentage={0} />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Advanced Dashboard Integration */}
      {error && (
        <ErrorState 
          error={error}
          onRetry={() => refresh()}
          title="Error cargando los datos del dashboard"
        />
      )}

      {!error && (
        <AdvancedDashboardLayout
          data={filteredData}
          selectedReservoirs={selectedReservoirs}
          showPercentage={showPercentage}
          showPrecipitation={showPrecipitation}
          granularity={granularity}
          loading={loading}
          onExportData={handleExportData}
        />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-96 mb-2"></div>
          <div className="h-4 bg-gray-100 rounded w-full max-w-2xl"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <StatusCardSkeleton />
          <StatusCardSkeleton />
          <StatusCardSkeleton />
          <StatusCardSkeleton />
        </div>
        <ChartSkeleton height={500} />
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
