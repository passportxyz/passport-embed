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
export const HumanTechMark: React.FC<IconProps> = ({ className, size = 12, title }) => (
  <svg
    className={className}
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    role={title ? "img" : "presentation"}
    aria-hidden={title ? undefined : true}
    aria-label={title}
    focusable="false"
  >
    {title ? <title>{title}</title> : null}
    <circle cx="12" cy="7.4" r="3.7" />
    <circle cx="12" cy="16.6" r="3.7" />
    <circle cx="7.4" cy="12" r="3.7" />
    <circle cx="16.6" cy="12" r="3.7" />
    <circle cx="12" cy="12" r="3.9" />
  </svg>
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
