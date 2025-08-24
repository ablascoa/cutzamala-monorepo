import { env } from './env';

export const API_BASE_URL = env.apiBaseUrl;

export const RESERVOIRS = {
  VALLE_BRAVO: "valle_bravo",
  VILLA_VICTORIA: "villa_victoria",
  EL_BOSQUE: "el_bosque",
} as const;

export const RESERVOIR_NAMES = {
  [RESERVOIRS.VALLE_BRAVO]: "Valle de Bravo",
  [RESERVOIRS.VILLA_VICTORIA]: "Villa Victoria",
  [RESERVOIRS.EL_BOSQUE]: "El Bosque",
} as const;

export const RESERVOIR_COLORS = {
  [RESERVOIRS.VALLE_BRAVO]: "#2563eb", // blue
  [RESERVOIRS.VILLA_VICTORIA]: "#dc2626", // red
  [RESERVOIRS.EL_BOSQUE]: "#16a34a", // green
  system_total: "#8b5cf6", // purple
} as const;

export const GRANULARITY_OPTIONS = [
  { value: "daily", label: "Diario" },
  { value: "weekly", label: "Semanal" },
  { value: "monthly", label: "Mensual" },
  { value: "yearly", label: "Anual" },
] as const;

export const DATE_PRESETS = [
  { label: "Últimos 30 días", days: 30 },
  { label: "Últimos 3 meses", days: 90 },
  { label: "Últimos 6 meses", days: 180 },
  { label: "Último año", days: 365 },
  { label: "Últimos 2 años", days: 730 },
] as const;

export const CHART_COLORS = [
  "#2563eb", "#dc2626", "#16a34a", "#ca8a04", 
  "#9333ea", "#c2410c", "#0891b2", "#be185d"
] as const;

export const DEFAULT_DATE_RANGE = {
  start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
  end: new Date(),
} as const;