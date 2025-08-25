'use client';

import { QueryClient, DefaultOptions } from '@tanstack/react-query';

// React Query default configuration
const queryConfig: DefaultOptions = {
  queries: {
    // Default stale time: 5 minutes
    staleTime: 5 * 60 * 1000,
    // Default cache time: 10 minutes
    gcTime: 10 * 60 * 1000,
    // Retry failed requests 3 times
    retry: 3,
    // Don't refetch on window focus by default (can be overridden per query)
    refetchOnWindowFocus: false,
    // Refetch on mount if data is potentially stale
    refetchOnMount: 'always',
    // Refetch on reconnect
    refetchOnReconnect: true,
  },
  mutations: {
    // Retry failed mutations once
    retry: 1,
  },
};

// Create a single query client instance
export const queryClient = new QueryClient({
  defaultOptions: queryConfig,
});

// Make queryClient available globally for debugging in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  (window as unknown as Record<string, unknown>).queryClient = queryClient;
}

// React Query keys for consistent cache management
export const queryKeys = {
  cutzamala: {
    all: ['cutzamala'] as const,
    readings: () => [...queryKeys.cutzamala.all, 'readings'] as const,
    dateRange: (startDate: string, endDate: string, granularity: string) => 
      [...queryKeys.cutzamala.readings(), 'dateRange', startDate, endDate, granularity] as const,
    latest: () => [...queryKeys.cutzamala.readings(), 'latest'] as const,
    health: () => [...queryKeys.cutzamala.all, 'health'] as const,
  },
} as const;