'use client';

import { useState } from 'react';
import { X, Settings, Sun, Moon, Monitor, RotateCcw } from 'lucide-react';
import { useUserPreferences } from '@/hooks/useUserPreferences';
import { Button } from './Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './Card';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const {
    preferences,
    setTheme,
    setDefaultGranularity,
    setDefaultChartType,
    setDefaultShowPercentage,
    setDefaultDateRange,
    setFavoriteReservoirs,
    setAutoRefresh,
    setRefreshInterval,
    resetPreferences,
  } = useUserPreferences();

  const [localPreferences, setLocalPreferences] = useState(preferences);

  const handleSave = () => {
    setTheme(localPreferences.theme);
    setDefaultGranularity(localPreferences.defaultGranularity);
    setDefaultChartType(localPreferences.defaultChartType);
    setDefaultShowPercentage(localPreferences.defaultShowPercentage);
    setDefaultDateRange(localPreferences.defaultDateRange);
    setFavoriteReservoirs(localPreferences.favoriteReservoirs);
    setAutoRefresh(localPreferences.autoRefresh);
    setRefreshInterval(localPreferences.refreshInterval);
    onClose();
  };

  const handleReset = () => {
    resetPreferences();
    setLocalPreferences(preferences);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5" />
              <CardTitle>Configuración</CardTitle>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <CardDescription>
            Personaliza tu experiencia con el Dashboard del Sistema Cutzamala
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Theme Settings */}
          <div>
            <h3 className="text-lg font-medium mb-3">Tema</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'light', label: 'Claro', icon: Sun },
                { value: 'dark', label: 'Oscuro', icon: Moon },
                { value: 'system', label: 'Sistema', icon: Monitor },
              ].map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setLocalPreferences(prev => ({ ...prev, theme: value as 'light' | 'dark' | 'system' }))}
                  className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-colors ${
                    localPreferences.theme === value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Default Chart Settings */}
          <div>
            <h3 className="text-lg font-medium mb-3">Configuración de Gráficos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Default Chart Type */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Tipo de gráfico por defecto
                </label>
                <select
                  value={localPreferences.defaultChartType}
                  onChange={(e) => setLocalPreferences(prev => ({
                    ...prev,
                    defaultChartType: e.target.value as 'line' | 'area' | 'bar'
                  }))}
                  className="w-full p-2 border border-border rounded-md bg-background"
                >
                  <option value="line">Líneas</option>
                  <option value="area">Área</option>
                  <option value="bar">Barras</option>
                </select>
              </div>

              {/* Default Granularity */}
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                  Período por defecto
                </label>
                <select
                  value={localPreferences.defaultGranularity}
                  onChange={(e) => setLocalPreferences(prev => ({
                    ...prev,
                    defaultGranularity: e.target.value as 'daily' | 'weekly' | 'monthly' | 'yearly'
                  }))}
                  className="w-full p-2 border border-border rounded-md bg-background"
                >
                  <option value="daily">Diario</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensual</option>
                  <option value="yearly">Anual</option>
                </select>
              </div>
            </div>

            {/* Show Percentage by Default */}
            <div className="mt-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={localPreferences.defaultShowPercentage}
                  onChange={(e) => setLocalPreferences(prev => ({
                    ...prev,
                    defaultShowPercentage: e.target.checked
                  }))}
                  className="rounded border-border"
                />
                <span className="text-sm">Mostrar porcentaje por defecto</span>
              </label>
            </div>
          </div>

          {/* Default Date Range */}
          <div>
            <h3 className="text-lg font-medium mb-3">Rango de fechas por defecto</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[30, 60, 90, 180, 365].map(days => (
                <button
                  key={days}
                  onClick={() => setLocalPreferences(prev => ({ ...prev, defaultDateRange: days }))}
                  className={`p-2 rounded-md text-sm transition-colors ${
                    localPreferences.defaultDateRange === days
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  {days} días
                </button>
              ))}
            </div>
          </div>

          {/* Auto Refresh Settings */}
          <div>
            <h3 className="text-lg font-medium mb-3">Actualización automática</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={localPreferences.autoRefresh}
                  onChange={(e) => setLocalPreferences(prev => ({
                    ...prev,
                    autoRefresh: e.target.checked
                  }))}
                  className="rounded border-border"
                />
                <span className="text-sm">Activar actualización automática</span>
              </label>

              {localPreferences.autoRefresh && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">
                    Intervalo de actualización (minutos)
                  </label>
                  <select
                    value={localPreferences.refreshInterval}
                    onChange={(e) => setLocalPreferences(prev => ({
                      ...prev,
                      refreshInterval: parseInt(e.target.value)
                    }))}
                    className="w-full max-w-xs p-2 border border-border rounded-md bg-background"
                  >
                    <option value={1}>1 minuto</option>
                    <option value={2}>2 minutos</option>
                    <option value={5}>5 minutos</option>
                    <option value={10}>10 minutos</option>
                    <option value={15}>15 minutos</option>
                    <option value={30}>30 minutos</option>
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button
              variant="outlined"
              onClick={handleReset}
              className="flex items-center space-x-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restablecer</span>
            </Button>

            <div className="flex items-center space-x-2">
              <Button variant="outlined" onClick={onClose}>
                Cancelar
              </Button>
              <Button onClick={handleSave}>
                Guardar cambios
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}