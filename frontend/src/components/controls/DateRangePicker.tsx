'use client';

import { useState } from 'react';
import DatePicker from 'react-datepicker';
import { Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import 'react-datepicker/dist/react-datepicker.css';

interface DateRangePickerProps {
  startDate: Date | null;
  endDate: Date | null;
  onDateChange: (start: Date | null, end: Date | null) => void;
  className?: string;
}

const PRESET_RANGES = [
  { label: 'Últimos 7 días', days: 7 },
  { label: 'Últimos 30 días', days: 30 },
  { label: 'Últimos 90 días', days: 90 },
  { label: 'Último año', days: 365 },
];

export function DateRangePicker({
  startDate,
  endDate,
  onDateChange,
  className = '',
}: DateRangePickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePresetClick = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    onDateChange(start, end);
    setIsOpen(false);
  };

  const handleClear = () => {
    onDateChange(null, null);
  };

  return (
    <div className={`relative ${className}`}>
      <Button
        variant="outlined"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 min-w-[200px]"
      >
        <Calendar className="w-4 h-4" />
        <span>
          {startDate && endDate
            ? `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
            : 'Seleccionar fechas'}
        </span>
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <Card className="absolute top-full left-0 mt-2 p-4 z-20 bg-white shadow-lg min-w-[400px]">
            <div className="space-y-4">
              <div className="flex space-x-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha inicio
                  </label>
                  <DatePicker
                    selected={startDate}
                    onChange={(date) => onDateChange(date, endDate)}
                    selectsStart
                    startDate={startDate}
                    endDate={endDate}
                    maxDate={new Date()}
                    dateFormat="dd/MM/yyyy"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholderText="Seleccionar fecha"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha fin
                  </label>
                  <DatePicker
                    selected={endDate}
                    onChange={(date) => onDateChange(startDate, date)}
                    selectsEnd
                    startDate={startDate}
                    endDate={endDate}
                    minDate={startDate || undefined}
                    maxDate={new Date()}
                    dateFormat="dd/MM/yyyy"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholderText="Seleccionar fecha"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Rangos predefinidos
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {PRESET_RANGES.map((preset) => (
                    <Button
                      key={preset.days}
                      variant="outlined"
                      size="sm"
                      onClick={() => handlePresetClick(preset.days)}
                      className="text-xs"
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <Button
                  variant="outlined"
                  size="sm"
                  onClick={handleClear}
                >
                  Limpiar
                </Button>
                <Button
                  size="sm"
                  onClick={() => setIsOpen(false)}
                >
                  Aplicar
                </Button>
              </div>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}