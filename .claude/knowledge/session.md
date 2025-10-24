### [13:29] [api] requiresSDKFlow flag for backend-controlled SDK verification
**Details**: The stamp metadata API now includes a `requiresSDKFlow` boolean flag that allows the backend to control which platforms use SDK-based verification flows (like Human ID SDK) versus standard flows (OAuth, signatures, etc.).

Implementation uses a dual-check pattern for security:
1. Backend sends requiresSDKFlow: true in /embed/stamps/metadata response
2. Frontend validates platformId against hardcoded HUMAN_ID_PLATFORMS list in useHumanIDVerification.tsx
3. Only if BOTH checks pass does the SDK flow activate

Benefits:
- Backend can dynamically enable/disable SDK flows without frontend deployments
- Frontend safety layer prevents unsupported platforms from triggering SDK
- Replaces previous hardcoded frontend logic that determined SDK flow based solely on platformId

The flag is optional (defaults to false/undefined for standard verification flows).
**Files**: src/hooks/stampTypes.ts, src/components/Body/PlatformVerification.tsx, dev/src/mocks/handlers.ts
---

