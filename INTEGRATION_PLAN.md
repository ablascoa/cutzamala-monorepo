# Backend-Frontend Integration Plan

**Status**: In Progress  
**Started**: 2025-08-24  
**Last Updated**: 2025-08-24

## Objective
Integrate the Cutzamala frontend dashboard with the real Python FastAPI backend, replacing mock data with actual water storage readings from the SQLite database.

## Current State Analysis

### Frontend Mock Data Setup
- ✅ Uses `env.useMockData` flag to toggle between mock/real API
- ✅ Mock data generates realistic patterns with seasonal variations  
- ✅ API service layer already configured for real backend integration
- ✅ Mock API matches expected interface structure

### Backend API Status
- ✅ Endpoint: `/api/v1/cutzamala-readings` available
- ⚠️  Returns different data structure than frontend expects
- ⚠️  Uses `data` array vs frontend expects `readings` array
- ⚠️  Missing pagination wrapper that frontend expects

## Key Integration Issues

### 1. Response Structure Mismatch
**Backend Response:**
```python
{
  "data": ReadingRecord[],
  "metadata": {
    "total_records": int,
    "returned_records": int,
    "offset": int,
    "limit": int
  }
}
```

**Frontend Expected:**
```typescript
{
  "readings": CutzamalaReading[],
  "metadata": {
    "total_records": number,
    "filtered_records": number,
    "granularity": Granularity,
    "date_range": { start: string, end: string },
    "reservoirs_included": string[]
  },
  "pagination": {
    "limit": number,
    "offset": number,
    "has_next": boolean,
    "has_previous": boolean
  }
}
```

### 2. Reservoir Naming Convention
- **Backend**: `"Villa Victoria"`, `"Valle de Bravo"`, `"El Bosque"`
- **Frontend**: `"villa_victoria"`, `"valle_bravo"`, `"el_bosque"`

### 3. Data Type Differences
- Backend `total_mm3: int` → Frontend expects `total_mm3: number`
- Some metadata fields missing in backend response

## Implementation Strategy

**Selected Approach**: **Option A - Minimal Frontend Changes**
- Update backend response format to match frontend expectations
- Keep existing frontend API service unchanged
- Add transformation layer in backend
- Maintain consistency with well-designed mock API interface

## Phase 1: Backend Response Alignment

### Task 1: Update Backend Response Model
- [ ] Modify `CutzamalaResponse` in `backend/api/models/response.py`
- [ ] Add missing fields: `filtered_records`, `granularity`, `date_range`, `reservoirs_included`
- [ ] Rename `data` → `readings`
- [ ] Add `pagination` object with `has_next`/`has_previous` logic

### Task 2: Add Response Transformation Layer
- [ ] Create transformation function to convert internal data to frontend format
- [ ] Map reservoir names: `"Valle de Bravo"` → `"valle_bravo"`
- [ ] Ensure consistent data types (int → number, etc.)

### Task 3: Update Backend Route Logic
- [ ] Modify `/cutzamala-readings` in `backend/api/routes/cutzamala.py`
- [ ] Add pagination logic (`has_next`, `has_previous`)
- [ ] Add date range calculation for metadata
- [ ] Include reservoirs_included in response

## Phase 2: Frontend Configuration

### Task 4: Environment Setup
- [ ] Create `.env.local` with `NEXT_PUBLIC_USE_MOCK_DATA=false`
- [ ] Set `NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1`
- [ ] Verify environment configuration loading

### Task 5: Error Handling Enhancement
- [ ] Add graceful fallback to mock data on API failures
- [ ] Enhance error logging for debugging
- [ ] Add connection timeout handling

## Phase 3: Testing & Validation

### Task 6: Integration Testing
- [ ] Test with real backend data
- [ ] Verify all chart components render correctly
- [ ] Test date filtering and reservoir selection
- [ ] Validate data export functionality

### Task 7: Error Scenarios Testing
- [ ] Test backend unavailable scenario
- [ ] Test invalid date ranges
- [ ] Test network timeout handling
- [ ] Verify mock fallback works properly

### Task 8: Performance Validation
- [ ] Measure API response times
- [ ] Test with large date ranges
- [ ] Verify acceptable loading states
- [ ] Optimize if needed

## Testing Checklist

### Backend API Tests
- [ ] `/cutzamala-readings` returns correct structure
- [ ] Pagination works correctly
- [ ] Date filtering functions properly
- [ ] Reservoir filtering works
- [ ] CSV export maintains functionality
- [ ] Error responses match expected format

### Frontend Integration Tests
- [ ] Dashboard loads with real data
- [ ] Charts render with backend data
- [ ] Date picker filters work
- [ ] Reservoir selection functions
- [ ] Export buttons work
- [ ] Loading states display properly
- [ ] Error states handled gracefully

### End-to-End Scenarios
- [ ] Fresh dashboard load
- [ ] Change date range
- [ ] Filter by reservoirs
- [ ] Export data to CSV
- [ ] Handle backend downtime
- [ ] Switch between mock/real data

## Rollback Plan

If integration fails:
1. Set `NEXT_PUBLIC_USE_MOCK_DATA=true`
2. Frontend continues with mock data
3. Debug backend issues separately
4. No user impact

## Notes

- Backend API is rate-limited (50 requests/minute)
- Frontend already handles the expected response format via mock API
- Reservoir capacity constants may need verification against real data
- Consider adding API health check endpoint integration

## Progress Tracking

- [x] Analysis completed
- [x] Integration plan created
- [ ] Phase 1: Backend changes
- [ ] Phase 2: Frontend configuration  
- [ ] Phase 3: Testing & validation
- [ ] Integration complete

---
*Last reviewed: 2025-08-24*