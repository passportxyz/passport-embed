import { useCallback, useEffect, useState } from "react";
import {
  useIsFetching,
  useIsMutating,
  useMutation,
  useQuery,
  QueryObserverResult,
} from "@tanstack/react-query";
import axios, { isAxiosError } from "axios";
import { useQueryContext } from "../hooks/useQueryContext";
import { usePassportQueryClient } from "./usePassportQueryClient";
import { DEFAULT_EMBED_SERVICE_URL } from "../contexts/QueryContext";

export type PassportEmbedProps = {
  apiKey: string;
  scorerId: string;
  // Address required to check Passport score,
  // but may be undefined if the wallet is not
  // yet connected
  address?: string;
  // Optional, if provided the widget will prompt
  // the user to connect their wallet if the
  // `address` is undefined
  connectWalletCallback?: () => Promise<void>;
  generateSignatureCallback?: (message: string) => Promise<string | undefined>;
  overrideEmbedServiceUrl?: string;
};

export type PassportQueryProps = Pick<
  PassportEmbedProps,
  "apiKey" | "address" | "scorerId"
> & {
  embedServiceUrl?: PassportEmbedProps["overrideEmbedServiceUrl"];
};

type PassportProviderPoints = {
  score: number;
  dedup: boolean;
  expirationDate: Date;
};

export type PassportScore = {
  address: string;
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
  refetch: () => Promise<QueryObserverResult<PassportScore | undefined, Error>>;
};

export const useWidgetPassportScoreAndVerifyCredentials = () => {
  const { isFetching, data, isError } = useWidgetPassportScore();
  const { mutate } = useWidgetVerifyCredentials();
  const [checkingEvmCredentials, setCheckingEvmCredentials] = useState(false);
  const [evmCredentialsChecked, setEvmCredentialsChecked] = useState(false);

  useEffect(() => {
    if (!isFetching && !isError && data !== undefined) {
      if (
        data.score < data.threshold &&
        !checkingEvmCredentials &&
        !evmCredentialsChecked
      ) {
        setCheckingEvmCredentials(true);
        mutate(undefined, {
          onSettled: (data, error, variables, context) => {
            setCheckingEvmCredentials(false);
            setEvmCredentialsChecked(true);
          },
        });
      }
    }
  }, [isFetching, data, isError]);

  // TODO: shall we compute a single state that takes into account the query & the mutation?
  return { data };
};

export class RateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RateLimitError";
  }
}

export const useWidgetPassportScore = () => {
  const queryProps = useQueryContext();
  return useInternalPassportScore(queryProps);
};

export const useWidgetVerifyCredentials = () => {
  const queryProps = useQueryContext();
  const queryClient = usePassportQueryClient();
  const queryKey = useQueryKey(queryProps);

  const verifyCredentialsMutation = useMutation(
    {
      mutationFn: () => verifyStampsForPassport({ ...queryProps }),
      onSuccess: (data) => {
        queryClient.setQueryData(queryKey, data);
      },
    },
    queryClient
  );

  return verifyCredentialsMutation;
};

// Returns true if any queries are currently in progress
export const useWidgetIsQuerying = () => {
  const queryClient = usePassportQueryClient();
  const isFetching = useIsFetching(undefined, queryClient);
  const isMutating = useIsMutating(undefined, queryClient);

  return Boolean(isFetching || isMutating);
};

const useQueryKey = ({
  address,
  scorerId,
  embedServiceUrl,
}: Pick<PassportQueryProps, "address" | "scorerId" | "embedServiceUrl">) => {
  return ["passportScore", address, scorerId, embedServiceUrl];
};

export const useResetWidgetPassportScore = () => {
  const queryClient = usePassportQueryClient();
  const queryProps = useQueryContext();
  const queryKey = useQueryKey(queryProps);

  const resetPassportScore = useCallback(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [queryClient, queryKey]);

  return { resetPassportScore };
};

const useInternalPassportScore = ({
  apiKey,
  address,
  scorerId,
  embedServiceUrl,
}: PassportQueryProps): PassportEmbedResult => {
  const queryClient = usePassportQueryClient();
  const queryKey = useQueryKey({ address, scorerId, embedServiceUrl });
  return useQuery(
    {
      queryKey,
      enabled: Boolean(address && apiKey && scorerId),
      queryFn: () =>
        fetchPassportScore({
          apiKey,
          address,
          scorerId,
          embedServiceUrl,
        }),
    },
    queryClient
  );
};

type EmbedScoreResponse = {
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
  embedServiceUrl,
}: PassportQueryProps): Promise<PassportScore> => {
  try {
    const scoreResponse = await axios.get<EmbedScoreResponse>(
      `${embedServiceUrl}/embed/score/${scorerId}/${address}`,

      {
        headers: {
          "X-API-KEY": apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    return processScoreResponse(scoreResponse.data);
  } catch (error) {
    throw processScoreResponseError(error);
  }
};

const processScoreResponse = (
  scoreData: EmbedScoreResponse
): PassportScore => ({
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
});

const processScoreResponseError = <T extends unknown>(error: T): T | Error => {
  if (isAxiosError(error) && error.response?.status === 429) {
    if (error.response.headers["x-ratelimit-limit"] === "0") {
      return new RateLimitError(
        "This API key does not have permission to access the Embed API."
      );
    }
    return new RateLimitError("Rate limit exceeded.");
  }
  return error;
};

const verifyStampsForPassport = async ({
  apiKey,
  address,
  scorerId,
  embedServiceUrl,
  credentialIds,
}: PassportQueryProps & {
  credentialIds?: string[];
}): Promise<PassportScore> => {
  try {
    const scoreData = (
      await axios.post<EmbedScoreResponse>(
        `${embedServiceUrl}/embed/auto-verify`,
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
      )
    ).data;
    return processScoreResponse(scoreData);
  } catch (error) {
    throw processScoreResponseError(error);
  }
};

export const usePassportScore = ({
  apiKey,
  address,
  scorerId,
  embedServiceUrl,
}: PassportQueryProps): PassportEmbedResult => {
  // Because this hook might be also used directly by users we have no guarantee that embedServiceUrl has been overriden
  const verifiedEmbedServiceUrl = embedServiceUrl || DEFAULT_EMBED_SERVICE_URL;

  return useInternalPassportScore({
    apiKey,
    address,
    scorerId,
    embedServiceUrl: verifiedEmbedServiceUrl,
  });
};
