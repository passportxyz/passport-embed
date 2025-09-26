import { useState } from "react";
import { usePassportQueryClient } from "@human.tech/passport-embed";
import { scenarioManager } from "../mocks/ScenarioManager";
import { scenarios } from "../mocks/scenarios";

interface DevToolsPanelProps {
  walletMode: "metamask" | "mock";
  onWalletModeChange: (mode: "metamask" | "mock") => void;
}

export function DevToolsPanel({ walletMode, onWalletModeChange }: DevToolsPanelProps) {
  const [currentScenario, setCurrentScenario] = useState(scenarioManager.getCurrentScenario().name);
  const queryClient = usePassportQueryClient();

  const handleScenarioChange = (name: string) => {
    setCurrentScenario(name);
    scenarioManager.switchScenario(name);
    // Invalidate all queries to refetch with new scenario data
    queryClient.invalidateQueries();
  };

  const panelStyle: React.CSSProperties = {
    position: "fixed",
    bottom: "10px",
    right: "10px",
    background: "#1a1a1a",
    border: "2px solid #ff6b00",
    borderRadius: "8px",
    padding: "12px",
    zIndex: 10000,
    boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
    minWidth: "280px",
    maxWidth: "300px",
    color: "#ffffff",
  };

  const headerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "12px",
    paddingBottom: "8px",
    borderBottom: "1px solid rgba(255, 107, 0, 0.3)",
  };

  const titleStyle: React.CSSProperties = {
    fontWeight: "bold",
    color: "#ff6b00",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  };

  const badgeStyle: React.CSSProperties = {
    background: "#ff6b00",
    color: "#ffffff",
    padding: "2px 6px",
    borderRadius: "4px",
    fontSize: "10px",
    fontWeight: "bold",
    textTransform: "uppercase",
  };

  const selectStyle: React.CSSProperties = {
    width: "100%",
    padding: "6px",
    fontSize: "12px",
    borderRadius: "4px",
    border: "1px solid #444",
    background: "#2a2a2a",
    color: "#ffffff",
    marginBottom: "8px",
    cursor: "pointer",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: "11px",
    color: "#999",
    marginBottom: "4px",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  };

  const infoStyle: React.CSSProperties = {
    fontSize: "10px",
    color: "#888",
    marginTop: "8px",
    paddingTop: "8px",
    borderTop: "1px solid rgba(255, 255, 255, 0.1)",
  };

  return (
    <div style={panelStyle}>
      <div style={headerStyle}>
        <div style={titleStyle}>🛠 MSW Dev Tools</div>
        <div style={badgeStyle}>Active</div>
      </div>

      <div style={{ marginBottom: "12px" }}>
        <div style={labelStyle}>Wallet Mode</div>
        <select
          value={walletMode}
          onChange={(e) => onWalletModeChange(e.target.value as "metamask" | "mock")}
          style={selectStyle}
        >
          <option value="metamask">MetaMask (Real)</option>
          <option value="mock">Mock Wallet (Testing)</option>
        </select>
        {walletMode === "mock" && (
          <div style={{ fontSize: "11px", color: "#ffa500", marginTop: "4px" }}>
            🔧 Using mock wallet - no real transactions
          </div>
        )}
      </div>

      <div>
        <div style={labelStyle}>Test Scenario</div>
        <select value={currentScenario} onChange={(e) => handleScenarioChange(e.target.value)} style={selectStyle}>
          {Object.entries(scenarios).map(([key, scenario]) => (
            <option key={key} value={key}>
              {scenario.description}
            </option>
          ))}
        </select>
      </div>

      <div style={infoStyle}>
        <strong>Current Score:</strong> {scenarios[currentScenario].passportScore.score} |<strong> Threshold:</strong>{" "}
        {scenarios[currentScenario].passportScore.threshold}
      </div>
    </div>
  );
}
