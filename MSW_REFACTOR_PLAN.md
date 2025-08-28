# MSW System Refactor Plan

## Problem Statement

The Mock Service Worker (MSW) testing infrastructure is currently part of the SDK source code (`src/mocks/`), which causes several critical issues:

1. **Production Bundle Bloat** - All MSW code, mock scenarios, and test data ship to production users
2. **Security Risk** - Test scenarios and mock endpoints are exposed in the production bundle
3. **Architectural Issue** - Development/testing tools are mixed with production SDK code
4. **Scattered Logic** - Scenario selection and management logic is duplicated across multiple files

## Current Structure (BAD)

```
src/                           # SDK source (gets built and published)
├── mocks/                     # ❌ Ships to production!
│   ├── browser.ts            
│   ├── handlers.ts           
│   ├── mockWallet.ts         
│   └── scenarios.ts          
├── components/
│   └── ScenarioSwitcher.tsx  # ❌ Dev UI in production code!
└── config/
    └── environment.ts         # ❌ Has MSW config that ships to prod

example/                       # Development/testing app
├── src/
│   ├── setupMocks.ts         # ✅ Correct location
│   └── index.tsx             # Currently imports from wrong location
```

## Proposed Structure (GOOD)

```
src/                           # SDK source - CLEAN, no MSW code
├── components/               # Only production components
└── contexts/                 # Only production code

dev/                           # Renamed from 'example/' - clearer purpose
├── src/
│   ├── mocks/                # ✅ All MSW code here
│   │   ├── browser.js        
│   │   ├── handlers.js       
│   │   ├── mockWallet.js     
│   │   ├── scenarios.js      # Pure scenario data
│   │   └── ScenarioManager.js # New: Centralized scenario logic
│   ├── components/
│   │   └── ScenarioSwitcher.jsx  # ✅ Dev UI in dev app
│   ├── setupMocks.js         
│   └── index.tsx             # Simple MSW toggle
├── tests/                    # ✅ Tests live with dev environment
│   ├── unit/                # Component tests using MSW
│   └── e2e/                 # Playwright tests using MSW  
└── test-scenarios.md         # Scenario documentation
```

## Implementation Steps

### Step 1: Rename example/ to dev/ and Move MSW Files

Rename the folder and move all MSW-related files from `src/` to `dev/src/`:

```bash
# Rename example to dev
mv example/ dev/

# Create new structure
mkdir -p dev/src/mocks
mkdir -p dev/src/components
mkdir -p dev/tests/unit
mkdir -p dev/tests/e2e

# Move files (preserving functionality)
mv src/mocks/scenarios.ts dev/src/mocks/scenarios.js
mv src/mocks/handlers.ts dev/src/mocks/handlers.js
mv src/mocks/browser.ts dev/src/mocks/browser.js
mv src/mocks/mockWallet.ts dev/src/mocks/mockWallet.js
mv src/components/ScenarioSwitcher.tsx dev/src/components/ScenarioSwitcher.jsx

# Move test files
mv tests/scenarios.spec.ts dev/tests/e2e/scenarios.spec.ts
mv tests/msw-mock.spec.ts dev/tests/e2e/msw-mock.spec.ts
```

### Step 2: Create ScenarioManager

Create `dev/src/mocks/ScenarioManager.js` to centralize all scenario logic:

```javascript
import { scenarios } from './scenarios';
import { HttpResponse } from 'msw';

class ScenarioManager {
  constructor() {
    // Only check URL params - simpler!
    this.current = this.detectScenario();
  }
  
  detectScenario() {
    // URL params only - no localStorage complexity
    const urlParams = new URLSearchParams(window.location.search);
    const urlScenario = urlParams.get('scenario');
    return (urlScenario && scenarios[urlScenario]) ? urlScenario : 'default';
  }
  
  switchScenario(name) {
    if (!scenarios[name]) {
      console.warn(`Unknown scenario: ${name}`);
      return;
    }
    this.current = name;
    // No reload needed - we'll invalidate React Query cache instead
    const url = new URL(window.location);
    url.searchParams.set('scenario', name);
    window.history.pushState({}, '', url);
  }
  
  getCurrentScenario() {
    return scenarios[this.current];
  }
  
  // Encapsulate all response generation logic
  getScoreResponse(address) {
    const scenario = this.getCurrentScenario();
    
    // Handle rate limiting
    if (scenario.verificationBehavior === 'rate-limit') {
      throw new HttpResponse(null, { 
        status: 429,
        statusText: 'Too Many Requests',
        headers: { 'Retry-After': '60' }
      });
    }
    
    // Return score data
    return {
      ...scenario.passportScore,
      address,
      lastScoreTimestamp: new Date(),
      expirationTimestamp: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };
  }
  
  getVerifyResponse(address, credentialIds) {
    const scenario = this.getCurrentScenario();
    
    // Handle different verification behaviors
    switch (scenario.verificationBehavior) {
      case 'rate-limit':
        throw new HttpResponse(null, { 
          status: 429,
          statusText: 'Too Many Requests' 
        });
        
      case 'failure':
        throw new HttpResponse(
          JSON.stringify({ 
            error: 'Verification failed',
            message: 'Unable to verify credentials at this time'
          }), 
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
        
      case 'success':
      default:
        if (!scenario.canAddStamps) {
          return this.getScoreResponse(address);
        }
        
        // Add new stamps logic
        const newStamps = credentialIds?.reduce((acc, id) => ({
          ...acc,
          [id]: { score: 3.5, dedup: true, expirationDate: new Date() }
        }), {}) || {};
        
        const newStampScore = Object.values(newStamps).reduce((sum, stamp) => sum + stamp.score, 0);
        const updatedScore = scenario.passportScore.score + newStampScore;
        
        return {
          ...scenario.passportScore,
          address,
          score: updatedScore,
          passingScore: updatedScore >= scenario.passportScore.threshold,
          stamps: {
            ...scenario.passportScore.stamps,
            ...newStamps
          },
          lastScoreTimestamp: new Date(),
          expirationTimestamp: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        };
    }
  }
}

export const scenarioManager = new ScenarioManager();
```

### Step 3: Simplify Handlers

Update `dev/src/mocks/handlers.js` to be pure request/response mapping:

```javascript
import { http, HttpResponse, delay } from 'msw';
import { scenarioManager } from './ScenarioManager';

const API_BASE = 'http://localhost:8004'; // Or import from config

export const handlers = [
  // Clean handler - no scenario logic
  http.get(`${API_BASE}/api/v1/score/:scorerId/:address`, async ({ params }) => {
    await delay(300); // Realistic delay
    try {
      const response = scenarioManager.getScoreResponse(params.address);
      return HttpResponse.json(response);
    } catch (error) {
      if (error instanceof HttpResponse) return error;
      throw error;
    }
  }),

  http.post(`${API_BASE}/api/v1/verify/:scorerId/:address`, async ({ request, params }) => {
    await delay(500);
    try {
      const body = await request.json();
      const response = scenarioManager.getVerifyResponse(params.address, body.credentialIds);
      return HttpResponse.json(response);
    } catch (error) {
      if (error instanceof HttpResponse) return error;
      throw error;
    }
  }),
];
```

### Step 4: Update ScenarioSwitcher Component

Move and update `dev/src/components/ScenarioSwitcher.jsx`:

```javascript
import { useState } from 'react';
import { usePassportQueryClient } from '@passportxyz/passport-embed';
import { scenarioManager } from '../mocks/ScenarioManager';
import { scenarios } from '../mocks/scenarios';

export function ScenarioSwitcher() {
  const [currentScenario, setCurrentScenario] = useState(scenarioManager.current);
  const queryClient = usePassportQueryClient(); // Get SDK's query client

  const handleScenarioChange = (name) => {
    setCurrentScenario(name);
    scenarioManager.switchScenario(name);
    // Invalidate cache to trigger refetch with new scenario data
    queryClient.invalidateQueries();
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '10px',
      right: '10px',
      background: 'white',
      border: '2px solid #ff6b00',
      borderRadius: '8px',
      padding: '10px',
      zIndex: 10000,
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      maxWidth: '300px',
    }}>
      <div style={{ 
        fontWeight: 'bold', 
        marginBottom: '8px',
        color: '#ff6b00',
        fontSize: '12px',
      }}>
        🎭 MSW Scenario
      </div>
      <select
        value={currentScenario}
        onChange={(e) => handleScenarioChange(e.target.value)}
        style={{
          width: '100%',
          padding: '4px',
          fontSize: '12px',
          borderRadius: '4px',
          border: '1px solid #ccc',
          marginBottom: '8px',
        }}
      >
        {Object.entries(scenarios).map(([key, scenario]) => (
          <option key={key} value={key}>
            {scenario.description}
          </option>
        ))}
      </select>
      <div style={{ fontSize: '10px', color: '#666' }}>
        Score: {scenarios[currentScenario].passportScore.score} | 
        Threshold: {scenarios[currentScenario].passportScore.threshold}
      </div>
    </div>
  );
}
```

### Step 5: Simplify Dev App Setup

Update `dev/src/index.tsx` to remove environment variables:

```javascript
import { createRoot } from "react-dom/client";
import { useState } from "react";
// ... other imports

// Simple toggle - no env vars needed
const USE_MOCKS = true; // Or make this a UI toggle

// Conditionally import dev tools
if (USE_MOCKS) {
  import('./mocks/browser').then(({ worker }) => {
    worker.start({
      onUnhandledRequest: 'bypass',
    });
  });
  
  // Dynamically import ScenarioSwitcher only in mock mode
  import('./components/ScenarioSwitcher').then(({ ScenarioSwitcher }) => {
    // Add to DOM or pass to App component
  });
}

// Rest of app...
```

### Step 6: Remove Environment Config

Delete or clean up `src/config/environment.ts` - it should not exist in the SDK source, or if it does, it should only contain production configuration.

### Step 7: Update Import Paths

Fix all imports in the dev app to use local paths instead of importing from the SDK:

```javascript
// Before (BAD)
import { ScenarioSwitcher } from "@passportxyz/passport-embed/src/components/ScenarioSwitcher";

// After (GOOD)  
import { ScenarioSwitcher } from "./components/ScenarioSwitcher";
```

## Testing Strategy

### Test Organization
All tests live in `dev/tests/` alongside the mocks they use:

```javascript
// dev/tests/unit/PassportWidget.test.tsx
import { render } from '@testing-library/react';
import { PassportScoreWidget } from '@passportxyz/passport-embed'; // Import built SDK
import { worker } from '../../src/mocks/browser';
import { scenarioManager } from '../../src/mocks/ScenarioManager';

beforeAll(() => worker.start());
afterEach(() => worker.resetHandlers());

test('shows low score warning', async () => {
  // Set scenario by updating URL
  window.history.pushState({}, '', '/?scenario=low-score');
  scenarioManager.current = 'low-score';
  
  const { findByText } = render(<PassportScoreWidget {...props} />);
  await findByText('Below threshold');
});
```

### Playwright E2E Tests
```javascript
// dev/tests/e2e/scenarios.spec.ts
test('low score flow', async ({ page }) => {
  await page.goto('http://localhost:5173/?scenario=low-score');
  // Tests use the same MSW mocks as dev environment
});
```

## Testing the Refactor

1. **Build the SDK** and verify MSW code is NOT in the bundle:
   ```bash
   npm run build
   # Check that dist/ has no MSW code
   grep -r "msw\|mock\|scenario" dist/
   # Should return nothing
   ```

2. **Run the dev app** with mocks:
   ```bash
   cd dev
   npm run dev
   # Should see MSW active, scenario switcher, etc.
   ```

3. **Test scenario switching** (no page reload!):
   - Via URL: `http://localhost:5173/?scenario=low-score`
   - Via UI: Use the scenario switcher (data updates instantly)
   - Scenarios persist in URL for easy sharing

4. **Verify production build** has no MSW references:
   ```bash
   npm run build
   grep -r "msw\|mock\|scenario" dist/
   # Should return nothing
   ```

## Benefits of This Approach

1. **Clean SDK** - Production bundle contains zero testing code
2. **Centralized Logic** - All scenario behavior in ScenarioManager
3. **Simple Handlers** - Just delay and return manager responses
4. **No Environment Deps** - Dev app just has a simple toggle
7. **No Page Reloads** - Uses React Query cache invalidation for instant updates
8. **URL-only State** - Simple, shareable, no localStorage complexity
5. **Better Security** - No test scenarios exposed to production users
6. **Maintainable** - Clear separation between SDK and dev tools

## Migration Checklist

- [ ] Rename `example/` folder to `dev/`
- [ ] Move all files from `src/mocks/` to `dev/src/mocks/`
- [ ] Move ScenarioSwitcher from `src/components/` to `dev/src/components/`
- [ ] Move test files to `dev/tests/`
- [ ] Create ScenarioManager class (URL-only, no localStorage)
- [ ] Update handlers to use ScenarioManager
- [ ] Update ScenarioSwitcher to use `usePassportQueryClient()` for cache invalidation
- [ ] Remove environment variables from dev app
- [ ] Update all import paths in dev app
- [ ] Test that SDK builds without MSW code
- [ ] Test that dev app works with mocks (no reload on scenario change)
- [ ] Delete any remaining MSW code from `src/`
- [ ] Delete `src/config/environment.ts` if it only contains MSW config