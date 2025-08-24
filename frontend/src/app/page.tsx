'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { StatusCardSkeleton, ChartSkeleton } from '@/components/ui/Skeleton';
import { StorageIndicator, WaterLevel } from '@/components/ui/StorageIndicator';
import { ErrorState } from '@/components/ui/ErrorState';
import { UnifiedChart } from '@/components/charts/UnifiedChart';
import { MultiRainfallChart } from '@/components/charts/MultiRainfallChart';
import { RainfallCorrelationChart } from '@/components/charts/RainfallCorrelationChart';
import { useDateRangeData } from '@/hooks/useCutzamalaData';
import { formatNumber, formatDate } from '@/lib/utils';
import { Droplets, TrendingUp, Cloud } from 'lucide-react';
import { Tabs } from '@/components/ui/Tabs';
import { ChartType } from '@/components/controls/ChartTypeSelector';

const DEFAULT_RESERVOIRS = ['valle_bravo', 'villa_victoria', 'el_bosque'];

const RESERVOIR_NAMES = {
  valle_bravo: 'Valle de Bravo',
  villa_victoria: 'Villa Victoria',
  el_bosque: 'El Bosque'
} as const;

export default function Home() {
  const [startDate] = useState<Date | null>(() => {
    const date = new Date();
    date.setDate(date.getDate() - 90); // Default: last 90 days
    return date;
  });
  const [endDate] = useState<Date | null>(new Date());
  const [selectedReservoirs] = useState<string[]>(DEFAULT_RESERVOIRS);
  const [showPercentage, setShowPercentage] = useState(true);
  const [granularity, setGranularity] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('daily');
  const [chartType] = useState<ChartType>('line');


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
        ) : null}
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

          {!loading && !error && filteredData.length > 0 && selectedReservoirs.length > 0 && (
            <UnifiedChart
              data={filteredData}
              showPercentage={showPercentage}
              reservoirs={selectedReservoirs as ('valle_bravo' | 'villa_victoria' | 'el_bosque')[]}
              chartType={chartType}
              height={500}
            />
          )}

          {!loading && !error && selectedReservoirs.length === 0 && (
            <div className="flex justify-center items-center h-96">
              <div className="text-center">
                <Droplets className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">No hay embalses seleccionados</p>
                <p className="text-sm text-muted-foreground">
                  Selecciona al menos un embalse para visualizar los datos
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>


      {/* Rainfall Analysis Section */}
      {!loading && !error && filteredData.length > 0 && selectedReservoirs.length > 0 && (
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
                <MultiRainfallChart
                  data={filteredData}
                  reservoirs={selectedReservoirs as ('valle_bravo' | 'villa_victoria' | 'el_bosque')[]}
                  height={400}
                />
              )}
            </CardContent>
          </Card>

          {/* Correlation Charts with Tabs */}
          {selectedReservoirs.length > 0 && (
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
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
