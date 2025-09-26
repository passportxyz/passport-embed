# Platform Name vs PlatformId Mismatch

## Issue

The SDK is using `platform.name` for API calls and identification, but for Human ID platforms like HumanIdKyc, the display name is "Government ID" while the actual platformId that should be used for backend communication is "HumanIdKyc".

## Backend Change

The backend has added a `platform.platformId` field that should be used for API calls instead of `platform.name`.

## Affected Areas

1. **getChallenge API call** - uses platform.name but should use platformId
2. **OAuth popup URL** - uses platform.name but should use platformId
3. **Platform identification** in switch/if statements - currently uses platform.name
4. **PlatformButton key prop** - uses platform.name but should use platformId for uniqueness

## Migration Required

Need to update all backend communication to use `platform.platformId` while keeping `platform.name` for display purposes only.

**Related files:**

- `/workspace/project/src/components/Body/PlatformVerification.tsx`
- `/workspace/project/src/components/Body/ScoreTooLowBody.tsx`
- `/workspace/project/src/hooks/useStampPages.tsx`
