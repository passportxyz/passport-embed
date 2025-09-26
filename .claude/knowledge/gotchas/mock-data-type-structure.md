# Mock Data Type Structure

## Mock data type structure matches production types correctly (2025-09-23)

**Status**: ✅ Working correctly - No issues found

Investigation confirms that mock data structure in MSW scenarios and ScenarioManager correctly matches the defined TypeScript types. The data flow is:

### 1. Scenarios Definition
In `dev/src/mocks/scenarios.ts`, stamps are defined as `Record<string, Stamp>` where Stamp has:
- score: number
- dedup: boolean
- expirationDate: Date

### 2. ScenarioManager Transformation
Converts scenario data to API snake_case format:
- score: string (converted from number)
- expiration_date: string (converted from Date.toISOString())
- dedup: boolean (unchanged)

### 3. API Response Format
Uses snake_case (`EmbedScoreResponse` type):
- stamps: Record<string, { score: string; expiration_date: string; dedup: boolean }>
- last_score_timestamp: string
- expiration_timestamp: string

### 4. SDK Processing
The `processScoreResponse` function converts API response to SDK types:
- stamps: Record<string, PassportProviderPoints> where PassportProviderPoints has:
  - score: number (parseFloat from string)
  - dedup: boolean (unchanged)
  - expirationDate: Date (new Date from string)

### Key Findings
The type system is working correctly with proper conversion at each layer. No mismatches found between:
- Mock scenario definitions
- ScenarioManager transformations
- API response types
- SDK processing logic

**Related files:**
- `src/hooks/usePassportScore.tsx`
- `dev/src/mocks/scenarios.ts`
- `dev/src/mocks/ScenarioManager.ts`