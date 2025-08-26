import { ReactNode, useEffect, useState } from 'react';
import { config } from '../config/environment';
import { createMockWalletCallbacks } from '../mocks/mockWallet';

interface DevWrapperProps {
  children: ReactNode;
  apiKey: string;
  scorerId: string;
  onWalletConnect?: (address: string) => void;
}

export function DevWrapper({ children, apiKey, scorerId, onWalletConnect }: DevWrapperProps) {
  const [isMockingReady, setIsMockingReady] = useState(!config.mocking.enabled);
  const [mockWalletCallbacks, setMockWalletCallbacks] = useState<ReturnType<typeof createMockWalletCallbacks>>();

  useEffect(() => {
    // Initialize MSW if mocking is enabled
    if (config.mocking.enabled) {
      import('../mocks/browser').then(({ worker }) => {
        worker.start({
          onUnhandledRequest: 'bypass', // Don't error on unhandled requests
          serviceWorker: {
            url: '/mockServiceWorker.js',
          },
        }).then(() => {
          setIsMockingReady(true);
        });
      });
    }

    // Initialize mock wallet if enabled
    if (config.wallet.useMock) {
      const callbacks = createMockWalletCallbacks();
      setMockWalletCallbacks(callbacks);
    }
  }, []);

  if (!isMockingReady) {
    return <div>Initializing development environment...</div>;
  }

  // Clone children and inject mock props if needed
  if (config.wallet.useMock && mockWalletCallbacks) {
    return (
      <>
        {children}
        {config.mocking.enabled && (
          <div style={{
            position: 'fixed',
            bottom: 10,
            right: 10,
            background: 'orange',
            padding: '5px 10px',
            borderRadius: 5,
            fontSize: 12,
            zIndex: 9999,
          }}>
            🔧 Mock Mode Active
          </div>
        )}
      </>
    );
  }

  return <>{children}</>;
}