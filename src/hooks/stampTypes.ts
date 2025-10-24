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
  requiresSDKFlow?: boolean; // Indicates if this platform requires SDK-based verification flow
  credentials: Credential[];
  displayWeight: string;
  icon: ReactNode; // Processed icon element (img, svg, or emoji)
};

export type RawPlatformData = Omit<Platform, "description" | "icon"> & {
  description: string;
  icon: string; // Raw icon string from API (URL, SVG, or emoji)
};

export type StampPage = {
  header: string;
  platforms: Platform[];
};

export type RawStampPageData = Omit<StampPage, "platforms"> & {
  platforms: RawPlatformData[];
};

export type StampsMetadataResponse = RawStampPageData[];
