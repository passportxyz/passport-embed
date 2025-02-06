import axios from "axios";
import { StampsMetadataResponse } from "../hooks/useStampPages";
import { DEFAULT_IAM_URL } from "../hooks/usePassportScore";

export const fetchStampPages = async ({
  apiKey,
  scorerId,
  overrideIamUrl,
}: {
  apiKey: string;
  scorerId: string;
  overrideIamUrl?: string;
}) => {
  // TODO: fix this to use propr url encoding
  const response = await axios.get<StampsMetadataResponse>(
    `${
      overrideIamUrl || DEFAULT_IAM_URL
    }/embed/stamps/metadata?scorerId=${scorerId}`,
    {
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};
