# E2E Test Configuration and Selectors

## Playwright Test Setup

Playwright E2E tests are configured for the Passport widget with specific requirements:

### Test Location and Execution

- Tests located in `dev/tests/e2e/`
- Run from root with `yarn test:e2e` which cd's into dev/
- WebServer command must be `cd .. && yarn dev:mock` to run from dev/ context

### Configuration Best Practices

- Use 'list' reporter instead of 'html' to avoid hanging after tests
- Set shorter timeouts for faster feedback:
  - Test timeout: 10000ms (10 seconds per test)
  - Action timeout: 3000ms (3 seconds for clicks, types)
  - Navigation timeout: 5000ms (5 seconds for page loads)
  - WebServer timeout: 10000ms (10 seconds to start dev server)

### UI Element Selectors

- **Wallet mode selector**: 2nd select element (index 1)
- **Collapse mode selector**: 1st select element (index 0)
- **Connect Wallet button**: Use `.last()` to avoid ambiguity with collapsed header button
- **Threshold status**: Use specific text like 'Is passing threshold: True/False' instead of ambiguous regex

### Testing Patterns

- Set collapse mode to 'off' before clicking Connect Wallet to avoid button overlap
- Scenarios persist via URL params only (no localStorage) - use `?scenario=name`
- Navigate directly to full URL with query params in each test (avoid beforeEach navigation)

### React Query Behavior

- React Query retries failed requests by default (up to 2 times for non-429 errors)
- When testing error scenarios, wait for all retries to complete before error message appears
- With 300ms delay per request, this means waiting approximately 3-5 seconds
- Use `waitForSelector` with 10-second timeout rather than fixed `waitForTimeout`

**Related files:**

- `dev/playwright.config.ts`
- `dev/tests/e2e/*.spec.ts`
- `src/hooks/usePassportQueryClient.tsx`
