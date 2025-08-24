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

    return this.client.get<CutzamalaResponse>('/cutzamala-readings', queryParams);
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