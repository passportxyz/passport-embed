import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const Widget = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

import { useQuery } from "@tanstack/react-query";

async function fetchPassportScore({
  apiKey,
  address,
}: {
  apiKey: string;
  address: string;
}) {
  return "TODO";
  const response = await fetch(`https://TODO/${address}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch Passport Score data");
  }

  return response.json();
}

export function usePassportScore({
  apiKey,
  address,
}: {
  apiKey: string;
  address: string;
}) {
  return useQuery({
    queryKey: ["passportScore", address],
    queryFn: () => fetchPassportScore({ apiKey, address }),
  });
}

type PassportScoreWidgetProps = {
  apiKey: string;
  address: string;
};

const PassportScore = ({ apiKey, address }: PassportScoreWidgetProps) => {
  const { data, isLoading, isError, error } = usePassportScore({
    apiKey,
    address,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (isError) {
    return <div>Error: {error.message}</div>;
  }

  return (
    <div>
      <h1>Score Data 23</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export const PassportScoreWidget = (props: PassportScoreWidgetProps) => {
  return (
    <Widget>
      <PassportScore {...props} />
    </Widget>
  );
};
