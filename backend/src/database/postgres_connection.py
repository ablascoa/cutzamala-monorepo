import os
from contextlib import contextmanager
from typing import Generator, List, Dict, Any
import logging
import psycopg2
from psycopg2.extras import RealDictCursor
from psycopg2 import sql

logger = logging.getLogger(__name__)


class PostgreSQLManager:
    def __init__(self, database_url: str = None):
        if database_url is None:
            # Build from environment variables
            self.database_url = os.getenv(
                "DATABASE_URL",
                "postgresql://postgres:password@localhost:5432/cutzamala"
            )
        else:
            self.database_url = database_url
        
        self._ensure_database_exists()

    def _ensure_database_exists(self):
        """Create database and tables if they don't exist"""
        try:
            # First, check if we can connect to the database
            with self.get_connection() as conn:
                with conn.cursor() as cursor:
                    cursor.execute("""
                        SELECT EXISTS (
                            SELECT FROM information_schema.tables 
                            WHERE table_name = 'cutzamala_readings'
                        )
                    """)
                    result = cursor.fetchone()
                    table_exists = result[0] if isinstance(result, tuple) else result['exists']
                    
                    if not table_exists:
                        logger.info("Tables don't exist, creating schema")
                        self._create_schema(conn)
                    else:
                        logger.info("Database tables already exist")
                        
        except psycopg2.OperationalError as e:
            logger.error(f"Cannot connect to database: {e}")
            raise
        except Exception as e:
            logger.error(f"Failed to initialize database: {e}")
            import traceback
            logger.error(f"Full traceback: {traceback.format_exc()}")
            raise

    def _create_schema(self, conn):
        """Create the database schema"""
        schema_sql = """
        -- Cutzamala Water Storage Database Schema (PostgreSQL version)
        
        DROP TABLE IF EXISTS cutzamala_readings CASCADE;
        
        CREATE TABLE cutzamala_readings (
            id SERIAL PRIMARY KEY,
            date DATE NOT NULL UNIQUE,
            year INTEGER NOT NULL,
            month INTEGER NOT NULL,
            month_name VARCHAR(20) NOT NULL,
            day INTEGER NOT NULL,
            
            -- Valle de Bravo reservoir data
            valle_bravo_mm3 REAL DEFAULT 0.0,
            valle_bravo_pct REAL DEFAULT 0.0,
            valle_bravo_lluvia REAL DEFAULT 0.0,
            
            -- Villa Victoria reservoir data
            villa_victoria_mm3 REAL DEFAULT 0.0,
            villa_victoria_pct REAL DEFAULT 0.0,
            villa_victoria_lluvia REAL DEFAULT 0.0,
            
            -- El Bosque reservoir data
            el_bosque_mm3 REAL DEFAULT 0.0,
            el_bosque_pct REAL DEFAULT 0.0,
            el_bosque_lluvia REAL DEFAULT 0.0,
            
            -- System totals
            total_mm3 INTEGER DEFAULT 0,
            total_pct REAL DEFAULT 0.0,
            
            -- Metadata
            source_pdf VARCHAR(255),
            is_synthetic BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Create indexes for better query performance
        CREATE INDEX idx_cutzamala_date ON cutzamala_readings(date);
        CREATE INDEX idx_cutzamala_year_month ON cutzamala_readings(year, month);
        CREATE INDEX idx_cutzamala_year ON cutzamala_readings(year);
        
        -- Function to update updated_at timestamp
        CREATE OR REPLACE FUNCTION update_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ language 'plpgsql';
        
        -- Trigger to update updated_at timestamp
        CREATE TRIGGER update_cutzamala_updated_at
            BEFORE UPDATE ON cutzamala_readings
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at();
        """
        
        with conn.cursor() as cursor:
            cursor.execute(schema_sql)
        conn.commit()
        logger.info("PostgreSQL schema created successfully")

    @contextmanager
    def get_connection(self) -> Generator[psycopg2.extensions.connection, None, None]:
        """Context manager for database connections"""
        conn = None
        try:
            conn = psycopg2.connect(
                self.database_url,
                cursor_factory=RealDictCursor
            )
            yield conn
        except Exception as e:
            if conn:
                conn.rollback()
            logger.error(f"Database error: {e}")
            raise
        finally:
            if conn:
                conn.close()

    def execute_query(self, query: str, params: tuple = None) -> List[Dict[str, Any]]:
        """Execute a query and return results"""
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                if params:
                    cursor.execute(query, params)
                else:
                    cursor.execute(query)
                
                # Handle queries that don't return results (INSERT, UPDATE, DELETE)
                try:
                    results = cursor.fetchall()
                    # Convert RealDictRow to regular dict
                    return [dict(row) for row in results]
                except psycopg2.ProgrammingError:
                    # No results to fetch (e.g., INSERT, UPDATE, DELETE)
                    conn.commit()
                    return []

    def execute_many(self, query: str, params_list: list) -> int:
        """Execute a query with multiple parameter sets"""
        with self.get_connection() as conn:
            with conn.cursor() as cursor:
                cursor.executemany(query, params_list)
                conn.commit()
                return cursor.rowcount

    def get_table_info(self, table_name: str = "cutzamala_readings") -> List[Dict[str, Any]]:
        """Get information about table structure"""
        query = """
        SELECT 
            column_name,
            data_type,
            is_nullable,
            column_default
        FROM information_schema.columns 
        WHERE table_name = %s
        ORDER BY ordinal_position
        """
        return self.execute_query(query, (table_name,))

    def get_row_count(self, table_name: str = "cutzamala_readings") -> int:
        """Get the number of rows in a table"""
        query = f"SELECT COUNT(*) as count FROM {table_name}"
        result = self.execute_query(query)
        return result[0]['count'] if result else 0