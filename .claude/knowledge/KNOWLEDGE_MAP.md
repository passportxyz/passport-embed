# Knowledge Map

_Last updated: 2025-08-27_

## 📁 API
- [Public Exports](./api/public-exports.md) - Library's public API including components, hooks (with usePassportQueryClient details), themes, and types
- [Passport Endpoints](./api/passport-endpoints.md) - API endpoints for score retrieval, verification, and rate limiting

## 🏗️ Architecture
- [Build System and Components](./architecture/build-system.md) - Webpack configuration, build philosophy, React Query integration, and Passport widget body component structure
- [MSW Infrastructure](./architecture/msw-infrastructure.md) - Complete MSW testing system refactored into dev/ directory with orchestrated build commands

## ⚙️ Configuration
- [Dev Environment](./config/dev-environment.md) - Example app setup, Vite configuration, environment variables, MSW development setup, and widget CSS variables

## 📦 Dependencies
- [Library Dependencies](./dependencies/library-dependencies.md) - Core, peer, and build dependencies

## ⚠️ Gotchas
- [PostCSS Dependencies](./gotchas/postcss-dependencies.md) - Autoprefixer dependency resolution issues and solutions
- [UI Alignment](./gotchas/ui-alignment.md) - Text alignment issues in Passport widget, padding impacts on Stamp flow, and solutions
- [Missing Components](./gotchas/missing-components.md) - ScenarioSwitcher component didn't exist despite refactor plans mentioning it

## 🎯 Patterns
- [MSW Scenario System](./patterns/msw-scenario-system.md) - Flexible mock data architecture for testing different user states
- [Wallet Callback Pattern](./patterns/wallet-callback-pattern.md) - Framework-agnostic wallet integration through callbacks

## 🧪 Testing
- [Framework Setup](./testing/framework-setup.md) - Jest unit testing and Playwright E2E testing with MSW scenario system
- [Mock Wallet Strategy](./testing/mock-wallet-strategy.md) - Dual mocking approach for wallet and API testing without external dependencies

## 🔄 Workflows
- [Development](./workflows/development.md) - Local development setup, hot reload configuration, and MSW setup process