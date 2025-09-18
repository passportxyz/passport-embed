# Development Environment Guide

## Dev App Setup

The dev app uses Vite for development with React plugin. It has an alias mapping "passport-widgets" to the parent src directory for local development. The dev script runs vite which should provide hot module replacement (HMR) out of the box.

## Local Development Workflow

The main package has a 'dev' script that runs 'cd dev && yarn dev', which starts the Vite dev server. The library uses webpack for building and has a 'localpub' script that builds and uses yalc for local publishing.

The dev app has been configured with a Vite alias that maps '@passportxyz/passport-embed' to the parent src folder, enabling local development with hot reload.

## Hot Reload Development Setup

The dev app uses Vite with hot module replacement (HMR) that works for both dev app files and the parent library source files.

### Configuration:

- The `vite.config.ts` aliases '@passportxyz/passport-embed' to the parent '../src' directory
- Server is configured to run on port 5173 and auto-open the browser
- Changes to both dev/src files and parent src/ files trigger immediate updates in the browser without manual refresh

### Benefits:

- Instant feedback when editing library components
- No need to rebuild the library for each change
- Preserves React component state during hot updates

## Environment Variables for Passport Widget

The dev app requires environment variables to work with the PassportScoreWidget:

- `VITE_API_KEY`: API key for the Passport service
- `VITE_SCORER_ID`: Scorer ID for the Passport service

These are loaded via Vite's `import.meta.env`.

## Widget CSS Variables Configuration

The widget uses CSS variables for consistent spacing and theming:

### Padding Variables:

- `--widget-padding-x-c6dbf459`: 20px (horizontal padding)
- `--widget-padding-y-c6dbf459`: 20px (vertical padding - changed from 12px for better alignment)

These variables are used throughout the widget for:

- Body container: `padding: var(--widget-padding-y-c6dbf459) var(--widget-padding-x-c6dbf459)`
- Header: Same padding pattern
- PlatformVerification: Various spacing calculations including max-height

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

## MSW Setup Process

### Initial Setup

Step-by-step MSW initialization for API mocking:

1. **Initialize service worker**: Run `npx msw init public/` to create the service worker file
2. **Enable with environment variable**: Set `VITE_ENABLE_MSW=true` in `.env.mock` or terminal
3. **Use convenience scripts**:
   - `npm run dev:mock` - Starts dev server with MSW enabled
   - `npm run dev:real` - Starts dev server with MSW disabled
4. **Service worker registration**: File served at root URL by Vite

### Important Notes

- The `mockServiceWorker.js` is NOT automatically loaded - requires explicit registration
- Registration happens via `worker.start()` which calls `navigator.serviceWorker.register()`
- Service worker only intercepts requests after successful registration
- Acts as network proxy between app and APIs

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

## Playwright MCP Testing Workflow on Fedora

Successfully configured Playwright MCP to work on Fedora systems:

### Key Steps

1. **Update .mcp.json**: Use `--browser chromium --headless` instead of Chrome
2. **Install dependencies**: Run `fedora-install-playwright-deps.sh` script to install required system libraries
3. **Create dev/.env**: Add dummy API key and scorer ID for MSW testing
4. **Start dev server**: Run `npm run dev:mock` on changing ports (5173, 5174, etc)
5. **Launch Playwright MCP**: Works in headless Chromium mode and can interact with the dev app
6. **Mock wallet mode**: Eliminates need for MetaMask during development

## Widget User Flow States

The PassportScoreWidget progresses through different body components based on user state:

### State Progression

1. **ConnectWalletBody** - Initial state showing "Connect Wallet" button
2. **CheckingBody** - Shows "Verifying onchain activity..." after wallet connection
3. **ScoreTooLowBody** - Shown if score < threshold (has InitialTooLow and AddStamps states)
4. **CongratsBody** - Final success state when score >= threshold

### Styling Notes

- Each state uses consistent CSS with `--widget-padding-x/y` variables (20px)
- Flex layouts for vertical centering
- Consistent visual hierarchy throughout flow

## Cross-References

See related documentation:

- **TypeScript Path Mapping**: @config/typescript-path-mapping.md - TypeScript path mapping for local development with Vite aliases
- **MSW Infrastructure**: @architecture/msw-infrastructure.md - Overall MSW system architecture and organization
- **Testing Framework**: @testing/framework-setup.md - Complete test framework setup with MSW integration
- **Playwright Automation**: @workflows/playwright-automation.md - Playwright MCP browser automation best practices

**Related files:**

- `/workspace/project/dev/vite.config.ts`
- `/workspace/project/dev/package.json`
- `/workspace/project/package.json`
- `/workspace/project/dev/.env-example`
- `/workspace/project/dev/src/index.tsx`
- `/workspace/project/src/widgets/Widget.module.css`
- `/workspace/project/src/components/Body/Body.module.css`
- `/workspace/project/src/components/Body/PlatformVerification.module.css`
- `/workspace/project/dev/src/setupMocks.ts`
- `/workspace/project/dev/src/mocks/browser.ts`
- `/workspace/project/dev/public/mockServiceWorker.js`
- `/workspace/project/dev/.env.mock`
- `/workspace/project/dev/src/components/ScenarioSwitcher.tsx`
- `/workspace/project/.mcp.json`
- `/workspace/project/fedora-install-playwright-deps.sh`
- `/workspace/project/dev/.env`
- `/workspace/project/src/widgets/PassportScoreWidget.tsx`
- `/workspace/project/src/components/widget-body/*.tsx`