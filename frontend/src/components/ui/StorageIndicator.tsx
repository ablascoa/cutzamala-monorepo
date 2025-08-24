'use client';

import { cn } from '@/lib/utils';

interface StorageIndicatorProps {
  percentage: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

/**
 * Visual storage indicator with color-coded progress bar
 */
export function StorageIndicator({ 
  percentage, 
  size = 'md', 
  showLabel = false,
  className 
}: StorageIndicatorProps) {
  // Determine color based on storage level
  const getColor = (percent: number) => {
    if (percent >= 80) return 'bg-green-500'; // High storage - green
    if (percent >= 60) return 'bg-blue-500';  // Good storage - blue
    if (percent >= 40) return 'bg-yellow-500'; // Medium storage - yellow
    if (percent >= 20) return 'bg-orange-500'; // Low storage - orange
    return 'bg-red-500'; // Critical storage - red
  };

  const getBgColor = (percent: number) => {
    if (percent >= 80) return 'bg-green-100'; 
    if (percent >= 60) return 'bg-blue-100';  
    if (percent >= 40) return 'bg-yellow-100'; 
    if (percent >= 20) return 'bg-orange-100'; 
    return 'bg-red-100'; 
  };

  const sizes = {
    sm: { height: 'h-1', text: 'text-xs' },
    md: { height: 'h-2', text: 'text-sm' },
    lg: { height: 'h-3', text: 'text-base' }
  };

  const currentSize = sizes[size];
  const fillColor = getColor(percentage);
  const bgColor = getBgColor(percentage);

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className={cn('flex justify-between mb-1', currentSize.text)}>
          <span className="font-medium">Almacenamiento</span>
          <span className="font-medium">{percentage.toFixed(1)}%</span>
        </div>
      )}
      
      <div className={cn(
        'w-full rounded-full overflow-hidden',
        currentSize.height,
        bgColor
      )}>
        <div
          className={cn(
            'transition-all duration-500 ease-out rounded-full',
            currentSize.height,
            fillColor
          )}
          style={{
            width: `${Math.min(Math.max(percentage, 0), 100)}%`
          }}
        />
      </div>
    </div>
  );
}

/**
 * Circular storage gauge indicator
 */
export function StorageGauge({ 
  percentage, 
  size = 'md',
  className 
}: StorageIndicatorProps) {
  const getColor = (percent: number) => {
    if (percent >= 80) return 'stroke-green-500';
    if (percent >= 60) return 'stroke-blue-500';  
    if (percent >= 40) return 'stroke-yellow-500';
    if (percent >= 20) return 'stroke-orange-500';
    return 'stroke-red-500';
  };

  const sizes = {
    sm: { size: 40, stroke: 3, text: 'text-xs' },
    md: { size: 50, stroke: 4, text: 'text-sm' },
    lg: { size: 60, stroke: 5, text: 'text-base' }
  };

  const currentSize = sizes[size];
  const radius = (currentSize.size - currentSize.stroke) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  const strokeColor = getColor(percentage);

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="relative">
        <svg
          width={currentSize.size}
          height={currentSize.size}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={currentSize.size / 2}
            cy={currentSize.size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={currentSize.stroke}
            fill="none"
            className="text-muted opacity-20"
          />
          {/* Progress circle */}
          <circle
            cx={currentSize.size / 2}
            cy={currentSize.size / 2}
            r={radius}
            stroke="currentColor"
            strokeWidth={currentSize.stroke}
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={cn('transition-all duration-500 ease-out', strokeColor)}
          />
        </svg>
        
        {/* Percentage text in center */}
        <div className={cn(
          'absolute inset-0 flex items-center justify-center font-bold',
          currentSize.text,
          strokeColor.replace('stroke-', 'text-')
        )}>
          {percentage.toFixed(0)}%
        </div>
      </div>
    </div>
  );
}

/**
 * Water level visualization (like a tank)
 */
export function WaterLevel({ 
  percentage, 
  className 
}: { 
  percentage: number; 
  className?: string; 
}) {
  const getColor = (percent: number) => {
    if (percent >= 80) return { water: 'bg-green-400', bg: 'bg-green-50 border-green-200' };
    if (percent >= 60) return { water: 'bg-blue-400', bg: 'bg-blue-50 border-blue-200' };  
    if (percent >= 40) return { water: 'bg-yellow-400', bg: 'bg-yellow-50 border-yellow-200' };
    if (percent >= 20) return { water: 'bg-orange-400', bg: 'bg-orange-50 border-orange-200' };
    return { water: 'bg-red-400', bg: 'bg-red-50 border-red-200' };
  };

  const colors = getColor(percentage);

  return (
    <div className={cn('flex items-end justify-center', className)}>
      <div className={cn(
        'relative w-8 h-12 rounded-b-lg border-2 overflow-hidden',
        colors.bg
      )}>
        {/* Water level */}
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 transition-all duration-500 ease-out rounded-b-md',
            colors.water
          )}
          style={{
            height: `${Math.min(Math.max(percentage, 0), 100)}%`
          }}
        />
        
        {/* Water level lines */}
        <div className="absolute inset-x-0 top-0 h-full">
          {[25, 50, 75].map((level) => (
            <div
              key={level}
              className="absolute left-0 right-0 border-t border-muted-foreground/20"
              style={{ top: `${100 - level}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}