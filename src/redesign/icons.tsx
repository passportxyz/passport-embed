import React from "react";

/**
 * Small stroke-icon set for the redesign shell + score windows.
 *
 * Every icon draws with `stroke: currentColor` (via the shared `gl` styling on
 * the consuming CSS module), so an icon inherits the token-driven color of its
 * context and is legible in BOTH themes. No hardcoded fills/strokes here.
 */

type IconProps = {
  className?: string;
  size?: number;
  strokeWidth?: number;
  title?: string;
};

const Svg: React.FC<IconProps & { children: React.ReactNode; viewBox?: string }> = ({
  className,
  size = 16,
  strokeWidth = 1.6,
  title,
  viewBox = "0 0 24 24",
  children,
}) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox={viewBox}
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    role={title ? "img" : "presentation"}
    aria-hidden={title ? undefined : true}
    aria-label={title}
    focusable="false"
  >
    {title ? <title>{title}</title> : null}
    {children}
  </svg>
);

/** Placeholder integrator app-icon (a cube). */
export const CubeIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M12 2.5 21 7v10l-9 4.5L3 17V7z" />
    <path d="M3 7l9 4.5L21 7" />
    <path d="M12 11.5V21.5" />
  </Svg>
);

export const CaretDownIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M6 9l6 6 6-6" />
  </Svg>
);

export const CheckIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M20 6 9 17l-5-5" />
  </Svg>
);

export const ShieldIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M12 2.5 20 6v6c0 5-3.5 8-8 9.5C7.5 20 4 17 4 12V6z" />
  </Svg>
);

export const StarIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M12 3.5l2.6 5.3 5.9.85-4.25 4.15 1 5.85L12 16.9l-5.25 2.75 1-5.85L3.5 9.65l5.9-.85z" />
  </Svg>
);

/**
 * Award / medal (Lucide `award`): a seal with two ribbon tails. The meaningful
 * fallback for a credential medallion or an empty stamps state, replacing the
 * old ambiguous star (a stamp is an earned credential, not a favourite).
 */
export const AwardIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="6" />
    <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
  </Svg>
);

export const InfoIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9.5" />
    <path d="M12 16.5v-5M12 8h.01" />
  </Svg>
);

export const RetryIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M20 11a8 8 0 1 0-1.5 5" />
    <path d="M20 4.5V11h-6.5" />
  </Svg>
);

export const ArrowLeftIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M19 12H5M11 18l-6-6 6-6" />
  </Svg>
);

export const SparkIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M12 3v4M12 17v4M4.9 7.4l2.6 2.6M16.5 14l2.6 2.6M3 12h4M17 12h4M4.9 16.6l2.6-2.6M16.5 10l2.6-2.6" />
  </Svg>
);

/** Wallet (used for the link-wallet CTA + linked-wallet rows). */
export const WalletIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18a2 2 0 0 1 2 2v1H6a1.5 1.5 0 0 0 0 3H20a1 1 0 0 1 1 1v3a2 2 0 0 1-2 2H5.5A2.5 2.5 0 0 1 3 15.5z" />
    <path d="M16.5 12.5h.01" />
  </Svg>
);

/** Plus / add affordance (link additional wallet, add verifications). */
export const PlusIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M12 5v14M5 12h14" />
  </Svg>
);

/** Copy (two stacked sheets) - copy an address / wallet to the clipboard. */
export const CopyIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <rect x="9" y="9" width="12" height="12" rx="2.2" />
    <path d="M6 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v1" />
  </Svg>
);

/**
 * Chain link (on-chain / link an identity). Two interlocking capsules that read
 * cleanly at both the small on-chain pip size and the drawer button size. Drawn
 * as a single cohesive glyph (the old version rendered as three broken strokes).
 */
export const LinkIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </Svg>
);

/**
 * Unlink (break the chain) - remove a linked wallet. Lucide `unlink` geometry:
 * two chain halves pulling apart with the four separation ticks, so it reads as a
 * deliberate break rather than a slashed link. Pairs with LinkIcon at any size.
 */
export const UnlinkIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M18.84 12.25l1.72-1.71a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M5.17 11.75l-1.71 1.71a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    <path d="M8 2v2M2 8h2M16 20v2M20 16h2" />
  </Svg>
);

/**
 * human.tech mark - the brand "human" flower (a plump quatrefoil), redrawn clean
 * and monochrome (currentColor) so the "Secured by human.tech" lockup carries the
 * real brand mark, not a generic shield. Same house language as the WaaP / Shield
 * marks: one color, legible in both themes, no crop of the full lockup.
 */
// The REAL human.tech symbol (the "atom"), from HTDS logos/ht-symbol.svg — exact
// brand geometry, not an approximation (an approximated logo is worse than none).
// currentColor so the single "Secured by human.tech" lockup reads in both themes.
export const HumanTechMark: React.FC<IconProps> = ({ className, size = 12, title }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="currentColor"
    role={title ? "img" : "presentation"}
    aria-hidden={title ? undefined : true}
    aria-label={title}
    focusable="false"
  >
    {title ? <title>{title}</title> : null}
    <path d="M88.6981 53C88.0755 52.7547 87.434 52.5189 86.7736 52.283C85.0189 51.6604 83.1226 51.0943 81.1226 50.6038C81.1415 50.2075 81.1415 49.7924 81.1226 49.3962C83.1226 48.9057 85.0189 48.3396 86.7736 47.717C87.4434 47.4811 88.0943 47.2358 88.717 46.9906C95.6226 44.2264 100 40.5 100 35.8491C100 30.3019 93.7736 26.0755 84.4717 23.2264C82.5566 22.6321 80.5 22.1038 78.3491 21.6509C77.8962 19.5 77.3679 17.4434 76.7736 15.5283C73.9245 6.22641 69.6981 0 64.1509 0C59.5 0 55.7736 4.37736 53.0094 11.283C52.7641 11.9057 52.5189 12.5566 52.283 13.2264C51.6698 14.9811 51.1038 16.8774 50.6038 18.8774C50.2075 18.8679 49.7924 18.8679 49.3962 18.8774C48.9057 16.8774 48.3396 14.9811 47.717 13.2264C47.4811 12.566 47.2453 11.9245 47 11.3019C44.2358 4.38679 40.5 0 35.8491 0C30.3019 0 26.0755 6.22641 23.2264 15.5377C22.6415 17.4528 22.1132 19.5 21.6415 21.6509C19.4906 22.1132 17.4434 22.6415 15.5377 23.2264C6.22641 26.0755 0 30.3019 0 35.8491C0 40.5 4.37736 44.2264 11.2925 46.9906C11.9151 47.2358 12.5566 47.4811 13.2264 47.7075C14.9811 48.3302 16.8679 48.8962 18.8774 49.3962C18.8679 49.7924 18.8679 50.2075 18.8774 50.6038C16.8679 51.1038 14.9811 51.6698 13.2264 52.2925C12.566 52.5189 11.9245 52.7547 11.3113 53C4.38679 55.7642 0 59.4906 0 64.1509C0 69.6981 6.22641 73.9245 15.5377 76.7736C17.4434 77.3585 19.4906 77.8868 21.6415 78.3491C22.1038 80.4906 22.6321 82.5377 23.2264 84.4528C26.066 93.7641 30.3019 100 35.8491 100C40.5 100 44.2358 95.6132 47 88.6981C47.2453 88.0755 47.4811 87.434 47.717 86.7736C48.3396 85.0189 48.9057 83.1226 49.3962 81.1226C49.7924 81.1321 50.2075 81.1321 50.6038 81.1226C51.1038 83.1226 51.6698 85.0189 52.283 86.7736C52.5189 87.4434 52.7641 88.0943 53.0094 88.717C55.7736 95.6226 59.5 100 64.1509 100C69.6981 100 73.9245 93.7736 76.7736 84.4623C77.3679 82.5472 77.8962 80.5 78.3491 78.3491C80.5 77.8962 82.5566 77.3679 84.4717 76.7736C93.7736 73.9245 100 69.6981 100 64.1509C100 59.5 95.6132 55.7642 88.6981 53ZM55.066 24.6038C56.9811 24.6604 58.9717 24.7547 60.8019 24.8868C63.2264 25.0472 65.5 25.2642 67.6415 25.5283C67.1887 23.3208 66.6981 21.3868 66.1887 19.7075C64.8774 19.5755 63.5566 19.4528 62.217 19.3491C60.3019 19.1887 58.3585 19.0755 56.4057 19C57 16.8679 57.6415 15.0094 58.2925 13.4151C60.4623 8.11321 62.7547 5.66038 64.1509 5.66038C65.6321 5.66038 68.1509 8.45283 70.434 14.5189C72.4811 19.9528 73.7264 26.2642 74.4717 32.3585C74.7359 34.5 74.9528 36.7736 75.1132 39.1981C77.2076 38.7547 79.0472 38.2736 80.6509 37.783C80.5472 36.4434 80.4245 35.1226 80.2924 33.8113C80.066 31.7264 79.7924 29.6792 79.4811 27.6981C81.7547 28.2736 83.7547 28.9057 85.4811 29.566C91.5472 31.8491 94.3396 34.3679 94.3396 35.8491C94.3396 37.2453 91.8868 39.5377 86.5849 41.7075C81.4906 43.7736 75.4245 45.0849 69.7547 45.8962C66.7736 46.3208 63.4811 46.6509 59.8962 46.8679C58.8774 43.6604 56.3491 41.1226 53.1321 40.1038C53.3491 36.5189 53.6792 33.2264 54.1038 30.2453C54.3868 28.2358 54.7075 26.3491 55.066 24.6038ZM13.4151 41.7075C8.11321 39.5377 5.66038 37.2453 5.66038 35.8491C5.66038 34.3679 8.45283 31.8491 14.5189 29.566C19.9528 27.5189 26.2642 26.2736 32.3585 25.5283C34.5 25.2642 36.7736 25.0472 39.1981 24.8868C38.7547 22.7925 38.2736 20.9528 37.783 19.3491C36.4434 19.4528 35.1226 19.5755 33.8113 19.7075C31.7264 19.934 29.6792 20.2075 27.6981 20.5189C28.2736 18.2453 28.9151 16.2453 29.566 14.5189C31.8491 8.45283 34.3679 5.66038 35.8491 5.66038C37.2453 5.66038 39.5377 8.11321 41.7075 13.4151C43.7736 18.5094 45.0849 24.5755 45.8962 30.2453C46.3208 33.2264 46.6415 36.5189 46.8679 40.1038C43.6604 41.1226 41.1226 43.6509 40.1038 46.8679C36.5189 46.6509 33.2264 46.3208 30.2453 45.8962C28.2358 45.6132 26.3491 45.2925 24.6038 44.934C24.6604 43.0189 24.7547 41.0283 24.8868 39.1981C25.0472 36.7736 25.2642 34.5 25.5283 32.3585C23.3208 32.8208 21.3868 33.3113 19.7075 33.8113C19.5755 35.1132 19.4528 36.434 19.3491 37.7736C19.1887 39.6887 19.0755 41.6321 19 43.5943C16.8679 43 15.0094 42.3585 13.4151 41.7075ZM44.934 75.3962C43.0189 75.3396 41.0283 75.2453 39.1981 75.1132C36.7736 74.9528 34.5 74.7359 32.3585 74.4717C32.8113 76.6793 33.3019 78.6132 33.8113 80.2924C35.1226 80.4245 36.4434 80.5472 37.783 80.6509C39.6981 80.8113 41.6415 80.9245 43.5943 81C43 83.1321 42.3585 84.9906 41.7075 86.5849C39.5377 91.8868 37.2453 94.3396 35.8491 94.3396C34.3679 94.3396 31.8491 91.5472 29.566 85.4811C27.5189 80.0472 26.2642 73.7358 25.5283 67.6415C25.2642 65.5 25.0472 63.2264 24.8868 60.8019C22.7925 61.2453 20.9528 61.7358 19.3491 62.2264C19.4528 63.566 19.5755 64.8868 19.7075 66.1887C19.934 68.2736 20.2075 70.3208 20.5189 72.3019C18.2453 71.7264 16.2453 71.0849 14.5189 70.434C8.45283 68.1509 5.66038 65.6321 5.66038 64.1509C5.66038 62.7547 8.11321 60.4623 13.4151 58.2925C18.5472 56.2076 24.5189 54.9151 30.2453 54.1038C33.2358 53.6792 36.5283 53.3491 40.1038 53.1321C41.1226 56.3396 43.6509 58.8774 46.8679 59.8962C46.6509 63.4811 46.3208 66.7736 45.8962 69.7547C45.6132 71.7642 45.2925 73.6509 44.934 75.3962ZM85.4811 70.434C80.0472 72.4811 73.7358 73.7359 67.6415 74.4717C65.5 74.7359 63.2264 74.9528 60.8019 75.1132C61.2453 77.2076 61.7264 79.0472 62.217 80.6509C63.5566 80.5472 64.8774 80.4245 66.1887 80.2924C68.2736 80.066 70.3208 79.7924 72.3019 79.4811C71.7264 81.7547 71.0943 83.7547 70.434 85.4811C68.1509 91.5472 65.6321 94.3396 64.1509 94.3396C62.7547 94.3396 60.4623 91.8868 58.2925 86.5849C56.2076 81.4528 54.9151 75.4811 54.1038 69.7547C53.6792 66.7736 53.3585 63.4811 53.1321 59.8962C56.3396 58.8774 58.8774 56.3491 59.8962 53.1321C63.4811 53.3491 66.7736 53.6792 69.7547 54.1038C71.7642 54.3868 73.6509 54.7075 75.3962 55.066C75.3396 56.9811 75.2453 58.9717 75.1132 60.8019C74.9528 63.2264 74.7359 65.5 74.4717 67.6415C76.6793 67.1887 78.6132 66.6981 80.2924 66.1887C80.4245 64.8774 80.5472 63.5566 80.6509 62.217C80.8113 60.3019 80.9245 58.3585 81 56.4057C83.1321 57 84.9906 57.6415 86.5849 58.2925C91.8868 60.4623 94.3396 62.7547 94.3396 64.1509C94.3396 65.6321 91.5472 68.1509 85.4811 70.434Z" />
  </svg>
);

/** External link (arrow out of a box) - open an on-chain view in a new tab. */
export const ExternalLinkIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M14 4h6v6M20 4l-8.5 8.5" />
    <path d="M18 13.5V18a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4.5" />
  </Svg>
);

/** Small clock (cooldown / pending wallet status). */
export const ClockIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7.5V12l3 2" />
  </Svg>
);

/** Sign out. */
export const LogoutIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" />
    <path d="M10 17l-5-5 5-5M4 12h11" />
  </Svg>
);

/** Switch accounts (two-way). */
export const SwitchIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M4 8h13l-3-3M20 16H7l3 3" />
  </Svg>
);

/**
 * WaaP mark - the "Wallet as a Passport" account behind the passport. A small
 * booklet/passport glyph with a quatrefoil-ish humanity dot, drawn on brand and
 * legible in both themes (currentColor stroke). Not a crop of the full lockup.
 */
export const WaaPIcon: React.FC<IconProps> = (p) => (
  <Svg {...p}>
    <path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H17a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6.5A1.5 1.5 0 0 1 5 19.5z" />
    <path d="M5 17h12" />
    <circle cx="12" cy="9" r="2.4" />
  </Svg>
);
