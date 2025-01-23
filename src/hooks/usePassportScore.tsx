import {
  QueryClient,
  useIsFetching,
  useIsMutating,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import { useQueryContext } from "../contexts/QueryContext";
import { useCallback } from "react";

const DEFAULT_IAM_URL = "https://embed.passport.xyz";

export type PassportEmbedProps = {
  apiKey: string;
  scorerId: string;
  // Address required to check Passport score,
  // but may be undefined if the wallet is not
  // yet connected
  address?: string;
  overrideIamUrl?: string;
  challengeSignatureUrl?: string;
  oAuthPopUpUrl?: string;
  // Optional, allows you to share a queryClient between the
  // widget(s) and the wider app
  queryClient?: QueryClient;
  // Optional, if provided the widget will prompt
  // the user to connect their wallet if the
  // `address` is undefined
  connectWalletCallback?: () => Promise<void>;
  generateSignatureCallback?: (message: string) => Promise<string | undefined>;
};

type PassportProviderPoints = {
  score: number;
  dedup: boolean;
  expirationDate: Date;
};

export type PassportScore = {
  address: String;
  score: number;
  passingScore: boolean;
  lastScoreTimestamp: Date;
  expirationTimestamp: Date;
  threshold: number;
  stamps: Record<string, PassportProviderPoints>;
};

export type PassportEmbedResult = {
  data: PassportScore | undefined;

  // No data yet
  isPending: boolean;
  // Currently querying data
  isFetching: boolean;
  // isPending && isFetching
  isLoading: boolean;

  isError: boolean;
  error: any;
};

export const useWidgetPassportScore = () => {
  const queryProps = useQueryContext();
  return usePassportScore(queryProps);
};

export const useWidgetVerifyCredentials = () => {
  const queryProps = useQueryContext();
  const queryKey = useQueryKey(queryProps);

  const verifyCredentialsMutation = useMutation(
    {
      mutationFn: (credentialIds: string[]) =>
        fetchPassportScore({ ...queryProps, credentialIds }),
      onSuccess: (data) => {
        console.log("Setting data from mutation", data);
        queryProps.queryClient.setQueryData(queryKey, data);
      },
    },
    queryProps.queryClient
  );

  const verifyCredentials = useCallback(
    (credentialIds: string[]) =>
      verifyCredentialsMutation.mutate(credentialIds),
    [verifyCredentialsMutation]
  );

  return { verifyCredentials };
};

// Returns true if any queries are currently in progress
export const useWidgetIsQuerying = () => {
  const { queryClient } = useQueryContext();
  const isFetching = useIsFetching(undefined, queryClient);
  const isMutating = useIsMutating(undefined, queryClient);

  return Boolean(isFetching || isMutating);
};

const useQueryKey = ({
  address,
  scorerId,
  overrideIamUrl,
}: Pick<PassportEmbedProps, "address" | "scorerId" | "overrideIamUrl">) => {
  return ["passportScore", address, scorerId, overrideIamUrl];
};

export const useResetPassportScore = () => {
  const queryProps = useQueryContext();
  const queryKey = useQueryKey(queryProps);

  const resetPassportScore = useCallback(() => {
    queryProps.queryClient.invalidateQueries({ queryKey });
  }, [queryProps.queryClient, queryKey]);

  return { resetPassportScore };
};

export const usePassportScore = ({
  apiKey,
  address,
  scorerId,
  overrideIamUrl,
  queryClient,
}: PassportEmbedProps): PassportEmbedResult => {
  // If a queryClient is not provided, use the nearest one
  const nearestClient = useQueryClient();

  const queryKey = useQueryKey({ address, scorerId, overrideIamUrl });

  return useQuery(
    {
      queryKey,
      enabled: Boolean(address && apiKey && scorerId),
      queryFn: () =>
        fetchPassportScore({ apiKey, address, scorerId, overrideIamUrl }),
    },
    queryClient || nearestClient
  );
};

type EmbedVerifyResponse = {
  address: string;
  score: string;
  passing_score: boolean;
  last_score_timestamp: string;
  expiration_timestamp: string;
  threshold: string;
  stamps: {
    [key: string]: {
      score: string;
      expiration_date: string;
      dedup: boolean;
    };
  };
};

// Any errors are automatically propagated into the react-query hook response (i.e. isError, error)
const fetchPassportScore = async ({
  apiKey,
  address,
  scorerId,
  overrideIamUrl,
  credentialIds,
}: PassportEmbedProps & {
  credentialIds?: string[];
}): Promise<PassportScore> => {
  const response = await axios.post<EmbedVerifyResponse>(
    `${overrideIamUrl || DEFAULT_IAM_URL}/embed/verify`,
    {
      address,
      scorerId,
      credentialIds,
    },
    {
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
    }
  );

  const scoreData = response.data;

  const ret: PassportScore = {
    address: scoreData.address,
    score: parseFloat(scoreData.score),
    passingScore: scoreData.passing_score,
    lastScoreTimestamp: new Date(scoreData.last_score_timestamp),
    expirationTimestamp: new Date(scoreData.expiration_timestamp),
    threshold: parseFloat(scoreData.threshold),
    stamps: Object.entries(scoreData.stamps).reduce(
      (stamps, [credentialId, { score, expiration_date, dedup }]) => {
        stamps[credentialId] = {
          score: parseFloat(score),
          dedup,
          expirationDate: new Date(expiration_date),
        };
        return stamps;
      },
      {} as Record<string, PassportProviderPoints>
    ),
  };

  return ret;
};
