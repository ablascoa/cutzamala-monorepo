from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import date
from enum import Enum


class GranularityEnum(str, Enum):
    daily = "daily"
    weekly = "weekly"
    monthly = "monthly"
    yearly = "yearly"


class FormatEnum(str, Enum):
    json = "json"
    csv = "csv"


class OrderEnum(str, Enum):
    asc = "asc"
    desc = "desc"


class CutzamalaQueryParams(BaseModel):
    start_date: Optional[date] = Field(None, description="Start date for filtering (YYYY-MM-DD)")
    end_date: Optional[date] = Field(None, description="End date for filtering (YYYY-MM-DD)")
    reservoirs: Optional[str] = Field(None, description="Comma-separated list of reservoir names")
    granularity: GranularityEnum = Field(GranularityEnum.daily, description="Data aggregation granularity")
    format: FormatEnum = Field(FormatEnum.json, description="Response format")
    order: OrderEnum = Field(OrderEnum.desc, description="Sort order for results by date")
    limit: Optional[int] = Field(1000, ge=1, le=10000, description="Maximum number of records to return")
    offset: Optional[int] = Field(0, ge=0, description="Number of records to skip")

    @validator('end_date')
    def end_date_after_start_date(cls, v, values):
        if 'start_date' in values and values['start_date'] and v:
            if v < values['start_date']:
                raise ValueError('end_date must be after start_date')
        return v

    @validator('reservoirs')
    def validate_reservoirs(cls, v):
        if v:
            reservoirs = [r.strip() for r in v.split(',')]
            valid_reservoirs = [
                'Villa Victoria', 'Valle de Bravo', 'El Bosque', 
                'Ixtapan del Oro', 'Colorines', 'Chilesdo'
            ]
            for reservoir in reservoirs:
                if reservoir not in valid_reservoirs:
                    raise ValueError(f'Invalid reservoir name: {reservoir}. Valid options: {", ".join(valid_reservoirs)}')
        return v