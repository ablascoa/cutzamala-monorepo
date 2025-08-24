from typing import Dict, List
from datetime import datetime, date, timedelta
import logging
from ..utils.date_utils import get_month_name

logger = logging.getLogger(__name__)


class DatabaseAggregationService:
    """Aggregation service that works with database data format"""
    
    @staticmethod
    def aggregate_daily(data: List[Dict]) -> List[Dict]:
        """Convert database records to API response format"""
        records = []
        
        for row in data:
            record = {
                "date": row['date'],
                "year": int(row['year']),
                "month": int(row['month']),
                "month_name": row['month_name'],
                "day": int(row['day']),
                "reservoirs": {
                    "Valle de Bravo": {
                        "storage_mm3": float(row['valle_bravo_mm3']),
                        "percentage": float(row['valle_bravo_pct']),
                        "rainfall": float(row['valle_bravo_lluvia'])
                    },
                    "Villa Victoria": {
                        "storage_mm3": float(row['villa_victoria_mm3']),
                        "percentage": float(row['villa_victoria_pct']),
                        "rainfall": float(row['villa_victoria_lluvia'])
                    },
                    "El Bosque": {
                        "storage_mm3": float(row['el_bosque_mm3']),
                        "percentage": float(row['el_bosque_pct']),
                        "rainfall": float(row['el_bosque_lluvia'])
                    }
                },
                "system_totals": {
                    "total_mm3": int(row['total_mm3']),
                    "total_percentage": float(row['total_pct'])
                },
                "source_pdf": row['source_pdf']
            }
            records.append(record)
        
        return records
    
    @staticmethod
    def aggregate_weekly(data: List[Dict]) -> List[Dict]:
        """Aggregate daily data into weekly periods"""
        if not data:
            return []
        
        # Group data by week
        weekly_groups = {}
        
        for row in data:
            row_date = datetime.fromisoformat(row['date']).date()
            
            # Get the Sunday of the week (ISO week starts on Monday, we want Sunday)
            days_since_sunday = (row_date.weekday() + 1) % 7
            week_start = row_date - timedelta(days=days_since_sunday)
            week_end = week_start + timedelta(days=6)
            
            week_key = f"{week_start} to {week_end}"
            
            if week_key not in weekly_groups:
                weekly_groups[week_key] = []
            weekly_groups[week_key].append(row)
        
        # Aggregate each week
        weekly_records = []
        for week_key, week_data in weekly_groups.items():
            # Use the last record of the week for date info
            latest_record = max(week_data, key=lambda x: x['date'])
            
            # Calculate averages for storage and percentages, sum for rainfall
            valle_bravo_storage_avg = sum(float(r['valle_bravo_mm3']) for r in week_data) / len(week_data)
            valle_bravo_pct_avg = sum(float(r['valle_bravo_pct']) for r in week_data) / len(week_data)
            valle_bravo_rainfall_sum = sum(float(r['valle_bravo_lluvia']) for r in week_data)
            
            villa_victoria_storage_avg = sum(float(r['villa_victoria_mm3']) for r in week_data) / len(week_data)
            villa_victoria_pct_avg = sum(float(r['villa_victoria_pct']) for r in week_data) / len(week_data)
            villa_victoria_rainfall_sum = sum(float(r['villa_victoria_lluvia']) for r in week_data)
            
            el_bosque_storage_avg = sum(float(r['el_bosque_mm3']) for r in week_data) / len(week_data)
            el_bosque_pct_avg = sum(float(r['el_bosque_pct']) for r in week_data) / len(week_data)
            el_bosque_rainfall_sum = sum(float(r['el_bosque_lluvia']) for r in week_data)
            
            total_mm3_avg = sum(int(r['total_mm3']) for r in week_data) / len(week_data)
            total_pct_avg = sum(float(r['total_pct']) for r in week_data) / len(week_data)
            
            record = {
                "date": week_key,
                "year": int(latest_record['year']),
                "month": int(latest_record['month']),
                "month_name": latest_record['month_name'],
                "day": int(latest_record['day']),
                "reservoirs": {
                    "Valle de Bravo": {
                        "storage_mm3": round(valle_bravo_storage_avg, 2),
                        "percentage": round(valle_bravo_pct_avg, 2),
                        "rainfall": round(valle_bravo_rainfall_sum, 2)
                    },
                    "Villa Victoria": {
                        "storage_mm3": round(villa_victoria_storage_avg, 2),
                        "percentage": round(villa_victoria_pct_avg, 2),
                        "rainfall": round(villa_victoria_rainfall_sum, 2)
                    },
                    "El Bosque": {
                        "storage_mm3": round(el_bosque_storage_avg, 2),
                        "percentage": round(el_bosque_pct_avg, 2),
                        "rainfall": round(el_bosque_rainfall_sum, 2)
                    }
                },
                "system_totals": {
                    "total_mm3": int(round(total_mm3_avg)),
                    "total_percentage": round(total_pct_avg, 2)
                },
                "source_pdf": latest_record['source_pdf']
            }
            weekly_records.append(record)
        
        # Sort by date descending
        weekly_records.sort(key=lambda x: x['date'], reverse=True)
        return weekly_records
    
    @staticmethod
    def aggregate_monthly(data: List[Dict]) -> List[Dict]:
        """Aggregate daily data into monthly periods"""
        if not data:
            return []
        
        # Group data by month
        monthly_groups = {}
        
        for row in data:
            month_key = f"{row['year']}-{row['month']:02d}"
            
            if month_key not in monthly_groups:
                monthly_groups[month_key] = []
            monthly_groups[month_key].append(row)
        
        # Aggregate each month
        monthly_records = []
        for month_key, month_data in monthly_groups.items():
            # Use the last record of the month for date info
            latest_record = max(month_data, key=lambda x: x['date'])
            
            # Calculate averages for storage and percentages, sum for rainfall
            valle_bravo_storage_avg = sum(float(r['valle_bravo_mm3']) for r in month_data) / len(month_data)
            valle_bravo_pct_avg = sum(float(r['valle_bravo_pct']) for r in month_data) / len(month_data)
            valle_bravo_rainfall_sum = sum(float(r['valle_bravo_lluvia']) for r in month_data)
            
            villa_victoria_storage_avg = sum(float(r['villa_victoria_mm3']) for r in month_data) / len(month_data)
            villa_victoria_pct_avg = sum(float(r['villa_victoria_pct']) for r in month_data) / len(month_data)
            villa_victoria_rainfall_sum = sum(float(r['villa_victoria_lluvia']) for r in month_data)
            
            el_bosque_storage_avg = sum(float(r['el_bosque_mm3']) for r in month_data) / len(month_data)
            el_bosque_pct_avg = sum(float(r['el_bosque_pct']) for r in month_data) / len(month_data)
            el_bosque_rainfall_sum = sum(float(r['el_bosque_lluvia']) for r in month_data)
            
            total_mm3_avg = sum(int(r['total_mm3']) for r in month_data) / len(month_data)
            total_pct_avg = sum(float(r['total_pct']) for r in month_data) / len(month_data)
            
            record = {
                "date": month_key,
                "year": int(latest_record['year']),
                "month": int(latest_record['month']),
                "month_name": latest_record['month_name'],
                "day": 1,  # Set to 1 for monthly aggregation
                "reservoirs": {
                    "Valle de Bravo": {
                        "storage_mm3": round(valle_bravo_storage_avg, 2),
                        "percentage": round(valle_bravo_pct_avg, 2),
                        "rainfall": round(valle_bravo_rainfall_sum, 2)
                    },
                    "Villa Victoria": {
                        "storage_mm3": round(villa_victoria_storage_avg, 2),
                        "percentage": round(villa_victoria_pct_avg, 2),
                        "rainfall": round(villa_victoria_rainfall_sum, 2)
                    },
                    "El Bosque": {
                        "storage_mm3": round(el_bosque_storage_avg, 2),
                        "percentage": round(el_bosque_pct_avg, 2),
                        "rainfall": round(el_bosque_rainfall_sum, 2)
                    }
                },
                "system_totals": {
                    "total_mm3": int(round(total_mm3_avg)),
                    "total_percentage": round(total_pct_avg, 2)
                },
                "source_pdf": latest_record['source_pdf']
            }
            monthly_records.append(record)
        
        # Sort by date descending
        monthly_records.sort(key=lambda x: x['date'], reverse=True)
        return monthly_records
    
    @staticmethod
    def aggregate_yearly(data: List[Dict]) -> List[Dict]:
        """Aggregate daily data into yearly periods"""
        if not data:
            return []
        
        # Group data by year
        yearly_groups = {}
        
        for row in data:
            year_key = str(row['year'])
            
            if year_key not in yearly_groups:
                yearly_groups[year_key] = []
            yearly_groups[year_key].append(row)
        
        # Aggregate each year
        yearly_records = []
        for year_key, year_data in yearly_groups.items():
            # Use the last record of the year for date info
            latest_record = max(year_data, key=lambda x: x['date'])
            
            # Calculate averages for storage and percentages, sum for rainfall
            valle_bravo_storage_avg = sum(float(r['valle_bravo_mm3']) for r in year_data) / len(year_data)
            valle_bravo_pct_avg = sum(float(r['valle_bravo_pct']) for r in year_data) / len(year_data)
            valle_bravo_rainfall_sum = sum(float(r['valle_bravo_lluvia']) for r in year_data)
            
            villa_victoria_storage_avg = sum(float(r['villa_victoria_mm3']) for r in year_data) / len(year_data)
            villa_victoria_pct_avg = sum(float(r['villa_victoria_pct']) for r in year_data) / len(year_data)
            villa_victoria_rainfall_sum = sum(float(r['villa_victoria_lluvia']) for r in year_data)
            
            el_bosque_storage_avg = sum(float(r['el_bosque_mm3']) for r in year_data) / len(year_data)
            el_bosque_pct_avg = sum(float(r['el_bosque_pct']) for r in year_data) / len(year_data)
            el_bosque_rainfall_sum = sum(float(r['el_bosque_lluvia']) for r in year_data)
            
            total_mm3_avg = sum(int(r['total_mm3']) for r in year_data) / len(year_data)
            total_pct_avg = sum(float(r['total_pct']) for r in year_data) / len(year_data)
            
            record = {
                "date": year_key,
                "year": int(year_key),
                "month": 12,  # Set to December for yearly aggregation
                "month_name": "December",
                "day": 31,  # Set to 31 for yearly aggregation
                "reservoirs": {
                    "Valle de Bravo": {
                        "storage_mm3": round(valle_bravo_storage_avg, 2),
                        "percentage": round(valle_bravo_pct_avg, 2),
                        "rainfall": round(valle_bravo_rainfall_sum, 2)
                    },
                    "Villa Victoria": {
                        "storage_mm3": round(villa_victoria_storage_avg, 2),
                        "percentage": round(villa_victoria_pct_avg, 2),
                        "rainfall": round(villa_victoria_rainfall_sum, 2)
                    },
                    "El Bosque": {
                        "storage_mm3": round(el_bosque_storage_avg, 2),
                        "percentage": round(el_bosque_pct_avg, 2),
                        "rainfall": round(el_bosque_rainfall_sum, 2)
                    }
                },
                "system_totals": {
                    "total_mm3": int(round(total_mm3_avg)),
                    "total_percentage": round(total_pct_avg, 2)
                },
                "source_pdf": latest_record['source_pdf']
            }
            yearly_records.append(record)
        
        # Sort by year descending
        yearly_records.sort(key=lambda x: int(x['year']), reverse=True)
        return yearly_records


