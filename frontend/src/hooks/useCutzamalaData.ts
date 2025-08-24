'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { cutzamalaApi } from '@/services/cutzamala-api';
import { queryKeys } from '@/lib/react-query';
import type { CutzamalaQueryParams } from '@/types/api';

/**
 * Hook to fetch Cutzamala water storage data
 */
export function useCutzamalaData(params?: CutzamalaQueryParams) {
  const queryClient = useQueryClient();

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: params ? [...queryKeys.cutzamala.readings(), params] : queryKeys.cutzamala.readings(),
    queryFn: async () => {
      const response = await cutzamalaApi.getCutzamalaReadings(params);
      
      if (response.status === 'error') {
        throw new Error(response.error?.message || 'Failed to fetch data');
      }
      
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
  });

  const refresh = () => {
    refetch();
    // Also invalidate related queries
    queryClient.invalidateQueries({ queryKey: queryKeys.cutzamala.readings() });
  };

  return {
    data,
    error,
    loading: isLoading,
    refresh,
  };
}

/**
 * Hook to fetch recent readings
 */
export function useRecentReadings(days: number = 30) {
  const queryClient = useQueryClient();

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: [...queryKeys.cutzamala.readings(), 'recent', days],
    queryFn: async () => {
      const response = await cutzamalaApi.getRecentReadings(days);
      
      if (response.status === 'error') {
        throw new Error(response.error?.message || 'Failed to fetch recent data');
      }
      
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: 10 * 60 * 1000, // 10 minutes
  });

  const refresh = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: queryKeys.cutzamala.readings() });
  };

  return {
    data,
    error,
    loading: isLoading,
    refresh,
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
  const queryClient = useQueryClient();

  const { data, error, isLoading, refetch } = useQuery({
    queryKey: queryKeys.cutzamala.dateRange(startDate, endDate, granularity),
    queryFn: async () => {
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
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchInterval: 15 * 60 * 1000, // 15 minutes
    enabled: Boolean(startDate && endDate), // Only run query if we have both dates
  });

  const refresh = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: queryKeys.cutzamala.readings() });
  };

  return {
    data,
    error,
    loading: isLoading,
    refresh,
  };
}