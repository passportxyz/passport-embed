# Knowledge Map

## 📁 API
- @api/public-exports.md - Library's public API including components, hooks (with usePassportQueryClient details), themes, and types
- @api/passport-endpoints.md - API endpoints with correct paths (/embed/score) and snake_case response format

## 🏗️ Architecture
- @architecture/build-system.md - Webpack configuration, build philosophy, React Query integration, and Passport widget body component structure
- @architecture/msw-infrastructure.md - Complete MSW testing system refactored into dev/ directory with orchestrated build commands

## ⚙️ Configuration
- @config/dev-environment.md - Example app setup, Vite configuration, environment variables, MSW development setup, widget CSS variables, Playwright MCP configuration for Fedora

## 📦 Dependencies
- @dependencies/library-dependencies.md - Core, peer, and build dependencies

## ⚠️ Gotchas
- @gotchas/postcss-dependencies.md - Autoprefixer dependency resolution issues and solutions
- @gotchas/ui-alignment.md - Text alignment issues in Passport widget, padding impacts on Stamp flow, and solutions
- @gotchas/missing-components.md - ScenarioSwitcher component didn't exist, MSW files JavaScript conversion error, dev environment API key requirements
- @gotchas/msw-handler-issues.md - MSW handler URL mismatch and bash process termination issues

## 🎯 Patterns
- @patterns/msw-scenario-system.md - Flexible mock data architecture and TypeScript file structure for testing different user states
- @patterns/wallet-callback-pattern.md - Framework-agnostic wallet integration through callbacks

## 🧪 Testing
- @testing/framework-setup.md - Complete test framework setup with detailed MSW scenarios and testing flow
- @testing/mock-wallet-strategy.md - Dual mocking approach for wallet and API testing without external dependencies
- @testing/msw-dev-environment.md - MSW development environment testing states and UI displays

## 🔄 Workflows
- @workflows/development.md - Local development setup, hot reload configuration, MSW setup process, Playwright MCP testing workflow on Fedora, widget user flow states
- @workflows/playwright-automation.md - Playwright MCP browser automation best practices and critical warnings

## 🎨 UI Components
- @ui/devtools-panel.md - Unified MSW development controls panel with dark theme styling