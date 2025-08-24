'use client';

import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { formatNumber } from '@/lib/utils';

interface GaugeChartProps {
  value: number;
  title: string;
  subtitle?: string;
  color?: string;
  height?: number;
  showValue?: boolean;
}

export function GaugeChart({ 
  value, 
  title, 
  subtitle,
  color = '#3b82f6',
  height = 200,
  showValue = true
}: GaugeChartProps) {
  // Clamp value between 0 and 100
  const clampedValue = Math.max(0, Math.min(100, value));
  
  const data = [
    { name: 'filled', value: clampedValue },
    { name: 'empty', value: 100 - clampedValue }
  ];

  const getColor = (value: number) => {
    if (value < 25) return '#ef4444'; // red
    if (value < 50) return '#f59e0b'; // amber
    if (value < 75) return '#10b981'; // green
    return '#3b82f6'; // blue
  };

  const fillColor = color === '#3b82f6' ? getColor(clampedValue) : color;

  return (
    <div className="flex flex-col items-center" style={{ height }}>
      <div className="relative">
        <ResponsiveContainer width={160} height={100}>
          <PieChart>
            <Pie
              data={data}
              cx={80}
              cy={80}
              startAngle={180}
              endAngle={0}
              innerRadius={50}
              outerRadius={70}
              dataKey="value"
            >
              <Cell fill={fillColor} />
              <Cell fill="#e5e7eb" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
        {showValue && (
          <div className="absolute inset-0 flex items-center justify-center mt-4">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: fillColor }}>
                {formatNumber(clampedValue)}%
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="text-center mt-2">
        <div className="font-semibold text-sm">{title}</div>
        {subtitle && (
          <div className="text-xs text-muted-foreground">{subtitle}</div>
        )}
      </div>
    </div>
  );
}

interface MultiGaugeChartProps {
  data: Array<{
    title: string;
    value: number;
    subtitle?: string;
    color?: string;
  }>;
  height?: number;
}

export function MultiGaugeChart({ data, height = 200 }: MultiGaugeChartProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {data.map((gauge, index) => (
        <GaugeChart
          key={index}
          value={gauge.value}
          title={gauge.title}
          subtitle={gauge.subtitle}
          color={gauge.color}
          height={height}
        />
      ))}
    </div>
  );
}