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

