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
  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(date));
}

/**
 * Formats a date in short Spanish Mexican locale
 * @param date - Date string or Date object
 * @returns Short formatted date string (e.g., "15 ene 2024")
 */
export function formatShortDate(date: string | Date): string {
  return new Intl.DateTimeFormat("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
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