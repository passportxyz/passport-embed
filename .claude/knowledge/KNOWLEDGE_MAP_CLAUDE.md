# Knowledge Map

## 📁 API

- @api/public-exports.md - Library's public API including components, hooks (with usePassportQueryClient and useHumanIDVerification details), themes, and types
- @api/passport-endpoints.md - API endpoints with correct paths (/embed/score), snake_case response format, and stamp pages endpoint
- @api/platform-identification.md - Platform name vs platformId mismatch and migration requirements

## 🏗️ Architecture

- @architecture/build-system.md - Webpack configuration, build philosophy, React Query integration, widget body and ScrollableDiv structure
- @architecture/msw-infrastructure.md - Complete MSW testing system refactored into dev/ directory with orchestrated build commands
- @architecture/human-id-sdk.md - Human ID SDK integration, configuration, and comprehensive mocking implementation

## ⚙️ Configuration

- @config/development-guide.md - Complete development environment setup, Vite configuration, MSW setup, and testing workflows
- @config/typescript-path-mapping.md - TypeScript path mapping for local development with Vite aliases

## 📦 Dependencies

- @dependencies/library-dependencies.md - Core, peer, and build dependencies

## ⚠️ Gotchas

- @gotchas/postcss-dependencies.md - Autoprefixer dependency resolution issues and solutions
- @gotchas/ui-alignment.md - Text alignment, padding issues, ScrollableDiv problems
- @gotchas/msw-handler-issues.md - MSW handler URL mismatch and bash process termination issues
- @gotchas/playwright-test-issues.md - Test timeouts and beforeEach navigation issues
- @gotchas/more-options-pagination.md - Pagination issues, Vite HMR errors, Human ID SDK sync behavior
- @gotchas/dev-dependencies.md - Dev directory yarn install failure with @human.tech/passport-embed package
- @gotchas/webpack-chunk-splitting.md - Webpack chunk splitting causes SSR errors in Next.js

## 🎯 Patterns

- @patterns/msw-scenario-system.md - Flexible mock data architecture, TypeScript file structure, and error scenario testing patterns
- @patterns/wallet-callback-pattern.md - Framework-agnostic wallet integration through callbacks
- @patterns/scrollbar-positioning.md - Pattern for positioning scrollbars at widget edge
- @patterns/safe-html-rendering.md - SanitizedHTMLComponent usage for XSS protection

## 🧪 Testing

- @testing/framework-setup.md - Complete test framework setup with detailed MSW scenarios and testing flow
- @testing/mock-wallet-strategy.md - Dual mocking approach for wallet and API testing without external dependencies
- @testing/msw-dev-environment.md - MSW development environment testing states and UI displays
- @testing/e2e-test-configuration.md - Playwright E2E test setup, selectors, and React Query behavior

## 🔄 Workflows

- @workflows/playwright-automation.md - Playwright MCP browser automation best practices and critical warnings

## 🎨 UI Components

- @ui/devtools-panel.md - Unified MSW development controls panel with dark theme styling
- @ui/theme-system.md - Flexible theme system with gradient and accent color support, widget redesign specifications