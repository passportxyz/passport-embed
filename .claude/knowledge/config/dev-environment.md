# Development Environment Configuration

## Dev App Setup

The dev app uses Vite for development with React plugin. It has an alias mapping "passport-widgets" to the parent src directory for local development. The dev script runs vite which should provide hot module replacement (HMR) out of the box.

**Related files:**

- `dev/vite.config.ts/js`
- `dev/package.json`

## Environment Variables for Passport Widget

The dev app requires environment variables to work with the PassportScoreWidget:

- `VITE_API_KEY`: API key for the Passport service
- `VITE_SCORER_ID`: Scorer ID for the Passport service

These are loaded via Vite's `import.meta.env`.

**Related files:**

- `dev/.env-example`
- `dev/src/index.tsx/jsx`

## Widget CSS Variables Configuration

The widget uses CSS variables for consistent spacing and theming:

### Padding Variables:

- `--widget-padding-x-c6dbf459`: 20px (horizontal padding)
- `--widget-padding-y-c6dbf459`: 20px (vertical padding - changed from 12px for better alignment)

These variables are used throughout the widget for:

- Body container: `padding: var(--widget-padding-y-c6dbf459) var(--widget-padding-x-c6dbf459)`
- Header: Same padding pattern
- PlatformVerification: Various spacing calculations including max-height

**Related files:**

- `src/widgets/Widget.module.css`
- `src/components/Body/Body.module.css`
- `src/components/Body/PlatformVerification.module.css`

## MSW Development Configuration

### Environment Setup

MSW configuration for API mocking in development:

- **VITE_ENABLE_MSW**: Set to `true` to enable MSW mocking
- **Can be set in**: `.env.mock` file or terminal environment
- **NPM scripts**:
  - `dev:mock`: Starts dev server with MSW enabled
  - `dev:real`: Starts dev server with MSW disabled (real APIs)

### Configuration Files

- **msw.workerDirectory**: Set to "public" in package.json
- **Vite alias**: Maps `@passportxyz/passport-embed` to local source for hot reload
- **Service worker**: Located at `public/mockServiceWorker.js`

### Visual Indicators

When MSW is active:

- **Orange badge**: "MSW Active" indicator in UI
- **Scenario switcher**: Panel for selecting test scenarios
- **Current scenario**: Displayed name of active scenario
- Only visible in development mode

### Scenario Control Methods

1. **URL parameters**: `?scenario=low-score` (primary method)
2. **UI switcher**: Interactive panel in development

**Related files:**

- `dev/package.json`
- `dev/vite.config.ts/js`
- `src/config/environment.ts/js`
- `dev/.env.mock`
- `dev/src/components/ScenarioSwitcher.tsx/jsx`

## Playwright MCP Configuration for Fedora

Playwright MCP server configuration needs special settings for Fedora systems since Chrome isn't easily available:

### Configuration Requirements

- **Browser**: Must specify `--browser chromium` instead of Chrome
- **Mode**: Use `--headless` for Fedora systems
- **Dependencies**: Requires system libraries installed via `fedora-install-playwright-deps.sh`

### Installation Script

Created `fedora-install-playwright-deps.sh` script to install all required system dependencies for running Playwright browsers on Fedora/RHEL systems. The script installs libraries for:

- Chromium support
- Firefox support
- WebKit support

**Related files:**

- `.mcp.json`
- `fedora-install-playwright-deps.sh`
