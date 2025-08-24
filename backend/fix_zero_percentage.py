#!/usr/bin/env python3
"""
Fix individual zero percentage values by interpolating from surrounding records.
"""

import sqlite3
import sys
import os
from datetime import datetime, date

def interpolate_zero_percentage(db_path, target_date, reservoir):
    """Interpolate a zero percentage value for a specific date and reservoir"""
    
    if not os.path.exists(db_path):
        print(f"Error: Database file not found: {db_path}")
        return False
    
    try:
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check the current record
        cursor.execute(f"""
            SELECT date, {reservoir}_mm3, {reservoir}_pct, source_pdf
            FROM cutzamala_readings 
            WHERE date = ?
        """, (target_date,))
        
        current_record = cursor.fetchone()
        if not current_record:
            print(f"No record found for date: {target_date}")
            conn.close()
            return False
        
        current_storage = current_record[1]
        current_pct = current_record[2]
        
        print(f"Current record for {target_date}:")
        print(f"  {reservoir} storage: {current_storage} mm³")
        print(f"  {reservoir} percentage: {current_pct}%")
        
        if current_pct != 0.0:
            print(f"  Percentage is not zero ({current_pct}%), no interpolation needed")
            conn.close()
            return False
        
        # Find the closest previous and next records with non-zero percentages
        cursor.execute(f"""
            SELECT date, {reservoir}_pct
            FROM cutzamala_readings 
            WHERE date < ? AND {reservoir}_pct > 0
            ORDER BY date DESC 
            LIMIT 1
        """, (target_date,))
        prev_record = cursor.fetchone()
        
        cursor.execute(f"""
            SELECT date, {reservoir}_pct
            FROM cutzamala_readings 
            WHERE date > ? AND {reservoir}_pct > 0
            ORDER BY date ASC 
            LIMIT 1
        """, (target_date,))
        next_record = cursor.fetchone()
        
        if not prev_record or not next_record:
            print(f"Cannot interpolate: insufficient surrounding data")
            print(f"  Previous record: {prev_record}")
            print(f"  Next record: {next_record}")
            conn.close()
            return False
        
        # Calculate interpolation weights
        prev_date = datetime.strptime(prev_record[0], '%Y-%m-%d').date()
        next_date = datetime.strptime(next_record[0], '%Y-%m-%d').date()
        target_date_obj = datetime.strptime(target_date, '%Y-%m-%d').date()
        
        total_days = (next_date - prev_date).days
        days_from_prev = (target_date_obj - prev_date).days
        
        if total_days == 0:
            weight = 0.5
        else:
            weight = days_from_prev / total_days
        
        # Interpolate percentage
        prev_pct = prev_record[1]
        next_pct = next_record[1]
        interpolated_pct = prev_pct + (next_pct - prev_pct) * weight
        
        print(f"\nInterpolation details:")
        print(f"  Previous: {prev_date} -> {prev_pct}%")
        print(f"  Next: {next_date} -> {next_pct}%")
        print(f"  Weight: {weight:.3f}")
        print(f"  Interpolated percentage: {interpolated_pct:.2f}%")
        
        # Update the record
        cursor.execute(f"""
            UPDATE cutzamala_readings 
            SET {reservoir}_pct = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE date = ?
        """, (interpolated_pct, target_date))
        
        updated_count = cursor.rowcount
        conn.commit()
        
        if updated_count > 0:
            print(f"\n✅ Successfully updated {reservoir}_pct for {target_date}")
            print(f"   New value: {interpolated_pct:.2f}%")
        else:
            print(f"\n❌ Failed to update record")
        
        conn.close()
        return updated_count > 0
        
    except Exception as e:
        print(f"Error fixing percentage: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return False

def find_zero_percentages(db_path):
    """Find all records with zero percentage values"""
    
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Find records with zero percentages
        cursor.execute("""
            SELECT date, 
                   CASE WHEN valle_bravo_pct = 0 THEN 'valle_bravo' ELSE NULL END as vb_zero,
                   CASE WHEN villa_victoria_pct = 0 THEN 'villa_victoria' ELSE NULL END as vv_zero,
                   CASE WHEN el_bosque_pct = 0 THEN 'el_bosque' ELSE NULL END as eb_zero,
                   valle_bravo_pct, villa_victoria_pct, el_bosque_pct
            FROM cutzamala_readings 
            WHERE valle_bravo_pct = 0 OR villa_victoria_pct = 0 OR el_bosque_pct = 0
            ORDER BY date
        """)
        
        results = cursor.fetchall()
        conn.close()
        
        print(f"Found {len(results)} records with zero percentage values:")
        for row in results:
            date_val, vb_zero, vv_zero, eb_zero, vb_pct, vv_pct, eb_pct = row
            zero_reservoirs = [r for r in [vb_zero, vv_zero, eb_zero] if r]
            print(f"  {date_val}: {', '.join(zero_reservoirs)} -> VB:{vb_pct}%, VV:{vv_pct}%, EB:{eb_pct}%")
        
        return results
        
    except Exception as e:
        print(f"Error finding zero percentages: {e}")
        return []

if __name__ == "__main__":
    # Use the database in the backend directory
    db_path = os.path.join(os.path.dirname(__file__), "cutzamala.db")
    
    print("🔧 Fixing zero percentage values in cutzamala.db")
    print(f"📊 Database: {db_path}")
    
    if len(sys.argv) == 3:
        # Fix specific record: python fix_zero_percentage.py 2017-02-21 valle_bravo
        target_date = sys.argv[1]
        reservoir = sys.argv[2]
        
        success = interpolate_zero_percentage(db_path, target_date, reservoir)
        
        if success:
            print("\n🎉 Percentage fix completed successfully!")
        else:
            print("\n❌ Percentage fix failed!")
            sys.exit(1)
    else:
        # Find all zero percentage records
        print("\n🔍 Scanning for zero percentage values...")
        results = find_zero_percentages(db_path)
        
        if results:
            print(f"\nTo fix a specific record, run:")
            print(f"python fix_zero_percentage.py <date> <reservoir>")
            print(f"Example: python fix_zero_percentage.py 2017-02-21 valle_bravo")
        else:
            print("\n✅ No zero percentage values found!")