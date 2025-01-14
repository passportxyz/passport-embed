import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";
const DEFAULT_IAM_URL = "https://embed.passport.xyz";
import axios from "axios";

export type PassportEmbedProps = {
  apiKey: string;
  scorerId: string;
  address: string;
  overrideIamUrl?: string;
  // Optional, allows you to share a queryClient between the
  // widget(s) and the wider app
  queryClient?: QueryClient;
};

type PassportProviderPoints = {
  score: number;
  dedup: boolean;
  expirationDate: Date;
};

// TODO: define proper value types
export type PassportScore = {
  address: String;
  score: number;
  passingScore: boolean;
  lastScoreTimestamp: Date;
  expirationTimestamp: Date;
  threshold: number;
  stamps: Record<string, PassportProviderPoints>;
};

type PassportEmbedResult = {
  data: PassportScore | undefined;
  isLoading: boolean;
  isError: boolean;
  error: any;
};

export const usePassportScore = ({
  apiKey,
  address,
  scorerId,
  overrideIamUrl,
  queryClient,
}: PassportEmbedProps & { enabled?: boolean }): PassportEmbedResult => {
  // If a queryClient is not provided, use the nearest one
  const nearestClient = useQueryClient();

  return useQuery(
    {
      enabled: Boolean(address && apiKey && scorerId),
      queryKey: ["passportScore", address, scorerId, overrideIamUrl],
      queryFn: () =>
        fetchPassportScore({ apiKey, address, scorerId, overrideIamUrl }),
    },
    queryClient || nearestClient
  );
};

// Any errors are automatically propagated into the react-query hook response (i.e. isError, error)
const fetchPassportScore = async ({
  apiKey,
  address,
  scorerId,
  overrideIamUrl,
}: PassportEmbedProps): Promise<PassportScore> => {
  /*
  return {
    score: "32.113512",
    threshold: "20",
    passingScore: true,
  };
  */
  const response = await axios.post(
    `${overrideIamUrl || DEFAULT_IAM_URL}/embed/verify`,
    {
      address,
      scorerId,
    },
    {
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
    }
  );

  const scoreData = response.data;
  console.log("geri scoreData", scoreData);

  const ret: PassportScore = {
    address: scoreData.address,
    score: parseFloat(scoreData.score),
    passingScore: scoreData.passing_score,
    lastScoreTimestamp: new Date(scoreData.last_score_timestamp),
    expirationTimestamp: new Date(scoreData.expiration_timestamp),
    threshold: parseFloat(scoreData.threshold),
    stamps: ((stamps: Record<string, any>) => {
      const ret: Record<string, PassportProviderPoints> = {};
      for (const key in stamps) {
        if (stamps.hasOwnProperty(key)) {
          const stamp = stamps[key];
          ret[key] = {
            score: parseFloat(stamp.score),
            dedup: stamp.dedup,
            expirationDate: new Date(stamp.expiration_date),
          };
        }
      }
      return ret;
    })(scoreData.stamps),
  };

  return ret;
};
