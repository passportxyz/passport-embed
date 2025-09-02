### [23:03] [testing] E2E test configuration and selectors
**Details**: Playwright E2E tests are in dev/tests/e2e/. Key learnings:
- Tests run from root with `yarn test:e2e` which cd's into dev/
- webServer command must be `cd .. && yarn dev:mock` to run from dev/ context
- Use 'list' reporter instead of 'html' to avoid hanging after tests
- Wallet mode selector is the 2nd select element (index 1), collapse mode is 1st (index 0)
- Must set collapse mode to 'off' before clicking Connect Wallet to avoid button overlap
- Use `.last()` on Connect Wallet button selector to avoid ambiguity with collapsed header button
- Scenarios persist via URL params only (no localStorage) - use ?scenario=name
- Use specific text selectors like 'Is passing threshold: True/False' instead of ambiguous regex
**Files**: dev/playwright.config.ts, dev/tests/e2e/*.spec.ts
---

### [23:03] [gotcha] Playwright test timeouts and performance
**Details**: Default Playwright timeouts are too long for this project's simple tests. Set shorter timeouts to fail fast:
- Test timeout: 10000ms (10 seconds per test)
- Action timeout: 3000ms (3 seconds for clicks, types)
- Navigation timeout: 5000ms (5 seconds for page loads)
- WebServer timeout: 10000ms (10 seconds to start dev server)
This prevents tests from hanging and crashing the CLI when they fail.
**Files**: dev/playwright.config.ts
---

### [22:04] [testing] React Query retry behavior in tests
**Details**: React Query retries failed requests by default (up to 2 times for non-429 errors). In E2E tests, when testing error scenarios, you must wait for all retries to complete before the error message appears. With a 300ms delay per request, this means waiting approximately 3-5 seconds. Use waitForSelector with a 10-second timeout rather than fixed waitForTimeout to handle this gracefully.
**Files**: src/hooks/usePassportQueryClient.tsx, dev/tests/e2e/stamp-errors.spec.ts
---

### [22:04] [gotcha] Playwright beforeEach navigation issues
**Details**: Avoid using beforeEach to navigate to a base URL and then navigating again in the test. When you do page.goto() in beforeEach and then page.goto() with query params in the test, it can cause issues with singleton instances like ScenarioManager that read window.location on initialization. Instead, navigate directly to the full URL with query parameters in each test.
**Files**: dev/tests/e2e/stamp-errors.spec.ts, dev/src/mocks/ScenarioManager.ts
---

### [22:05] [pattern] MSW error scenario testing pattern
**Details**: To test error scenarios with MSW: 1) Add a behavior flag to scenarios (e.g., stampPagesBehavior) 2) Check this flag in MSW handlers and return appropriate error responses 3) ScenarioManager.getCurrentScenario() should always re-detect from URL to handle navigation 4) Error messages from axios are "Request failed with status code XXX" not custom messages 5) Test with Playwright MCP first to verify scenarios work before writing E2E tests
**Files**: dev/src/mocks/scenarios.ts, dev/src/mocks/handlers.ts, dev/src/mocks/ScenarioManager.ts
---

### [22:05] [api] Stamp pages error handling
**Details**: The stamp pages endpoint (/embed/stamps/metadata) can return various errors: 500 (server error), 401 (invalid API key), 404 (scorer not found), 429 (rate limited). The UI shows the axios error message "Request failed with status code XXX" and a "Try Again" button that calls refetch() from React Query. The useStampPages hook uses React Query with 1 hour stale time and no refetch on mount/focus.
**Files**: src/hooks/useStampPages.tsx, src/components/Body/ScoreTooLowBody.tsx, dev/src/mocks/handlers.ts
---

