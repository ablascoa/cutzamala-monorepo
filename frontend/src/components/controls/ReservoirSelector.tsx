'use client';

import { CheckSquare, Square, Droplets } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface ReservoirSelectorProps {
  selectedReservoirs: string[];
  onSelectionChange: (reservoirs: string[]) => void;
  className?: string;
}

const RESERVOIRS = [
  { id: 'valle_bravo', name: 'Valle de Bravo', color: 'bg-blue-500' },
  { id: 'villa_victoria', name: 'Villa Victoria', color: 'bg-red-500' },
  { id: 'el_bosque', name: 'El Bosque', color: 'bg-green-500' },
];

export function ReservoirSelector({
  selectedReservoirs,
  onSelectionChange,
  className = '',
}: ReservoirSelectorProps) {
  const handleReservoirToggle = (reservoirId: string) => {
    const newSelection = selectedReservoirs.includes(reservoirId)
      ? selectedReservoirs.filter(id => id !== reservoirId)
      : [...selectedReservoirs, reservoirId];
    
    onSelectionChange(newSelection);
  };

  const handleSelectAll = () => {
    if (selectedReservoirs.length === RESERVOIRS.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(RESERVOIRS.map(r => r.id));
    }
  };

  const allSelected = selectedReservoirs.length === RESERVOIRS.length;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Droplets className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">Embalses</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleSelectAll}
          className="text-xs"
        >
          {allSelected ? 'Deseleccionar todo' : 'Seleccionar todo'}
        </Button>
      </div>

      <div className="space-y-2">
        {RESERVOIRS.map((reservoir) => {
          const isSelected = selectedReservoirs.includes(reservoir.id);
          
          return (
            <div
              key={reservoir.id}
              className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                isSelected ? 'bg-gray-50 ring-1 ring-gray-200' : ''
              }`}
              onClick={() => handleReservoirToggle(reservoir.id)}
            >
              {isSelected ? (
                <CheckSquare className="w-5 h-5 text-blue-600" />
              ) : (
                <Square className="w-5 h-5 text-gray-400" />
              )}
              
              <div className={`w-3 h-3 rounded-full ${reservoir.color}`} />
              
              <span className={`text-sm ${
                isSelected ? 'text-gray-900 font-medium' : 'text-gray-600'
              }`}>
                {reservoir.name}
              </span>
            </div>
          );
        })}
      </div>

      <div className="text-xs text-gray-500">
        {selectedReservoirs.length} de {RESERVOIRS.length} seleccionados
      </div>
    </div>
  );
}