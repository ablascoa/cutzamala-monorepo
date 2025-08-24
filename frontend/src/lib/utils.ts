import { clsx, type ClassValue } from "clsx";

/**
 * Combines class names using clsx
 * @param inputs - Class names, objects, or arrays to combine
 * @returns Combined class names string
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Formats a number with proper locale formatting
 * @param num - The number to format
 * @returns Formatted number string with one decimal place
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(num);
}

/**
 * Formats a date in Spanish Mexican locale
 * @param date - Date string or Date object
 * @returns Formatted date string (e.g., "15 de enero de 2024")
 */
export function formatDate(date: string | Date): string {
  // Handle Date objects
  if (date instanceof Date) {
    return new Intl.DateTimeFormat("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  }
  
  // Handle different string formats
  // Weekly format: "2025-08-31 to 2025-09-06" - use start date
  if (typeof date === 'string' && date.includes(' to ')) {
    const startDate = date.split(' to ')[0];
    return new Intl.DateTimeFormat("es-MX", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(startDate + 'T00:00:00'));
  }
  
  // Monthly format: "2025-08" - use first day of month
  if (typeof date === 'string' && /^\d{4}-\d{2}$/.test(date)) {
    return new Intl.DateTimeFormat("es-MX", {
      year: "numeric",
      month: "long",
    }).format(new Date(date + '-01T00:00:00'));
  }
  
  // Yearly format: "2025" - just return the year
  if (typeof date === 'string' && /^\d{4}$/.test(date)) {
    return date;
  }
  
  // Daily format: "2025-08-31" or fallback
  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date + 'T00:00:00'));
}

/**
 * Formats a date in short Spanish Mexican locale
 * @param date - Date string or Date object
 * @returns Short formatted date string (e.g., "15 ene 2024")
 */
export function formatShortDate(date: string | Date): string {
  // Handle Date objects
  if (date instanceof Date) {
    return new Intl.DateTimeFormat("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  }
  
  // Handle different string formats
  // Weekly format: "2025-08-31 to 2025-09-06" - use start date
  if (typeof date === 'string' && date.includes(' to ')) {
    const startDate = date.split(' to ')[0];
    return new Intl.DateTimeFormat("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(startDate + 'T00:00:00'));
  }
  
  // Monthly format: "2025-08" - use first day of month
  if (typeof date === 'string' && /^\d{4}-\d{2}$/.test(date)) {
    return new Intl.DateTimeFormat("es-MX", {
      year: "numeric",
      month: "short",
    }).format(new Date(date + '-01T00:00:00'));
  }
  
  // Yearly format: "2025" - just return the year
  if (typeof date === 'string' && /^\d{4}$/.test(date)) {
    return date;
  }
  
  // Daily format: "2025-08-31" or fallback
  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date + 'T00:00:00'));
}

/**
 * Calculates percentage change between two numbers
 * @param current - Current value
 * @param previous - Previous value
 * @returns Percentage change as a number (positive for increase, negative for decrease)
 */
export function calculatePercentageChange(current: number, previous: number): number {
  if (previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

/**
 * Returns a CSS custom property color based on storage percentage levels
 * @param percentage - Storage percentage (0-100)
 * @returns CSS custom property string that adapts to theme
 */
export function getStorageColor(percentage: number): string {
  if (percentage >= 80) return "var(--success)";
  if (percentage >= 60) return "var(--warning)";
  if (percentage >= 40) return "var(--destructive)";
  return "var(--destructive)";
}

/**
 * Returns appropriate text color for storage levels
 * @param percentage - Storage percentage (0-100)
 * @returns CSS custom property for text color
 */
export function getStorageTextColor(percentage: number): string {
  if (percentage >= 80) return "var(--success-foreground)";
  if (percentage >= 60) return "var(--warning-foreground)";
  if (percentage >= 40) return "var(--destructive-foreground)";
  return "var(--destructive-foreground)";
}