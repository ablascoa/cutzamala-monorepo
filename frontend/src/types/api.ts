// API Response Types
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: ApiError;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, string | number | boolean>;
}

// Reservoir Data Types
export interface ReservoirData {
  storage_mm3: number;
  percentage: number;
  rainfall: number;
}

export interface SystemTotals {
  total_mm3: number;
  total_percentage: number;
}

export interface CutzamalaReading {
  date: string;
  year: number;
  month: number;
  month_name: string;
  day: number;
  reservoirs: {
    valle_bravo: ReservoirData;
    villa_victoria: ReservoirData;
    el_bosque: ReservoirData;
  };
  system_totals: SystemTotals;
  source_pdf: string;
}

export interface CutzamalaResponse {
  readings: CutzamalaReading[];
  metadata: {
    total_records: number;
    filtered_records: number;
    granularity: Granularity;
    date_range: {
      start: string;
      end: string;
    };
    reservoirs_included: string[];
  };
  pagination: {
    limit: number;
    offset: number;
    has_next: boolean;
    has_previous: boolean;
  };
}

// Query Parameters
export type Granularity = 'daily' | 'weekly' | 'monthly' | 'yearly';
export type ReservoirType = 'valle_bravo' | 'villa_victoria' | 'el_bosque' | 'all';
export type ResponseFormat = 'json' | 'csv';

export interface CutzamalaQueryParams {
  start_date?: string;
  end_date?: string;
  granularity?: Granularity;
  reservoirs?: string;
  format?: ResponseFormat;
  order?: 'asc' | 'desc';
  limit?: number;
  offset?: number;
}

// Chart Data Types
export interface ApiChartDataPoint {
  date: string;
  [key: string]: number | string;
}

export interface ReservoirChartData {
  name: string;
  data: ApiChartDataPoint[];
  color: string;
}