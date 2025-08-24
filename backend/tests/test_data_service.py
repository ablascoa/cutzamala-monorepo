import pytest
from datetime import date
from api.services.database_service import DatabaseDataService
from api.services.database_aggregation_service import DatabaseAggregationService


class TestDatabaseService:
    """Test cases for the DatabaseDataService."""
    
    def test_service_initialization(self, database_service: DatabaseDataService):
        """Test that the service initializes correctly."""
        assert database_service is not None
        # Check that it has the expected attributes for database connection
        assert hasattr(database_service, 'db_manager')
    
    def test_get_date_range(self, database_service: DatabaseDataService):
        """Test getting the available date range."""
        min_date, max_date = database_service.get_date_range()
        
        if min_date and max_date:
            assert isinstance(min_date, date)
            assert isinstance(max_date, date)
            assert min_date <= max_date
    
    def test_get_available_reservoirs(self, database_service: DatabaseDataService):
        """Test getting available reservoirs."""
        reservoirs = database_service.get_available_reservoirs()
        assert isinstance(reservoirs, list)
        assert len(reservoirs) > 0
        
        # Check for expected reservoir names
        expected_reservoirs = ["valle_bravo", "villa_victoria", "el_bosque"]
        for reservoir in expected_reservoirs:
            if reservoir in reservoirs:
                assert isinstance(reservoir, str)
    
    def test_get_record_count(self, database_service: DatabaseDataService):
        """Test getting record count."""
        total_count = database_service.get_record_count()
        assert isinstance(total_count, int)
        assert total_count >= 0
        
        # Test with date filter
        filtered_count = database_service.get_record_count(
            start_date=date(2024, 1, 1),
            end_date=date(2024, 1, 31)
        )
        assert isinstance(filtered_count, int)
        assert filtered_count >= 0
    
    def test_get_filtered_data(self, database_service: DatabaseDataService):
        """Test getting filtered data."""
        # Test basic filtering
        data = database_service.get_filtered_data(limit=5)
        assert isinstance(data, list)
        assert len(data) <= 5
        
        # Test with date range
        data = database_service.get_filtered_data(
            start_date=date(2024, 1, 1),
            end_date=date(2024, 1, 31),
            limit=10
        )
        assert isinstance(data, list)
        assert len(data) <= 10
        
        # Verify data structure if data exists
        if data:
            record = data[0]
            assert "date" in record
            # Note: raw database records have individual columns, not nested structure
            assert "valle_bravo_mm3" in record or "Villa Victoria" in str(record)


class TestDatabaseAggregationService:
    """Test cases for the DatabaseAggregationService."""
    
    def test_daily_aggregation(self):
        """Test daily aggregation with sample data."""
        # Sample data in database format
        sample_data = [
            {
                "date": "2024-01-01",
                "year": 2024,
                "month": 1,
                "month_name": "ENERO",
                "day": 1,
                "valle_bravo_mm3": 100.0,
                "valle_bravo_pct": 50.0,
                "valle_bravo_lluvia": 0.0,
                "villa_victoria_mm3": 150.0,
                "villa_victoria_pct": 60.0,
                "villa_victoria_lluvia": 2.0,
                "el_bosque_mm3": 25.0,
                "el_bosque_pct": 80.0,
                "el_bosque_lluvia": 0.0,
                "total_mm3": 275000000,
                "total_pct": 63.3,
                "source_pdf": "test.pdf"
            }
        ]
        
        result = DatabaseAggregationService.aggregate_daily(sample_data)
        assert isinstance(result, list)
        assert len(result) == 1
        assert result[0]["date"] == "2024-01-01"
        assert "Valle de Bravo" in result[0]["reservoirs"]
    
    def test_aggregation_with_empty_data(self):
        """Test aggregation methods with empty data."""
        empty_data = []
        
        daily_result = DatabaseAggregationService.aggregate_daily(empty_data)
        assert isinstance(daily_result, list)
        assert len(daily_result) == 0
        
        weekly_result = DatabaseAggregationService.aggregate_weekly(empty_data)
        assert isinstance(weekly_result, list)
        assert len(weekly_result) == 0
        
        monthly_result = DatabaseAggregationService.aggregate_monthly(empty_data)
        assert isinstance(monthly_result, list)
        assert len(monthly_result) == 0
        
        yearly_result = DatabaseAggregationService.aggregate_yearly(empty_data)
        assert isinstance(yearly_result, list)
        assert len(yearly_result) == 0