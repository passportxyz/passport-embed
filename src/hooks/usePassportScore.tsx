import { useQuery } from "@tanstack/react-query";
const DEFAULT_IAM_URL = "https://iam.passport.xyz/api/v0.0.0";
import axios from "axios";

export type PassportScoreProps = {
  apiKey: string;
  address: string;
  scorerId: string;
  overrideIamUrl?: string;
};

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
};

const fetchPassportScore = async ({
  apiKey,
  address,
  scorerId,
  overrideIamUrl,
}: PassportScoreProps): Promise<{
  score: string;
  threshold: string;
  passingScore: boolean;
  overrideIamUrl?: string;
}> => {
  /*
  return {
    score: "32.113512",
    threshold: "20",
    passingScore: true,
  };
  */
  const response = await axios.post(
    `${overrideIamUrl || DEFAULT_IAM_URL}/auto-verification`,
    {
      address,
      scorerId,
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  const { score, threshold } = response.data;

  const passingScore = parseFloat(score) >= parseFloat(threshold);

  return {
    score,
    threshold,
    passingScore,
  };
};
