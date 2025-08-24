from pydantic import BaseModel
from typing import Dict, List, Optional
from datetime import date


class ReservoirReading(BaseModel):
    storage_mm3: float
    percentage: float
    rainfall: float


class SystemTotals(BaseModel):
    total_mm3: int
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


class CutzamalaResponse(BaseModel):
    data: List[ReadingRecord]
    metadata: Dict[str, int]


class ErrorResponse(BaseModel):
    error: str
    code: str
    details: Optional[str] = None