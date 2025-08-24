#!/usr/bin/env python3
"""
Fix total_mm3 values in the database by recalculating from individual reservoir values.
"""

import sqlite3
import sys
import os

def fix_total_mm3(db_path):
    """Fix total_mm3 values by recalculating from individual reservoirs"""
    
    if not os.path.exists(db_path):
        print(f"Error: Database file not found: {db_path}")
        return False
    
    try:
        # Connect to database
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # First, check how many records need fixing
        cursor.execute("""
            SELECT COUNT(*) as count
            FROM cutzamala_readings 
            WHERE ABS((valle_bravo_mm3 + villa_victoria_mm3 + el_bosque_mm3) - total_mm3) > 0.1
        """)
        problematic_count = cursor.fetchone()[0]
        
        print(f"Found {problematic_count} records with incorrect total_mm3 values")
        
        if problematic_count == 0:
            print("No records need fixing!")
            conn.close()
            return True
        
        # Show a few examples before fixing
        print("\nExamples of problematic records:")
        cursor.execute("""
            SELECT 
                date,
                valle_bravo_mm3,
                villa_victoria_mm3,
                el_bosque_mm3,
                valle_bravo_mm3 + villa_victoria_mm3 + el_bosque_mm3 as calculated_total,
                total_mm3,
                ABS((valle_bravo_mm3 + villa_victoria_mm3 + el_bosque_mm3) - total_mm3) as difference
            FROM cutzamala_readings 
            WHERE ABS((valle_bravo_mm3 + villa_victoria_mm3 + el_bosque_mm3) - total_mm3) > 0.1
            ORDER BY difference DESC
            LIMIT 3
        """)
        
        for row in cursor.fetchall():
            print(f"  {row[0]}: {row[1]:.3f} + {row[2]:.3f} + {row[3]:.3f} = {row[4]:.3f} (was {row[5]:.0f})")
        
        # Auto-proceed (running in non-interactive environment)
        print(f"\nProceeding to fix {problematic_count} records...")
        
        # Update all records to use calculated totals
        cursor.execute("""
            UPDATE cutzamala_readings 
            SET total_mm3 = valle_bravo_mm3 + villa_victoria_mm3 + el_bosque_mm3,
                updated_at = CURRENT_TIMESTAMP
            WHERE ABS((valle_bravo_mm3 + villa_victoria_mm3 + el_bosque_mm3) - total_mm3) > 0.1
        """)
        
        updated_count = cursor.rowcount
        conn.commit()
        
        # Verify the fix
        cursor.execute("""
            SELECT COUNT(*) as count
            FROM cutzamala_readings 
            WHERE ABS((valle_bravo_mm3 + villa_victoria_mm3 + el_bosque_mm3) - total_mm3) > 0.1
        """)
        remaining_count = cursor.fetchone()[0]
        
        print(f"\n✅ Successfully updated {updated_count} records")
        print(f"✅ Remaining problematic records: {remaining_count}")
        
        # Show some examples of fixed records
        print("\nExamples of fixed records:")
        cursor.execute("""
            SELECT 
                date,
                valle_bravo_mm3,
                villa_victoria_mm3,
                el_bosque_mm3,
                total_mm3
            FROM cutzamala_readings 
            WHERE date BETWEEN '2018-11-08' AND '2018-11-15'
            ORDER BY date
            LIMIT 5
        """)
        
        for row in cursor.fetchall():
            print(f"  {row[0]}: {row[1]:.3f} + {row[2]:.3f} + {row[3]:.3f} = {row[4]:.3f}")
        
        conn.close()
        return True
        
    except Exception as e:
        print(f"Error fixing database: {e}")
        if 'conn' in locals():
            conn.rollback()
            conn.close()
        return False

if __name__ == "__main__":
    # Use the database in the backend directory
    db_path = os.path.join(os.path.dirname(__file__), "cutzamala.db")
    
    print("🔧 Fixing total_mm3 calculation errors in cutzamala.db")
    print(f"📊 Database: {db_path}")
    
    success = fix_total_mm3(db_path)
    
    if success:
        print("\n🎉 Database fix completed successfully!")
    else:
        print("\n❌ Database fix failed!")
        sys.exit(1)