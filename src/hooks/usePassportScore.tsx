import { useQuery } from "@tanstack/react-query";
const DEFAULT_IAM_URL = "https://iam.passport.xyz/api/v0.0.0";
import axios from "axios";

<<<<<<< HEAD
export type PassportScoreProps = {
=======
import { config } from "../config";
import { useEffect, useState } from "react";

export type PassportEmbedApiProps = {
>>>>>>> 2964-demo-widget
  apiKey: string;
  address: string;
  scorerId: string;
  overrideIamUrl?: string;
};

<<<<<<< HEAD
export const usePassportScore = ({
  enabled,
  apiKey,
  address,
  scorerId,
  overrideIamUrl,
}: PassportScoreProps & { enabled: boolean }) => {
  return useQuery({
    enabled,
    queryKey: ["passportScore", address, scorerId, overrideIamUrl],
    queryFn: () =>
      fetchPassportScore({ apiKey, address, scorerId, overrideIamUrl }),
  });
=======
export type PassportEmbedProps = {
  address: string;
  enabled: boolean;
};

type PassportProviderPoints = {
  score: number;
  dedup: boolean;
  expiration_date: Date;
};

// TODO: define proper value types
type PassportScore = {
  address?: String;
  score?: number;
  passing_score?: boolean;
  last_score_timestamp?: Date;
  expiration_timestamp?: Date;
  threshold?: number;
  error?: String;
  stamps?: Record<string, PassportProviderPoints>;
};

type PassportScoreFetch = {
  data: PassportScore | undefined;
  isLoading: boolean;
  isError: boolean;
  error: any;
};

export const usePassportScore = ({
  enabled,
  address,
}: PassportEmbedProps): PassportScoreFetch => {
  const [score, setScore] = useState<PassportScoreFetch>({
    data: undefined,
    isLoading: false,
    isError: false,
    error: undefined,
  });

  useEffect(() => {
    setScore({ ...score, isLoading: true, isError: false, error: undefined });
    fetchPassportScore({
      apiKey: config.apiKey,
      address,
      scorerId: config.scorerId,
      overrideIamUrl: config.overrideIamUrl,
    })
      .then((response) => {
        console.log("-----------------------");
        console.log("response", response);
        setScore({
          ...score,
          data: response,
          isLoading: false,
          isError: false,
          error: undefined,
        });
      })
      .catch((error) => {
        setScore({ ...score, isLoading: false, isError: false, error: error });
      });
  }, [enabled, address]);

  return score;

  // return useQuery({
  //   enabled,
  //   queryKey: [
  //     "passportScore",
  //     address,
  //     config.scorerId,
  //     config.overrideIamUrl,
  //   ],
  //   queryFn: () =>
  //     fetchPassportScore({
  //       apiKey: config.apiKey,
  //       address,
  //       scorerId: config.scorerId,
  //       overrideIamUrl: config.overrideIamUrl,
  //     }),
  // });
>>>>>>> 2964-demo-widget
};

const fetchPassportScore = async ({
  apiKey,
  address,
  scorerId,
  overrideIamUrl,
<<<<<<< HEAD
}: PassportScoreProps): Promise<{
  score: string;
  threshold: string;
  passingScore: boolean;
  overrideIamUrl?: string;
}> => {
=======
}: PassportEmbedApiProps): Promise<PassportScore> => {
>>>>>>> 2964-demo-widget
  /*
  return {
    score: "32.113512",
    threshold: "20",
    passingScore: true,
  };
  */
  const response = await axios.post(
<<<<<<< HEAD
    `${overrideIamUrl || DEFAULT_IAM_URL}/auto-verification`,
=======
    `${overrideIamUrl || DEFAULT_IAM_URL}/embed/verify`,
>>>>>>> 2964-demo-widget
    {
      address,
      scorerId,
    },
    {
      headers: {
<<<<<<< HEAD
        Authorization: `Bearer ${apiKey}`,
=======
        "X-API-KEY": apiKey,
>>>>>>> 2964-demo-widget
        "Content-Type": "application/json",
      },
    }
  );

<<<<<<< HEAD
  const { score, threshold } = response.data;

  const passingScore = parseFloat(score) >= parseFloat(threshold);

  return {
    score,
    threshold,
    passingScore,
  };
=======
  const scoreData = response.data;
  console.log("geri scoreData", scoreData);
  try {
    const ret: PassportScore = {
      address: scoreData.address,
      score: parseFloat(scoreData.score),
      passing_score: scoreData.passing_score,
      last_score_timestamp: new Date(scoreData.last_score_timestamp),
      expiration_timestamp: new Date(scoreData.expiration_timestamp),
      threshold: parseFloat(scoreData.threshold),
      error: scoreData.error,
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
  } catch (error) {
    // TODO: handle error
    console.log("scoreData error", error);
    const ret: PassportScore = {
      error: scoreData.error,
    };
    return ret;
  }
>>>>>>> 2964-demo-widget
};
