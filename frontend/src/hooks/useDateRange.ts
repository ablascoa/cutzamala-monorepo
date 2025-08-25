'use client';

import { useQuery } from '@tanstack/react-query';
import { cutzamalaApi } from '@/services/cutzamala-api';
import { queryKeys } from '@/lib/react-query';

/**
 * Hook to get the available date range from the API
 * This fetches the first and last available dates in the dataset
 */
export function useDateRange() {
  const { data, error, isLoading } = useQuery({
    queryKey: ['dateRange'],
    queryFn: async () => {
      // Get a large dataset to find the actual date range
      // This is more reliable than using offset
      const allDataResponse = await cutzamalaApi.getCutzamalaReadings({
        granularity: 'daily',
        start_date: '2010-01-01', // Very early date to ensure we get all data
        end_date: '2030-12-31', // Future date to ensure we get all data
        limit: 10000, // Large limit to get all records
      });

      if (allDataResponse.status === 'error' || !allDataResponse.data?.readings?.length) {
        throw new Error('Failed to fetch date range');
      }

      const readings = allDataResponse.data.readings;
      
      // Find the actual earliest and latest dates from the data
      const dates = readings.map(reading => reading.date).sort();
      const startDate = dates[0]; // Earliest date
      const endDate = dates[dates.length - 1]; // Latest date

      return {
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        startDateString: startDate,
        endDateString: endDate,
      };
    },
    staleTime: 60 * 60 * 1000, // 1 hour - date range doesn't change frequently
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
    retry: 3,
  });

  return {
    dateRange: data,
    error,
    loading: isLoading,
  };
}

/**
 * Hook to get the earliest available date for default date picker
 */
export function useEarliestDate() {
  const { dateRange, error, loading } = useDateRange();
  
  return {
    earliestDate: dateRange?.startDate || null,
    earliestDateString: dateRange?.startDateString || null,
    latestDate: dateRange?.endDate || null,
    latestDateString: dateRange?.endDateString || null,
    error,
    loading,
  };
}