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
    
    // Add visual indicator
    const indicator = document.createElement('div');
    indicator.innerHTML = '🔧 MSW Active';
    indicator.style.cssText = 'position:fixed;bottom:10px;left:10px;background:#ff6b00;color:white;padding:5px 10px;border-radius:5px;z-index:9999;font-size:12px;';
    document.body.appendChild(indicator);
  }
}