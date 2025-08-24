# Cutzamala Water Storage API

A FastAPI-based REST API server that provides access to historical water storage data from the Cutzamala water system reservoirs.

## 🚀 Quick Start

### Prerequisites

- Python 3.11 or higher
- pip or pipenv

### Installation

1. **Install dependencies:**
   ```bash
   cd src
   pip install -r requirements.txt
   # OR using pipenv
   pipenv install
   ```

2. **Ensure data is available:**
   Make sure `cutzamala_consolidated.csv` exists in the `src/` directory. If not, run the data processing script first:
   ```bash
   python scripts/main.py --auto
   ```

3. **Start the API server:**
   ```bash
   python main.py
   ```

   The API will be available at: http://127.0.0.1:8000

### Development Mode

To run with auto-reload for development:
```bash
python main.py --reload --host 0.0.0.0
```

## 📖 API Documentation

- **Interactive API Docs**: http://127.0.0.1:8000/docs
- **OpenAPI Schema**: http://127.0.0.1:8000/openapi.json
- **Health Check**: http://127.0.0.1:8000/api/v1/health

## 🛠️ API Endpoints

### Main Endpoint: `/api/v1/cutzamala-readings`

Get water storage readings with flexible filtering and aggregation options.

**Query Parameters:**
- `start_date` (optional): Start date in YYYY-MM-DD format
- `end_date` (optional): End date in YYYY-MM-DD format
- `reservoirs` (optional): Comma-separated list of reservoir names
- `granularity` (optional): `daily` (default), `weekly`, `monthly`, `yearly`
- `format` (optional): `json` (default) or `csv`
- `limit` (optional): Maximum records to return (1-10000, default 1000)
- `offset` (optional): Number of records to skip (default 0)

**Example Requests:**

```bash
# Get daily data for all reservoirs (last 1000 records)
curl "http://127.0.0.1:8000/api/v1/cutzamala-readings"

# Get data for specific date range
curl "http://127.0.0.1:8000/api/v1/cutzamala-readings?start_date=2024-01-01&end_date=2024-12-31"

# Get monthly aggregated data for specific reservoirs
curl "http://127.0.0.1:8000/api/v1/cutzamala-readings?reservoirs=Villa%20Victoria,Valle%20de%20Bravo&granularity=monthly"

# Get data in CSV format
curl "http://127.0.0.1:8000/api/v1/cutzamala-readings?format=csv" -o cutzamala_data.csv

# Paginated results
curl "http://127.0.0.1:8000/api/v1/cutzamala-readings?limit=100&offset=200"
```

### Other Endpoints:

- `GET /api/v1/health` - Health check and system status
- `GET /api/v1/reservoirs` - List available reservoir names
- `GET /` - API information and links

## 📊 Data Structure

### JSON Response Format

```json
{
  "data": [
    {
      "date": "2024-01-15",
      "year": 2024,
      "month": 1,
      "month_name": "January",
      "day": 15,
      "reservoirs": {
        "Villa Victoria": {
          "storage_mm3": 165.5,
          "percentage": 85.2,
          "rainfall": 12.3
        },
        "Valle de Bravo": {
          "storage_mm3": 145.8,
          "percentage": 78.9,
          "rainfall": 8.7
        }
      },
      "system_totals": {
        "total_mm3": 850,
        "total_percentage": 75.4
      },
      "source_pdf": "Enero_2024.pdf"
    }
  ],
  "metadata": {
    "total_records": 1500,
    "returned_records": 1000,
    "offset": 0,
    "limit": 1000
  }
}
```

## 🏗️ Architecture

```
src/
├── api/
│   ├── app.py              # FastAPI application setup
│   ├── config.py           # Configuration settings
│   ├── routes/
│   │   └── cutzamala.py    # API endpoints
│   ├── models/
│   │   ├── request.py      # Request validation models
│   │   └── response.py     # Response models
│   ├── services/
│   │   ├── data_service.py       # Data loading and filtering
│   │   └── aggregation_service.py # Data aggregation logic
│   └── utils/
│       ├── error_handlers.py     # Error handling
│       ├── date_utils.py         # Date utilities
│       └── csv_utils.py          # CSV formatting
└── main.py                 # Application entry point
```

## ⚡ Features

- **Fast Performance**: Built with FastAPI for high performance
- **Data Validation**: Request/response validation with Pydantic
- **Multiple Formats**: JSON and CSV response formats
- **Flexible Filtering**: Date range and reservoir filtering
- **Data Aggregation**: Daily, weekly, monthly, yearly aggregations
- **Rate Limiting**: 50 requests/minute, 1000/hour
- **CORS Support**: Cross-origin request handling
- **Auto Documentation**: Interactive OpenAPI documentation
- **Error Handling**: Comprehensive error responses
- **Health Monitoring**: Health check endpoint

## 🔧 Configuration

Environment variables and settings (see `api/config.py`):

- `DATA_FILE_PATH`: Path to CSV data file (default: cutzamala_consolidated.csv)
- `RATE_LIMIT_PER_MINUTE`: Rate limit per minute (default: 50)
- `RATE_LIMIT_PER_HOUR`: Rate limit per hour (default: 1000)
- `MAX_LIMIT`: Maximum records per request (default: 10000)
- `DEFAULT_LIMIT`: Default records per request (default: 1000)
- `CORS_ORIGINS`: Allowed CORS origins (default: ["*"])
- `LOG_LEVEL`: Logging level (default: "INFO")

## 🧪 Testing

### Manual Testing
The API includes comprehensive error handling and validation. Test the endpoints using:

1. **Interactive documentation**: Visit `/docs` for testing
2. **curl**: Use the example commands above
3. **HTTP clients**: Use tools like Postman or Insomnia

### Automated Testing

**Test Suite Setup:**
```bash
cd src
pip install -r requirements-dev.txt
```

**Run Tests:**
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=api --cov-report=html

# Run specific test file
pytest tests/test_api_endpoints.py
```

**Docker Testing:**
```bash
# Run tests in development container
docker-compose exec cutzamala-api pytest

# Or build and test
docker build -f Dockerfile.dev -t cutzamala-api:dev .
docker run --rm -v $(pwd)/src:/app cutzamala-api:dev pytest
```

**Test Coverage:**
- API endpoints testing
- Data service testing  
- Error handling testing
- Edge cases and validation testing

## 🚦 Rate Limiting

- **50 requests per minute** per IP address
- **1000 requests per hour** per IP address
- Exceeding limits returns HTTP 429 (Too Many Requests)

## ❌ Error Handling

The API returns structured error responses:

```json
{
  "error": "Invalid request parameters",
  "code": "VALIDATION_ERROR",
  "details": "end_date must be after start_date"
}
```

Common error codes:
- `VALIDATION_ERROR`: Invalid query parameters
- `DATA_NOT_FOUND`: Data file not available
- `DATA_LOAD_ERROR`: Failed to load data
- `PROCESSING_ERROR`: Request processing failed
- `INTERNAL_ERROR`: Unexpected server error

## 📈 Available Reservoirs

The API serves data for these Cutzamala system reservoirs:

- Villa Victoria
- Valle de Bravo
- El Bosque
- Ixtapan del Oro
- Colorines
- Chilesdo

## 🐳 Docker Deployment

**Comprehensive Docker support is now available!** See the complete [Docker Deployment Guide](./DOCKER_README.md) for detailed instructions.

### Quick Docker Start

**Development:**
```bash
docker-compose up --build
```

**Production:**
```bash
docker build -t cutzamala-api .
docker run -d -p 8000:8000 -v $(pwd)/src/cutzamala.db:/app/cutzamala.db:ro cutzamala-api
```

### Available Docker Configurations
- `Dockerfile` - Production-optimized container
- `Dockerfile.dev` - Development container with auto-reload
- `docker-compose.yml` - Complete development environment
- `nginx.conf` - Optional reverse proxy configuration

📖 **Full documentation**: [DOCKER_README.md](./DOCKER_README.md)

## 📝 Command Line Options

```bash
python main.py --help

Options:
  --host TEXT          Host to bind the server (default: 127.0.0.1)
  --port INTEGER       Port to bind the server (default: 8000)
  --reload             Enable auto-reload for development
  --log-level TEXT     Set logging level (debug|info|warning|error|critical)
```

## 🤝 Integration

The API is designed to integrate with the Next.js dashboard in the `cutzamala-dashboard/` directory. The frontend uses the API client in `src/lib/api-client.ts` to fetch data from this API server.

## 📄 License

MIT License - see the project root for details.