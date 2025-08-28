# Knowledge Map

## 📁 API
- @api/public-exports.md - Library's public API including components, hooks (with usePassportQueryClient details), themes, and types
- @api/passport-endpoints.md - API endpoints for score retrieval, verification, and rate limiting

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

## 🎯 Patterns
- @patterns/msw-scenario-system.md - Flexible mock data architecture and TypeScript file structure for testing different user states
- @patterns/wallet-callback-pattern.md - Framework-agnostic wallet integration through callbacks

## 🧪 Testing
- @testing/framework-setup.md - Jest unit testing, Playwright E2E testing with MSW scenario system, complete MSW testing environment setup
- @testing/mock-wallet-strategy.md - Dual mocking approach for wallet and API testing without external dependencies

## 🔄 Workflows
- @workflows/development.md - Local development setup, hot reload configuration, MSW setup process, Playwright MCP testing workflow on Fedora, widget user flow states