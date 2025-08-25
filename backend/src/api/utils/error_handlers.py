from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError
import logging

logger = logging.getLogger(__name__)


class CutzamalaAPIException(HTTPException):
    def __init__(self, status_code: int, error: str, code: str, details: str = None):
        self.error = error
        self.code = code
        self.details = details
        super().__init__(status_code=status_code, detail=error)


async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.warning(f"Validation error: {exc}")
    return JSONResponse(
        status_code=400,
        content={
            "error": "Invalid request parameters",
            "code": "VALIDATION_ERROR",
            "details": str(exc)
        }
    )


async def cutzamala_exception_handler(request: Request, exc: CutzamalaAPIException):
    logger.error(f"Cutzamala API error: {exc.error}")
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.error,
            "code": exc.code,
            "details": exc.details
        }
    )


async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unexpected error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "code": "INTERNAL_ERROR",
            "details": "An unexpected error occurred"
        }
    )