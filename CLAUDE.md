## ⚠️ IMPORTANT: Manual Chronicler Process

After making commits with significant gathered knowledge, **remind the user** to run:

```bash
./chronicler-quicken
```

This processes the `.claude/knowledge/session.md` file into organized documentation. The chronicler cannot run automatically due to timeout issues in hooks/agents that crash Claude.

<!-- BEGIN CHRONICLER: knowledge-gathering-protocol -->

## 🧠 Knowledge Gathering Protocol

You have access to the gather_knowledge tool. You MUST use it PROACTIVELY to capture ALL discoveries about this project.

Use gather_knowledge with these parameters:

- **category**: Type of knowledge (use descriptive categories like: architecture, pattern, dependency, workflow, config, gotcha, convention, api, database, testing, security, etc.)
- **topic**: Brief title of what you learned
- **details**: Specific information discovered
- **files**: Related file paths (optional)

✅ ALWAYS capture when you:

- Understand how something works
- Find configuration or setup details
- Discover a pattern or convention
- Hit a surprising behavior
- Learn about dependencies or integrations
- Figure out a workflow or process

❌ DON'T capture:

- Syntax errors or typos
- Temporary debugging info
- Personal TODOs (use TodoWrite instead)
<!-- END CHRONICLER: knowledge-gathering-protocol -->

<!-- BEGIN CHRONICLER: project-architecture -->

## 🏗️ Project Architecture

### Build System
- **Webpack configuration** for both ESM and CJS bundles
- **CSS Modules** for self-contained styling (no parent app CSS framework requirements)
- **Tree-shaking enabled** with sideEffects: false
- **TypeScript declarations** generated separately using tsc

### Passport Widget Body Components
- **ConnectWalletBody**: Shows "Proof of Unique Humanity" with Connect Wallet button
- **CheckingBody**: Displays "Verifying onchain activity..." with disabled Verifying button
- **ScoreTooLowBody**: Two states - InitialTooLow (low score message) and AddStamps (verification options)
- **CongratsBody**: Congratulations message without button (uses extraBottomMarginForBodyWithoutButton)

### Component Patterns
- All body components use `styles.textBlock` for text content
- textBlock uses `flex-grow: 1` and `justify-content: center` for vertical centering
- All screens except CongratsBody have a Button component at bottom

### React Query Integration
The SDK uses @tanstack/react-query for efficient data fetching:
- **QueryContextProvider** wraps the app with API key, address, and scorerId configuration
- **usePassportQueryClient** creates singleton QueryClient with retry logic and rate limit handling
- **usePassportScore** hook fetches passport score data from embed service API
- Special handling for 429 (rate limit) errors - no retries on rate limit
- Service URL configurable via environment variables (defaults to DEFAULT_EMBED_SERVICE_URL)

### Component Structure
- SDK provides embeddable React components for passport verification
- Callback-based architecture for wallet integration
- UI components handle connection, verification, and score display flows
<!-- END CHRONICLER: project-architecture -->

<!-- BEGIN CHRONICLER: key-patterns -->

## 🎯 Key Patterns

### CSS Variables for Consistent Spacing
- `--widget-padding-x-c6dbf459`: 20px (horizontal padding)
- `--widget-padding-y-c6dbf459`: 20px (vertical padding)
- Used throughout widget for container padding and spacing calculations

### Flexible Text Layout
- Text blocks use flexbox with `flex-grow: 1` for dynamic vertical centering
- Consistent padding patterns across all body components

### MSW Scenario System
Flexible mock data architecture for testing:
- **Multiple scenarios** defined in `src/mocks/scenarios.ts` (low-score, high-score, rate-limited, etc.)
- **Dynamic handler selection** based on URL params (?scenario=name) or localStorage
- **Each scenario controls**: score, stamps, verification behavior, ability to add stamps
- **Realistic delays** (300-500ms) for authentic behavior
- **Visual indicators** show MSW status and current scenario

### Wallet Callback Pattern
- SDK doesn't directly integrate with wallet providers
- Uses **connectWalletCallback** and **generateSignatureCallback** for flexibility
- Consumer maintains full control over wallet interactions
- Framework agnostic - works with any wallet provider
<!-- END CHRONICLER: key-patterns -->

<!-- BEGIN CHRONICLER: dependencies -->

## 📦 Dependencies

### Core Dependencies
- **React 18.3.1**: Main UI library (peer dependency)
- **@gitcoin/passport-sdk-types**: Core Passport types
- **@gitcoin/passport-sdk-verifier**: Verification functionality

### Build Dependencies
- **Webpack 5**: Module bundler for library builds
- **PostCSS with Autoprefixer**: CSS processing
- **TypeScript 5.6**: Type safety and declarations
- **Babel**: JavaScript transpilation for compatibility

- **@tanstack/react-query**: Data fetching and caching
- **MSW (Mock Service Worker)**: API mocking for development/testing
- **Vite**: Build tool and dev server
- **React**: UI framework

### Wallet Integration
- No direct wallet dependencies - uses callback pattern
- Mock wallet available for testing (`src/mocks/mockWallet.ts`)
- Returns hardcoded address (0x1234...7890) for consistent testing

### API Integration
- Passport embed service API endpoints:
  - GET `/api/v1/score/{scorerId}/{address}`
  - POST `/api/v1/verify/{scorerId}/{address}`
  - POST `/api/v1/platform/{platform}/verify`
<!-- END CHRONICLER: dependencies -->

<!-- BEGIN CHRONICLER: development-workflows -->

## 🔄 Development Workflows

### Local Development Setup
1. Run `yarn install` in root directory (installs dependencies including autoprefixer)
2. Run `yarn build` to build the library
3. Navigate to `example/` directory
4. Set up `.env` file with VITE_API_KEY and VITE_SCORER_ID
5. Run `yarn dev` to start Vite dev server with hot reload

### Example App Configuration
- Uses Vite with React plugin
- Alias mapping "passport-widgets" to parent src directory
- Hot Module Replacement (HMR) enabled out of the box

### MSW Setup Process
1. Initialize service worker: `npx msw init public/`
2. Enable with environment variable: `VITE_ENABLE_MSW=true`
3. Use convenience scripts:
   - `npm run dev:mock` - Enables MSW
   - `npm run dev:real` - Disables MSW
4. Service worker file served at root URL by Vite

### Testing with Mock Data
1. Start dev server with MSW: `npm run dev:mock`
2. Select scenario via:
   - URL param: `?scenario=low-score`
   - UI switcher component (visible when MSW active)
   - localStorage: Set `msw-scenario` key
3. Test different user journeys without real blockchain/APIs

### Development Environment
- Visual indicators: Orange "MSW Active" badge when mocking enabled
- Hot reload via Vite alias mapping to local source
- Mock wallet eliminates need for MetaMask in development
<!-- END CHRONICLER: development-workflows -->

<!-- BEGIN CHRONICLER: recent-discoveries -->

## 💡 Recent Discoveries

### Text Alignment Fix (2025-08-21)
- **Issue**: Button had only 13px bottom padding instead of 20px
- **Solution**: Changed `--widget-padding-y-c6dbf459` from 12px to 20px
- **Impact**: Also adjusted platformButtonGroup height (110px → 126px) and PlatformVerification max-height (120px → 136px)
- **Result**: Consistent 20px padding on all sides, improved vertical text centering

### PostCSS Autoprefixer Resolution (2025-08-21)
- **Issue**: Example app failed to start due to missing autoprefixer
- **Cause**: Vite finds PostCSS config in parent package.json which requires autoprefixer
- **Solution**: Run `yarn install` in parent directory first to make autoprefixer available

- The `mockServiceWorker.js` file is NOT automatically loaded - requires explicit registration
- Registration happens via `worker.start()` which calls `navigator.serviceWorker.register()`
- Service worker only intercepts requests after successful registration
- Acts as network proxy between app and APIs

### Testing Strategy Benefits (2025-08-21)
- Dual mocking (wallet + API) eliminates need for:
  - MetaMask installation
  - Real blockchain connection
  - Backend API availability
  - Actual wallet signatures
- Scenarios persist across reloads via localStorage or URL params
<!-- END CHRONICLER: recent-discoveries -->
