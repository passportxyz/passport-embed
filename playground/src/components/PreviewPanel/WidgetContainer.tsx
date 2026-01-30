"use client";

import { useEffect, useRef, useState } from "react";
import { PassportScoreWidget } from "@human.tech/passport-embed";
import { PlaygroundConfig } from "@/lib/default-config";
import { useMockWallet } from "@/hooks/useMockWallet";
import { getThemeForPreset } from "@/lib/config-state";
import { WalletMode } from "@/components/PlaygroundLayout";

interface WidgetContainerProps {
  config: PlaygroundConfig;
  walletMode: WalletMode;
}

export function WidgetContainer({ config, walletMode }: WidgetContainerProps) {
  const mockWallet = useMockWallet();
  const [widgetKey, setWidgetKey] = useState(0);
  const prevScenarioRef = useRef(config.scenario);

  // Force widget remount when scenario changes by incrementing the key
  useEffect(() => {
    if (prevScenarioRef.current !== config.scenario) {
      prevScenarioRef.current = config.scenario;
      // Increment key to force complete widget remount with fresh query cache
      setWidgetKey(k => k + 1);
    }
  }, [config.scenario]);

  // For real wallet mode, we don't provide callbacks - user must connect via their own wallet
  const address = walletMode === "mock" ? mockWallet.address : undefined;
  const connectWalletCallback = walletMode === "mock" ? mockWallet.connectWalletCallback : undefined;
  const generateSignatureCallback = walletMode === "mock" ? mockWallet.generateSignatureCallback : undefined;
  const disconnect = mockWallet.disconnect;
  const isConnected = walletMode === "mock" ? mockWallet.isConnected : false;

  const theme = getThemeForPreset(config.themePreset, config.theme);

  // Determine background color based on theme
  const bgColor = theme.colors?.background
    ? `rgb(${theme.colors.background})`
    : "rgb(0, 0, 0)";

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <span className="w-2 h-2 rounded-full bg-success"></span>
              <span className="text-xs text-muted-foreground">
                Connected: Mock Wallet
              </span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-muted-foreground"></span>
              <span className="text-xs text-muted-foreground">Not connected</span>
            </>
          )}
        </div>
        {isConnected && (
          <button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            onClick={disconnect}
          >
            Disconnect
          </button>
        )}
      </div>
      <div
        className="flex-1 flex items-center justify-center p-6 transition-colors"
        style={{ backgroundColor: bgColor }}
      >
        <div className="max-w-sm w-[320px]">
          <PassportScoreWidget
            key={`widget-${widgetKey}`}
            apiKey={config.apiKey}
            scorerId={`${config.scorerId}__${config.scenario}`}
            address={address}
            connectWalletCallback={connectWalletCallback}
            generateSignatureCallback={generateSignatureCallback}
            collapseMode={config.collapseMode}
            theme={theme}
            className={config.className || undefined}
            overrideEmbedServiceUrl={config.overrideEmbedServiceUrl || undefined}
          />
        </div>
      </div>
    </div>
  );
}
