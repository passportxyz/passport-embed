# Passport API Endpoints

## Score Endpoint

### GET `/api/v1/score/{scorerId}/{address}`
Fetches the current passport score for a given address.

**Response Type**: `PassportScore`
```typescript
{
  address: string
  score: string
  passingScore: string
  lastScoreTimestamp: string
  expirationTimestamp: string
  threshold: string
  stamps: Array<{
    score: string
    dedup: boolean
    expirationDate: string
  }>
}
```

## Verification Endpoints

### POST `/api/v1/verify/{scorerId}/{address}`
Verifies and adds new credentials/stamps to a passport.

**Purpose**: Bulk verification of multiple stamps
**Returns**: Updated passport score with new stamps

### POST `/api/v1/platform/{platform}/verify`
Individual platform verification endpoint.

**Purpose**: Verify a single platform credential
**Parameters**: Platform name in URL path
**Body**: Platform-specific verification data

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
- `src/mocks/handlers.ts`
- `src/config/environment.ts`