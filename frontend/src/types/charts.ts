// Chart Component Types
export interface ChartDataPoint {
  [key: string]: string | number | Date;
}

export interface ChartProps {
  data: ChartDataPoint[];
  height?: number;
  loading?: boolean;
  error?: string;
  className?: string;
}

export interface TimeSeriesChartProps extends ChartProps {
  showTooltip?: boolean;
  showLegend?: boolean;
  dataKeys: string[];
  colors?: string[];
}

export interface GaugeChartProps {
  value: number;
  max: number;
  label: string;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export interface BarChartProps extends ChartProps {
  xAxisKey: string;
  yAxisKeys: string[];
  colors?: string[];
}

// Dashboard Types
export interface KPICardProps {
  title: string;
  value: string | number;
  unit?: string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ComponentType<{ className?: string; size?: number }>;
  loading?: boolean;
}

export interface FilterState {
  dateRange: {
    start: Date;
    end: Date;
  };
  granularity: Granularity;
  reservoirs: ReservoirType[];
}

export interface DashboardState {
  filters: FilterState;
  loading: boolean;
  error: string | null;
}

// Import Granularity and ReservoirType from api.ts
import type { Granularity, ReservoirType } from './api';