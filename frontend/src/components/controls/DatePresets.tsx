'use client';

interface DatePresetsProps {
  onPresetSelect: (startDate: Date, endDate: Date) => void;
  className?: string;
}

const DATE_PRESETS = [
  {
    label: 'Últimos 7 días',
    getDates: () => {
      const end = new Date();
      const start = new Date();
      start.setDate(end.getDate() - 7);
      return { start, end };
    }
  },
  {
    label: 'Último mes',
    getDates: () => {
      const end = new Date();
      const start = new Date();
      start.setMonth(end.getMonth() - 1);
      return { start, end };
    }
  },
  {
    label: 'Últimos 3 meses',
    getDates: () => {
      const end = new Date();
      const start = new Date();
      start.setMonth(end.getMonth() - 3);
      return { start, end };
    }
  },
  {
    label: 'Últimos 6 meses',
    getDates: () => {
      const end = new Date();
      const start = new Date();
      start.setMonth(end.getMonth() - 6);
      return { start, end };
    }
  },
  {
    label: 'Último año',
    getDates: () => {
      const end = new Date();
      const start = new Date();
      start.setFullYear(end.getFullYear() - 1);
      return { start, end };
    }
  },
  {
    label: 'Año actual',
    getDates: () => {
      const end = new Date();
      const start = new Date(end.getFullYear(), 0, 1);
      return { start, end };
    }
  },
  {
    label: 'Año anterior',
    getDates: () => {
      const currentYear = new Date().getFullYear();
      const start = new Date(currentYear - 1, 0, 1);
      const end = new Date(currentYear - 1, 11, 31);
      return { start, end };
    }
  }
];

export function DatePresets({ onPresetSelect, className = '' }: DatePresetsProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-foreground">
        Períodos Predefinidos
      </label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {DATE_PRESETS.map((preset) => (
          <button
            key={preset.label}
            onClick={() => {
              const { start, end } = preset.getDates();
              onPresetSelect(start, end);
            }}
            className="px-3 py-2 text-sm rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground transition-colors"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
}