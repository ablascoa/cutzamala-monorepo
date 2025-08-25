'use client';

import { QueryClient, DefaultOptions } from '@tanstack/react-query';

// React Query default configuration
const queryConfig: DefaultOptions = {
  queries: {
    // Force immediate staleness for development
    staleTime: 0,
    // Short cache time
    gcTime: 10 * 1000,
    // Retry failed requests 3 times
    retry: 3,
    // Refetch on window focus in development to pick up changes
    refetchOnWindowFocus: true,
    // Always refetch on mount
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

// Version for cache invalidation - increment when API behavior changes
const API_VERSION = 'v3';

// React Query keys for consistent cache management
export const queryKeys = {
  cutzamala: {
    all: ['cutzamala', API_VERSION] as const,
    readings: () => [...queryKeys.cutzamala.all, 'readings'] as const,
    dateRange: (startDate: string, endDate: string, granularity: string) => 
      [...queryKeys.cutzamala.readings(), 'dateRange', startDate, endDate, granularity] as const,
    latest: () => [...queryKeys.cutzamala.readings(), 'latest'] as const,
    health: () => [...queryKeys.cutzamala.all, 'health'] as const,
  },
} as const;