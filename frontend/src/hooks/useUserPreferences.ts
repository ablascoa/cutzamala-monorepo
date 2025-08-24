'use client';

import { useEffect } from 'react';
import useLocalStorage from './useLocalStorage';
import { useUrlState, type DashboardState } from './useUrlState';

export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  defaultGranularity: DashboardState['granularity'];
  defaultChartType: DashboardState['chartType'];
  defaultShowPercentage: boolean;
  defaultDateRange: number; // days
  favoriteReservoirs: string[];
  autoRefresh: boolean;
  refreshInterval: number; // minutes
}

const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'system',
  defaultGranularity: 'daily',
  defaultChartType: 'line',
  defaultShowPercentage: true,
  defaultDateRange: 90, // 90 days
  favoriteReservoirs: ['valle_bravo', 'villa_victoria', 'el_bosque'],
  autoRefresh: false,
  refreshInterval: 5, // 5 minutes
};

export function useUserPreferences() {
  const [preferences, setPreferences] = useLocalStorage<UserPreferences>(
    'cutzamala-dashboard-preferences',
    DEFAULT_PREFERENCES
  );

  const { updateState } = useUrlState();

  // Apply default preferences when component mounts (if URL doesn't have values)
  useEffect(() => {
    // Only run once on mount
    const searchParams = new URLSearchParams(window.location.search);
    const hasUrlState = searchParams.has('startDate') || 
                       searchParams.has('endDate') || 
                       searchParams.has('granularity') || 
                       searchParams.has('showPercentage') ||
                       searchParams.has('chartType') ||
                       searchParams.has('reservoirs');

    // Only apply preferences if URL doesn't have state (first visit)
    if (!hasUrlState) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - preferences.defaultDateRange);
      
      updateState({
        startDate,
        endDate: new Date(),
        granularity: preferences.defaultGranularity,
        chartType: preferences.defaultChartType,
        showPercentage: preferences.defaultShowPercentage,
        selectedReservoirs: preferences.favoriteReservoirs,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Helper functions to update specific preferences
  const updatePreference = <K extends keyof UserPreferences>(
    key: K,
    value: UserPreferences[K]
  ) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const setTheme = (theme: UserPreferences['theme']) => {
    updatePreference('theme', theme);
    
    // Apply theme to document
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      
      if (theme === 'dark') {
        root.classList.add('dark');
      } else if (theme === 'light') {
        root.classList.remove('dark');
      } else {
        // System preference
        const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (systemDark) {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      }
    }
  };

  const setDefaultGranularity = (granularity: UserPreferences['defaultGranularity']) => {
    updatePreference('defaultGranularity', granularity);
  };

  const setDefaultChartType = (chartType: UserPreferences['defaultChartType']) => {
    updatePreference('defaultChartType', chartType);
  };

  const setDefaultShowPercentage = (showPercentage: boolean) => {
    updatePreference('defaultShowPercentage', showPercentage);
  };

  const setDefaultDateRange = (days: number) => {
    updatePreference('defaultDateRange', days);
  };

  const setFavoriteReservoirs = (reservoirs: string[]) => {
    updatePreference('favoriteReservoirs', reservoirs);
  };

  const setAutoRefresh = (autoRefresh: boolean) => {
    updatePreference('autoRefresh', autoRefresh);
  };

  const setRefreshInterval = (minutes: number) => {
    updatePreference('refreshInterval', minutes);
  };

  const resetPreferences = () => {
    setPreferences(DEFAULT_PREFERENCES);
  };

  return {
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
    updatePreference,
  };
}