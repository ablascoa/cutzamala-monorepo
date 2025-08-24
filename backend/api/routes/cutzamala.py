from fastapi import APIRouter, Depends, Query, Request
from fastapi.responses import Response
from typing import Optional, List
from datetime import date
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

from ..models.request import CutzamalaQueryParams, GranularityEnum, FormatEnum
from ..models.response import CutzamalaResponse, ErrorResponse
from ..services.database_service import DatabaseDataService
from ..services.database_aggregation_service import DatabaseAggregationService
from ..utils.csv_utils import create_csv_response_content
from ..utils.error_handlers import CutzamalaAPIException

router = APIRouter(prefix="/api/v1", tags=["Cutzamala Water Storage"])

data_service = DatabaseDataService()


@router.get("/cutzamala-readings", 
           summary="Get Cutzamala water storage readings",
           description="Retrieve water storage data from Cutzamala reservoirs with filtering and aggregation options")
@limiter.limit("50/minute")
async def get_cutzamala_readings(
    request: Request,
    start_date: Optional[date] = Query(None, description="Start date for filtering (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date for filtering (YYYY-MM-DD)"),
    reservoirs: Optional[str] = Query(None, description="Comma-separated list of reservoir names"),
    granularity: GranularityEnum = Query(GranularityEnum.daily, description="Data aggregation granularity"),
    format: FormatEnum = Query(FormatEnum.json, description="Response format"),
    limit: Optional[int] = Query(1000, ge=1, le=10000, description="Maximum number of records to return"),
    offset: Optional[int] = Query(0, ge=0, description="Number of records to skip")
):
    try:
        reservoir_list = None
        if reservoirs:
            reservoir_list = [r.strip() for r in reservoirs.split(',')]
        
        # Get total count first for metadata
        total_records = data_service.get_record_count(
            start_date=start_date,
            end_date=end_date,
            reservoirs=reservoir_list
        )
        
        # Get filtered data with pagination
        filtered_data = data_service.get_filtered_data(
            start_date=start_date,
            end_date=end_date,
            reservoirs=reservoir_list,
            limit=limit,
            offset=offset
        )
        
        if len(filtered_data) == 0:
            records = []
        else:
            if granularity == GranularityEnum.daily:
                records = DatabaseAggregationService.aggregate_daily(filtered_data)
            elif granularity == GranularityEnum.weekly:
                records = DatabaseAggregationService.aggregate_weekly(filtered_data)
            elif granularity == GranularityEnum.monthly:
                records = DatabaseAggregationService.aggregate_monthly(filtered_data)
            elif granularity == GranularityEnum.yearly:
                records = DatabaseAggregationService.aggregate_yearly(filtered_data)
            else:
                records = DatabaseAggregationService.aggregate_daily(filtered_data)
        
        paginated_records = records
        
        if format == FormatEnum.csv:
            csv_content, headers = create_csv_response_content(
                paginated_records, 
                f"cutzamala_{granularity}_{start_date or 'all'}_{end_date or 'all'}.csv"
            )
            return Response(content=csv_content, media_type="text/csv", headers=headers)
        
        metadata = {
            "total_records": total_records,
            "returned_records": len(paginated_records),
            "offset": offset,
            "limit": limit
        }
        
        response = CutzamalaResponse(data=paginated_records, metadata=metadata)
        return response
        
    except CutzamalaAPIException:
        raise
    except Exception as e:
        raise CutzamalaAPIException(
            status_code=500,
            error="Failed to process request",
            code="PROCESSING_ERROR",
            details=str(e)
        )


@router.get("/health",
           summary="Health check",
           description="Check if the API is running and data is available")
@limiter.limit("10/minute")
async def health_check(request: Request):
    try:
        min_date, max_date = data_service.get_date_range()
        available_reservoirs = data_service.get_available_reservoirs()
        
        return {
            "status": "healthy",
            "data_available": min_date is not None,
            "date_range": {
                "start": min_date.isoformat() if min_date else None,
                "end": max_date.isoformat() if max_date else None
            },
            "available_reservoirs": available_reservoirs
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "error": str(e)
        }


@router.get("/reservoirs",
           summary="Get available reservoirs",
           description="List all available reservoir names in the dataset")
@limiter.limit("10/minute")
async def get_reservoirs(request: Request):
    try:
        reservoirs = data_service.get_available_reservoirs()
        return {"reservoirs": reservoirs}
    except Exception as e:
        raise CutzamalaAPIException(
            status_code=500,
            error="Failed to get reservoirs",
            code="RESERVOIRS_ERROR",
            details=str(e)
        )