import { useQuery } from "@tanstack/react-query";
const IAM_URL = "http://localhost:8888/api/v0.0.0";
import axios from "axios";

export type PassportScoreProps = {
  apiKey: string;
  address: string;
  scorerId: string;
};

export const usePassportScore = ({
  enabled,
  apiKey,
  address,
  scorerId,
}: PassportScoreProps & { enabled: boolean }) => {
  return useQuery({
    enabled,
    queryKey: ["passportScore", address, scorerId],
    queryFn: () => fetchPassportScore({ apiKey, address, scorerId }),
  });
};

const fetchPassportScore = async ({
  apiKey,
  address,
  scorerId,
}: PassportScoreProps): Promise<{
  score: string;
  threshold: string;
  passingScore: boolean;
}> => {
  /*
  return {
    score: "32.113512",
    threshold: "20",
    passingScore: true,
  };
  */
  const response = await axios.post(
    `${IAM_URL}/auto-verification`,
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
