/**
 * Utilities for parsing different date formats from the backend API
 */

export function parseApiDate(dateStr: string): Date {
  // Daily format: "2025-08-31"
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return new Date(dateStr + 'T00:00:00');
  }
  
  // Weekly format: "2025-08-31 to 2025-09-06" - use start date
  if (/^\d{4}-\d{2}-\d{2} to \d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    const startDate = dateStr.split(' to ')[0];
    return new Date(startDate + 'T00:00:00');
  }
  
  // Monthly format: "2025-08" - use first day of month
  if (/^\d{4}-\d{2}$/.test(dateStr)) {
    return new Date(dateStr + '-01T00:00:00');
  }
  
  // Yearly format: "2025" - use first day of year
  if (/^\d{4}$/.test(dateStr)) {
    return new Date(dateStr + '-01-01T00:00:00');
  }
  
  // Fallback - try to parse as-is
  return new Date(dateStr);
}

export function formatDateForDisplay(dateStr: string, granularity: string = 'daily'): string {
  // For weekly, show the range as-is
  if (granularity === 'weekly' && dateStr.includes(' to ')) {
    return dateStr;
  }
  
  // For monthly, show month name and year
  if (granularity === 'monthly' && /^\d{4}-\d{2}$/.test(dateStr)) {
    const date = parseApiDate(dateStr);
    return date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
  }
  
  // For yearly, just show the year
  if (granularity === 'yearly' && /^\d{4}$/.test(dateStr)) {
    return dateStr;
  }
  
  // For daily or other formats, format normally
  const date = parseApiDate(dateStr);
  return date.toLocaleDateString('es-ES');
}