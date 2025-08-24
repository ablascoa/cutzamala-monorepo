'use client';

import { Droplets, BarChart3, TrendingUp } from 'lucide-react';

interface EmptyChartProps {
  height?: number;
  title?: string;
  message?: string;
  icon?: 'droplets' | 'chart' | 'trending';
}

export function EmptyChart({ 
  height = 400, 
  title = "Sin datos disponibles",
  message = "No hay datos para mostrar en el período seleccionado",
  icon = 'droplets'
}: EmptyChartProps) {
  const IconComponent = {
    droplets: Droplets,
    chart: BarChart3,
    trending: TrendingUp
  }[icon];

  return (
    <div 
      className="flex flex-col items-center justify-center text-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300"
      style={{ height }}
    >
      <IconComponent className="w-12 h-12 text-gray-400 mb-4" />
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 max-w-md">{message}</p>
    </div>
  );
}