from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import logging

from .routes.cutzamala import router as cutzamala_router
from .utils.error_handlers import (
    validation_exception_handler,
    cutzamala_exception_handler,
    general_exception_handler,
    CutzamalaAPIException
)
from .config import settings

logging.basicConfig(level=getattr(logging, settings.LOG_LEVEL))
logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="Cutzamala Water Storage API",
    description="""
    ## Cutzamala Water Storage Data API
    
    This API provides access to historical water storage data from the Cutzamala water system reservoirs.
    
    ### Features
    - **Historical Data**: Access to water storage readings from multiple reservoirs
    - **Flexible Filtering**: Filter by date range and specific reservoirs
    - **Multiple Aggregations**: Daily, weekly, monthly, and yearly data aggregation
    - **Multiple Formats**: JSON and CSV response formats
    - **Pagination**: Efficient handling of large datasets
    
    ### Rate Limits
    - 50 requests per minute
    - 1000 requests per hour
    
    ### Available Reservoirs
    - Villa Victoria
    - Valle de Bravo
    - El Bosque
    - Ixtapan del Oro
    - Colorines
    - Chilesdo
    """,
    version="1.0.0",
    contact={
        "name": "Cutzamala API Support",
        "email": "support@cutzamala-api.com"
    },
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT"
    }
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(CutzamalaAPIException, cutzamala_exception_handler)
app.add_exception_handler(Exception, general_exception_handler)

app.include_router(cutzamala_router)


@app.get("/", tags=["Root"])
@limiter.limit("10/minute")
async def root(request: Request):
    return {
        "message": "Welcome to the Cutzamala Water Storage API",
        "version": "1.0.0",
        "documentation": "/docs",
        "health_check": "/api/v1/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)