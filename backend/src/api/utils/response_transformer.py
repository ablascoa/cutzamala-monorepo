"""
Response transformation utilities for converting internal data structures
to frontend-compatible formats.
"""
from typing import List, Dict, Any, Optional
from ..models.response import (
    CutzamalaResponse, 
    CutzamalaMetadata, 
    CutzamalaPagination,
    DateRange,
    ReadingRecord
)

# Mapping from internal reservoir names to frontend format
RESERVOIR_NAME_MAPPING = {
    "Valle de Bravo": "valle_bravo",
    "Villa Victoria": "villa_victoria", 
    "El Bosque": "el_bosque"
}

def transform_reservoir_names(reservoirs: Dict[str, Any]) -> Dict[str, Any]:
    """
    Transform reservoir names from internal format to frontend format.
    
    Args:
        reservoirs: Dictionary with internal reservoir names as keys
        
    Returns:
        Dictionary with frontend-compatible reservoir names as keys
    """
    transformed = {}
    for internal_name, data in reservoirs.items():
        frontend_name = RESERVOIR_NAME_MAPPING.get(internal_name, internal_name.lower().replace(" ", "_"))
        transformed[frontend_name] = data
    return transformed

def transform_reading_record(record: Dict[str, Any]) -> Dict[str, Any]:
    """
    Transform a single reading record to frontend format.
    
    Args:
        record: Dictionary with internal format
        
    Returns:
        Dictionary with frontend-compatible format
    """
    # Transform reservoir names
    transformed_reservoirs = transform_reservoir_names(record["reservoirs"])
    
    # Create a new record with transformed data
    return {
        "date": record["date"],
        "year": record["year"],
        "month": record["month"],
        "month_name": record["month_name"],
        "day": record["day"],
        "reservoirs": transformed_reservoirs,
        "system_totals": {
            "total_mm3": float(record["system_totals"]["total_mm3"]),  # Ensure float
            "total_percentage": record["system_totals"]["total_percentage"]
        },
        "source_pdf": record["source_pdf"]
    }

def create_frontend_response(
    records: List[Dict[str, Any]],
    total_records: int,
    filtered_records: int,
    granularity: str,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    reservoirs_included: Optional[List[str]] = None,
    limit: int = 1000,
    offset: int = 0
) -> CutzamalaResponse:
    """
    Create a frontend-compatible response from internal data.
    
    Args:
        records: List of ReadingRecord objects
        total_records: Total number of records available
        filtered_records: Number of records after filtering
        granularity: Data granularity (daily, weekly, monthly, yearly)
        start_date: Start date of the query
        end_date: End date of the query  
        reservoirs_included: List of reservoirs included in the query
        limit: Maximum number of records requested
        offset: Number of records to skip
        
    Returns:
        CutzamalaResponse object ready for frontend consumption
    """
    # Transform all reading records
    transformed_records = [transform_reading_record(record) for record in records]
    
    # Calculate pagination info
    has_next = offset + len(transformed_records) < filtered_records
    has_previous = offset > 0
    
    # Determine date range from data if not provided
    if not start_date or not end_date:
        if transformed_records:
            dates = []
            for record in transformed_records:
                date_val = record["date"]
                # Convert date objects to strings if needed
                if hasattr(date_val, 'isoformat'):
                    dates.append(date_val.isoformat())
                else:
                    dates.append(str(date_val))
            dates.sort()
            start_date = start_date or dates[0]
            end_date = end_date or dates[-1]
        else:
            start_date = start_date or ""
            end_date = end_date or ""
    
    # Default reservoirs if not provided
    if reservoirs_included is None:
        reservoirs_included = ["valle_bravo", "villa_victoria", "el_bosque"]
    else:
        # Transform reservoir names in the included list
        reservoirs_included = [
            RESERVOIR_NAME_MAPPING.get(res, res.lower().replace(" ", "_"))
            for res in reservoirs_included
        ]
    
    # Build the response
    return CutzamalaResponse(
        readings=transformed_records,
        metadata=CutzamalaMetadata(
            total_records=total_records,
            filtered_records=filtered_records,
            granularity=granularity,
            date_range=DateRange(start=start_date, end=end_date),
            reservoirs_included=reservoirs_included
        ),
        pagination=CutzamalaPagination(
            limit=limit,
            offset=offset,
            has_next=has_next,
            has_previous=has_previous
        )
    )