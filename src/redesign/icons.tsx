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
