# Knowledge Map

## 📁 API
- @api/public-exports.md - Library's public API including components, hooks (with usePassportQueryClient and useHumanIDVerification details), themes, and types
- @api/passport-endpoints.md - API endpoints with correct paths (/embed/score), snake_case response format, and stamp pages endpoint
- @api/platform-identification.md - Platform name vs platformId mismatch and migration requirements

## 🏗️ Architecture
- @architecture/build-system.md - Webpack configuration, build philosophy, React Query integration, and Passport widget body component structure
- @architecture/msw-infrastructure.md - Complete MSW testing system refactored into dev/ directory with orchestrated build commands
- @architecture/human-id-configuration.md - Human ID SDK RPC configuration for SBT validation on Optimism

## ⚙️ Configuration
- @config/dev-environment.md - Example app setup, Vite configuration, environment variables, MSW development setup, widget CSS variables, Playwright MCP configuration for Fedora
- @config/typescript-path-mapping.md - TypeScript path mapping for local development with Vite aliases

## 📦 Dependencies
- @dependencies/library-dependencies.md - Core, peer, and build dependencies

## ⚠️ Gotchas
- @gotchas/postcss-dependencies.md - Autoprefixer dependency resolution issues and solutions
- @gotchas/ui-alignment.md - Text alignment issues in Passport widget, padding impacts on Stamp flow, and solutions
- @gotchas/missing-components.md - ScenarioSwitcher component didn't exist, MSW files JavaScript conversion error, dev environment API key requirements
- @gotchas/msw-handler-issues.md - MSW handler URL mismatch and bash process termination issues
- @gotchas/playwright-test-issues.md - Test timeouts and beforeEach navigation issues
- @gotchas/more-options-pagination.md - More Options feature breaking pagination tests by adding extra page

## 🎯 Patterns
- @patterns/msw-scenario-system.md - Flexible mock data architecture, TypeScript file structure, and error scenario testing patterns
- @patterns/wallet-callback-pattern.md - Framework-agnostic wallet integration through callbacks
- @patterns/human-id-integration.md - Human ID SDK integration pattern for SBT-based credentials

## 🧪 Testing
- @testing/framework-setup.md - Complete test framework setup with detailed MSW scenarios and testing flow
- @testing/mock-wallet-strategy.md - Dual mocking approach for wallet and API testing without external dependencies
- @testing/msw-dev-environment.md - MSW development environment testing states and UI displays
- @testing/e2e-test-configuration.md - Playwright E2E test setup, selectors, and React Query behavior

## 🔄 Workflows
- @workflows/development.md - Local development setup, hot reload configuration, MSW setup process, Playwright MCP testing workflow on Fedora, widget user flow states
- @workflows/playwright-automation.md - Playwright MCP browser automation best practices and critical warnings

## 🎨 UI Components
- @ui/devtools-panel.md - Unified MSW development controls panel with dark theme styling