import { useQuery } from "@tanstack/react-query";
const DEFAULT_IAM_URL = "https://iam.passport.xyz/api/v0.0.0";
import axios from "axios";

export type PassportEmbedProps = {
  apiKey: string;
  scorerId: string;
  address: string;
  overrideIamUrl?: string;
};

type PassportProviderPoints = {
  score: number;
  dedup: boolean;
  expiration_date: Date;
};

// TODO: define proper value types
type PassportScore = {
  address: String;
  score: number;
  passing_score: boolean;
  last_score_timestamp: Date;
  expiration_timestamp: Date;
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
  enabled,
  apiKey,
  address,
  scorerId,
  overrideIamUrl,
}: PassportEmbedProps & { enabled?: boolean }): PassportEmbedResult => {
  return useQuery({
    // Default to enabled
    enabled: enabled === undefined ? true : enabled,
    queryKey: ["passportScore", address, scorerId, overrideIamUrl],
    queryFn: () =>
      fetchPassportScore({ apiKey, address, scorerId, overrideIamUrl }),
  });
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
    passing_score: scoreData.passing_score,
    last_score_timestamp: new Date(scoreData.last_score_timestamp),
    expiration_timestamp: new Date(scoreData.expiration_timestamp),
    threshold: parseFloat(scoreData.threshold),
    stamps: ((stamps: Record<string, any>) => {
      const ret: Record<string, PassportProviderPoints> = {};
      for (const key in stamps) {
        if (stamps.hasOwnProperty(key)) {
          const stamp = stamps[key];
          ret[key] = {
            score: parseFloat(stamp.score),
            dedup: stamp.dedup,
            expiration_date: new Date(stamp.expiration_date),
          };
        }
      }
      return ret;
    })(scoreData.stamps),
  };

  return ret;
};
