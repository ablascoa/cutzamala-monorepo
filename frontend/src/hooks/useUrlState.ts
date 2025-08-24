'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

export type Granularity = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type ChartType = 'line' | 'area' | 'bar';

export interface DashboardState {
  startDate: Date | null;
  endDate: Date | null;
  selectedReservoirs: string[];
  showPercentage: boolean;
  granularity: Granularity;
  chartType: ChartType;
}

const DEFAULT_STATE: DashboardState = {
  startDate: (() => {
    const date = new Date();
    date.setDate(date.getDate() - 90);
    return date;
  })(),
  endDate: new Date(),
  selectedReservoirs: ['valle_bravo', 'villa_victoria', 'el_bosque'],
  showPercentage: true,
  granularity: 'daily',
  chartType: 'line',
};

export function useUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState<DashboardState>(DEFAULT_STATE);
  const [isClient, setIsClient] = useState(false);

  // Initialize from URL on client-side mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const searchParams = new URLSearchParams(window.location.search);
    
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const reservoirsParam = searchParams.get('reservoirs');
    const showPercentageParam = searchParams.get('showPercentage');
    const granularityParam = searchParams.get('granularity');
    const chartTypeParam = searchParams.get('chartType');

    const urlState = {
      startDate: startDateParam ? new Date(startDateParam) : DEFAULT_STATE.startDate,
      endDate: endDateParam ? new Date(endDateParam) : DEFAULT_STATE.endDate,
      selectedReservoirs: reservoirsParam 
        ? reservoirsParam.split(',').filter(Boolean)
        : DEFAULT_STATE.selectedReservoirs,
      showPercentage: showPercentageParam !== null 
        ? showPercentageParam === 'true' 
        : DEFAULT_STATE.showPercentage,
      granularity: (granularityParam as Granularity) || DEFAULT_STATE.granularity,
      chartType: (chartTypeParam as ChartType) || DEFAULT_STATE.chartType,
    };

    setState(urlState);
    setIsClient(true);
  }, []);

  // Update URL with new state
  const updateState = useCallback(
    (updates: Partial<DashboardState>) => {
      if (!isClient) return;
      
      const newState = { ...state, ...updates };
      setState(newState);
      
      const params = new URLSearchParams();

      // Only add non-default values to URL
      if (newState.startDate && newState.startDate.getTime() !== DEFAULT_STATE.startDate?.getTime()) {
        params.set('startDate', newState.startDate.toISOString().split('T')[0]);
      }

      if (newState.endDate && newState.endDate.getTime() !== DEFAULT_STATE.endDate?.getTime()) {
        params.set('endDate', newState.endDate.toISOString().split('T')[0]);
      }

      if (JSON.stringify(newState.selectedReservoirs.sort()) !== JSON.stringify(DEFAULT_STATE.selectedReservoirs.sort())) {
        params.set('reservoirs', newState.selectedReservoirs.join(','));
      }

      if (newState.showPercentage !== DEFAULT_STATE.showPercentage) {
        params.set('showPercentage', String(newState.showPercentage));
      }

      if (newState.granularity !== DEFAULT_STATE.granularity) {
        params.set('granularity', newState.granularity);
      }

      if (newState.chartType !== DEFAULT_STATE.chartType) {
        params.set('chartType', newState.chartType);
      }

      const url = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(url, { scroll: false });
    },
    [router, pathname, state, isClient]
  );

  // Individual setters for convenience
  const setStartDate = useCallback(
    (startDate: Date | null) => updateState({ startDate }),
    [updateState]
  );

  const setEndDate = useCallback(
    (endDate: Date | null) => updateState({ endDate }),
    [updateState]
  );

  const setSelectedReservoirs = useCallback(
    (selectedReservoirs: string[]) => updateState({ selectedReservoirs }),
    [updateState]
  );

  const setShowPercentage = useCallback(
    (showPercentage: boolean) => updateState({ showPercentage }),
    [updateState]
  );

  const setGranularity = useCallback(
    (granularity: Granularity) => updateState({ granularity }),
    [updateState]
  );

  const setChartType = useCallback(
    (chartType: ChartType) => updateState({ chartType }),
    [updateState]
  );

  // Reset to defaults
  const resetState = useCallback(() => {
    if (!isClient) return;
    setState(DEFAULT_STATE);
    router.replace(pathname, { scroll: false });
  }, [router, pathname, isClient]);

  return {
    state,
    updateState,
    setStartDate,
    setEndDate,
    setSelectedReservoirs,
    setShowPercentage,
    setGranularity,
    setChartType,
    resetState,
  };
}