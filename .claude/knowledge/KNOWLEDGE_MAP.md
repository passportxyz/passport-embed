# Knowledge Map

_Last updated: 2025-09-02_

## 📁 API
- [Public Exports](./api/public-exports.md) - Library's public API including components, hooks (with usePassportQueryClient details), themes, and types
- [Passport Endpoints](./api/passport-endpoints.md) - API endpoints with correct paths (/embed/score), snake_case response format, and stamp pages endpoint *(Updated 2025-09-02)*

## 🏗️ Architecture
- [Build System and Components](./architecture/build-system.md) - Webpack configuration, build philosophy, React Query integration, and Passport widget body component structure
- [MSW Infrastructure](./architecture/msw-infrastructure.md) - Complete MSW testing system refactored into dev/ directory with orchestrated build commands

## ⚙️ Configuration
- [Dev Environment](./config/dev-environment.md) - Example app setup, Vite configuration, environment variables, MSW development setup, widget CSS variables, Playwright MCP configuration for Fedora

## 📦 Dependencies
- [Library Dependencies](./dependencies/library-dependencies.md) - Core, peer, and build dependencies

## ⚠️ Gotchas
- [PostCSS Dependencies](./gotchas/postcss-dependencies.md) - Autoprefixer dependency resolution issues and solutions
- [UI Alignment](./gotchas/ui-alignment.md) - Text alignment issues in Passport widget, padding impacts on Stamp flow, and solutions
- [Missing Components](./gotchas/missing-components.md) - ScenarioSwitcher component didn't exist, MSW files JavaScript conversion error, dev environment API key requirements
- [MSW Handler Issues](./gotchas/msw-handler-issues.md) - MSW handler URL mismatch and bash process termination issues
- [Playwright Test Issues](./gotchas/playwright-test-issues.md) - Test timeouts and beforeEach navigation issues *(New 2025-09-02)*

## 🎯 Patterns
- [MSW Scenario System](./patterns/msw-scenario-system.md) - Flexible mock data architecture, TypeScript file structure, and error scenario testing patterns *(Updated 2025-09-02)*
- [Wallet Callback Pattern](./patterns/wallet-callback-pattern.md) - Framework-agnostic wallet integration through callbacks

## 🧪 Testing
- [Framework Setup](./testing/framework-setup.md) - Complete test framework setup with detailed MSW scenarios and testing flow
- [Mock Wallet Strategy](./testing/mock-wallet-strategy.md) - Dual mocking approach for wallet and API testing without external dependencies
- [MSW Dev Environment](./testing/msw-dev-environment.md) - MSW development environment testing states and UI displays
- [E2E Test Configuration](./testing/e2e-test-configuration.md) - Playwright E2E test setup, selectors, and React Query behavior *(New 2025-09-02)*

## 🔄 Workflows
- [Development](./workflows/development.md) - Local development setup, hot reload configuration, MSW setup process, Playwright MCP testing workflow on Fedora, widget user flow states
- [Playwright Automation](./workflows/playwright-automation.md) - Playwright MCP browser automation best practices and critical warnings

## 🎨 UI Components
- [DevTools Panel](./ui/devtools-panel.md) - Unified MSW development controls panel with dark theme styling *(New)*