# Lottie Canvas SSR/Test Errors

## Lottie Canvas SSR/Test Error (2025-10-24)

**Issue**: The lottie-react library uses Canvas APIs that don't exist in Node.js/SSR/test environments. When consuming projects import the library and run tests, Lottie tries to access canvas.getContext('2d') which returns null, causing "Cannot set properties of null (setting 'fillStyle')" errors.

**Solution**: Use dynamic imports with environment checks in CheckingBody.tsx:
- Import lottie-react dynamically using useEffect with typeof window !== 'undefined' check
- Store Lottie component in state
- Show placeholder while loading
- Only attempt to load Lottie in browser environments

This ensures the library works correctly in SSR, test environments, and consuming projects without requiring them to mock lottie-react.

**Related files:**
- `src/components/Body/CheckingBody.tsx`
