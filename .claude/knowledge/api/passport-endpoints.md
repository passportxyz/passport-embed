# Passport API Endpoints

## Score Endpoint

### GET `/embed/score/{scorerId}/{address}`

Fetches the current passport score for a given address.

**Important**: The actual API path is `/embed/score`, NOT `/api/v1/score`

**Response Format**: All fields use snake_case (not camelCase)

```typescript
{
  address: string;
  score: string; // numeric value as string
  passing_score: boolean; // NOT passingScore
  last_score_timestamp: string; // ISO timestamp
  expiration_timestamp: string; // ISO timestamp
  threshold: string; // numeric value as string
  stamps: {
    score: string;
    dedup: boolean;
    expiration_date: string; // ISO timestamp
  }
  [];
}
```

**Note**: The widget's `usePassportScore` hook internally converts these snake_case fields to camelCase for component usage.

## Verification Endpoints

### POST `/embed/verify/{scorerId}/{address}`

Verifies and adds new credentials/stamps to a passport.

**Important**: The actual API path is `/embed/verify`, NOT `/api/v1/verify`

**Purpose**: Bulk verification of multiple stamps
**Returns**: Updated passport score with new stamps (same format as score endpoint)

### POST `/api/v1/platform/{platform}/verify`

Individual platform verification endpoint.

**Purpose**: Verify a single platform credential
**Parameters**: Platform name in URL path
**Body**: Platform-specific verification data

### POST `/embed/auto-verify/{scorerId}/{address}`

Automatically verifies credentials for a given address.

**Purpose**: Automatic verification of credentials without user interaction
**Returns**: Updated passport score with auto-verified stamps (same format as score endpoint)

## Stamp Pages Endpoint

### GET `/embed/stamps/metadata`

Fetches available stamp pages and their metadata.

**Purpose**: Get list of available stamp verification options
**Response**: Array of stamp page configurations

**Error Responses**:

- **500**: Server error - "Request failed with status code 500"
- **401**: Invalid API key - "Request failed with status code 401"
- **404**: Scorer not found - "Request failed with status code 404"
- **429**: Rate limited - "Request failed with status code 429"

**UI Behavior**:

- Shows axios error message in UI
- Displays "Try Again" button that calls `refetch()` from React Query
- Uses React Query with 1 hour stale time
- No refetch on mount/focus

**Related files:**

- `src/hooks/useStampPages.tsx`
- `src/components/Body/ScoreTooLowBody.tsx`

## Rate Limiting

### HTTP 429 Responses

- **Status**: 429 Too Many Requests
- **Header**: `Retry-After` (seconds to wait)
- **React Query handling**: Automatically handled without retries
- **User experience**: Shows rate limit message in UI

## Error Handling

- **400**: Bad request - invalid parameters
- **401**: Unauthorized - invalid API key
- **404**: Not found - scorer or address not found
- **429**: Rate limited - too many requests
- **500**: Internal server error

## Environment Configuration

- **Service URL**: Configurable via `VITE_EMBED_SERVICE_URL`
- **Default**: Uses `DEFAULT_EMBED_SERVICE_URL` constant
- **API Key**: Required via `VITE_API_KEY`
- **Scorer ID**: Required via `VITE_SCORER_ID`

**Related files:**

- `src/hooks/usePassportScore.tsx`
- `dev/src/mocks/handlers.ts`
- `dev/src/mocks/ScenarioManager.ts`
- `src/config/environment.ts`
