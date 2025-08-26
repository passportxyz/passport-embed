# MSW Setup and Initialization Process

## Setup Steps

### 1. Install Service Worker
Run the following command to copy mockServiceWorker.js to the public folder:
```bash
npx msw init public/
```

### 2. Important Notes
- The mockServiceWorker.js file is NOT automatically loaded - must be explicitly registered
- Registration happens via `worker.start()` which calls `navigator.serviceWorker.register()`
- Service worker intercepts network requests only after registration
- In Vite, public/ files are served at root URL (public/file.js → /file.js)

### 3. Enable MSW
Set environment variable:
```bash
VITE_ENABLE_MSW=true
```

Or use the convenience scripts:
```bash
npm run dev:mock  # Enables MSW
npm run dev:real  # Disables MSW
```

### 4. How It Works
The mockServiceWorker.js acts as a network proxy between the app and APIs, intercepting requests based on defined handlers.

## Key Files
- `example/src/setupMocks.ts` - MSW initialization logic
- `src/mocks/browser.ts` - Browser worker setup
- `example/public/mockServiceWorker.js` - Service worker file