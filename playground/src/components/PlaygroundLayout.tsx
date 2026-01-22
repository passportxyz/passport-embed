"use client";

import { useState } from "react";
import { ConfigPanel } from "@/components/ConfigPanel";
import { PreviewPanel } from "@/components/PreviewPanel";
import { CodePanel } from "@/components/CodePanel";
import { usePlaygroundConfig } from "@/hooks/usePlaygroundConfig";

export type WalletMode = "mock" | "real";

export function PlaygroundLayout() {
  const { config, setConfig, resetConfig, copyShareableUrl, isInitialized } = usePlaygroundConfig();
  const [walletMode, setWalletMode] = useState<WalletMode>("mock");

  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading playground...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="flex items-center justify-between px-6 h-14 border-b border-border bg-background/80 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-4">
          <a href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <svg width="24" height="24" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="2" className="text-primary" />
              <circle cx="16" cy="16" r="6" fill="currentColor" className="text-primary" />
            </svg>
            <span className="text-sm font-semibold text-foreground">
              Passport
            </span>
          </a>
          <span className="hidden sm:inline-block px-2 py-1 text-xs font-medium rounded bg-primary/10 text-primary">
            Playground
          </span>
        </div>
        <div className="flex items-center gap-1">
          <a
            href="https://docs.passport.xyz"
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 text-xs font-medium rounded text-muted-foreground hover:text-foreground transition-colors"
          >
            Docs
          </a>
          <a
            href="https://github.com/passportxyz/passport-embed"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4 p-4 overflow-auto lg:overflow-hidden">
        {/* On mobile, Preview comes first */}
        <div className="lg:col-span-1 min-h-[500px] lg:min-h-0 lg:overflow-hidden order-1 lg:order-2">
          <PreviewPanel config={config} walletMode={walletMode} />
        </div>
        <div className="lg:col-span-1 min-h-0 lg:overflow-hidden order-2 lg:order-1">
          <ConfigPanel
            config={config}
            onChange={setConfig}
            onReset={resetConfig}
            walletMode={walletMode}
            onWalletModeChange={setWalletMode}
          />
        </div>
        <div className="lg:col-span-1 min-h-0 lg:overflow-hidden order-3">
          <CodePanel config={config} />
        </div>
      </div>
    </div>
  );
}
