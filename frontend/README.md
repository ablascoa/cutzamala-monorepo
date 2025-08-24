# Cutzamala Dashboard

Interactive web dashboard for visualizing and analyzing water storage data from the Cutzamala System reservoirs. Built with Next.js 15, TypeScript, and Tailwind CSS.

## Overview

The Cutzamala Dashboard provides real-time monitoring and historical analysis of water storage levels from the three main reservoirs of Mexico's Cutzamala System:
- **Valle de Bravo**
- **Villa Victoria** 
- **El Bosque**

Data is sourced from official CONAGUA monthly reports spanning from 2016 to present.

## Features

### Current Capabilities (Phase 1 - Complete)
- ✅ **Modern UI Components**: Built with reusable Card, Button, and layout components
- ✅ **API Client**: Full TypeScript API client with type safety
- ✅ **Data Types**: Complete type definitions for reservoir data and API responses
- ✅ **Responsive Design**: Mobile-first design with Tailwind CSS
- ✅ **Project Setup**: Next.js 15 with TypeScript, ESLint, and modern tooling

### Planned Features (Phase 2)
- 🔄 **Data Visualization**: Interactive charts using Recharts library
- ⏳ **Date Range Filtering**: Custom date picker controls with react-datepicker
- ⏳ **Reservoir Selection**: Filter data by individual reservoirs or view all
- ⏳ **Data Export**: Export filtered data in CSV format
- ⏳ **Historical Analysis**: Compare data across different time periods

## API Integration

The dashboard integrates with the Cutzamala Water Storage API to fetch:
- Daily, weekly, monthly, and yearly aggregated data
- Storage levels (in millions of cubic meters)
- Percentage capacity for each reservoir
- Rainfall data
- System totals and historical trends

### Supported API Endpoints
- `GET /cutzamala-readings` - Main data endpoint with flexible filtering
- Query parameters: `start_date`, `end_date`, `granularity`, `reservoirs`, `format`, pagination

## Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository and navigate to the dashboard:
```bash
cd cutzamala-dashboard
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                 # Next.js App Router pages
│   ├── layout.tsx       # Root layout with navigation
│   └── page.tsx         # Landing page with feature overview
├── components/
│   ├── layout/          # Header and Footer components
│   └── ui/              # Reusable UI components (Card, Button)
├── hooks/               # Custom React hooks
│   └── useCutzamalaData.ts  # Data fetching hook with SWR
├── lib/                 # Utility libraries
│   ├── api-client.ts    # HTTP client for API calls
│   ├── constants.ts     # Configuration constants
│   └── utils.ts         # Helper utilities
├── services/            # API service layers
│   └── cutzamala-api.ts # Cutzamala API service methods
└── types/               # TypeScript type definitions
    ├── api.ts           # API response types
    ├── charts.ts        # Chart data types
    └── index.ts         # Exported types
```

## Technology Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts 3.1
- **Data Fetching**: SWR 2.3 for client-side data management
- **Date Handling**: date-fns 4.1 and react-datepicker
- **Icons**: Lucide React
- **Build Tools**: ESLint, PostCSS

## Development Scripts

```bash
npm run dev     # Start development server
npm run build   # Build for production
npm run start   # Start production server
npm run lint    # Run ESLint
```

## Data Sources

All reservoir data is extracted from official monthly reports published by CONAGUA (Comisión Nacional del Agua) at:
https://www.gob.mx/conagua/acciones-y-programas/organismo-de-cuenca-aguas-del-valle-de-mexico

## Contributing

This is an internal project for analyzing Cutzamala System water storage data. The dashboard is designed to support water resource management and historical trend analysis.

## License

Private project - All rights reserved.
