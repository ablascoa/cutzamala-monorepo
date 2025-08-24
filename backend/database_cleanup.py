#!/usr/bin/env python3
"""
Database cleanup utility for Cutzamala water storage data.

This script performs the following operations:
1. Removes records with all zero storage values
2. Identifies missing dates in the time series
3. Interpolates storage values for missing dates
4. Marks interpolated records as synthetic
"""

import sqlite3
import sys
import os
from datetime import datetime, timedelta, date
from typing import List, Tuple, Dict, Optional
import logging

logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)


class DatabaseCleaner:
    """Handles cleanup and interpolation of Cutzamala database records"""
    
    def __init__(self, db_path: str):
        self.db_path = db_path
        if not os.path.exists(db_path):
            raise FileNotFoundError(f"Database file not found: {db_path}")
    
    def get_connection(self) -> sqlite3.Connection:
        """Get database connection with row factory"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn
    
    def remove_zero_storage_records(self) -> int:
        """Remove records where all storage values are zero"""
        logger.info("🗑️  Removing records with all zero storage values...")
        
        with self.get_connection() as conn:
            # First, count how many records will be removed
            cursor = conn.execute("""
                SELECT COUNT(*) as count
                FROM cutzamala_readings 
                WHERE valle_bravo_mm3 = 0 
                  AND villa_victoria_mm3 = 0 
                  AND el_bosque_mm3 = 0
            """)
            count_to_remove = cursor.fetchone()['count']
            
            if count_to_remove == 0:
                logger.info("   No zero-storage records found")
                return 0
            
            # Show some examples before removal
            cursor = conn.execute("""
                SELECT date, source_pdf 
                FROM cutzamala_readings 
                WHERE valle_bravo_mm3 = 0 
                  AND villa_victoria_mm3 = 0 
                  AND el_bosque_mm3 = 0
                ORDER BY date 
                LIMIT 5
            """)
            examples = cursor.fetchall()
            
            logger.info(f"   Found {count_to_remove} records to remove")
            logger.info("   Examples:")
            for row in examples:
                logger.info(f"     {row['date']} (from {row['source_pdf'] or 'unknown'})")
            
            # Remove the records
            cursor = conn.execute("""
                DELETE FROM cutzamala_readings 
                WHERE valle_bravo_mm3 = 0 
                  AND villa_victoria_mm3 = 0 
                  AND el_bosque_mm3 = 0
            """)
            removed_count = cursor.rowcount
            conn.commit()
            
            logger.info(f"   ✅ Removed {removed_count} zero-storage records")
            return removed_count
    
    def find_missing_dates(self) -> List[date]:
        """Find missing dates in the time series"""
        logger.info("🔍 Finding missing dates in time series...")
        
        with self.get_connection() as conn:
            # Get the date range
            cursor = conn.execute("""
                SELECT MIN(date) as min_date, MAX(date) as max_date
                FROM cutzamala_readings
            """)
            result = cursor.fetchone()
            
            if not result['min_date'] or not result['max_date']:
                logger.warning("   No data found in database")
                return []
            
            start_date = datetime.strptime(result['min_date'], '%Y-%m-%d').date()
            end_date = datetime.strptime(result['max_date'], '%Y-%m-%d').date()
            
            # Get all existing dates
            cursor = conn.execute("""
                SELECT date FROM cutzamala_readings 
                ORDER BY date
            """)
            existing_dates = {datetime.strptime(row['date'], '%Y-%m-%d').date() 
                            for row in cursor.fetchall()}
            
            # Find missing dates
            missing_dates = []
            current_date = start_date
            while current_date <= end_date:
                if current_date not in existing_dates:
                    missing_dates.append(current_date)
                current_date += timedelta(days=1)
            
            logger.info(f"   Found {len(missing_dates)} missing dates between {start_date} and {end_date}")
            if len(missing_dates) > 0:
                logger.info(f"   Date range: {min(missing_dates)} to {max(missing_dates)}")
            
            return missing_dates
    
    def interpolate_storage_values(self, target_date: date) -> Optional[Dict]:
        """Interpolate storage values for a specific date"""
        with self.get_connection() as conn:
            target_str = target_date.strftime('%Y-%m-%d')
            
            # Find the closest previous and next records with non-zero values
            cursor = conn.execute("""
                SELECT date, valle_bravo_mm3, villa_victoria_mm3, el_bosque_mm3,
                       valle_bravo_pct, villa_victoria_pct, el_bosque_pct,
                       total_mm3, total_pct
                FROM cutzamala_readings 
                WHERE date < ? 
                  AND (valle_bravo_mm3 > 0 OR villa_victoria_mm3 > 0 OR el_bosque_mm3 > 0)
                ORDER BY date DESC 
                LIMIT 1
            """, (target_str,))
            prev_record = cursor.fetchone()
            
            cursor = conn.execute("""
                SELECT date, valle_bravo_mm3, villa_victoria_mm3, el_bosque_mm3,
                       valle_bravo_pct, villa_victoria_pct, el_bosque_pct,
                       total_mm3, total_pct
                FROM cutzamala_readings 
                WHERE date > ? 
                  AND (valle_bravo_mm3 > 0 OR villa_victoria_mm3 > 0 OR el_bosque_mm3 > 0)
                ORDER BY date ASC 
                LIMIT 1
            """, (target_str,))
            next_record = cursor.fetchone()
            
            if not prev_record or not next_record:
                logger.warning(f"   Cannot interpolate for {target_str}: insufficient surrounding data")
                return None
            
            # Calculate interpolation weights
            prev_date = datetime.strptime(prev_record['date'], '%Y-%m-%d').date()
            next_date = datetime.strptime(next_record['date'], '%Y-%m-%d').date()
            
            total_days = (next_date - prev_date).days
            days_from_prev = (target_date - prev_date).days
            
            if total_days == 0:
                weight = 0.5
            else:
                weight = days_from_prev / total_days
            
            # Interpolate each value
            def interpolate(prev_val, next_val):
                return prev_val + (next_val - prev_val) * weight
            
            interpolated = {
                'date': target_str,
                'year': target_date.year,
                'month': target_date.month,
                'month_name': target_date.strftime('%B').upper(),
                'day': target_date.day,
                'valle_bravo_mm3': interpolate(prev_record['valle_bravo_mm3'], next_record['valle_bravo_mm3']),
                'valle_bravo_pct': interpolate(prev_record['valle_bravo_pct'], next_record['valle_bravo_pct']),
                'valle_bravo_lluvia': 0.0,  # Cannot interpolate rainfall
                'villa_victoria_mm3': interpolate(prev_record['villa_victoria_mm3'], next_record['villa_victoria_mm3']),
                'villa_victoria_pct': interpolate(prev_record['villa_victoria_pct'], next_record['villa_victoria_pct']),
                'villa_victoria_lluvia': 0.0,  # Cannot interpolate rainfall
                'el_bosque_mm3': interpolate(prev_record['el_bosque_mm3'], next_record['el_bosque_mm3']),
                'el_bosque_pct': interpolate(prev_record['el_bosque_pct'], next_record['el_bosque_pct']),
                'el_bosque_lluvia': 0.0,  # Cannot interpolate rainfall
                'source_pdf': f"INTERPOLATED_BETWEEN_{prev_record['date']}_{next_record['date']}",
                'is_synthetic': True
            }
            
            # Calculate total
            interpolated['total_mm3'] = (interpolated['valle_bravo_mm3'] + 
                                       interpolated['villa_victoria_mm3'] + 
                                       interpolated['el_bosque_mm3'])
            interpolated['total_pct'] = interpolate(prev_record['total_pct'], next_record['total_pct'])
            
            return interpolated
    
    def insert_interpolated_records(self, missing_dates: List[date]) -> int:
        """Insert interpolated records for missing dates"""
        if not missing_dates:
            return 0
        
        logger.info(f"🔮 Interpolating storage values for {len(missing_dates)} missing dates...")
        
        interpolated_count = 0
        failed_count = 0
        
        with self.get_connection() as conn:
            for missing_date in missing_dates:
                interpolated = self.interpolate_storage_values(missing_date)
                
                if interpolated:
                    try:
                        # Insert the interpolated record
                        cursor = conn.execute("""
                            INSERT INTO cutzamala_readings 
                            (date, year, month, month_name, day,
                             valle_bravo_mm3, valle_bravo_pct, valle_bravo_lluvia,
                             villa_victoria_mm3, villa_victoria_pct, villa_victoria_lluvia,
                             el_bosque_mm3, el_bosque_pct, el_bosque_lluvia,
                             total_mm3, total_pct, source_pdf, is_synthetic)
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """, (
                            interpolated['date'], interpolated['year'], interpolated['month'], 
                            interpolated['month_name'], interpolated['day'],
                            interpolated['valle_bravo_mm3'], interpolated['valle_bravo_pct'], 
                            interpolated['valle_bravo_lluvia'],
                            interpolated['villa_victoria_mm3'], interpolated['villa_victoria_pct'], 
                            interpolated['villa_victoria_lluvia'],
                            interpolated['el_bosque_mm3'], interpolated['el_bosque_pct'], 
                            interpolated['el_bosque_lluvia'],
                            interpolated['total_mm3'], interpolated['total_pct'], 
                            interpolated['source_pdf'], interpolated['is_synthetic']
                        ))
                        interpolated_count += 1
                        
                        if interpolated_count <= 3:  # Show first few examples
                            logger.info(f"   {missing_date}: Total={interpolated['total_mm3']:.1f}mm³ "
                                      f"(VB:{interpolated['valle_bravo_mm3']:.1f}, "
                                      f"VV:{interpolated['villa_victoria_mm3']:.1f}, "
                                      f"EB:{interpolated['el_bosque_mm3']:.1f})")
                    except Exception as e:
                        logger.error(f"   Failed to insert {missing_date}: {e}")
                        failed_count += 1
                else:
                    failed_count += 1
            
            conn.commit()
        
        logger.info(f"   ✅ Successfully interpolated {interpolated_count} records")
        if failed_count > 0:
            logger.warning(f"   ⚠️  Failed to interpolate {failed_count} records")
        
        return interpolated_count
    
    def get_cleanup_summary(self) -> Dict:
        """Get summary statistics about the cleanup"""
        with self.get_connection() as conn:
            cursor = conn.execute("""
                SELECT 
                    COUNT(*) as total_records,
                    COUNT(CASE WHEN is_synthetic = 1 THEN 1 END) as synthetic_records,
                    COUNT(CASE WHEN is_synthetic = 0 THEN 1 END) as original_records,
                    MIN(date) as earliest_date,
                    MAX(date) as latest_date
                FROM cutzamala_readings
            """)
            result = cursor.fetchone()
            
            return {
                'total_records': result['total_records'],
                'synthetic_records': result['synthetic_records'], 
                'original_records': result['original_records'],
                'earliest_date': result['earliest_date'],
                'latest_date': result['latest_date']
            }
    
    def cleanup_database(self, remove_zeros: bool = True, interpolate_missing: bool = True) -> Dict:
        """Perform complete database cleanup"""
        logger.info("🧹 Starting database cleanup...")
        
        initial_stats = self.get_cleanup_summary()
        logger.info(f"   Initial state: {initial_stats['total_records']} records "
                   f"from {initial_stats['earliest_date']} to {initial_stats['latest_date']}")
        
        results = {
            'initial_records': initial_stats['total_records'],
            'removed_zero_records': 0,
            'interpolated_records': 0,
            'final_records': 0,
            'synthetic_records': 0
        }
        
        # Step 1: Remove zero storage records
        if remove_zeros:
            results['removed_zero_records'] = self.remove_zero_storage_records()
        
        # Step 2: Interpolate missing dates
        if interpolate_missing:
            missing_dates = self.find_missing_dates()
            results['interpolated_records'] = self.insert_interpolated_records(missing_dates)
        
        # Final summary
        final_stats = self.get_cleanup_summary()
        results['final_records'] = final_stats['total_records']
        results['synthetic_records'] = final_stats['synthetic_records']
        
        logger.info("🎉 Database cleanup completed!")
        logger.info(f"   📊 Final state: {final_stats['total_records']} total records")
        logger.info(f"   📊 Original records: {final_stats['original_records']}")
        logger.info(f"   📊 Synthetic records: {final_stats['synthetic_records']}")
        logger.info(f"   📊 Date range: {final_stats['earliest_date']} to {final_stats['latest_date']}")
        
        return results


def main():
    """Main function for standalone execution"""
    db_path = os.path.join(os.path.dirname(__file__), "cutzamala.db")
    
    if not os.path.exists(db_path):
        print(f"❌ Database not found: {db_path}")
        sys.exit(1)
    
    print("🧹 Cutzamala Database Cleanup Utility")
    print(f"📊 Database: {db_path}")
    print()
    
    try:
        cleaner = DatabaseCleaner(db_path)
        results = cleaner.cleanup_database()
        
        print("\n📈 Cleanup Summary:")
        print(f"   • Initial records: {results['initial_records']}")
        print(f"   • Removed zero-storage records: {results['removed_zero_records']}")
        print(f"   • Added interpolated records: {results['interpolated_records']}")
        print(f"   • Final records: {results['final_records']}")
        print(f"   • Synthetic records: {results['synthetic_records']}")
        
    except Exception as e:
        logger.error(f"Cleanup failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()