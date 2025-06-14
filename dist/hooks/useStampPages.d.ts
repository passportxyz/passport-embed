import { ReactNode } from "react";
import { PassportQueryProps } from "./usePassportScore";
export type Credential = {
    id: string;
    weight: string;
};
export type Platform = {
    name: string;
    description: ReactNode;
    documentationLink: string;
    requiresSignature?: boolean;
    requiresPopup?: boolean;
    popupUrl?: string;
    credentials: Credential[];
    displayWeight: string;
};
type RawPlatformData = Omit<Platform, "description"> & {
    description: string;
};
export type StampPage = {
    header: string;
    platforms: Platform[];
};
type RawStampPageData = Omit<StampPage, "platforms"> & {
    platforms: RawPlatformData[];
};
export type StampsMetadataResponse = RawStampPageData[];
export declare const usePaginatedStampPages: ({ apiKey, scorerId, embedServiceUrl }: PassportQueryProps) => {
    page: StampPage;
    nextPage: () => void;
    prevPage: () => void;
    isFirstPage: boolean;
    isLastPage: boolean;
    loading: boolean;
    error: string | null;
};
export {};
