'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useEarliestDate } from './useDateRange';

export type Granularity = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type ChartType = 'line' | 'area' | 'bar';

export interface DashboardState {
  startDate: Date | null;
  endDate: Date | null;
  selectedReservoirs: ('valle_bravo' | 'villa_victoria' | 'el_bosque')[];
  visibleLines: string[];
  showPercentage: boolean;
  showPrecipitation: boolean;
  granularity: Granularity;
  chartType: ChartType;
}

// Default fallback dates (used if API is unavailable)
const FALLBACK_START_DATE = (() => {
  const date = new Date();
  date.setDate(date.getDate() - 90);
  return date;
})();

const FALLBACK_END_DATE = new Date();

export function useUrlState() {
  const router = useRouter();
  const pathname = usePathname();
  const { earliestDate, latestDate } = useEarliestDate();
  
  // Create dynamic default state based on API data
  const getDefaultState = useCallback((): DashboardState => ({
    startDate: earliestDate || FALLBACK_START_DATE,
    endDate: latestDate || FALLBACK_END_DATE,
    selectedReservoirs: ['valle_bravo', 'villa_victoria', 'el_bosque'],
    visibleLines: ['valle_bravo', 'villa_victoria', 'el_bosque', 'system_total'],
    showPercentage: true,
    showPrecipitation: false,
    granularity: 'daily',
    chartType: 'line',
  }), [earliestDate, latestDate]);

  const [state, setState] = useState<DashboardState>(() => ({
    startDate: FALLBACK_START_DATE,
    endDate: FALLBACK_END_DATE,
    selectedReservoirs: ['valle_bravo', 'villa_victoria', 'el_bosque'],
    visibleLines: ['valle_bravo', 'villa_victoria', 'el_bosque', 'system_total'],
    showPercentage: true,
    showPrecipitation: false,
    granularity: 'daily',
    chartType: 'line',
  }));
  const [isClient, setIsClient] = useState(false);

  // Update default state when API data becomes available
  useEffect(() => {
    if (!isClient && (earliestDate || latestDate)) {
      setState(getDefaultState());
    }
  }, [earliestDate, latestDate, isClient, getDefaultState]);

  // Initialize from URL on client-side mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const searchParams = new URLSearchParams(window.location.search);
    
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const reservoirsParam = searchParams.get('reservoirs');
    const visibleLinesParam = searchParams.get('visibleLines');
    const showPercentageParam = searchParams.get('showPercentage');
    const showPrecipitationParam = searchParams.get('showPrecipitation');
    const granularityParam = searchParams.get('granularity');
    const chartTypeParam = searchParams.get('chartType');

    const defaultState = getDefaultState();

    const urlState = {
      startDate: startDateParam ? new Date(startDateParam) : defaultState.startDate,
      endDate: endDateParam ? new Date(endDateParam) : defaultState.endDate,
      selectedReservoirs: reservoirsParam 
        ? reservoirsParam.split(',').filter(Boolean) as ('valle_bravo' | 'villa_victoria' | 'el_bosque')[]
        : defaultState.selectedReservoirs,
      visibleLines: visibleLinesParam 
        ? visibleLinesParam.split(',').filter(Boolean)
        : defaultState.visibleLines,
      showPercentage: showPercentageParam !== null 
        ? showPercentageParam === 'true' 
        : defaultState.showPercentage,
      showPrecipitation: showPrecipitationParam !== null 
        ? showPrecipitationParam === 'true' 
        : defaultState.showPrecipitation,
      granularity: (granularityParam as Granularity) || defaultState.granularity,
      chartType: (chartTypeParam as ChartType) || defaultState.chartType,
    };

    setState(urlState);
    setIsClient(true);
  }, [getDefaultState]);

  // Update URL with new state
  const updateState = useCallback(
    (updates: Partial<DashboardState>) => {
      if (!isClient) return;
      
      const newState = { ...state, ...updates };
      setState(newState);
      
      const params = new URLSearchParams();
      const defaultState = getDefaultState();

      // Only add non-default values to URL
      if (newState.startDate && newState.startDate.getTime() !== defaultState.startDate?.getTime()) {
        params.set('startDate', newState.startDate.toISOString().split('T')[0]);
      }

      if (newState.endDate && newState.endDate.getTime() !== defaultState.endDate?.getTime()) {
        params.set('endDate', newState.endDate.toISOString().split('T')[0]);
      }

      if (JSON.stringify(newState.selectedReservoirs.sort()) !== JSON.stringify(defaultState.selectedReservoirs.sort())) {
        params.set('reservoirs', newState.selectedReservoirs.join(','));
      }

      if (JSON.stringify(newState.visibleLines.sort()) !== JSON.stringify(defaultState.visibleLines.sort())) {
        params.set('visibleLines', newState.visibleLines.join(','));
      }

      if (newState.showPercentage !== defaultState.showPercentage) {
        params.set('showPercentage', String(newState.showPercentage));
      }

      if (newState.showPrecipitation !== defaultState.showPrecipitation) {
        params.set('showPrecipitation', String(newState.showPrecipitation));
      }

      if (newState.granularity !== defaultState.granularity) {
        params.set('granularity', newState.granularity);
      }

      if (newState.chartType !== defaultState.chartType) {
        params.set('chartType', newState.chartType);
      }

      const url = params.toString() ? `${pathname}?${params.toString()}` : pathname;
      router.replace(url, { scroll: false });
    },
    [router, pathname, state, isClient, getDefaultState]
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

  const setVisibleLines = useCallback(
    (visibleLines: string[]) => updateState({ visibleLines }),
    [updateState]
  );

  const setShowPercentage = useCallback(
    (showPercentage: boolean) => updateState({ showPercentage }),
    [updateState]
  );

  const setShowPrecipitation = useCallback(
    (showPrecipitation: boolean) => updateState({ showPrecipitation }),
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
    setVisibleLines,
    setShowPercentage,
    setShowPrecipitation,
    setGranularity,
    setChartType,
    resetState,
  };
}