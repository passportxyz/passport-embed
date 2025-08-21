# Test Framework Setup

The project uses Jest with ts-jest for testing TypeScript code:

## Configuration
- **Test runner**: Jest with ts-jest preset
- **Environment**: jsdom for React component testing
- **CSS handling**: CSS modules mocked using identity-obj-proxy
- **Test location**: Tests in `test/` directory with subdirectories matching source structure:
  - `test/components/` for component tests
  - `test/hooks/` for hook tests
- **Testing library**: @testing-library/react for component testing

**Related files:**
- `jest.config.ts`
- `test/components/`
- `test/hooks/`