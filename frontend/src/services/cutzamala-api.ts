import { ApiClient } from '@/lib/api-client';
import { API_BASE_URL } from '@/lib/constants';
import { env } from '@/lib/env';
import { mockCutzamalaApi } from '@/lib/mock-api-client';
import type {
  ApiResponse,
  CutzamalaResponse,
  CutzamalaQueryParams,
} from '@/types/api';

export class CutzamalaApiService {
  private client: ApiClient;

  constructor() {
    this.client = new ApiClient(API_BASE_URL);
    
    if (env.useMockData && env.enableDebugMode) {
      console.log('🔬 CutzamalaApiService: Using mock data mode');
    }
  }

  /**
   * Fetch water storage data from the Cutzamala system
   * @param params - Query parameters for filtering data
   * @returns Promise resolving to water storage readings
   * @throws {Error} When date parameters are invalid
   */
  async getCutzamalaReadings(
    params?: CutzamalaQueryParams
  ): Promise<ApiResponse<CutzamalaResponse>> {
    // Use mock data if flag is set
    if (env.useMockData) {
      return mockCutzamalaApi.getCutzamalaReadings(params);
    }

    // Validate date parameters
    if (params?.start_date && params?.end_date) {
      const startDate = new Date(params.start_date);
      const endDate = new Date(params.end_date);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Invalid date format. Use YYYY-MM-DD format.');
      }
      
      if (startDate > endDate) {
        throw new Error('Start date must be before end date.');
      }
    }
    const queryParams: Record<string, string | number | boolean> = {};

    if (params?.start_date) queryParams.start_date = params.start_date;
    if (params?.end_date) queryParams.end_date = params.end_date;
    if (params?.granularity) queryParams.granularity = params.granularity;
    if (params?.reservoirs) queryParams.reservoirs = params.reservoirs;
    if (params?.format) queryParams.format = params.format;
    if (params?.limit) queryParams.limit = params.limit;
    if (params?.offset) queryParams.offset = params.offset;

    try {
      const response = await this.client.get<CutzamalaResponse>('/cutzamala-readings', queryParams);
      
      // If the response is successful, return it
      if (response.status === 'success') {
        return response;
      }
      
      // If the response has an error, only fall back to mock data if mock data is enabled
      if (env.isDevelopment && env.useMockData) {
        console.warn('🔄 API request failed, falling back to mock data:', response.error);
        return mockCutzamalaApi.getCutzamalaReadings(params);
      } else if (env.isDevelopment) {
        console.warn('❌ API request failed. Mock data is disabled, showing error state:', response.error);
      }
      
      return response;
    } catch (error) {
      // Only fallback to mock data on network errors if mock data is enabled
      if (env.isDevelopment && env.useMockData) {
        console.warn('🔄 Network error occurred, falling back to mock data:', error);
        return mockCutzamalaApi.getCutzamalaReadings(params);
      } else if (env.isDevelopment) {
        console.warn('❌ Network error occurred. Mock data is disabled, showing error state:', error);
      }
      
      // In production or when mock data is disabled, re-throw the error
      throw error;
    }
  }

  /**
   * Get readings for a specific date range
   */
  async getReadingsByDateRange(
    startDate: string,
    endDate: string,
    granularity: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'daily'
  ): Promise<ApiResponse<CutzamalaResponse>> {
    if (env.useMockData) {
      return mockCutzamalaApi.getReadingsByDateRange(startDate, endDate, granularity);
    }
    
    return this.getCutzamalaReadings({
      start_date: startDate,
      end_date: endDate,
      granularity,
    });
  }

  /**
   * Get readings for specific reservoirs
   */
  async getReservoirReadings(
    reservoirs: string[],
    params?: Omit<CutzamalaQueryParams, 'reservoirs'>
  ): Promise<ApiResponse<CutzamalaResponse>> {
    if (env.useMockData) {
      return mockCutzamalaApi.getReservoirReadings(reservoirs, params);
    }
    
    return this.getCutzamalaReadings({
      ...params,
      reservoirs: reservoirs.join(','),
    });
  }

  /**
   * Get recent readings (last 30 days by default)
   */
  async getRecentReadings(
    days: number = 30
  ): Promise<ApiResponse<CutzamalaResponse>> {
    if (env.useMockData) {
      return mockCutzamalaApi.getRecentReadings(days);
    }
    
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return this.getCutzamalaReadings({
      start_date: startDate.toISOString().split('T')[0],
      end_date: endDate.toISOString().split('T')[0],
      granularity: 'daily',
    });
  }

  /**
   * Get aggregated data for charts
   */
  async getAggregatedData(
    granularity: 'weekly' | 'monthly' | 'yearly',
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<CutzamalaResponse>> {
    if (env.useMockData) {
      return mockCutzamalaApi.getAggregatedData(granularity, startDate, endDate);
    }
    
    return this.getCutzamalaReadings({
      start_date: startDate,
      end_date: endDate,
      granularity,
    });
  }
}

// Export a singleton instance
export const cutzamalaApi = new CutzamalaApiService();

// Global testing methods for development
if (typeof window !== 'undefined' && env.enableDebugMode) {
  // @ts-ignore - Global testing utilities
  window.testEmptyStates = {
    enable: () => {
      if (env.useMockData) {
        mockCutzamalaApi.setEmptyMode(true);
        console.log('🧪 Empty states enabled. Refresh the page to see empty cards and charts.');
      } else {
        console.log('⚠️ Empty states testing only works with mock data. Set NEXT_PUBLIC_USE_MOCK_DATA=true');
      }
    },
    disable: () => {
      if (env.useMockData) {
        mockCutzamalaApi.setEmptyMode(false);
        console.log('🧪 Empty states disabled. Refresh the page to see normal data.');
      }
    }
  };

  // @ts-ignore - Global cache utilities
  window.clearApiCache = () => {
    // Clear React Query cache
    if (typeof window !== 'undefined' && (window as any).queryClient) {
      (window as any).queryClient.clear();
      console.log('✅ React Query cache cleared');
    }
    
    // Force page reload to ensure clean state
    window.location.reload();
  };

  // @ts-ignore - Global debug utilities
  window.debugApiConfig = () => {
    console.log('🔧 API Configuration:');
    console.log('  - Mock data enabled:', env.useMockData);
    console.log('  - API base URL:', API_BASE_URL);
    console.log('  - Debug mode:', env.enableDebugMode);
    console.log('  - Development mode:', env.isDevelopment);
    console.log('  - Fallback behavior: ', env.useMockData ? 'Will use mock data on errors' : 'Will show error states on failures');
  };

  // @ts-ignore - Global testing utilities
  window.testApiFailure = () => {
    console.log('🧪 Testing API failure behavior...');
    console.log('Current config:');
    console.log('  - Mock data enabled:', env.useMockData);
    console.log('Expected behavior:', env.useMockData ? 'Should fallback to mock data' : 'Should show error/empty state');
    console.log('To test: Stop backend server or change API URL to trigger failure');
  };
}