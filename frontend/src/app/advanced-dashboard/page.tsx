'use client';

import { Suspense } from 'react';
import { AdvancedDashboardLayout } from '@/components/dashboard/AdvancedDashboardLayout';
import { ChartSkeleton, StatusCardSkeleton } from '@/components/ui/Skeleton';
import { ErrorState } from '@/components/ui/ErrorState';
import { useDateRangeData } from '@/hooks/useCutzamalaData';
import { useUrlState } from '@/hooks/useUrlState';

function AdvancedDashboardContent() {
  const {
    state: { startDate, endDate, selectedReservoirs, showPercentage, showPrecipitation, granularity },
  } = useUrlState();

  // Fetch data based on current filters
  const { data, loading, error, refresh } = useDateRangeData(
    startDate?.toISOString().split('T')[0] || '',
    endDate?.toISOString().split('T')[0] || '',
    granularity
  );

  const handleExportData = (format: 'csv' | 'json') => {
    if (!data?.readings) return;
    
    if (format === 'csv') {
      // Convert to CSV format
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
      // Export as JSON
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

  if (error) {
    return (
      <ErrorState 
        error={error}
        onRetry={() => refresh()}
        title="Error cargando el dashboard avanzado"
      />
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <AdvancedDashboardLayout
        data={data?.readings || []}
        selectedReservoirs={selectedReservoirs}
        showPercentage={showPercentage}
        showPrecipitation={showPrecipitation}
        granularity={granularity}
        loading={loading}
        onExportData={handleExportData}
      />
    </div>
  );
}

export default function AdvancedDashboardPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="h-8 bg-gray-200 rounded w-96 mb-2"></div>
          <div className="h-4 bg-gray-100 rounded w-full max-w-2xl"></div>
        </div>
        <div className="space-y-6">
          <ChartSkeleton height={500} />
          <ChartSkeleton height={450} />
          <ChartSkeleton height={500} />
        </div>
      </div>
    }>
      <AdvancedDashboardContent />
    </Suspense>
  );
}