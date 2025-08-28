# Development Workflows

## Local Development Workflow
The main package has a 'dev' script that runs 'cd dev && yarn dev', which starts the Vite dev server. The library uses webpack for building and has a 'localpub' script that builds and uses yalc for local publishing.

The dev app has been configured with a Vite alias that maps '@passportxyz/passport-embed' to the parent src folder, enabling local development with hot reload.

**Related files:**
- `package.json`
- `dev/vite.config.ts/js`

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

**Related files:**
- `dev/vite.config.ts/js`
- `dev/src/index.tsx/jsx`
- `src/components/Header.tsx/jsx`

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

### Configuration Files
- **msw.workerDirectory**: Set to "public" in package.json
- **Environment variable**: VITE_ENABLE_MSW controls activation
- **Scenarios**: Defined in `dev/src/mocks/scenarios.ts/js`
- **Handlers**: API endpoints mocked in `dev/src/mocks/handlers.ts/js`

**Related files:**
- `dev/src/setupMocks.ts/js`
- `dev/src/mocks/browser.ts/js`
- `dev/public/mockServiceWorker.js`
- `dev/.env.mock`

## Playwright MCP Testing Workflow on Fedora

Successfully configured Playwright MCP to work on Fedora systems:

### Key Steps
1. **Update .mcp.json**: Use `--browser chromium --headless` instead of Chrome
2. **Install dependencies**: Run `fedora-install-playwright-deps.sh` script to install required system libraries
3. **Create dev/.env**: Add dummy API key and scorer ID for MSW testing
4. **Start dev server**: Run `npm run dev:mock` on changing ports (5173, 5174, etc)
5. **Launch Playwright MCP**: Works in headless Chromium mode and can interact with the dev app
6. **Mock wallet mode**: Eliminates need for MetaMask during development

**Related files:**
- `.mcp.json`
- `fedora-install-playwright-deps.sh`
- `dev/.env`

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

**Related files:**
- `src/widgets/PassportScoreWidget.tsx`
- `src/components/widget-body/*.tsx`