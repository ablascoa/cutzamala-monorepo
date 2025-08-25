#!/usr/bin/env python3
"""
Migration script to transfer data from SQLite to PostgreSQL.

This script reads data from the existing SQLite database and migrates it to PostgreSQL.
"""

import sqlite3
import psycopg2
import os
import sys
from typing import List, Tuple
import logging

# Add the backend directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from src.database.postgres_connection import PostgreSQLManager
from src.api.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def get_sqlite_data(sqlite_path: str) -> List[Tuple]:
    """Extract all data from SQLite database"""
    logger.info(f"Reading data from SQLite database: {sqlite_path}")
    
    if not os.path.exists(sqlite_path):
        raise FileNotFoundError(f"SQLite database not found: {sqlite_path}")
    
    conn = sqlite3.connect(sqlite_path)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    
    # Get all data from cutzamala_readings table
    cursor.execute("SELECT * FROM cutzamala_readings ORDER BY date")
    rows = cursor.fetchall()
    
    # Convert to list of tuples for bulk insert
    data = []
    for row in rows:
        # Skip the id column (first column) as PostgreSQL will generate new IDs
        # Convert SQLite row to proper types for PostgreSQL
        row_data = list(row[1:])  # Skip id column
        
        # Convert the is_synthetic column (last column) from integer to boolean
        # Row structure: date, year, month, month_name, day, valle_bravo_mm3, valle_bravo_pct, valle_bravo_lluvia,
        # villa_victoria_mm3, villa_victoria_pct, villa_victoria_lluvia, el_bosque_mm3, el_bosque_pct, el_bosque_lluvia,
        # total_mm3, total_pct, source_pdf, created_at, updated_at, is_synthetic
        if len(row_data) >= 20:  # Make sure we have the is_synthetic column
            row_data[19] = bool(row_data[19])  # Convert 0/1 to False/True (is_synthetic is at index 19)
        
        data.append(tuple(row_data))
    
    conn.close()
    logger.info(f"Extracted {len(data)} records from SQLite")
    return data


def migrate_data(sqlite_path: str, postgres_url: str):
    """Migrate data from SQLite to PostgreSQL"""
    try:
        # Get data from SQLite
        sqlite_data = get_sqlite_data(sqlite_path)
        
        if not sqlite_data:
            logger.warning("No data found in SQLite database")
            return
        
        # Initialize PostgreSQL
        logger.info("Connecting to PostgreSQL...")
        pg_manager = PostgreSQLManager(postgres_url)
        
        # Clear existing data (optional - comment out if you want to preserve existing data)
        logger.info("Clearing existing PostgreSQL data...")
        pg_manager.execute_query("DELETE FROM cutzamala_readings")
        
        # Insert data into PostgreSQL
        logger.info("Inserting data into PostgreSQL...")
        insert_query = """
        INSERT INTO cutzamala_readings (
            date, year, month, month_name, day,
            valle_bravo_mm3, valle_bravo_pct, valle_bravo_lluvia,
            villa_victoria_mm3, villa_victoria_pct, villa_victoria_lluvia,
            el_bosque_mm3, el_bosque_pct, el_bosque_lluvia,
            total_mm3, total_pct, source_pdf,
            created_at, updated_at, is_synthetic
        ) VALUES (
            %s, %s, %s, %s, %s,
            %s, %s, %s,
            %s, %s, %s,
            %s, %s, %s,
            %s, %s, %s,
            %s, %s, %s
        )
        """
        
        rows_inserted = pg_manager.execute_many(insert_query, sqlite_data)
        
        logger.info(f"Successfully migrated {rows_inserted} records to PostgreSQL")
        
        # Verify migration
        count = pg_manager.get_row_count()
        logger.info(f"PostgreSQL now contains {count} records")
        
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        raise


def main():
    """Main migration function"""
    # Default paths
    sqlite_path = os.path.join(os.path.dirname(__file__), "..", "..", "data", "cutzamala.db")
    postgres_url = settings.DATABASE_URL
    
    # Parse command line arguments
    if len(sys.argv) > 1:
        sqlite_path = sys.argv[1]
    if len(sys.argv) > 2:
        postgres_url = sys.argv[2]
    
    logger.info("Starting migration from SQLite to PostgreSQL")
    logger.info(f"Source SQLite: {sqlite_path}")
    logger.info(f"Target PostgreSQL: {postgres_url}")
    
    try:
        migrate_data(sqlite_path, postgres_url)
        logger.info("Migration completed successfully!")
        
    except Exception as e:
        logger.error(f"Migration failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()