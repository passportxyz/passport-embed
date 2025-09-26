# Knowledge Map

_Last updated: 2025-09-26_

## 📁 API

- [Public Exports](./api/public-exports.md) - Library's public API including components, hooks (with usePassportQueryClient and useHumanIDVerification details), themes, and types _(Updated 2025-09-03)_
- [Passport Endpoints](./api/passport-endpoints.md) - API endpoints with correct paths (/embed/score), snake_case response format, and stamp pages endpoint
- [Platform Identification](./api/platform-identification.md) - Platform name vs platformId mismatch and migration requirements _(New 2025-09-03)_

## 🏗️ Architecture

- [Build System and Components](./architecture/build-system.md) - Webpack configuration, build philosophy, React Query integration, widget body and ScrollableDiv structure _(Updated 2025-09-19)_
- [MSW Infrastructure](./architecture/msw-infrastructure.md) - Complete MSW testing system refactored into dev/ directory with orchestrated build commands
- [Human ID SDK](./architecture/human-id-sdk.md) - Human ID SDK integration, configuration, and comprehensive mocking implementation _(Merged 2025-09-18)_

## ⚙️ Configuration

- [Development Guide](./config/development-guide.md) - Complete development environment setup, Vite configuration, MSW setup, and testing workflows _(Merged 2025-09-18)_
- [TypeScript Path Mapping](./config/typescript-path-mapping.md) - TypeScript path mapping for local development with Vite aliases _(New 2025-09-03)_

## 📦 Dependencies

- [Library Dependencies](./dependencies/library-dependencies.md) - Core, peer, and build dependencies

## ⚠️ Gotchas

- [PostCSS Dependencies](./gotchas/postcss-dependencies.md) - Autoprefixer dependency resolution issues and solutions
- [UI Alignment](./gotchas/ui-alignment.md) - Text alignment, padding issues, ScrollableDiv problems _(Updated 2025-09-19)_
- [MSW Handler Issues](./gotchas/msw-handler-issues.md) - MSW handler URL mismatch and bash process termination issues
- [Playwright Test Issues](./gotchas/playwright-test-issues.md) - Test timeouts and beforeEach navigation issues
- [More Options Pagination](./gotchas/more-options-pagination.md) - Pagination issues, Vite HMR errors, Human ID SDK sync behavior _(Updated 2025-09-04)_
- [Dev Dependencies](./gotchas/dev-dependencies.md) - Dev directory yarn install failure with @human.tech/passport-embed package _(New 2025-09-04)_
- [Webpack Chunk Splitting](./gotchas/webpack-chunk-splitting.md) - Webpack chunk splitting causes SSR errors in Next.js _(New 2025-09-04)_
- [Mock Data Type Structure](./gotchas/mock-data-type-structure.md) - Mock data type structure verification and data flow _(New 2025-09-23)_

## 🎯 Patterns

- [MSW Scenario System](./patterns/msw-scenario-system.md) - Flexible mock data architecture, TypeScript file structure, and error scenario testing patterns
- [Wallet Callback Pattern](./patterns/wallet-callback-pattern.md) - Framework-agnostic wallet integration through callbacks
- [Scrollbar Positioning](./patterns/scrollbar-positioning.md) - Pattern for positioning scrollbars at widget edge _(New 2025-09-19)_
- [Safe HTML Rendering](./patterns/safe-html-rendering.md) - SanitizedHTMLComponent usage for XSS protection _(New 2025-09-19)_
- [Color System](./patterns/color-system.md) - Standardized color variable naming and theme configuration _(New 2025-09-26)_

## 🧪 Testing

- [Framework Setup](./testing/framework-setup.md) - Complete test framework setup with detailed MSW scenarios and testing flow
- [Mock Wallet Strategy](./testing/mock-wallet-strategy.md) - Dual mocking approach for wallet and API testing without external dependencies
- [MSW Dev Environment](./testing/msw-dev-environment.md) - MSW development environment testing states and UI displays
- [E2E Test Configuration](./testing/e2e-test-configuration.md) - Playwright E2E test setup, selectors, and React Query behavior _(New 2025-09-02)_

## 🔄 Workflows

- [Playwright Automation](./workflows/playwright-automation.md) - Playwright MCP browser automation best practices and critical warnings

## 🎨 UI Components

- [DevTools Panel](./ui/devtools-panel.md) - Unified MSW development controls panel with dark theme styling _(New)_
- [Theme System](./ui/theme-system.md) - Flexible theme system with gradient and accent color support, widget redesign specifications _(New 2025-09-12)_