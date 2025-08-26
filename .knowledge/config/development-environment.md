# Development Environment Configuration with MSW

## Environment Setup

### Environment Variables
- `VITE_ENABLE_MSW=true` - Enables MSW mocking
- Can be set in `.env.mock` file or directly in terminal

### NPM Scripts
```json
{
  "dev:mock": "VITE_ENABLE_MSW=true vite",  // Enables MSW
  "dev:real": "vite"                         // Disables MSW
}
```

### MSW Configuration
In `package.json`:
```json
{
  "msw": {
    "workerDirectory": "public"
  }
}
```

### Vite Configuration
- Alias maps `@passportxyz/passport-embed` to local source for hot reload
- Public folder serves static assets including mockServiceWorker.js

### Visual Indicators
When MSW is active:
- Orange "MSW Active" badge appears
- Scenario switcher panel is available
- Current scenario is displayed

### Scenario Control Methods
1. URL params: `?scenario=name`
2. localStorage: Set `msw-scenario` key
3. UI switcher: Interactive panel in development mode

## Key Files
- `example/package.json` - Script definitions
- `example/vite.config.ts` - Build configuration
- `src/config/environment.ts` - Environment variable handling
- `example/.env.mock` - Mock environment variables