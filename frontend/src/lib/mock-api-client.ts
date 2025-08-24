import type {
  ApiResponse,
  CutzamalaResponse,
  CutzamalaQueryParams,
} from '@/types/api';
import { generateMockCutzamalaData, generateRecentReadings } from './mock-data';

/**
 * Mock API client that simulates the Cutzamala API with realistic delays and data
 * 
 * This client provides the same interface as the real API but generates
 * mock data with realistic patterns, seasonal variations, and proper pagination.
 */
export class MockCutzamalaApiService {
  private simulateNetworkDelay = true;
  private baseDelay = 300; // Base delay in milliseconds
  private maxDelay = 800; // Maximum delay in milliseconds
  private forceEmpty = false; // Force empty responses for testing
  
  constructor(options?: { simulateDelay?: boolean; baseDelay?: number }) {
    this.simulateNetworkDelay = options?.simulateDelay ?? true;
    this.baseDelay = options?.baseDelay ?? 300;
  }
  
  /**
   * Simulates network delay for realistic API behavior
   * @param additionalMs - Additional delay in milliseconds
   */
  private async delay(additionalMs: number = 0): Promise<void> {
    if (!this.simulateNetworkDelay) return;
    
    const randomDelay = this.baseDelay + Math.random() * (this.maxDelay - this.baseDelay);
    const totalDelay = randomDelay + additionalMs;
    
    return new Promise(resolve => setTimeout(resolve, totalDelay));
  }
  
  /**
   * Validates date parameters to simulate real API validation
   * @param params - Query parameters to validate
   * @throws Error if validation fails
   */
  private validateParams(params?: CutzamalaQueryParams): void {
    if (!params) return;
    
    // Validate date format and range
    if (params.start_date && params.end_date) {
      const startDate = new Date(params.start_date);
      const endDate = new Date(params.end_date);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        throw new Error('Invalid date format. Use YYYY-MM-DD format.');
      }
      
      if (startDate > endDate) {
        throw new Error('Start date must be before end date.');
      }
      
      // Check if date range is too large (more than 5 years)
      const maxRange = 5 * 365 * 24 * 60 * 60 * 1000; // 5 years in milliseconds
      if (endDate.getTime() - startDate.getTime() > maxRange) {
        throw new Error('Date range cannot exceed 5 years.');
      }
    }
    
    // Validate granularity
    if (params.granularity && !['daily', 'weekly', 'monthly', 'yearly'].includes(params.granularity)) {
      throw new Error('Invalid granularity. Must be one of: daily, weekly, monthly, yearly');
    }
    
    // Validate pagination parameters
    if (params.limit && (params.limit < 1 || params.limit > 1000)) {
      throw new Error('Limit must be between 1 and 1000.');
    }
    
    if (params.offset && params.offset < 0) {
      throw new Error('Offset must be non-negative.');
    }
  }
  
  /**
   * Simulates potential API errors for testing error handling
   * @param params - Query parameters
   * @returns True if an error should be simulated
   */
  private shouldSimulateError(params?: CutzamalaQueryParams): boolean {
    // 2% chance of random error for testing
    if (Math.random() < 0.02) return true;
    
    // Simulate specific error conditions
    if (params?.start_date === '2000-01-01') {
      throw new Error('Data not available before 2016-01-01');
    }
    
    return false;
  }
  
  /**
   * Fetch water storage data from the Cutzamala system (mock)
   * @param params - Query parameters for filtering data
   * @returns Promise resolving to water storage readings
   */
  async getCutzamalaReadings(
    params?: CutzamalaQueryParams
  ): Promise<ApiResponse<CutzamalaResponse>> {
    console.log('🔬 Mock API: Fetching Cutzamala readings with params:', params);
    
    try {
      // Validate parameters
      this.validateParams(params);
      
      // Check for simulated errors
      if (this.shouldSimulateError(params)) {
        throw new Error('Simulated network error for testing');
      }
      
      // Simulate network delay
      await this.delay();
      
      // Generate mock data
      const data = generateMockCutzamalaData(params, this.forceEmpty);
      
      console.log('🔬 Mock API: Generated', data.readings.length, 'readings');
      
      return {
        status: 'success',
        data,
      };
    } catch (error) {
      console.error('🔬 Mock API: Error generating data:', error);
      
      return {
        status: 'error',
        error: {
          code: 'MOCK_API_ERROR',
          message: error instanceof Error ? error.message : 'Unknown mock API error',
          details: {
            timestamp: new Date().toISOString(),
            params: JSON.stringify(params),
          },
        },
      };
    }
  }
  
  /**
   * Get readings for a specific date range (mock)
   * @param startDate - Start date in YYYY-MM-DD format
   * @param endDate - End date in YYYY-MM-DD format
   * @param granularity - Data granularity
   * @returns Promise resolving to filtered readings
   */
  async getReadingsByDateRange(
    startDate: string,
    endDate: string,
    granularity: 'daily' | 'weekly' | 'monthly' | 'yearly' = 'daily'
  ): Promise<ApiResponse<CutzamalaResponse>> {
    console.log('🔬 Mock API: Fetching readings by date range:', startDate, 'to', endDate);
    
    return this.getCutzamalaReadings({
      start_date: startDate,
      end_date: endDate,
      granularity,
    });
  }
  
  /**
   * Get readings for specific reservoirs (mock)
   * @param reservoirs - Array of reservoir names
   * @param params - Additional query parameters
   * @returns Promise resolving to reservoir-specific readings
   */
  async getReservoirReadings(
    reservoirs: string[],
    params?: Omit<CutzamalaQueryParams, 'reservoirs'>
  ): Promise<ApiResponse<CutzamalaResponse>> {
    console.log('🔬 Mock API: Fetching readings for reservoirs:', reservoirs);
    
    return this.getCutzamalaReadings({
      ...params,
      reservoirs: reservoirs.join(','),
    });
  }
  
  /**
   * Get recent readings (mock)
   * @param days - Number of days of recent data
   * @returns Promise resolving to recent readings
   */
  async getRecentReadings(
    days: number = 30
  ): Promise<ApiResponse<CutzamalaResponse>> {
    console.log('🔬 Mock API: Fetching recent', days, 'days of readings');
    
    try {
      // Simulate network delay
      await this.delay();
      
      // Generate recent data
      const data = this.forceEmpty 
        ? generateMockCutzamalaData({ granularity: 'daily' }, true)
        : generateRecentReadings(days);
      
      console.log('🔬 Mock API: Generated', data.readings.length, 'recent readings');
      
      return {
        status: 'success',
        data,
      };
    } catch (error) {
      console.error('🔬 Mock API: Error generating recent data:', error);
      
      return {
        status: 'error',
        error: {
          code: 'MOCK_API_ERROR',
          message: error instanceof Error ? error.message : 'Unknown mock API error',
        },
      };
    }
  }
  
  /**
   * Get aggregated data for charts (mock)
   * @param granularity - Data granularity
   * @param startDate - Optional start date
   * @param endDate - Optional end date
   * @returns Promise resolving to aggregated data
   */
  async getAggregatedData(
    granularity: 'weekly' | 'monthly' | 'yearly',
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<CutzamalaResponse>> {
    console.log('🔬 Mock API: Fetching aggregated data with granularity:', granularity);
    
    return this.getCutzamalaReadings({
      start_date: startDate,
      end_date: endDate,
      granularity,
    });
  }
  
  /**
   * Enable or disable network delay simulation
   * @param enabled - Whether to simulate delays
   * @param baseDelay - Base delay in milliseconds
   */
  setDelaySimulation(enabled: boolean, baseDelay?: number): void {
    this.simulateNetworkDelay = enabled;
    if (baseDelay !== undefined) {
      this.baseDelay = baseDelay;
    }
    console.log('🔬 Mock API: Delay simulation', enabled ? 'enabled' : 'disabled');
  }

  /**
   * Enable or disable empty data mode for testing
   * @param enabled - Whether to return empty data
   */
  setEmptyMode(enabled: boolean): void {
    this.forceEmpty = enabled;
    console.log('🔬 Mock API: Empty mode', enabled ? 'enabled' : 'disabled');
  }
}

// Export a singleton instance for easy use
export const mockCutzamalaApi = new MockCutzamalaApiService();