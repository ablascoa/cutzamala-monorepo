'use client';

import { useMemo, Suspense } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatusCardSkeleton, ChartSkeleton } from '@/components/ui/Skeleton';
import { WaterLevel } from '@/components/ui/StorageIndicator';
import { ErrorState } from '@/components/ui/ErrorState';
import { UnifiedChart } from '@/components/charts/UnifiedChart';
import { MultiRainfallChart } from '@/components/charts/MultiRainfallChart';
import { RainfallCorrelationChart } from '@/components/charts/RainfallCorrelationChart';
import { EmptyChart } from '@/components/charts/EmptyChart';
import { useDateRangeData } from '@/hooks/useCutzamalaData';
import { useUrlState } from '@/hooks/useUrlState';
import { formatNumber, formatDate } from '@/lib/utils';
import { TrendingUp, Cloud, RotateCcw } from 'lucide-react';
import { Tabs } from '@/components/ui/Tabs';
import { ChartErrorBoundary } from '@/components/error-boundaries';

const RESERVOIR_NAMES = {
  valle_bravo: 'Valle de Bravo',
  villa_victoria: 'Villa Victoria',
  el_bosque: 'El Bosque'
} as const;

function HomeContent() {
  const {
    state: { startDate, endDate, selectedReservoirs, showPercentage, granularity, chartType },
    setShowPercentage,
    setGranularity,
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

  const latestReading = filteredData[filteredData.length - 1];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Compact Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Dashboard del Sistema Cutzamala
        </h1>
        <p className="text-muted-foreground">
          Visualización interactiva de los datos de almacenamiento de agua de Valle de Bravo, Villa Victoria y El Bosque
        </p>
      </div>

      {/* Current Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {loading ? (
          <>
            <StatusCardSkeleton />
            <StatusCardSkeleton />
            <StatusCardSkeleton />
            <StatusCardSkeleton />
          </>
        ) : latestReading ? (
          <>
            <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-blue-700">Valle de Bravo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatNumber(latestReading.reservoirs.valle_bravo.percentage)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(latestReading.reservoirs.valle_bravo.storage_mm3)} Mm³
                  </p>
                </div>
                <WaterLevel percentage={latestReading.reservoirs.valle_bravo.percentage} />
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
                  <div className="text-2xl font-bold text-red-600">
                    {formatNumber(latestReading.reservoirs.villa_victoria.percentage)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(latestReading.reservoirs.villa_victoria.storage_mm3)} Mm³
                  </p>
                </div>
                <WaterLevel percentage={latestReading.reservoirs.villa_victoria.percentage} />
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
                  <div className="text-2xl font-bold text-green-600">
                    {formatNumber(latestReading.reservoirs.el_bosque.percentage)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(latestReading.reservoirs.el_bosque.storage_mm3)} Mm³
                  </p>
                </div>
                <WaterLevel percentage={latestReading.reservoirs.el_bosque.percentage} />
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
                  <div className="text-2xl font-bold text-purple-600">
                    {formatNumber(latestReading.system_totals.total_percentage)}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(latestReading.system_totals.total_mm3)} Mm³
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

      {/* Main Chart */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>
                Evolución Temporal - {showPercentage ? 'Porcentaje' : 'Almacenamiento'}
              </span>
            </div>
            <div className="flex items-center space-x-6">
              {latestReading && (
                <span className="text-sm text-muted-foreground">
                  Última actualización: {formatDate(latestReading.date)}
                </span>
              )}
              {data?.metadata && (
                <>
                  <span className="text-sm text-muted-foreground">
                    {data.metadata.total_records} registros
                  </span>
                  <span className="text-sm text-muted-foreground capitalize">
                    Período: {granularity}
                  </span>
                </>
              )}
            </div>
          </CardTitle>
          <CardDescription>
            {selectedReservoirs.length === 0 
              ? 'Selecciona al menos un embalse para ver los datos'
              : `Mostrando datos de ${selectedReservoirs.length} embalse${selectedReservoirs.length > 1 ? 's' : ''} seleccionado${selectedReservoirs.length > 1 ? 's' : ''}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Chart Controls */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="flex flex-wrap items-center gap-6">
              {/* Data Type Toggle */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Mostrar:</span>
                <button
                  onClick={() => setShowPercentage(!showPercentage)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors flex items-center space-x-1 ${
                    showPercentage 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>{showPercentage ? 'Porcentaje' : 'Almacenamiento'}</span>
                </button>
              </div>

              {/* Granularity Selector */}
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Período:</span>
                <div className="flex rounded-lg border border-gray-200 overflow-hidden">
                  {[
                    { value: 'daily' as const, label: 'Diario' },
                    { value: 'weekly' as const, label: 'Semanal' },
                    { value: 'monthly' as const, label: 'Mensual' },
                    { value: 'yearly' as const, label: 'Anual' },
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setGranularity(option.value)}
                      className={`px-3 py-1 text-sm transition-colors ${
                        granularity === option.value
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reset Button */}
              <button
                onClick={resetState}
                className="flex items-center space-x-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-md transition-colors"
                title="Restablecer filtros"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Restablecer</span>
              </button>
            </div>
          </div>

          {loading && <ChartSkeleton height={500} />}

          {error && (
            <ErrorState 
              error={error}
              onRetry={() => refresh()}
              title="Error cargando el gráfico"
            />
          )}

          {!loading && !error && (
            <ChartErrorBoundary height={500} onRetry={() => refresh()}>
              {filteredData.length > 0 && selectedReservoirs.length > 0 ? (
                <UnifiedChart
                  data={filteredData}
                  showPercentage={showPercentage}
                  reservoirs={selectedReservoirs as ('valle_bravo' | 'villa_victoria' | 'el_bosque')[]}
                  chartType={chartType}
                  height={500}
                />
              ) : selectedReservoirs.length === 0 ? (
                <EmptyChart 
                  height={500}
                  title="No hay embalses seleccionados"
                  message="Selecciona al menos un embalse para visualizar los datos"
                  icon="droplets"
                />
              ) : (
                <EmptyChart 
                  height={500}
                  title="Sin datos disponibles"
                  message="No hay datos para mostrar en el período seleccionado"
                  icon="trending"
                />
              )}
            </ChartErrorBoundary>
          )}
        </CardContent>
      </Card>


      {/* Rainfall Analysis Section */}
      {!loading && !error && (
        <div className="space-y-6">
          {/* Multi-Reservoir Rainfall Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Cloud className="w-5 h-5" />
                <span>Análisis de Precipitación</span>
              </CardTitle>
              <CardDescription>
                Comparación de niveles de lluvia entre embalses seleccionados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <ChartSkeleton height={400} />
              ) : (
                <ChartErrorBoundary height={400} onRetry={() => refresh()}>
                  {filteredData.length > 0 && selectedReservoirs.length > 0 ? (
                    <MultiRainfallChart
                      data={filteredData}
                      reservoirs={selectedReservoirs as ('valle_bravo' | 'villa_victoria' | 'el_bosque')[]}
                      height={400}
                    />
                  ) : selectedReservoirs.length === 0 ? (
                    <EmptyChart 
                      height={400}
                      title="No hay embalses seleccionados"
                      message="Selecciona al menos un embalse para visualizar la precipitación"
                      icon="droplets"
                    />
                  ) : (
                    <EmptyChart 
                      height={400}
                      title="Sin datos de precipitación"
                      message="No hay datos de precipitación para mostrar en el período seleccionado"
                      icon="droplets"
                    />
                  )}
                </ChartErrorBoundary>
              )}
            </CardContent>
          </Card>

          {/* Correlation Charts with Tabs */}
          <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Correlación Almacenamiento-Lluvia</span>
                </CardTitle>
                <CardDescription>
                  Análisis de correlación individual por embalse
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <ChartSkeleton height={400} />
                ) : (
                  <ChartErrorBoundary height={400} onRetry={() => refresh()}>
                    {filteredData.length > 0 && selectedReservoirs.length > 0 ? (
                      <Tabs
                        tabs={[
                          {
                            id: 'system_total',
                            label: 'Sistema Total',
                            content: (
                              <RainfallCorrelationChart
                                data={filteredData}
                                reservoir="system_total"
                                height={400}
                              />
                            )
                          },
                          ...selectedReservoirs.map(reservoir => ({
                            id: reservoir,
                            label: RESERVOIR_NAMES[reservoir as keyof typeof RESERVOIR_NAMES],
                            content: (
                              <RainfallCorrelationChart
                                data={filteredData}
                                reservoir={reservoir as 'valle_bravo' | 'villa_victoria' | 'el_bosque'}
                                height={400}
                              />
                            )
                          }))
                        ]}
                        defaultTab="system_total"
                      />
                    ) : selectedReservoirs.length === 0 ? (
                      <EmptyChart 
                        height={400}
                        title="No hay embalses seleccionados"
                        message="Selecciona al menos un embalse para visualizar la correlación"
                        icon="chart"
                      />
                    ) : (
                      <EmptyChart 
                        height={400}
                        title="Sin datos de correlación"
                        message="No hay datos suficientes para mostrar la correlación en el período seleccionado"
                        icon="chart"
                      />
                    )}
                  </ChartErrorBoundary>
                )}
              </CardContent>
            </Card>
        </div>
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
