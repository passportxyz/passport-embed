// Initialize MSW when explicitly enabled
export async function setupMocks() {
  // Only start MSW if explicitly enabled via env variable
  if (import.meta.env.VITE_ENABLE_MSW === 'true') {
    const { worker } = await import('./mocks/browser');
    
    // Start the worker
    await worker.start({
      onUnhandledRequest: 'bypass', // Let unhandled requests pass through
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    });
    
    console.log('[MSW] Mock Service Worker started');
  }
}