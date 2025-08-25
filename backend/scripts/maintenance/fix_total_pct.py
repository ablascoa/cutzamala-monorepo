#!/usr/bin/env python3
"""
Fix total_pct values that are zero by interpolating from surrounding valid values.
"""

import sqlite3
import sys
import os
from datetime import datetime, date, timedelta

def fix_zero_total_pct_range(db_path, start_date, end_date):
    """Fix a range of zero total_pct values by interpolating"""
    
    if not os.path.exists(db_path):
        print(f"Error: Database file not found: {db_path}")
        return False
    
    try:
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Find records in the range with zero total_pct
        cursor.execute("""
            SELECT date, total_pct, valle_bravo_pct, villa_victoria_pct, el_bosque_pct
            FROM cutzamala_readings 
            WHERE date BETWEEN ? AND ? AND total_pct = 0.0
            ORDER BY date
        """, (start_date, end_date))
        
        zero_records = cursor.fetchall()
        
        if not zero_records:
            print(f"No zero total_pct records found between {start_date} and {end_date}")
            conn.close()
            return False
        
        print(f"Found {len(zero_records)} records with zero total_pct between {start_date} and {end_date}")
        
        # Find the closest previous valid total_pct
        cursor.execute("""
            SELECT date, total_pct
            FROM cutzamala_readings 
            WHERE date < ? AND total_pct > 0
            ORDER BY date DESC 
            LIMIT 1
        """, (start_date,))
        prev_record = cursor.fetchone()
        
        # Find the closest next valid total_pct  
        cursor.execute("""
            SELECT date, total_pct
            FROM cutzamala_readings 
            WHERE date > ? AND total_pct > 0
            ORDER BY date ASC 
            LIMIT 1
        """, (end_date,))
        next_record = cursor.fetchone()
        
        if not prev_record or not next_record:
            print(f"Cannot interpolate: insufficient surrounding data")
            print(f"  Previous record: {prev_record}")
            print(f"  Next record: {next_record}")
            conn.close()
            return False
        
        prev_date = datetime.strptime(prev_record[0], '%Y-%m-%d').date()
        next_date = datetime.strptime(next_record[0], '%Y-%m-%d').date()
        prev_pct = prev_record[1]
        next_pct = next_record[1]
        
        print(f"\nInterpolation anchors:")
        print(f"  Previous: {prev_date} -> {prev_pct}%")
        print(f"  Next: {next_date} -> {next_pct}%")
        
        total_span_days = (next_date - prev_date).days
        
        # Update each zero record
        updated_count = 0
        
        for record in zero_records:
            record_date = datetime.strptime(record[0], '%Y-%m-%d').date()
            days_from_prev = (record_date - prev_date).days
            
            if total_span_days == 0:
                weight = 0.5
            else:
                weight = days_from_prev / total_span_days
            
            # Linear interpolation
            interpolated_pct = prev_pct + (next_pct - prev_pct) * weight
            
            # Update the record
            cursor.execute("""
                UPDATE cutzamala_readings 
                SET total_pct = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE date = ?
            """, (interpolated_pct, record[0]))
            
            updated_count += cursor.rowcount
            
            if updated_count <= 5:  # Show first few examples
                print(f"  {record[0]}: {interpolated_pct:.2f}% (weight: {weight:.3f})")
        
        conn.commit()
        
        if updated_count > 5:
            print(f"  ... and {updated_count - 5} more records")
        
        print(f"\n✅ Successfully updated {updated_count} total_pct values")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"Error fixing total_pct: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return False

def find_zero_total_pct_ranges(db_path):
    """Find ranges of consecutive zero total_pct values"""
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Find all records with zero total_pct
        cursor.execute("""
            SELECT date, total_pct
            FROM cutzamala_readings 
            WHERE total_pct = 0.0
            ORDER BY date
        """)
        
        results = cursor.fetchall()
        conn.close()
        
        if not results:
            print("✅ No zero total_pct values found!")
            return []
        
        print(f"Found {len(results)} records with zero total_pct:")
        
        # Group consecutive dates
        ranges = []
        current_range_start = None
        current_range_end = None
        
        for i, (date_str, _) in enumerate(results):
            record_date = datetime.strptime(date_str, '%Y-%m-%d').date()
            
            if current_range_start is None:
                current_range_start = record_date
                current_range_end = record_date
            else:
                # Check if this date is consecutive
                expected_next = current_range_end + timedelta(days=1)
                if record_date == expected_next:
                    current_range_end = record_date
                else:
                    # End current range, start new one
                    ranges.append((current_range_start, current_range_end))
                    current_range_start = record_date
                    current_range_end = record_date
        
        # Add the last range
        if current_range_start is not None:
            ranges.append((current_range_start, current_range_end))
        
        print(f"\nFound {len(ranges)} consecutive range(s):")
        for i, (start, end) in enumerate(ranges, 1):
            days = (end - start).days + 1
            print(f"  Range {i}: {start} to {end} ({days} days)")
        
        return ranges
        
    except Exception as e:
        print(f"Error finding zero total_pct ranges: {e}")
        return []

if __name__ == "__main__":
    # Use the database in the data directory
    db_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "cutzamala.db")
    
    print("🔧 Fixing zero total_pct values in cutzamala.db")
    print(f"📊 Database: {db_path}")
    
    if len(sys.argv) == 3:
        # Fix specific range: python fix_total_pct.py 2021-01-01 2021-01-31
        start_date = sys.argv[1]
        end_date = sys.argv[2]
        
        success = fix_zero_total_pct_range(db_path, start_date, end_date)
        
        if success:
            print("\n🎉 Total percentage fix completed successfully!")
        else:
            print("\n❌ Total percentage fix failed!")
            sys.exit(1)
    else:
        # Find all zero total_pct ranges
        print("\n🔍 Scanning for zero total_pct values...")
        ranges = find_zero_total_pct_ranges(db_path)
        
        if ranges:
            print(f"\nTo fix a specific range, run:")
            print(f"python fix_total_pct.py <start_date> <end_date>")
            print(f"Example: python fix_total_pct.py 2021-01-01 2021-01-31")
        else:
            print("\n✅ No zero total_pct values found!")