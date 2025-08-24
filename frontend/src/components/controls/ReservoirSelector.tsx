'use client';

import { Eye, EyeOff } from 'lucide-react';

interface ReservoirSelectorProps {
  selectedReservoirs: string[];
  onReservoirToggle: (reservoirs: string[]) => void;
  className?: string;
}

const RESERVOIR_CONFIG = {
  valle_bravo: {
    name: 'Valle de Bravo',
    color: '#2563eb', // blue
  },
  villa_victoria: {
    name: 'Villa Victoria',
    color: '#dc2626', // red
  },
  el_bosque: {
    name: 'El Bosque',
    color: '#16a34a', // green
  },
};

const SYSTEM_TOTAL = {
  name: 'Sistema Total',
  color: '#6b7280', // gray
};

export function ReservoirSelector({ selectedReservoirs, onReservoirToggle, className = '' }: ReservoirSelectorProps) {
  const toggleReservoir = (reservoir: string) => {
    const newSelection = selectedReservoirs.includes(reservoir)
      ? selectedReservoirs.filter(r => r !== reservoir)
      : [...selectedReservoirs, reservoir];
    
    onReservoirToggle(newSelection);
  };

  const toggleSystemTotal = () => {
    const newSelection = selectedReservoirs.includes('system_total')
      ? selectedReservoirs.filter(r => r !== 'system_total')
      : [...selectedReservoirs, 'system_total'];
    
    onReservoirToggle(newSelection);
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-sm font-medium text-gray-700">Líneas:</span>
      <div className="flex flex-wrap items-center gap-2">
        {/* Individual Reservoirs */}
        {Object.entries(RESERVOIR_CONFIG).map(([key, config]) => {
          const isSelected = selectedReservoirs.includes(key);
          return (
            <button
              key={key}
              onClick={() => toggleReservoir(key)}
              className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 border ${
                isSelected
                  ? 'border-gray-300 text-gray-800 bg-white shadow-sm'
                  : 'border-gray-200 text-gray-400 bg-gray-50'
              }`}
              title={`${isSelected ? 'Ocultar' : 'Mostrar'} ${config.name}`}
            >
              {isSelected ? (
                <Eye className="w-3 h-3" />
              ) : (
                <EyeOff className="w-3 h-3" />
              )}
              <div 
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: isSelected ? config.color : '#d1d5db' }}
              />
              <span>{config.name}</span>
            </button>
          );
        })}
        
        {/* System Total */}
        <button
          onClick={toggleSystemTotal}
          className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 border ${
            selectedReservoirs.includes('system_total')
              ? 'border-gray-300 text-gray-800 bg-white shadow-sm'
              : 'border-gray-200 text-gray-400 bg-gray-50'
          }`}
          title={`${selectedReservoirs.includes('system_total') ? 'Ocultar' : 'Mostrar'} Sistema Total`}
        >
          {selectedReservoirs.includes('system_total') ? (
            <Eye className="w-3 h-3" />
          ) : (
            <EyeOff className="w-3 h-3" />
          )}
          <div 
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: selectedReservoirs.includes('system_total') ? SYSTEM_TOTAL.color : '#d1d5db' }}
          />
          <span>{SYSTEM_TOTAL.name}</span>
        </button>
      </div>
    </div>
  );
}