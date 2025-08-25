import logging
from typing import List, Dict, Optional, Tuple
from datetime import date
import sys
import os

# Add src to path to import our modules
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '../..'))

from src.database.connection import DatabaseManager
from src.database.postgres_connection import PostgreSQLManager
from ..utils.error_handlers import CutzamalaAPIException
from ..config import settings

logger = logging.getLogger(__name__)


class DatabaseDataService:
    """Data service that supports both PostgreSQL and SQLite databases"""
    
    def __init__(self, db_path: str = None):
        if settings.USE_SQLITE:
            # Use SQLite
            if db_path is None:
                current_dir = os.path.dirname(os.path.abspath(__file__))
                db_path = os.path.join(current_dir, "..", "..", "data", "cutzamala.db")
                db_path = os.path.abspath(db_path)
            self.db_manager = DatabaseManager(db_path)
            self.param_placeholder = "?"
        else:
            # Use PostgreSQL
            self.db_manager = PostgreSQLManager(settings.DATABASE_URL)
            self.param_placeholder = "%s"
        
        self._verify_database()
    
    def _verify_database(self):
        """Verify that the database exists and has data"""
        try:
            count = self.db_manager.get_row_count()
            if count == 0:
                raise CutzamalaAPIException(
                    status_code=500,
                    error="Database is empty",
                    code="DATABASE_EMPTY",
                    details="No data found in the database. Please run the migration script first."
                )
            logger.info(f"Database verified with {count} records")
        except Exception as e:
            logger.error(f"Database verification failed: {e}")
            raise CutzamalaAPIException(
                status_code=500,
                error="Database not available",
                code="DATABASE_ERROR",
                details=str(e)
            )
    
    def get_filtered_data(
        self, 
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        reservoirs: Optional[List[str]] = None,
        order: str = "desc",
        limit: Optional[int] = None,
        offset: Optional[int] = 0
    ) -> List[Dict]:
        """Get filtered data from database"""
        try:
            # Build the base query
            query_parts = []
            params = []
            
            # Base SELECT
            base_query = """
            SELECT 
                date, year, month, month_name, day,
                valle_bravo_mm3, valle_bravo_pct, valle_bravo_lluvia,
                villa_victoria_mm3, villa_victoria_pct, villa_victoria_lluvia,
                el_bosque_mm3, el_bosque_pct, el_bosque_lluvia,
                total_mm3, total_pct, source_pdf
            FROM cutzamala_readings
            """
            query_parts.append(base_query)
            
            # Add WHERE conditions
            where_conditions = []
            
            if start_date:
                where_conditions.append(f"date >= {self.param_placeholder}")
                params.append(start_date.isoformat())
            
            if end_date:
                where_conditions.append(f"date <= {self.param_placeholder}")
                params.append(end_date.isoformat())
            
            # Note: Reservoir filtering is handled differently than CSV version
            # since we're selecting specific columns based on the reservoir names
            
            if where_conditions:
                query_parts.append("WHERE " + " AND ".join(where_conditions))
            
            # Add ordering (validate order parameter for security)
            order_direction = "DESC" if order.lower() == "desc" else "ASC"
            query_parts.append(f"ORDER BY date {order_direction}")
            
            # Add pagination
            if limit:
                query_parts.append(f"LIMIT {self.param_placeholder}")
                params.append(limit)
                
                if offset:
                    query_parts.append(f"OFFSET {self.param_placeholder}")
                    params.append(offset)
            
            final_query = " ".join(query_parts)
            
            # Execute query
            results = self.db_manager.execute_query(final_query, tuple(params))
            
            # Convert results to list of dictionaries
            data = []
            for row in results:
                # Convert date object to string if needed (PostgreSQL returns date objects)
                date_val = row['date']
                if hasattr(date_val, 'isoformat'):
                    date_str = date_val.isoformat()
                else:
                    date_str = str(date_val)
                
                record = {
                    'date': date_str,
                    'year': row['year'],
                    'month': row['month'],
                    'month_name': row['month_name'],
                    'day': row['day'],
                    'valle_bravo_mm3': row['valle_bravo_mm3'],
                    'valle_bravo_pct': row['valle_bravo_pct'],
                    'valle_bravo_lluvia': row['valle_bravo_lluvia'],
                    'villa_victoria_mm3': row['villa_victoria_mm3'],
                    'villa_victoria_pct': row['villa_victoria_pct'],
                    'villa_victoria_lluvia': row['villa_victoria_lluvia'],
                    'el_bosque_mm3': row['el_bosque_mm3'],
                    'el_bosque_pct': row['el_bosque_pct'],
                    'el_bosque_lluvia': row['el_bosque_lluvia'],
                    'total_mm3': row['total_mm3'],
                    'total_pct': row['total_pct'],
                    'source_pdf': row['source_pdf']
                }
                data.append(record)
            
            # Apply reservoir filtering if specified
            if reservoirs:
                data = self._filter_by_reservoirs(data, reservoirs)
            
            logger.info(f"Retrieved {len(data)} filtered records from database")
            return data
            
        except CutzamalaAPIException:
            raise
        except Exception as e:
            logger.error(f"Failed to get filtered data: {e}")
            raise CutzamalaAPIException(
                status_code=500,
                error="Failed to retrieve data",
                code="DATABASE_QUERY_ERROR",
                details=str(e)
            )
    
    def _filter_by_reservoirs(self, data: List[Dict], reservoirs: List[str]) -> List[Dict]:
        """Filter data to include only specified reservoirs"""
        # This simulates the reservoir filtering by zeroing out non-requested reservoirs
        for record in data:
            if 'Valle de Bravo' not in reservoirs:
                record['valle_bravo_mm3'] = 0.0
                record['valle_bravo_pct'] = 0.0
                record['valle_bravo_lluvia'] = 0.0
            
            if 'Villa Victoria' not in reservoirs:
                record['villa_victoria_mm3'] = 0.0
                record['villa_victoria_pct'] = 0.0
                record['villa_victoria_lluvia'] = 0.0
            
            if 'El Bosque' not in reservoirs:
                record['el_bosque_mm3'] = 0.0
                record['el_bosque_pct'] = 0.0
                record['el_bosque_lluvia'] = 0.0
        
        return data
    
    def get_available_reservoirs(self) -> List[str]:
        """Get list of available reservoirs"""
        return ['Valle de Bravo', 'Villa Victoria', 'El Bosque']
    
    def get_date_range(self) -> Tuple[date, date]:
        """Get the date range of available data"""
        try:
            query = """
            SELECT 
                MIN(date) as min_date,
                MAX(date) as max_date
            FROM cutzamala_readings
            """
            result = self.db_manager.execute_query(query)
            
            if result and result[0]['min_date'] and result[0]['max_date']:
                # Handle both PostgreSQL (returns date objects) and SQLite (returns strings)
                from datetime import datetime, date
                min_date_val = result[0]['min_date']
                max_date_val = result[0]['max_date']
                
                if isinstance(min_date_val, str):
                    # SQLite returns strings
                    min_date = datetime.fromisoformat(min_date_val).date()
                    max_date = datetime.fromisoformat(max_date_val).date()
                else:
                    # PostgreSQL returns date objects
                    min_date = min_date_val
                    max_date = max_date_val
                
                return min_date, max_date
            else:
                return None, None
                
        except Exception as e:
            logger.error(f"Failed to get date range: {e}")
            return None, None
    
    def get_record_count(
        self,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        reservoirs: Optional[List[str]] = None
    ) -> int:
        """Get count of records matching the filter criteria"""
        try:
            query_parts = ["SELECT COUNT(*) as count FROM cutzamala_readings"]
            params = []
            where_conditions = []
            
            if start_date:
                where_conditions.append(f"date >= {self.param_placeholder}")
                params.append(start_date.isoformat())
            
            if end_date:
                where_conditions.append(f"date <= {self.param_placeholder}")
                params.append(end_date.isoformat())
            
            if where_conditions:
                query_parts.append("WHERE " + " AND ".join(where_conditions))
            
            final_query = " ".join(query_parts)
            result = self.db_manager.execute_query(final_query, tuple(params))
            
            return result[0]['count'] if result else 0
            
        except Exception as e:
            logger.error(f"Failed to get record count: {e}")
            return 0
    
    def insert_record(self, record: Dict) -> bool:
        """Insert a single record into the database"""
        try:
            insert_query = f"""
            INSERT INTO cutzamala_readings (
                date, year, month, month_name, day,
                valle_bravo_mm3, valle_bravo_pct, valle_bravo_lluvia,
                villa_victoria_mm3, villa_victoria_pct, villa_victoria_lluvia,
                el_bosque_mm3, el_bosque_pct, el_bosque_lluvia,
                total_mm3, total_pct, source_pdf, is_synthetic
            ) VALUES (
                {self.param_placeholder}, {self.param_placeholder}, {self.param_placeholder}, {self.param_placeholder}, {self.param_placeholder},
                {self.param_placeholder}, {self.param_placeholder}, {self.param_placeholder},
                {self.param_placeholder}, {self.param_placeholder}, {self.param_placeholder},
                {self.param_placeholder}, {self.param_placeholder}, {self.param_placeholder},
                {self.param_placeholder}, {self.param_placeholder}, {self.param_placeholder}, {self.param_placeholder}
            )
            """
            
            params = (
                record.get('date'),
                record.get('year'),
                record.get('month'), 
                record.get('month_name'),
                record.get('day'),
                record.get('valle_bravo_mm3', 0.0),
                record.get('valle_bravo_pct', 0.0),
                record.get('valle_bravo_lluvia', 0.0),
                record.get('villa_victoria_mm3', 0.0),
                record.get('villa_victoria_pct', 0.0),
                record.get('villa_victoria_lluvia', 0.0),
                record.get('el_bosque_mm3', 0.0),
                record.get('el_bosque_pct', 0.0),
                record.get('el_bosque_lluvia', 0.0),
                record.get('total_mm3', 0),
                record.get('total_pct', 0.0),
                record.get('source_pdf', ''),
                record.get('is_synthetic', False)
            )
            
            self.db_manager.execute_query(insert_query, params)
            logger.info(f"Inserted record for date: {record.get('date')}")
            return True
            
        except Exception as e:
            logger.error(f"Failed to insert record: {e}")
            return False
    
    def bulk_insert_records(self, records: List[Dict]) -> int:
        """Insert multiple records into the database"""
        if not records:
            return 0
            
        try:
            insert_query = f"""
            INSERT INTO cutzamala_readings (
                date, year, month, month_name, day,
                valle_bravo_mm3, valle_bravo_pct, valle_bravo_lluvia,
                villa_victoria_mm3, villa_victoria_pct, villa_victoria_lluvia,
                el_bosque_mm3, el_bosque_pct, el_bosque_lluvia,
                total_mm3, total_pct, source_pdf, is_synthetic
            ) VALUES (
                {self.param_placeholder}, {self.param_placeholder}, {self.param_placeholder}, {self.param_placeholder}, {self.param_placeholder},
                {self.param_placeholder}, {self.param_placeholder}, {self.param_placeholder},
                {self.param_placeholder}, {self.param_placeholder}, {self.param_placeholder},
                {self.param_placeholder}, {self.param_placeholder}, {self.param_placeholder},
                {self.param_placeholder}, {self.param_placeholder}, {self.param_placeholder}, {self.param_placeholder}
            )
            """
            
            params_list = []
            for record in records:
                params = (
                    record.get('date'),
                    record.get('year'),
                    record.get('month'), 
                    record.get('month_name'),
                    record.get('day'),
                    record.get('valle_bravo_mm3', 0.0),
                    record.get('valle_bravo_pct', 0.0),
                    record.get('valle_bravo_lluvia', 0.0),
                    record.get('villa_victoria_mm3', 0.0),
                    record.get('villa_victoria_pct', 0.0),
                    record.get('villa_victoria_lluvia', 0.0),
                    record.get('el_bosque_mm3', 0.0),
                    record.get('el_bosque_pct', 0.0),
                    record.get('el_bosque_lluvia', 0.0),
                    record.get('total_mm3', 0),
                    record.get('total_pct', 0.0),
                    record.get('source_pdf', ''),
                    record.get('is_synthetic', False)
                )
                params_list.append(params)
            
            rows_inserted = self.db_manager.execute_many(insert_query, params_list)
            logger.info(f"Bulk inserted {rows_inserted} records")
            return rows_inserted
            
        except Exception as e:
            logger.error(f"Failed to bulk insert records: {e}")
            return 0