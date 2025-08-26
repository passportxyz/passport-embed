# React Query Integration with Passport SDK

## Overview
The project uses @tanstack/react-query for data fetching with a custom QueryClient setup optimized for the Passport SDK's needs.

## Key Components

### QueryContextProvider
- Wraps the app and provides API key, address, and scorerId configuration
- Location: `src/components/QueryContextProvider.tsx`

### usePassportQueryClient
- Creates a singleton QueryClient with retry logic and rate limit handling
- Special handling for 429 (rate limit) errors - no retries on rate limit
- Location: `src/hooks/usePassportQueryClient.tsx`

### usePassportScore
- Fetches passport score data from an embed service API
- The service URL defaults to DEFAULT_EMBED_SERVICE_URL but can be overridden
- Location: `src/hooks/usePassportScore.tsx`

## Configuration
- Service endpoints can be configured via environment variables
- Rate limiting is handled automatically without retries