# Playwright Test Issues and Gotchas

## Playwright Test Timeouts and Performance (2025-09-02)

**Issue**: Default Playwright timeouts are too long for this project's simple tests, causing tests to hang and crash the CLI when they fail.

**Solution**: Set shorter timeouts in playwright.config.ts to fail fast:

- Test timeout: 10000ms (10 seconds per test)
- Action timeout: 3000ms (3 seconds for clicks, types)
- Navigation timeout: 5000ms (5 seconds for page loads)
- WebServer timeout: 10000ms (10 seconds to start dev server)

This prevents tests from hanging and provides faster feedback during development.

**Related files:**

- `dev/playwright.config.ts`

## Playwright beforeEach Navigation Issues (2025-09-02)

**Issue**: Using beforeEach to navigate to a base URL and then navigating again in the test causes issues with singleton instances like ScenarioManager that read window.location on initialization.

**Symptoms**: ScenarioManager doesn't detect the correct scenario when navigating twice.

**Solution**: Navigate directly to the full URL with query parameters in each test instead of using beforeEach for navigation.

**Bad pattern:**

```javascript
beforeEach(async ({ page }) => {
  await page.goto("http://localhost:5173");
});

test("test name", async ({ page }) => {
  await page.goto("http://localhost:5173?scenario=error");
  // ScenarioManager may not detect the scenario correctly
});
```

**Good pattern:**

```javascript
test("test name", async ({ page }) => {
  await page.goto("http://localhost:5173?scenario=error");
  // ScenarioManager correctly detects the scenario
});
```

**Related files:**

- `dev/tests/e2e/stamp-errors.spec.ts`
- `dev/src/mocks/ScenarioManager.ts`
