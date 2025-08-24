# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a monorepo containing the Cutzamala water system monitoring application with three main packages:

- **backend/**: Python FastAPI server for water storage data
- **frontend/**: Next.js 15 dashboard for data visualization  
- **shared/**: TypeScript types and constants shared between frontend and backend

The application processes PDF reports from CONAGUA (Mexico's National Water Commission) to track water storage levels in the Cutzamala System reservoirs: Valle de Bravo, Villa Victoria, and El Bosque.

## Commands

### Development
```bash
# Start frontend development server
npm run dev

# Start backend API server  
npm run backend:dev

# Install all dependencies (both Node.js and Python)
npm run install:all
```

### Building and Testing
```bash
# Build frontend for production
npm run build

# Start frontend production server
npm run start

# Run frontend linting
npm run lint

# Run backend tests
npm run backend:test
```

### Backend-specific commands (from backend/ directory)
```bash
# Run a single test file
cd backend && python -m pytest tests/test_specific_file.py

# Run tests with coverage
cd backend && python -m pytest --cov=api

# Start API with specific host/port
cd backend && python main.py

# Install Python dependencies
cd backend && pipenv install
```

### Frontend-specific commands (from frontend/ directory)
```bash
# Run ESLint on specific files
cd frontend && eslint src/components/**/*.tsx

# Build with verbose output
cd frontend && next build --debug
```

## Architecture

### Backend (Python FastAPI)
- **Entry point**: `backend/main.py` - CLI interface and server startup
- **API app**: `backend/api/app.py` - FastAPI application with CORS, rate limiting
- **Routes**: `backend/api/routes/cutzamala.py` - Main API endpoints
- **Services**: 
  - `backend/api/services/database_service.py` - Core database operations
  - `backend/api/services/database_aggregation_service.py` - Data aggregation logic
- **Models**: `backend/api/models/` - Pydantic request/response models
- **Database**: SQLite database with schema at `backend/database/schema.sql`
- **PDF Processing**: `backend/cutzamala/` - PDF downloaders and processors

### Frontend (Next.js 15)
- **App Router**: `frontend/src/app/` - Next.js 15 pages using App Router
- **Components**:
  - `frontend/src/components/charts/` - Recharts visualization components
  - `frontend/src/components/controls/` - Date pickers, selectors, filters
  - `frontend/src/components/ui/` - Reusable UI components
- **API Integration**: 
  - `frontend/src/lib/api-client.ts` - HTTP client with error handling
  - `frontend/src/services/cutzamala-api.ts` - API service layer
  - `frontend/src/hooks/useCutzamalaData.ts` - SWR-based data fetching
- **Types**: `frontend/src/types/` - Component and API types (also uses shared types)

### Shared Package
- **Types**: `shared/types/api.ts` - Core API response and data types
- **Constants**: `shared/constants/reservoirs.ts` - Reservoir names, colors, configurations
- **Import pattern**: Frontend imports as `@cutzamala/shared`

### Key Integration Points
- The frontend `frontend/src/services/cutzamala-api.ts` calls backend endpoints at `/cutzamala-readings`
- Shared types ensure type safety between frontend and backend
- Backend serves data in both JSON and CSV formats
- Rate limiting: 50 requests/minute, 1000 requests/hour

### Data Flow
1. PDF reports stored in `backend/pdfs/` directory
2. CLI processes PDFs and stores data in SQLite (`backend/cutzamala.db`)
3. FastAPI serves aggregated data (daily/weekly/monthly/yearly)
4. Frontend fetches and visualizes data using Recharts
5. Users can filter by date range, reservoirs, and export data

## Technology Stack
- **Backend**: Python 3.11, FastAPI, SQLite, Pydantic, uvicorn
- **Frontend**: Next.js 15, React 19, TypeScript 5, Tailwind CSS 4, Recharts, SWR
- **Testing**: pytest (backend), ESLint (frontend)
- **Deployment**: Docker support for backend, Vercel configuration for frontend

## Notes
in .md files; make sure to always include the latest reviewed date