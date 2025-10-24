import { ReactNode } from "react";
export declare const INCLUDE_VISIT_PASSPORT_PAGE = true;
export declare const VISIT_PASSPORT_HEADER = "More Options";
export type Credential = {
    id: string;
    weight: string;
};
export type Platform = {
    platformId: string;
    name: string;
    description: ReactNode;
    documentationLink: string;
    requiresSignature?: boolean;
    requiresPopup?: boolean;
    popupUrl?: string;
    requiresSDKFlow?: boolean;
    credentials: Credential[];
    displayWeight: string;
    icon: ReactNode;
};
export type RawPlatformData = Omit<Platform, "description" | "icon"> & {
    description: string;
    icon: string;
};
export type StampPage = {
    header: string;
    platforms: Platform[];
};
export type RawStampPageData = Omit<StampPage, "platforms"> & {
    platforms: RawPlatformData[];
};
export type StampsMetadataResponse = RawStampPageData[];
