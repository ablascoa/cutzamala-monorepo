from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import date


class ReservoirReading(BaseModel):
    storage_mm3: float
    percentage: float
    rainfall: float


class SystemTotals(BaseModel):
    total_mm3: float  # Changed from int to float to match frontend expectations
    total_percentage: float


class ReadingRecord(BaseModel):
    date: str
    year: int
    month: int
    month_name: str
    day: int
    reservoirs: Dict[str, ReservoirReading]
    system_totals: SystemTotals
    source_pdf: str


class DateRange(BaseModel):
    start: str
    end: str


class CutzamalaMetadata(BaseModel):
    total_records: int
    filtered_records: int
    granularity: str
    date_range: DateRange
    reservoirs_included: List[str]


class CutzamalaPagination(BaseModel):
    limit: int
    offset: int
    has_next: bool
    has_previous: bool


class CutzamalaResponse(BaseModel):
    readings: List[ReadingRecord]  # Changed from 'data' to 'readings'
    metadata: CutzamalaMetadata
    pagination: CutzamalaPagination


class ErrorResponse(BaseModel):
    error: str
    code: str
    details: Optional[str] = None