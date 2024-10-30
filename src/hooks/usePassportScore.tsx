import { useQuery } from "@tanstack/react-query";
const IAM_URL = "http://localhost:8888/api/v0.0.0";
import axios from "axios";

export type PassportScoreProps = {
  apiKey: string;
  address: string;
  scorerId: string;
};

export const usePassportScore = ({
  apiKey,
  address,
  scorerId,
}: PassportScoreProps) => {
  return useQuery({
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
}> => {
  return {
    score: "32.113512",
  };
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

  return response.data;
};
