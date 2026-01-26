"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";

// MSW setup for client-side mocking
// Playground always uses MSW unless explicitly disabled
async function initMocks() {
  if (typeof window === "undefined") return;
  if (process.env.NEXT_PUBLIC_ENABLE_MSW === "false") return;

  const { worker } = await import("@/mocks/browser");
  return worker.start({
    onUnhandledRequest: "bypass",
  });
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: true,
            refetchOnMount: true,
            retry: (failureCount, error) => {
              // Don't retry on 429 errors
              if (error instanceof Error && error.message.includes("429")) {
                return false;
              }
              return failureCount < 2;
            },
          },
        },
      })
  );

  const [mswReady, setMswReady] = useState(false);

  useEffect(() => {
    initMocks().then(() => setMswReady(true));
  }, []);

  // Show loading state while MSW initializes (unless MSW is explicitly disabled)
  if (process.env.NEXT_PUBLIC_ENABLE_MSW !== "false" && !mswReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Initializing playground...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
