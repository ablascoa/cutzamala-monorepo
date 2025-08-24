# Cutzamala Water Storage API Specification

## Overview

This API provides access to water storage data from the Cutzamala system reservoirs, extracted from official CONAGUA reports.

## Base URL
```
https://api.example.com/v1
```

## Endpoints

### GET /cutzamala-readings

Fetches water storage data from the Cutzamala system reservoirs with optional filtering by date range and data granularity.

#### Query Parameters

| Parameter | Type | Required | Description | Default | Example |
|-----------|------|----------|-------------|---------|---------|
| `start_date` | string | No | Start date in YYYY-MM-DD format | First available date | `2023-01-01` |
| `end_date` | string | No | End date in YYYY-MM-DD format | Last available date | `2023-12-31` |
| `granularity` | string | No | Data aggregation level | `daily` | `daily`, `weekly`, `monthly`, `yearly` |
| `reservoirs` | string | No | Comma-separated list of reservoirs to include | `all` | `valle_bravo,villa_victoria,el_bosque` |
| `format` | string | No | Response format | `json` | `json`, `csv` |
| `limit` | integer | No | Maximum number of records to return | 1000 | `500` |
| `offset` | integer | No | Number of records to skip for pagination | 0 | `100` |

#### Valid Granularity Values

- `daily` - Returns daily readings (default)
- `weekly` - Returns weekly averages (Sunday to Saturday)
- `monthly` - Returns monthly averages
- `yearly` - Returns yearly averages

#### Valid Reservoir Values

- `valle_bravo` - Valle de Bravo reservoir only
- `villa_victoria` - Villa Victoria reservoir only
- `el_bosque` - El Bosque reservoir only
- `all` - All reservoirs (default)

#### Example Requests

```bash
# Get all daily readings
GET /cutzamala-readings

# Get monthly data for 2023
GET /cutzamala-readings?start_date=2023-01-01&end_date=2023-12-31&granularity=monthly

# Get Valle de Bravo data only
GET /cutzamala-readings?reservoirs=valle_bravo&start_date=2023-06-01

# Get data in CSV format
GET /cutzamala-readings?format=csv&limit=100
```

#### Response Format (JSON)

```json
{
  "status": "success",
  "data": {
    "readings": [
      {
        "date": "2023-01-01",
        "year": 2023,
        "month": 1,
        "month_name": "ENERO",
        "day": 1,
        "reservoirs": {
          "valle_bravo": {
            "storage_mm3": 185.5,
            "percentage": 45.2,
            "rainfall": 0.0
          },
          "villa_victoria": {
            "storage_mm3": 165.8,
            "percentage": 71.3,
            "rainfall": 2.5
          },
          "el_bosque": {
            "storage_mm3": 28.4,
            "percentage": 92.1,
            "rainfall": 0.0
          }
        },
        "system_totals": {
          "total_mm3": 379700000,
          "total_percentage": 58.9
        },
        "source_pdf": "Enero_2023.pdf"
      }
    ],
    "metadata": {
      "total_records": 365,
      "filtered_records": 1,
      "granularity": "daily",
      "date_range": {
        "start": "2023-01-01",
        "end": "2023-01-01"
      },
      "reservoirs_included": ["valle_bravo", "villa_victoria", "el_bosque"]
    },
    "pagination": {
      "limit": 1000,
      "offset": 0,
      "has_next": false,
      "has_previous": false
    }
  }
}
```

#### Response Format (CSV)

When `format=csv`, the response will be a CSV file with headers:

```csv
date,year,month,month_name,day,valle_bravo_mm3,valle_bravo_pct,valle_bravo_lluvia,villa_victoria_mm3,villa_victoria_pct,villa_victoria_lluvia,el_bosque_mm3,el_bosque_pct,el_bosque_lluvia,total_mm3,total_pct,source_pdf
2023-01-01,2023,1,ENERO,1,185.5,45.2,0.0,165.8,71.3,2.5,28.4,92.1,0.0,379700000,58.9,Enero_2023.pdf
```

#### HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success - Data retrieved successfully |
| 400 | Bad Request - Invalid parameters |
| 404 | Not Found - No data found for specified criteria |
| 422 | Unprocessable Entity - Invalid date format or range |
| 500 | Internal Server Error - Server processing error |

#### Error Response Format

```json
{
  "status": "error",
  "error": {
    "code": "INVALID_DATE_RANGE",
    "message": "End date must be after start date",
    "details": {
      "start_date": "2023-12-31",
      "end_date": "2023-01-01"
    }
  }
}
```

#### Common Error Codes

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `INVALID_DATE_FORMAT` | 400 | Date parameter not in YYYY-MM-DD format |
| `INVALID_DATE_RANGE` | 400 | End date is before start date |
| `INVALID_GRANULARITY` | 400 | Unsupported granularity value |
| `INVALID_RESERVOIR` | 400 | Unsupported reservoir name |
| `INVALID_FORMAT` | 400 | Unsupported response format |
| `INVALID_LIMIT` | 400 | Limit parameter out of range (1-10000) |
| `DATA_NOT_FOUND` | 404 | No data available for specified criteria |
| `DATE_OUT_OF_RANGE` | 422 | Requested date range outside available data |

## Data Aggregation Rules

### Weekly Aggregation
- Week starts on Sunday and ends on Saturday
- Storage values are averaged across the week
- Rainfall values are summed across the week
- Percentage values are averaged across the week

### Monthly Aggregation
- Storage values are averaged across the month
- Rainfall values are summed across the month
- Percentage values are averaged across the month

### Yearly Aggregation
- Storage values are averaged across the year
- Rainfall values are summed across the year
- Percentage values are averaged across the year

## Rate Limiting

- **Rate limit**: 1000 requests per hour per API key
- **Burst limit**: 50 requests per minute
- Rate limit headers are included in responses:
  - `X-RateLimit-Limit`: Request limit per hour
  - `X-RateLimit-Remaining`: Requests remaining in current window
  - `X-RateLimit-Reset`: Unix timestamp when rate limit resets

## Authentication

Currently, the API is public and does not require authentication. Future versions may implement API key authentication.

## Data Sources

All data is extracted from official CONAGUA (Comisión Nacional del Agua) monthly reports published at:
https://www.gob.mx/conagua/acciones-y-programas/organismo-de-cuenca-aguas-del-valle-de-mexico

## Versioning

This API uses URL versioning. The current version is `v1`. Future versions will be available at `/v2`, `/v3`, etc.

## Support

For technical support or questions about this API, please contact: [support email]