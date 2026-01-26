"use client";

import { WidgetContainer } from "./WidgetContainer";
import { PlaygroundConfig, isMswEnabled } from "@/lib/default-config";
import { WalletMode } from "@/components/PlaygroundLayout";

interface PreviewPanelProps {
  config: PlaygroundConfig;
  walletMode: WalletMode;
}

export function PreviewPanel({ config, walletMode }: PreviewPanelProps) {
  return (
    <div className="h-full min-h-[450px] flex flex-col rounded-xl border border-border bg-background">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-sm font-semibold text-foreground">Live Preview</span>
        <a
          href="https://docs.passport.xyz/building-with-passport/embed/pulling-user-data"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline"
        >
          Access user data →
        </a>
      </div>
      {walletMode === "real" && isMswEnabled && (
        <div className="px-4 py-2 bg-warning/10 border-b border-warning/20">
          <p className="text-xs text-warning">
            Using real wallet — enter valid API credentials in the Configuration panel.
          </p>
        </div>
      )}
      <div className="flex-1 overflow-hidden">
        <WidgetContainer config={config} walletMode={walletMode} />
      </div>
    </div>
  );
}
