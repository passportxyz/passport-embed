import { createRoot } from "react-dom/client";
import { PassportScoreWidget, usePassportScore } from "passport-widgets";

import "./index.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
  overrideIamUrl: "http://localhost:8888/api/v0.0.0",
};

const DirectPassportDataAccess = ({ address }: { address: string }) => {
  const { data, isError, error } = usePassportScore({
    ...passportEmbedParams,
    address,
  });

  console.log("passportScore", data);

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
  const address = "0x85fF01cfF157199527528788ec4eA6336615C989";

  return (
    <div className="container">
      <h1>Passport Widgets Example</h1>
      <h3>Check your Passport score</h3>
      <PassportScoreWidget
        {...passportEmbedParams}
        address="0x85fF01cfF157199527528788ec4eA6336615C989"
        // Generally you would not provide this, the widget has its own QueryClient.
        // But this can be used to override query parameters or to share a QueryClient
        // with the wider app and/or multiple widgets
        queryClient={appQueryClient}
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
