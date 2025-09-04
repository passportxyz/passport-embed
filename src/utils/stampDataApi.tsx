import axios from "axios";
import { StampsMetadataResponse } from "../hooks/stampTypes";
import { PassportQueryProps } from "../hooks/usePassportScore";

export const fetchStampPages = async ({ apiKey, scorerId, embedServiceUrl }: PassportQueryProps) => {
  const response = await axios.get<StampsMetadataResponse>(
    `${embedServiceUrl}/embed/stamps/metadata?scorerId=${scorerId}`,
    {
      headers: {
        "X-API-KEY": apiKey,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data;
};
