"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ApiSettings } from "./ApiSettings";
import { LayoutSettings } from "./LayoutSettings";
import { ThemeSettings } from "./ThemeSettings";
import { ScenarioSelector } from "./ScenarioSelector";
import { PlaygroundConfig, isMswEnabled } from "@/lib/default-config";
import { WalletMode } from "@/components/PlaygroundLayout";

interface ConfigPanelProps {
  config: PlaygroundConfig;
  onChange: (updates: Partial<PlaygroundConfig>) => void;
  onReset: () => void;
  walletMode: WalletMode;
  onWalletModeChange: (mode: WalletMode) => void;
}

export function ConfigPanel({ config, onChange, onReset, walletMode, onWalletModeChange }: ConfigPanelProps) {
  const [showModeInfo, setShowModeInfo] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const modeInfoButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (showModeInfo && modeInfoButtonRef.current) {
      const rect = modeInfoButtonRef.current.getBoundingClientRect();
      setTooltipPosition({
        top: rect.bottom + 8,
        left: Math.max(8, rect.left - 100),
      });
    }
  }, [showModeInfo]);

  return (
    <div className="h-full flex flex-col rounded-xl border border-border bg-background">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <span className="text-sm font-semibold text-foreground">Configuration</span>
        <button
          type="button"
          className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          onClick={onReset}
        >
          Reset
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="divide-y divide-border">
          {/* Mode Selection - only show when MSW is enabled */}
          {isMswEnabled && (
            <div className="pb-5">
              <div className="flex items-center gap-1.5 mb-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Mode
                </h3>
                <>
                  <button
                    ref={modeInfoButtonRef}
                    type="button"
                    className="w-4 h-4 rounded-full bg-muted border border-border text-muted-foreground hover:text-foreground hover:border-foreground text-[10px] font-medium flex items-center justify-center transition-colors"
                    onMouseEnter={() => setShowModeInfo(true)}
                    onMouseLeave={() => setShowModeInfo(false)}
                    onClick={() => setShowModeInfo(!showModeInfo)}
                  >
                    ?
                  </button>
                  {showModeInfo && typeof document !== "undefined" && createPortal(
                    <div
                      className="fixed z-[9999] w-72 p-3 rounded-lg bg-foreground text-background text-xs leading-relaxed shadow-lg"
                      style={{ top: tooltipPosition.top, left: tooltipPosition.left }}
                      onMouseEnter={() => setShowModeInfo(true)}
                      onMouseLeave={() => setShowModeInfo(false)}
                    >
                      <div className="space-y-2">
                        <div><strong>Mock Wallet:</strong> Uses simulated wallet and API responses. Perfect for testing different scenarios without real credentials.</div>
                        <div><strong>Real Wallet:</strong> Connect your actual wallet and use real API credentials. Test scenarios won&apos;t be available.</div>
                      </div>
                    </div>,
                    document.body
                  )}
                </>
              </div>
              <div className="inline-flex p-1 rounded-lg border border-border bg-muted">
                <button
                  type="button"
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    walletMode === "mock"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => onWalletModeChange("mock")}
                >
                  Mock Wallet
                </button>
                <button
                  type="button"
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    walletMode === "real"
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  onClick={() => onWalletModeChange("real")}
                >
                  Real Wallet
                </button>
              </div>
            </div>
          )}

          {/* API Settings - only show in real mode or when MSW is disabled */}
          {(walletMode === "real" || !isMswEnabled) && (
            <div className={isMswEnabled ? "py-5" : "pb-5"}>
              <ApiSettings config={config} onChange={onChange} />
            </div>
          )}

          {/* Test Scenarios - only show in mock mode when MSW is enabled */}
          {isMswEnabled && walletMode === "mock" && (
            <div className="py-5">
              <ScenarioSelector config={config} onChange={onChange} />
            </div>
          )}

          <div className="py-5">
            <LayoutSettings config={config} onChange={onChange} />
          </div>
          <div className="pt-5">
            <ThemeSettings config={config} onChange={onChange} />
          </div>
        </div>
      </div>
    </div>
  );
}
