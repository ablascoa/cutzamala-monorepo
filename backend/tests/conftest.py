import pytest
import asyncio
from fastapi.testclient import TestClient
from api.app import app
from api.services.database_service import DatabaseDataService


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture
def client():
    """Create a test client for the FastAPI app."""
    return TestClient(app)


@pytest.fixture
def sample_query_params():
    """Sample query parameters for testing."""
    return {
        "start_date": "2024-01-01",
        "end_date": "2024-01-31",
        "granularity": "daily",
        "limit": 10,
        "offset": 0
    }


@pytest.fixture
def database_service():
    """Create a database service instance for testing."""
    return DatabaseDataService()