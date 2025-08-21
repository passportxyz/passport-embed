import { createRoot } from "react-dom/client";
import { useState } from "react";
import { Buffer } from "buffer";
import { PassportScoreWidget, usePassportScore, CollapseMode } from "@passportxyz/passport-embed";
import { setupMocks } from "./setupMocks";
// Import scenario switcher - will compile from source via alias
import { ScenarioSwitcher } from "@passportxyz/passport-embed/src/components/ScenarioSwitcher";

import "./index.css";

// Initialize mocks if needed
setupMocks();

const passportEmbedParams = {
  apiKey: import.meta.env.VITE_API_KEY,
  scorerId: import.meta.env.VITE_SCORER_ID,
  overrideEmbedServiceUrl: "http://localhost:8004",
};

const connectWallet = async () => {
  // Check if MetaMask is installed
  if (typeof window.ethereum === "undefined") {
    alert("Please install MetaMask!");
    return;
  }

  try {
    // Request account access
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    // Get the connected account
    return accounts[0];
  } catch (error) {
    console.error(error);
    alert("Failed to connect to wallet");
  }
};

const generateSignature = async (message: string) => {
  try {
    // Check if MetaMask is installed
    if (typeof window.ethereum === "undefined") {
      alert("Please install MetaMask!");
      return;
    }

    // Request account access if not already connected
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });

    const signerAddress = accounts[0];

    const stringToSign = `0x${Buffer.from(message, "utf8").toString("hex")}`;
    // Sign the message
    const signature = await window.ethereum.request({
      method: "personal_sign",
      params: [stringToSign, signerAddress],
    });

    return signature ? signature : "";
  } catch (error) {
    console.error("Error signing message:", error);
    alert("Failed to sign message");
    throw error;
  }
};
const DirectPassportDataAccess = ({ address }: { address?: string }) => {
  const { data, isError, error } = usePassportScore({
    ...passportEmbedParams,
    embedServiceUrl: passportEmbedParams.overrideEmbedServiceUrl,
    address,
  });

  return (
    <div>
      <h1>This is an app element!</h1>
      <ul>
        <li>Passport Score: {data?.score}</li>
        <li>Passport Threshold: {data?.threshold}</li>
        <li>Is passing threshold: {data?.passingScore ? "True" : "False"}</li>
        <li>
          What stamps?
          <pre>{JSON.stringify(data?.stamps, undefined, 2)}</pre>
        </li>
        {isError && <li>Error: {(error as Error)?.message}</li>}
      </ul>
    </div>
  );
};

// Mock wallet that just returns a hardcoded address
const mockWallet = {
  connect: async () => {
    // Simulate a tiny delay like a real wallet
    await new Promise(resolve => setTimeout(resolve, 300));
    return "0x1234567890123456789012345678901234567890";
  },
  sign: async (message: string) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    return `0xmocked_signature_for_${message}`;
  }
};

const Dashboard = () => {
  const [address, setAddress] = useState<string | undefined>();
  const [collapseMode, setCollapseMode] = useState<CollapseMode>("shift");
  const [walletMode, setWalletMode] = useState<"metamask" | "mock">("metamask");

  const handleConnect = async () => {
    if (walletMode === "mock") {
      const addr = await mockWallet.connect();
      setAddress(addr);
    } else {
      const addr = await connectWallet();
      setAddress(addr);
    }
  };

  const handleSign = async (message: string) => {
    if (walletMode === "mock") {
      return mockWallet.sign(message);
    } else {
      return generateSignature(message);
    }
  };

  return (
    <div className="container">
      <h1>Passport Widgets Example</h1>
      <h3>Check your Passport score</h3>
      
      <div style={{ marginBottom: "1rem", padding: "1rem", background: "#f0f0f0", borderRadius: "8px" }}>
        <label style={{ marginRight: "0.5rem", fontWeight: "bold" }}>Wallet Mode:</label>
        <select 
          value={walletMode} 
          onChange={(e) => {
            setWalletMode(e.target.value as "metamask" | "mock");
            setAddress(undefined); // Reset address when switching
          }}
          style={{ marginRight: "1rem" }}
        >
          <option value="metamask">MetaMask (Real)</option>
          <option value="mock">Mock Wallet (Testing)</option>
        </select>
        {walletMode === "mock" && (
          <span style={{ color: "orange", fontSize: "0.9em" }}>
            🔧 Using mock wallet - no real transactions
          </span>
        )}
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label style={{ marginRight: "0.5rem" }}>Collapse Mode:</label>
        <select value={collapseMode} onChange={(e) => setCollapseMode(e.target.value as "shift" | "overlay" | "off")}>
          <option value="shift">Shift</option>
          <option value="overlay">Overlay</option>
          <option value="off">Off</option>
        </select>
      </div>
      <PassportScoreWidget
        {...passportEmbedParams}
        address={address}
        collapseMode={collapseMode}
        connectWalletCallback={handleConnect}
        generateSignatureCallback={handleSign}

        /*
        theme={{
          colors: {
            primary: "255, 255, 0",
          },
        }}
        */
      />
      <DirectPassportDataAccess address={address} />
    </div>
  );
};

export const App = () => (
  <>
    <Dashboard />
    <ScenarioSwitcher />
  </>
);

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
