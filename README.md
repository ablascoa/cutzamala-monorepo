# Cutzamala Monorepo

A monorepo containing the Cutzamala water system monitoring backend API and frontend dashboard.

## Structure

```
cutzamala-monorepo/
├── backend/          # Python API server
├── frontend/         # Next.js dashboard
├── shared/           # Shared types and constants
└── package.json      # Workspace configuration
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- Python 3.8+
- pipenv or pip

### Installation

Install all dependencies:
```bash
npm run install:all
```

Or install manually:
```bash
# Install Node.js dependencies
npm install

# Install Python dependencies
cd backend && pipenv install
# or
cd backend && pip install -r requirements.txt
```

### Development

Start the frontend development server:
```bash
npm run dev
```

Start the backend API server:
```bash
npm run backend:dev
```

### Testing

Run backend tests:
```bash
npm run backend:test
```

Run frontend linting:
```bash
npm run lint
```

## Deployment

### Frontend (Vercel)

The frontend is configured for Vercel deployment with `vercel.json`. Vercel will automatically detect the Next.js app in the `frontend/` directory.

### Backend

The backend can be deployed using Docker:
```bash
cd backend && docker build -t cutzamala-api .
```

## Shared Package

The `shared/` directory contains TypeScript types and constants used by both frontend and backend. It's configured as a workspace package and can be imported in the frontend as:

```typescript
import { CutzamalaReading, RESERVOIRS } from '@cutzamala/shared';
```

## Scripts

- `npm run dev` - Start frontend development server
- `npm run build` - Build frontend for production
- `npm run start` - Start frontend production server  
- `npm run lint` - Run frontend linting
- `npm run backend:dev` - Start backend development server
- `npm run backend:test` - Run backend tests
- `npm run install:all` - Install all dependencies