import { StampsMetadataResponse } from "../hooks/useStampPages";
import { PassportQueryProps } from "../hooks/usePassportScore";
export declare const fetchStampPages: ({ apiKey, scorerId, embedServiceUrl, }: PassportQueryProps) => Promise<StampsMetadataResponse>;
