import { createRoot } from "react-dom/client";
import { useState, useEffect } from "react";
import { Buffer } from "buffer";
import { PassportScoreWidget, usePassportScore, CollapseMode } from "@passportxyz/passport-embed";
import { setupMocks } from "./setupMocks";
import { DevToolsPanel } from "./components/DevToolsPanel";

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
    console.log("%c🔐 [Mock Wallet] Simulating wallet connection...", "color: #4CAF50; font-weight: bold");
    console.log(`%c   → User would normally see MetaMask popup here`, "color: #888");

    // Simulate a tiny delay like a real wallet
    await new Promise((resolve) => setTimeout(resolve, 300));

    const address = "0x1234567890123456789012345678901234567890";
    console.log(`%c✅ [Mock Wallet] Connected with address: ${address}`, "color: #4CAF50");
    console.log(`%c   → Simulated user clicking "Connect" in wallet popup`, "color: #888");

    return address;
  },
  sign: async (message: string) => {
    console.log("%c🖊️ [Mock Wallet] Signature request received", "color: #FF9800; font-weight: bold");
    console.log(
      `%c   → Message to sign: "${message.substring(0, 50)}${message.length > 50 ? "..." : ""}"`,
      "color: #888"
    );
    console.log(`%c   → User would see MetaMask signature popup here`, "color: #888");

    await new Promise((resolve) => setTimeout(resolve, 200));

    const signature = `0xmocked_signature_for_${message}`;
    console.log(`%c✅ [Mock Wallet] Signature generated`, "color: #4CAF50");
    console.log(`%c   → Simulated user clicking "Sign" in wallet popup`, "color: #888");
    console.log(`%c   → Mock signature: ${signature.substring(0, 30)}...`, "color: #888");

    return signature;
  },
};

const Dashboard = ({ walletMode }: { walletMode: "metamask" | "mock" }) => {
  const [address, setAddress] = useState<string | undefined>();
  const [collapseMode, setCollapseMode] = useState<CollapseMode>("shift");

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

  // Reset address when wallet mode changes
  useEffect(() => {
    setAddress(undefined);
  }, [walletMode]);

  return (
    <div className="container">
      <h1>Passport Widgets Example</h1>
      <h3>Check your Passport score</h3>

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
        opRPCURL={import.meta.env.VITE_OP_RPC_URL as string}
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

export const App = () => {
  const showMocks = import.meta.env.VITE_ENABLE_MSW === "true";
  const [walletMode, setWalletMode] = useState<"metamask" | "mock">("mock");

  return (
    <>
      <Dashboard walletMode={walletMode} />
      {showMocks && <DevToolsPanel walletMode={walletMode} onWalletModeChange={setWalletMode} />}
    </>
  );
};

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
