from fastapi import APIRouter, Depends, Query, Request, HTTPException
from fastapi.responses import Response, JSONResponse
from typing import Optional, List, Dict, Any
from datetime import date, datetime
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

from ..models.request import CutzamalaQueryParams, GranularityEnum, FormatEnum, OrderEnum
from ..models.response import CutzamalaResponse, ErrorResponse
from ..services.database_service import DatabaseDataService
from ..services.database_aggregation_service import DatabaseAggregationService
from ..utils.csv_utils import create_csv_response_content
from ..utils.error_handlers import CutzamalaAPIException
from ..utils.response_transformer import create_frontend_response

router = APIRouter(prefix="/api/v1", tags=["Cutzamala Water Storage"])

data_service = DatabaseDataService()


@router.get("/health",
           summary="Health check endpoint",
           description="Returns the health status of the API and its dependencies")
@limiter.limit("100/minute")  # More generous limit for health checks
async def health_check(request: Request) -> Dict[str, Any]:
    """
    Comprehensive health check that validates:
    - API responsiveness
    - Database connectivity
    - Service availability
    """
    try:
        health_status = {
            "status": "healthy",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "service": "cutzamala-api",
            "version": "1.0.0",
            "checks": {}
        }
        
        # Test database connectivity and get basic info
        try:
            # Try to get a small amount of data to verify DB connection
            test_result = data_service.get_filtered_data(limit=1)
            
            # Get additional info for health check
            total_records = data_service.get_record_count()
            available_reservoirs = data_service.get_available_reservoirs()
            date_range = data_service.get_date_range()
            
            health_status["checks"]["database"] = {
                "status": "healthy",
                "message": "Database connection successful",
                "records_available": len(test_result)
            }
            
            # Add the expected fields from the test
            health_status["data_available"] = total_records > 0
            health_status["available_reservoirs"] = available_reservoirs
            health_status["date_range"] = {
                "start": date_range[0].isoformat() if date_range[0] else None,
                "end": date_range[1].isoformat() if date_range[1] else None
            }
            
        except Exception as e:
            health_status["checks"]["database"] = {
                "status": "unhealthy",
                "message": f"Database connection failed: {str(e)}"
            }
            health_status["status"] = "unhealthy"
            health_status["data_available"] = False
            health_status["available_reservoirs"] = []
            health_status["date_range"] = {"start": None, "end": None}
        
        # Test aggregation service
        try:
            agg_service = DatabaseAggregationService()
            # Quick test - this should not fail in normal circumstances
            health_status["checks"]["aggregation_service"] = {
                "status": "healthy",
                "message": "Aggregation service available"
            }
        except Exception as e:
            health_status["checks"]["aggregation_service"] = {
                "status": "unhealthy", 
                "message": f"Aggregation service error: {str(e)}"
            }
            health_status["status"] = "unhealthy"
        
        # Return appropriate HTTP status code
        status_code = 200 if health_status["status"] == "healthy" else 503
        return JSONResponse(
            content=health_status,
            status_code=status_code
        )
        
    except Exception as e:
        # If health check itself fails
        error_response = {
            "status": "unhealthy",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "service": "cutzamala-api",
            "error": f"Health check failed: {str(e)}"
        }
        return JSONResponse(
            content=error_response,
            status_code=503
        )


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
    order: OrderEnum = Query(OrderEnum.desc, description="Sort order for results by date"),
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
        
        # Get filtered data count (before aggregation) 
        filtered_count = data_service.get_record_count(
            start_date=start_date,
            end_date=end_date,
            reservoirs=reservoir_list
        )
        
        # Get filtered data with pagination
        filtered_data = data_service.get_filtered_data(
            start_date=start_date,
            end_date=end_date,
            reservoirs=reservoir_list,
            order=order.value,
            limit=limit,
            offset=offset
        )
        
        if len(filtered_data) == 0:
            records = []
        else:
            if granularity == GranularityEnum.daily:
                records = DatabaseAggregationService.aggregate_daily(filtered_data, order.value)
            elif granularity == GranularityEnum.weekly:
                records = DatabaseAggregationService.aggregate_weekly(filtered_data, order.value)
            elif granularity == GranularityEnum.monthly:
                records = DatabaseAggregationService.aggregate_monthly(filtered_data, order.value)
            elif granularity == GranularityEnum.yearly:
                records = DatabaseAggregationService.aggregate_yearly(filtered_data, order.value)
            else:
                records = DatabaseAggregationService.aggregate_daily(filtered_data, order.value)
        
        paginated_records = records
        
        if format == FormatEnum.csv:
            csv_content, headers = create_csv_response_content(
                paginated_records, 
                f"cutzamala_{granularity}_{start_date or 'all'}_{end_date or 'all'}.csv"
            )
            return Response(content=csv_content, media_type="text/csv", headers=headers)
        
        # Create frontend-compatible response using the transformer
        response = create_frontend_response(
            records=paginated_records,
            total_records=total_records,
            filtered_records=filtered_count,
            granularity=granularity.value,
            start_date=start_date.isoformat() if start_date else None,
            end_date=end_date.isoformat() if end_date else None,
            reservoirs_included=reservoir_list,
            limit=limit,
            offset=offset
        )
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