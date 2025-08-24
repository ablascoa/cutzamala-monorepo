# Cutzamala Water Storage API

FastAPI backend for the Cutzamala water storage system data.

## Features

- **Historical Data**: Access to water storage readings from multiple reservoirs
- **Flexible Filtering**: Filter by date range and specific reservoirs  
- **Multiple Aggregations**: Daily, weekly, monthly, and yearly data aggregation
- **Multiple Formats**: JSON and CSV response formats
- **Pagination**: Efficient handling of large datasets
- **Rate Limiting**: 50 requests per minute, 1000 requests per hour

## Available Reservoirs

- Villa Victoria
- Valle de Bravo
- El Bosque
- Ixtapan del Oro
- Colorines
- Chilesdo

## Quick Start

### Option 1: Using Python directly
```bash
cd src
pipenv install
pipenv shell
uvicorn api.app:app --host 0.0.0.0 --port 8000 --reload
```

### Option 2: Using Docker
```bash
docker-compose up cutzamala-api
```

## API Documentation

Once running, visit:
- http://localhost:8000/docs (Interactive API documentation)
- http://localhost:8000/redoc (Alternative API documentation)

## Development

The API uses:
- **FastAPI** for the web framework
- **SQLite** for data storage
- **Pydantic** for data validation
- **Uvicorn** for the ASGI server

## Testing

```bash
cd src
pipenv install --dev
pytest
```