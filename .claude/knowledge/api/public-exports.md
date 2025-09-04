# Library Public API Exports

The @passportxyz/passport-embed library exports:

## Components

- **PassportScoreWidget**: Main widget component
  - Required props: `apiKey`, `scorerId`
  - Supports callbacks for wallet connection and signature generation

## Hooks

- **usePassportScore**: Hook for accessing passport score data
- **useVerifyCredentials**: Hook for credential verification
- **usePassportQueryClient**: Hook for accessing the singleton QueryClient
  - Returns shared QueryClient instance used by all SDK components
  - Configuration includes:
    - `refetchOnWindowFocus: true`
    - `refetchOnMount: true`
    - `staleTime: 60000` (1 minute)
    - `gcTime: 86400000` (24 hours)
    - Special retry logic: No retries for 429 errors, up to 2 retries for others
  - Useful in dev for `queryClient.invalidateQueries()` to force refetch with new MSW data
- **useHumanIDVerification**: Hook for Human ID verification flow
  - Encapsulates all Human ID SDK logic
  - Detects Human ID platform types
  - Checks for existing SBTs on-chain
  - Handles verification flow
  - Provides error and loading state management

## Themes

- **DarkTheme**: Dark theme configuration
- **LightTheme**: Light theme configuration

## Types

- **PassportScoreWidgetProps**: Props type for PassportScoreWidget
- **GenericPassportWidgetProps**: Generic widget props
- **PassportWidgetTheme**: Theme configuration type
- **CollapseMode**: Collapse mode enum

## Constants

- **DEFAULT_EMBED_SERVICE_URL**: Default service URL constant

**Related files:**

- `src/index.ts`
- `example/src/index.tsx`
- `src/hooks/useHumanIDVerification.tsx`
