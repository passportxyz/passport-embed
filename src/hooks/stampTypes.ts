import { ReactNode } from "react";

export const INCLUDE_VISIT_PASSPORT_PAGE = true;
export const VISIT_PASSPORT_HEADER = "More Options";

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
  credentials: Credential[];
  displayWeight: string;
};

export type RawPlatformData = Omit<Platform, "description"> & {
  description: string;
};

export type StampPage = {
  header: string;
  platforms: Platform[];
};

export type RawStampPageData = Omit<StampPage, "platforms"> & {
  platforms: RawPlatformData[];
};

export type StampsMetadataResponse = RawStampPageData[];
