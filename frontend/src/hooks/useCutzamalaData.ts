'use client';

import useSWR from 'swr';
import { cutzamalaApi } from '@/services/cutzamala-api';
import type { CutzamalaQueryParams } from '@/types/api';

/**
 * Hook to fetch Cutzamala water storage data
 */
export function useCutzamalaData(params?: CutzamalaQueryParams) {
  const key = params ? ['cutzamala-readings', params] : ['cutzamala-readings'];

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      const response = await cutzamalaApi.getCutzamalaReadings(params);
      
      if (response.status === 'error') {
        throw new Error(response.error?.message || 'Failed to fetch data');
      }
      
      return response.data;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 5 * 60 * 1000, // 5 minutes
      dedupingInterval: 2 * 60 * 1000, // 2 minutes
    }
  );

  return {
    data,
    error,
    loading: isLoading,
    refresh: mutate,
  };
}

/**
 * Hook to fetch recent readings
 */
export function useRecentReadings(days: number = 30) {
  const { data, error, isLoading, mutate } = useSWR(
    ['recent-readings', days],
    async () => {
      const response = await cutzamalaApi.getRecentReadings(days);
      
      if (response.status === 'error') {
        throw new Error(response.error?.message || 'Failed to fetch recent data');
      }
      
      return response.data;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 10 * 60 * 1000, // 10 minutes
    }
  );

  return {
    data,
    error,
    loading: isLoading,
    refresh: mutate,
  };
}

/**
 * Hook to fetch data by date range
 */
export function useDateRangeData(
  startDate: string,
  endDate: string,
  granularity: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'daily'
) {
  const { data, error, isLoading, mutate } = useSWR(
    ['date-range-readings', startDate, endDate, granularity],
    async () => {
      const response = await cutzamalaApi.getReadingsByDateRange(
        startDate,
        endDate,
        granularity
      );
      
      if (response.status === 'error') {
        throw new Error(response.error?.message || 'Failed to fetch date range data');
      }
      
      return response.data;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      refreshInterval: 15 * 60 * 1000, // 15 minutes
    }
  );

  return {
    data,
    error,
    loading: isLoading,
    refresh: mutate,
  };
}