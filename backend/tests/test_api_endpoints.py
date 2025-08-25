import pytest
from fastapi.testclient import TestClient
from src.api.app import app

class TestCutzamalaAPI:
    """Test cases for the Cutzamala API endpoints."""
    
    def test_root_endpoint(self, client: TestClient):
        """Test the root endpoint returns basic info."""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "version" in data
        assert data["version"] == "1.0.0"
    
    def test_health_check(self, client: TestClient):
        """Test the health check endpoint."""
        response = client.get("/api/v1/health")
        assert response.status_code == 200
        data = response.json()
        assert "status" in data
        assert data["status"] == "healthy"
        assert "data_available" in data
        assert "date_range" in data
        assert "available_reservoirs" in data
    
    def test_reservoirs_endpoint(self, client: TestClient):
        """Test the reservoirs endpoint returns available reservoirs."""
        response = client.get("/api/v1/reservoirs")
        assert response.status_code == 200
        data = response.json()
        assert "reservoirs" in data
        assert isinstance(data["reservoirs"], list)
        assert len(data["reservoirs"]) > 0
    
    def test_cutzamala_readings_basic(self, client: TestClient):
        """Test basic cutzamala readings endpoint."""
        response = client.get("/api/v1/cutzamala-readings?limit=2")
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert "metadata" in data
        assert isinstance(data["data"], list)
        assert len(data["data"]) <= 2
    
    def test_cutzamala_readings_with_date_filter(self, client: TestClient):
        """Test cutzamala readings with date filtering."""
        response = client.get("/api/v1/cutzamala-readings?start_date=2024-01-01&end_date=2024-01-31&limit=5")
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert "metadata" in data
        
        # Check that returned data is within date range if any data exists
        if data["data"]:
            for record in data["data"]:
                assert "date" in record
                record_date = record["date"]
                assert "2024-01" in record_date  # Should be January 2024
    
    def test_cutzamala_readings_granularity(self, client: TestClient):
        """Test different granularity options."""
        granularities = ["daily", "weekly", "monthly", "yearly"]
        
        for granularity in granularities:
            response = client.get(f"/api/v1/cutzamala-readings?granularity={granularity}&limit=3")
            assert response.status_code == 200
            data = response.json()
            assert "data" in data
            assert "metadata" in data
    
    def test_cutzamala_readings_csv_format(self, client: TestClient):
        """Test CSV format response."""
        response = client.get("/api/v1/cutzamala-readings?format=csv&limit=2")
        assert response.status_code == 200
        assert response.headers["content-type"] == "text/csv"
        
        # Check that response contains CSV headers
        content = response.content.decode()
        assert "date" in content
        assert "year" in content
    
    def test_invalid_granularity(self, client: TestClient):
        """Test invalid granularity parameter."""
        response = client.get("/api/v1/cutzamala-readings?granularity=invalid")
        # Should return 422 for validation error, but some APIs may return 400
        assert response.status_code in [400, 422]
    
    def test_invalid_date_format(self, client: TestClient):
        """Test invalid date format."""
        response = client.get("/api/v1/cutzamala-readings?start_date=invalid-date")
        # Should return 422 for validation error, but some APIs may return 400
        assert response.status_code in [400, 422]
    
    def test_pagination_limits(self, client: TestClient):
        """Test pagination parameters."""
        # Test limit boundary
        response = client.get("/api/v1/cutzamala-readings?limit=1")
        assert response.status_code == 200
        data = response.json()
        assert len(data["data"]) <= 1
        
        # Test offset
        response = client.get("/api/v1/cutzamala-readings?limit=1&offset=1")
        assert response.status_code == 200
        
        # Test invalid limit (too high)
        response = client.get("/api/v1/cutzamala-readings?limit=20000")
        # Should return 422 for validation error, but some APIs may return 400
        assert response.status_code in [400, 422]
    
    def test_reservoir_filtering(self, client: TestClient):
        """Test filtering by specific reservoirs."""
        response = client.get("/api/v1/cutzamala-readings?reservoirs=Valle%20de%20Bravo&limit=2")
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        
        # Just check that the API accepts reservoir filtering
        # The actual filtering logic is handled by the service layer
        assert isinstance(data["data"], list)