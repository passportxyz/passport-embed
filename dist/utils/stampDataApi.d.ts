import { StampsMetadataResponse } from "../hooks/stampTypes";
import { PassportQueryProps } from "../hooks/usePassportScore";
export declare const fetchStampPages: ({ apiKey, scorerId, embedServiceUrl }: PassportQueryProps) => Promise<StampsMetadataResponse>;
