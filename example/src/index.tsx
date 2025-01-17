import { useState } from "react";
import { createRoot } from "react-dom/client";
import { PassportScoreWidget, usePassportScore } from "passport-widgets";
import { setConfig } from "passport-widgets/config";

import { WagmiProvider, createConfig } from "wagmi";
import { mainnet, optimismSepolia } from "wagmi/chains";
import { createPublicClient, http } from "viem";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useConnect, useAccount, useDisconnect } from "wagmi";
import { signMessage } from "@wagmi/core";
import "./index.css";

const API_KEY = import.meta.env.VITE_API_KEY;
const SCORER_ID = import.meta.env.VITE_SCORER_ID;

setConfig({
  apiKey: API_KEY,
  scorerId: SCORER_ID,
  overrideIamUrl: "https://embed.staging.passport.xyz",
});

// Initialize React Query's QueryClient
const queryClient = new QueryClient();
// Create a public client using viem
const publicClient = createPublicClient({
  chain: mainnet,
  transport: http(), // Default HTTP transport
});

// Create Wagmi configuration
const wagmiConfig = createConfig({
  chains: [mainnet, optimismSepolia],
  transports: {
    [mainnet.id]: http("https://rpc.ankr.com/eth"),
    [optimismSepolia.id]: http("https://sepolia.optimism.io"),
  },
});

const WalletConnectButton = () => {
  const { connect, connectors, status } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  if (isConnected) return null;

  return (
    <div>
      <h3>Connect your wallet to see your Passport Score</h3>
      {connectors.map((connector) => (
        <button key={connector.id} onClick={() => connect({ connector })}>
          {status == "pending"
            ? "Connecting..."
            : `Connect with ${connector.name}`}
        </button>
      ))}
    </div>
  );
};

const App = () => {
  const { address, isConnected } = useAccount();
  // const { disconnect } = useDisconnect();
  const [signature, setSignature] = useState<string | null>(null);
  const passportScore = usePassportScore({
    enabled: isConnected,
    address: address || "",
  });

  const generateSignature = async (message: string) => {
    try {
      const signedMessage = await signMessage(wagmiConfig, { message });
      console.log("Signature:", signedMessage);
      setSignature(signedMessage); // Update state with the generated signature
      return signedMessage;
    } catch (error) {
      console.error("Error signing message:", error);
      throw error;
    }
  };

  return (
    <div className="container">
      <h1>Passport Widgets Example</h1>
      {!isConnected ? (
        <WalletConnectButton />
      ) : (
        <>
          <h3>Wallet Connected</h3>
          <p>Address: {address}</p>
          {/* <button onClick={() => disconnect()}>Disconnect</button> */}
          <PassportScoreWidget
            address={address || ""}
            enabled={true}
            generateSignature={generateSignature}
            signature={signature}
          />
          <div>
            <h3>Passport Details</h3>
            <ul>
              <li>Passport Score: {passportScore.data?.score}</li>
              <li>Passport Threshold: {passportScore.data?.threshold}</li>
              <li>
                Is passing threshold:{" "}
                {passportScore.data?.passing_score ? "True" : "False"}
              </li>
              <li>
                What stamps?
                <pre>
                  {JSON.stringify(passportScore.data?.stamps, undefined, 2)}
                </pre>
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig}>
        <App />
      </WagmiProvider>
    </QueryClientProvider>
  );
}
