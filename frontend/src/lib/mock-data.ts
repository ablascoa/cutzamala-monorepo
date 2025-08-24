import type {
  CutzamalaReading,
  CutzamalaResponse,
  CutzamalaQueryParams,
  Granularity,
  ReservoirData,
  SystemTotals,
} from '@/types/api';

/**
 * Reservoir capacity data (in millions of cubic meters)
 */
const RESERVOIR_CAPACITIES = {
  valle_bravo: 394.0,
  villa_victoria: 186.0,
  el_bosque: 17.8,
} as const;

const TOTAL_CAPACITY = Object.values(RESERVOIR_CAPACITIES).reduce((sum, capacity) => sum + capacity, 0);

/**
 * Generates a realistic storage value with seasonal patterns
 * @param date - The date for which to generate data
 * @param reservoirKey - The reservoir key
 * @param baseLevel - Base storage level (0-1)
 * @returns Realistic storage value in millions of cubic meters
 */
function generateRealisticStorage(
  date: Date,
  reservoirKey: keyof typeof RESERVOIR_CAPACITIES,
  baseLevel: number = 0.7
): number {
  const capacity = RESERVOIR_CAPACITIES[reservoirKey];
  const month = date.getMonth(); // 0-11
  const year = date.getFullYear();
  
  // Seasonal pattern: higher levels during rainy season (June-October)
  let seasonalMultiplier = 1.0;
  if (month >= 5 && month <= 9) { // June to October (rainy season)
    seasonalMultiplier = 1.2 + Math.sin((month - 5) * Math.PI / 4) * 0.3;
  } else { // Dry season
    seasonalMultiplier = 0.6 + Math.sin((month + 1) * Math.PI / 6) * 0.2;
  }
  
  // Long-term trend: slight decline over years due to climate change
  const yearsSince2016 = year - 2016;
  const trendMultiplier = 1.0 - (yearsSince2016 * 0.01); // 1% decline per year
  
  // Random daily variation
  const randomVariation = 0.95 + Math.random() * 0.1; // ±5% variation
  
  // Calculate final storage
  const storage = capacity * baseLevel * seasonalMultiplier * trendMultiplier * randomVariation;
  
  // Ensure realistic bounds (minimum 10% of capacity, maximum 95%)
  return Math.max(capacity * 0.1, Math.min(capacity * 0.95, storage));
}

/**
 * Generates rainfall data with seasonal patterns
 * @param date - The date for which to generate rainfall
 * @returns Rainfall in millimeters
 */
function generateRainfall(date: Date): number {
  const month = date.getMonth();
  
  // Rainy season has much higher rainfall
  let baseRainfall = 0;
  if (month >= 5 && month <= 9) { // June to October
    baseRainfall = 50 + Math.random() * 150; // 50-200mm
  } else { // Dry season
    baseRainfall = Math.random() * 20; // 0-20mm
  }
  
  return Math.round(baseRainfall * 10) / 10; // Round to 1 decimal
}

/**
 * Generates a single reservoir data point
 * @param date - The date for the reading
 * @param reservoirKey - The reservoir identifier
 * @param baseLevel - Base storage level multiplier
 * @returns Complete reservoir data
 */
function generateReservoirData(
  date: Date,
  reservoirKey: keyof typeof RESERVOIR_CAPACITIES,
  baseLevel: number
): ReservoirData {
  const capacity = RESERVOIR_CAPACITIES[reservoirKey];
  const storage_mm3 = generateRealisticStorage(date, reservoirKey, baseLevel);
  const percentage = (storage_mm3 / capacity) * 100;
  const rainfall = generateRainfall(date);
  
  return {
    storage_mm3: Math.round(storage_mm3 * 10) / 10,
    percentage: Math.round(percentage * 10) / 10,
    rainfall: rainfall,
  };
}

/**
 * Generates system totals from individual reservoir data
 * @param reservoirs - Individual reservoir data
 * @returns System totals
 */
function generateSystemTotals(reservoirs: {
  valle_bravo: ReservoirData;
  villa_victoria: ReservoirData;
  el_bosque: ReservoirData;
}): SystemTotals {
  const total_mm3 = reservoirs.valle_bravo.storage_mm3 + 
                   reservoirs.villa_victoria.storage_mm3 + 
                   reservoirs.el_bosque.storage_mm3;
  
  const total_percentage = (total_mm3 / TOTAL_CAPACITY) * 100;
  
  return {
    total_mm3: Math.round(total_mm3 * 10) / 10,
    total_percentage: Math.round(total_percentage * 10) / 10,
  };
}

/**
 * Generates a complete Cutzamala reading for a specific date
 * @param date - The date for the reading
 * @returns Complete reading with all reservoirs and system data
 */
function generateCutzamalaReading(date: Date): CutzamalaReading {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  
  // Different base levels for each reservoir to create variety
  const reservoirs = {
    valle_bravo: generateReservoirData(date, 'valle_bravo', 0.75),
    villa_victoria: generateReservoirData(date, 'villa_victoria', 0.65),
    el_bosque: generateReservoirData(date, 'el_bosque', 0.80),
  };
  
  const system_totals = generateSystemTotals(reservoirs);
  
  const monthNames = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];
  
  return {
    date: date.toISOString().split('T')[0],
    year,
    month,
    month_name: monthNames[month - 1],
    day,
    reservoirs,
    system_totals,
    source_pdf: `mock-report-${year}-${month.toString().padStart(2, '0')}.pdf`,
  };
}

/**
 * Aggregates daily readings into weekly, monthly, or yearly data
 * @param readings - Array of daily readings
 * @param granularity - Target granularity
 * @returns Aggregated readings
 */
function aggregateReadings(readings: CutzamalaReading[], granularity: Granularity): CutzamalaReading[] {
  if (granularity === 'daily') return readings;
  
  const aggregated: CutzamalaReading[] = [];
  
  if (granularity === 'weekly') {
    // Group by week
    const weeklyGroups = new Map<string, CutzamalaReading[]>();
    
    readings.forEach(reading => {
      const date = new Date(reading.date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split('T')[0];
      
      if (!weeklyGroups.has(weekKey)) {
        weeklyGroups.set(weekKey, []);
      }
      weeklyGroups.get(weekKey)!.push(reading);
    });
    
    weeklyGroups.forEach((weekReadings, weekKey) => {
      if (weekReadings.length > 0) {
        aggregated.push(averageReadings(weekReadings, weekKey));
      }
    });
  } else if (granularity === 'monthly') {
    // Group by month
    const monthlyGroups = new Map<string, CutzamalaReading[]>();
    
    readings.forEach(reading => {
      const monthKey = `${reading.year}-${reading.month.toString().padStart(2, '0')}`;
      
      if (!monthlyGroups.has(monthKey)) {
        monthlyGroups.set(monthKey, []);
      }
      monthlyGroups.get(monthKey)!.push(reading);
    });
    
    monthlyGroups.forEach((monthReadings, monthKey) => {
      if (monthReadings.length > 0) {
        const [year, month] = monthKey.split('-');
        const aggregatedDate = `${year}-${month}-01`;
        aggregated.push(averageReadings(monthReadings, aggregatedDate));
      }
    });
  } else if (granularity === 'yearly') {
    // Group by year
    const yearlyGroups = new Map<number, CutzamalaReading[]>();
    
    readings.forEach(reading => {
      if (!yearlyGroups.has(reading.year)) {
        yearlyGroups.set(reading.year, []);
      }
      yearlyGroups.get(reading.year)!.push(reading);
    });
    
    yearlyGroups.forEach((yearReadings, year) => {
      if (yearReadings.length > 0) {
        const aggregatedDate = `${year}-01-01`;
        aggregated.push(averageReadings(yearReadings, aggregatedDate));
      }
    });
  }
  
  return aggregated.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

/**
 * Averages multiple readings into a single reading
 * @param readings - Readings to average
 * @param date - Date for the averaged reading
 * @returns Averaged reading
 */
function averageReadings(readings: CutzamalaReading[], date: string): CutzamalaReading {
  const avg = (values: number[]) => values.reduce((sum, val) => sum + val, 0) / values.length;
  const sum = (values: number[]) => values.reduce((sum, val) => sum + val, 0);
  
  const avgReading = readings[0]; // Use first reading as template
  const avgDate = new Date(date);
  
  return {
    ...avgReading,
    date,
    year: avgDate.getFullYear(),
    month: avgDate.getMonth() + 1,
    day: avgDate.getDate(),
    reservoirs: {
      valle_bravo: {
        storage_mm3: Math.round(avg(readings.map(r => r.reservoirs.valle_bravo.storage_mm3)) * 10) / 10,
        percentage: Math.round(avg(readings.map(r => r.reservoirs.valle_bravo.percentage)) * 10) / 10,
        rainfall: Math.round(sum(readings.map(r => r.reservoirs.valle_bravo.rainfall)) * 10) / 10,
      },
      villa_victoria: {
        storage_mm3: Math.round(avg(readings.map(r => r.reservoirs.villa_victoria.storage_mm3)) * 10) / 10,
        percentage: Math.round(avg(readings.map(r => r.reservoirs.villa_victoria.percentage)) * 10) / 10,
        rainfall: Math.round(sum(readings.map(r => r.reservoirs.villa_victoria.rainfall)) * 10) / 10,
      },
      el_bosque: {
        storage_mm3: Math.round(avg(readings.map(r => r.reservoirs.el_bosque.storage_mm3)) * 10) / 10,
        percentage: Math.round(avg(readings.map(r => r.reservoirs.el_bosque.percentage)) * 10) / 10,
        rainfall: Math.round(sum(readings.map(r => r.reservoirs.el_bosque.rainfall)) * 10) / 10,
      },
    },
    system_totals: {
      total_mm3: Math.round(avg(readings.map(r => r.system_totals.total_mm3)) * 10) / 10,
      total_percentage: Math.round(avg(readings.map(r => r.system_totals.total_percentage)) * 10) / 10,
    },
  };
}

/**
 * Generates mock Cutzamala data based on query parameters
 * @param params - Query parameters for filtering
 * @returns Mock API response with realistic data
 */
export function generateMockCutzamalaData(params?: CutzamalaQueryParams, forceEmpty = false): CutzamalaResponse {
  const {
    start_date,
    end_date,
    granularity = 'daily',
    limit = 100,
    offset = 0,
  } = params || {};
  
  // Default date range: last year
  const defaultEndDate = new Date();
  const defaultStartDate = new Date();
  defaultStartDate.setFullYear(defaultStartDate.getFullYear() - 1);
  
  const startDate = start_date ? new Date(start_date) : defaultStartDate;
  const endDate = end_date ? new Date(end_date) : defaultEndDate;
  
  // Generate daily readings for the entire range
  const dailyReadings: CutzamalaReading[] = [];
  
  if (!forceEmpty) {
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      dailyReadings.push(generateCutzamalaReading(new Date(currentDate)));
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }
  
  // Aggregate based on granularity
  const aggregatedReadings = aggregateReadings(dailyReadings, granularity);
  
  // Apply pagination
  const totalRecords = aggregatedReadings.length;
  const paginatedReadings = aggregatedReadings.slice(offset, offset + limit);
  
  return {
    readings: paginatedReadings,
    metadata: {
      total_records: totalRecords,
      filtered_records: totalRecords,
      granularity,
      date_range: {
        start: startDate.toISOString().split('T')[0],
        end: endDate.toISOString().split('T')[0],
      },
      reservoirs_included: ['valle_bravo', 'villa_victoria', 'el_bosque'],
    },
    pagination: {
      limit,
      offset,
      has_next: offset + limit < totalRecords,
      has_previous: offset > 0,
    },
  };
}

/**
 * Generates sample recent readings for testing
 * @param days - Number of days of recent data
 * @returns Recent readings
 */
export function generateRecentReadings(days: number = 30): CutzamalaResponse {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  
  return generateMockCutzamalaData({
    start_date: startDate.toISOString().split('T')[0],
    end_date: endDate.toISOString().split('T')[0],
    granularity: 'daily',
  });
}