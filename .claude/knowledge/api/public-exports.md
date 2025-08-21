# Library Public API Exports

The @passportxyz/passport-embed library exports:

## Components
- **PassportScoreWidget**: Main widget component
  - Required props: `apiKey`, `scorerId`
  - Supports callbacks for wallet connection and signature generation

## Hooks
- **usePassportScore**: Hook for accessing passport score data
- **useVerifyCredentials**: Hook for credential verification
- **usePassportQueryClient**: Hook for accessing the query client

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