import { createRoot } from "react-dom/client";
import { PassportScoreWidget, usePassportScore } from "passport-widgets";

import "./index.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

const appQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // With this config, the query will be re-fetched when this tab/window
      // is refocused and the data has not been fetched for at least 1 minute
      refetchOnWindowFocus: true,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: 1000 * 60 * 1,
      gcTime: Infinity,
    },
  },
});

const passportEmbedParams = {
  apiKey: import.meta.env.VITE_API_KEY,
  scorerId: import.meta.env.VITE_SCORER_ID,
  overrideIamUrl: "http://localhost:8004",
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

const DirectPassportDataAccess = ({ address }: { address?: string }) => {
  const { data, isError, error } = usePassportScore({
    ...passportEmbedParams,
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
        {isError && <li>Error: {error?.message}</li>}
      </ul>
    </div>
  );
};

const Dashboard = () => {
  const [address, setAddress] = useState<string | undefined>();

  return (
    <div className="container">
      <h1>Passport Widgets Example</h1>
      <h3>Check your Passport score</h3>
      <PassportScoreWidget
        {...passportEmbedParams}
        address={address}
        // Generally you would not provide this, the widget has its own QueryClient.
        // But this can be used to override query parameters or to share a QueryClient
        // with the wider app and/or multiple widgets
        queryClient={appQueryClient}
        connectWalletCallback={async () => {
          const address = await connectWallet();
          setAddress(address);
        }}
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

const App = () => (
  <QueryClientProvider client={appQueryClient}>
    <Dashboard />
  </QueryClientProvider>
);

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<App />);
}
