import sqlite3
import os
from contextlib import contextmanager
from typing import Generator
import logging

logger = logging.getLogger(__name__)


class DatabaseManager:
    def __init__(self, db_path: str = None):
        if db_path is None:
            db_path = os.path.join(os.path.dirname(__file__), "cutzamala.db")
        self.db_path = db_path
        self._ensure_database_exists()

    def _ensure_database_exists(self):
        """Create database and tables if they don't exist"""
        try:
            # Only create schema if database doesn't exist or tables are missing
            needs_schema = False
            
            if not os.path.exists(self.db_path):
                needs_schema = True
                logger.info(f"Database file doesn't exist, will create: {self.db_path}")
            else:
                # Check if tables exist
                with self.get_connection() as conn:
                    cursor = conn.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='cutzamala_readings'")
                    if not cursor.fetchone():
                        needs_schema = True
                        logger.info("Database exists but tables are missing, will create schema")
                    else:
                        logger.info(f"Using existing database at {self.db_path}")
                        return  # Database already exists with tables
            
            if needs_schema:
                with self.get_connection() as conn:
                    # Read and execute schema
                    schema_path = os.path.join(os.path.dirname(__file__), "schema.sql")
                    if os.path.exists(schema_path):
                        with open(schema_path, 'r') as f:
                            schema_sql = f.read()
                        
                        # Execute the entire schema as one script
                        conn.executescript(schema_sql)
                        
                        conn.commit()
                        logger.info(f"Database schema created at {self.db_path}")
                    else:
                        logger.warning(f"Schema file not found at {schema_path}")
        except Exception as e:
            logger.error(f"Failed to initialize database: {e}")
            raise

    @contextmanager
    def get_connection(self) -> Generator[sqlite3.Connection, None, None]:
        """Context manager for database connections"""
        conn = None
        try:
            conn = sqlite3.connect(self.db_path)
            conn.row_factory = sqlite3.Row  # Enable column access by name
            yield conn
        except Exception as e:
            if conn:
                conn.rollback()
            logger.error(f"Database error: {e}")
            raise
        finally:
            if conn:
                conn.close()

    def execute_query(self, query: str, params: tuple = None):
        """Execute a query and return results"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            return cursor.fetchall()

    def execute_many(self, query: str, params_list: list):
        """Execute a query with multiple parameter sets"""
        with self.get_connection() as conn:
            cursor = conn.cursor()
            cursor.executemany(query, params_list)
            conn.commit()
            return cursor.rowcount

    def get_table_info(self, table_name: str = "cutzamala_readings"):
        """Get information about table structure"""
        query = f"PRAGMA table_info({table_name})"
        return self.execute_query(query)

    def get_row_count(self, table_name: str = "cutzamala_readings"):
        """Get the number of rows in a table"""
        query = f"SELECT COUNT(*) as count FROM {table_name}"
        result = self.execute_query(query)
        return result[0]['count'] if result else 0