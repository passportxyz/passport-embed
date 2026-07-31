import React from "react";

/**
 * Real Human Passport stamp icons, as inline SVG React nodes.
 *
 * In production the embed renders each platform's REAL icon: the
 * `/embed/stamps/metadata` endpoint returns `platform.icon` as an inline SVG
 * string, which the widget renders through `SanitizedHTMLComponent`. These
 * components carry the SAME geometry as those shipped assets (taken from
 * passportxyz/passport `app/public/assets/*.svg`), redrawn as currentColor so
 * a medallion glyph adapts to the token color of its context and stays legible
 * in BOTH themes (the Storybook mock has no network + no asset pipeline).
 *
 * Every catalog platform below has an entry in STAMP_ICONS, keyed by the
 * platform id used across the mock catalog + drawer detail.
 */

type IconProps = { size?: number };

const box = (size: number, viewBox: string, children: React.ReactNode, mode: "fill" | "stroke") => (
  <svg
    width={size}
    height={size}
    viewBox={viewBox}
    fill={mode === "fill" ? "currentColor" : "none"}
    stroke={mode === "stroke" ? "currentColor" : "none"}
    strokeWidth={mode === "stroke" ? 2 : undefined}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {children}
  </svg>
);

/* ---- Physical Verification ---- */

// Government ID (HumanIdKyc) - real idCard.svg
export const GovIdIcon: React.FC<IconProps> = ({ size = 22 }) =>
  box(
    size,
    "0 0 24 24",
    <path d="M16 10H18M16 14H18M6.17 15C6.37614 14.414 6.7591 13.9065 7.26602 13.5474C7.77294 13.1884 8.37881 12.9955 9 12.9955C9.62119 12.9955 10.2271 13.1884 10.734 13.5474C11.2409 13.9065 11.6239 14.414 11.83 15M11 11C11 12.1046 10.1046 13 9 13C7.89543 13 7 12.1046 7 11C7 9.89543 7.89543 9 9 9C10.1046 9 11 9.89543 11 11ZM4 5H20C21.1046 5 22 5.89543 22 7V17C22 18.1046 21.1046 19 20 19H4C2.89543 19 2 18.1046 2 17V7C2 5.89543 2.89543 5 4 5Z" />,
    "stroke"
  );

// Phone Verification (HumanIdPhone) - real smartphone.svg
export const PhoneIcon: React.FC<IconProps> = ({ size = 22 }) =>
  box(
    size,
    "0 0 24 24",
    <path d="M12 18H12.01M7 2H17C18.1046 2 19 2.89543 19 4V20C19 21.1046 18.1046 22 17 22H7C5.89543 22 5 21.1046 5 20V4C5 2.89543 5.89543 2 7 2Z" />,
    "stroke"
  );

// Biometrics - real biometrics.svg (framed face)
export const BiometricsIcon: React.FC<IconProps> = ({ size = 22 }) =>
  box(
    size,
    "0 0 24 24",
    <path d="M3 7V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H7M17 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V7M21 17V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H17M7 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V17M8 14C8 14 9.5 16 12 16C14.5 16 16 14 16 14M9 9H9.01M15 9H15.01" />,
    "stroke"
  );

// Proof of Clean Hands - real cleanHands.svg (raised hand + sparkles)
export const CleanHandsIcon: React.FC<IconProps> = ({ size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    <path d="M17.8168 12.65V8.4C17.8168 7.94913 17.6491 7.51673 17.3506 7.19792C17.0522 6.87911 16.6473 6.7 16.2252 6.7C15.8031 6.7 15.3983 6.87911 15.0998 7.19792C14.8013 7.51673 14.6336 7.94913 14.6336 8.4M14.6336 11.8V6.7C14.6336 6.24913 14.4659 5.81673 14.1674 5.49792C13.869 5.17911 13.4641 5 13.042 5C12.6199 5 12.2151 5.17911 11.9166 5.49792C11.6181 5.81673 11.4504 6.24913 11.4504 6.7V8.4M11.4504 8.4V12.225M11.4504 8.4C11.4504 7.94913 11.2827 7.51673 10.9842 7.19792C10.6858 6.87911 10.2809 6.7 9.85881 6.7C9.43669 6.7 9.03186 6.87911 8.73338 7.19792C8.4349 7.51673 8.26721 7.94913 8.26721 8.4V15.2M17.8168 10.1C17.8168 9.64913 17.9845 9.21673 18.283 8.89792C18.5815 8.57911 18.9863 8.4 19.4084 8.4C19.8305 8.4 20.2353 8.57911 20.5338 8.89792C20.8323 9.21673 21 9.64913 21 10.1V15.2C21 17.0035 20.3293 18.7331 19.1353 20.0083C17.9414 21.2836 16.3221 22 14.6336 22H13.042C10.8138 22 9.46091 21.269 8.27517 20.011L5.41029 16.951C5.13649 16.6271 4.98978 16.2031 5.00055 15.7669C5.01133 15.3307 5.17875 14.9155 5.46816 14.6075C5.75757 14.2995 6.14681 14.1221 6.55527 14.1122C6.96373 14.1022 7.36013 14.2604 7.6624 14.554L9.06301 16.05" />
    <path
      fill="currentColor"
      stroke="none"
      d="M2.49045 11.06C2.87449 11.1163 3.35307 11.06 3.35307 11.4371C3.35307 11.5864 3.41532 11.7296 3.52612 11.8351C3.63692 11.9407 3.7872 12 3.9439 12C4.1006 12 4.25088 11.9407 4.36168 11.8351C4.47249 11.7296 4.53474 11.5864 4.53474 11.4371C4.54064 11.1413 4.97195 11.1163 5.40917 11.0544C5.56587 11.0544 5.71615 10.9951 5.82695 10.8896C5.93775 10.784 6 10.6408 6 10.4916C6 10.3423 5.93775 10.1991 5.82695 10.0936C5.71615 9.98801 5.56587 9.92871 5.40917 9.92871C4.97195 9.87242 4.53474 9.87835 4.54064 9.56285C4.54064 9.41357 4.47839 9.27041 4.36759 9.16486C4.25679 9.0593 4.10651 9 3.94981 9C3.79311 9 3.64283 9.0593 3.53203 9.16486C3.42123 9.27041 3.35898 9.41357 3.35898 9.56285C3.35898 9.92871 2.91585 9.88368 2.51409 9.93433C2.37105 9.95219 2.23981 10.0193 2.14512 10.123C2.05044 10.2267 1.99884 10.3598 2.00006 10.4972C1.99802 10.6313 2.04629 10.7617 2.1362 10.8648C2.2261 10.968 2.35173 11.0373 2.49045 11.06Z"
    />
    <path
      fill="currentColor"
      stroke="none"
      d="M6.03858 7.36307C6.03858 5.65834 9.36569 5.08385 9.4016 5.08385C9.5603 5.08385 9.71251 5.01806 9.82473 4.90096C9.93695 4.78385 10 4.62502 10 4.45941C10 4.2938 9.93695 4.13497 9.82473 4.01786C9.71251 3.90076 9.5603 3.83497 9.4016 3.83497C9.34774 3.84121 6.03858 3.3479 6.03858 1.62444C6.03858 1.45883 5.97553 1.3 5.86331 1.1829C5.75109 1.06579 5.59889 1 5.44018 1C5.28147 1 5.12927 1.06579 5.01705 1.1829C4.90482 1.3 4.84178 1.45883 4.84178 1.62444C4.84178 3.3479 1.55057 3.85995 1.52065 3.86619C1.37578 3.88601 1.24286 3.96045 1.14696 4.07547C1.05106 4.1905 0.998799 4.33817 1.00004 4.49063C0.998407 4.64123 1.04899 4.78736 1.14246 4.90211C1.23593 5.01686 1.36599 5.09249 1.50868 5.11508C1.54458 5.11508 4.84178 5.67083 4.84178 7.37556C4.84178 7.54117 4.90482 7.7 5.01705 7.8171C5.12927 7.93421 5.28147 8 5.44018 8C5.59889 8 5.75109 7.93421 5.86331 7.8171C5.97553 7.7 6.03858 7.54117 6.03858 7.37556V7.36307Z"
    />
  </svg>
);

// Binance - real binanceStamp.svg diamond (script tags dropped, brand color -> currentColor)
export const BinanceIcon: React.FC<IconProps> = ({ size = 22 }) =>
  box(
    size,
    "0 0 45 45",
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M13.7642 18.9085L22.504 10.1722L31.2474 18.9156L36.33 13.8295L22.504 0L8.6781 13.8259L13.7642 18.9085ZM0 22.5008L5.08424 17.4166L10.1685 22.5008L5.08424 27.5851L0 22.5008ZM22.504 34.8313L13.7642 26.0914L8.67096 31.1704L8.67807 31.1775L22.504 44.9999L36.3299 31.1704L36.3335 31.1668L31.2474 26.0879L22.504 34.8313ZM34.83 22.5022L39.9142 17.418L44.9984 22.5022L39.9142 27.5864L34.83 22.5022ZM22.504 17.3375L27.6612 22.4983H27.6647L27.6612 22.5018L22.504 27.6625L17.3468 22.5089L17.3397 22.4983L17.3468 22.4911L18.2496 21.5884L18.6903 21.1512L22.504 17.3375Z"
    />,
    "fill"
  );

// Civic - real civic person-in-C mark (brand orange -> currentColor)
export const CivicIcon: React.FC<IconProps> = ({ size = 22 }) =>
  box(
    size,
    "0 0 218 219",
    <>
      <path d="m131.246 92.7977c0-12.1689-9.864-22.0331-22.033-22.0331-12.1678 0-22.0326 9.8641-22.0326 22.0331 0 8.5143 4.838 15.8873 11.9082 19.5553l-8.1658 35.311h36.5812l-8.165-35.311c7.069-3.668 11.907-11.041 11.907-19.5553z" />
      <path d="m195.392 136.983c-4.279 33.225-32.727 58.986-67.098 58.986h-38.1611c-37.3161 0-67.6751-30.359-67.6751-67.675v-38.1603c0-37.3162 30.359-67.6752 67.6751-67.6752h38.1611c34.371 0 62.818 25.7624 67.098 58.9872h22.608c-4.386-45.6383-42.938-81.4457-89.706-81.4457h-38.1611c-49.7472 0-90.1341 40.3869-90.1341 90.134v38.1603c0 49.748 40.3869 90.134 90.1341 90.134h38.1611c46.768 0 85.32-35.807 89.706-81.446z" />
    </>,
    "fill"
  );

// Coinbase - real coinbase circle-with-bar (brand blue -> currentColor)
export const CoinbaseIcon: React.FC<IconProps> = ({ size = 22 }) =>
  box(
    size,
    "0 0 24 24",
    <path d="M11.9805 1.5C17.7908 1.5 22.5 6.20182 22.5 12C22.5 17.7981 17.7908 22.5 11.9805 22.5C6.65457 22.4998 2.25386 18.5489 1.55762 13.4248H16.0645V10.5752H1.55762C2.25383 5.45115 6.65454 1.50018 11.9805 1.5Z" />,
    "fill"
  );

/* ---- Blockchain Networks and Activities ---- */

// ENS - simplified tilted-prism ENS mark, currentColor (real asset uses gradients)
export const EnsIcon: React.FC<IconProps> = ({ size = 22 }) =>
  box(
    size,
    "0 0 24 24",
    <path d="M12 2 6 11.5c-1 1.6-1 3.6 0 5.2L12 22l6-5.3c1-1.6 1-3.6 0-5.2L12 2Zm0 3.4 3.7 6c.5.8.5 1.9 0 2.7L12 18.6l-3.7-4.5c-.5-.8-.5-1.9 0-2.7L12 5.4Z" />,
    "fill"
  );

// Ethereum - real ethStampIcon.svg diamond geometry, currentColor
export const EthIcon: React.FC<IconProps> = ({ size = 22 }) =>
  box(
    size,
    "0 0 48 48",
    <>
      <path d="M11 24L25 2 39 24 25 32z" opacity={0.6} />
      <path d="M11 27L25 35 39 27 25 46z" opacity={0.6} />
      <path d="M25 2L39 24 25 32zM25 35L39 27 25 46zM11 24L25 18 39 24 25 32z" />
      <path d="M25 18L39 24 25 32z" />
    </>,
    "fill"
  );

// Gitcoin Grants - flower / hex mark, currentColor
export const GitcoinIcon: React.FC<IconProps> = ({ size = 22 }) =>
  box(
    size,
    "0 0 24 24",
    <>
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 3a7 7 0 1 1 0 14 7 7 0 0 1 0-14Z" />
      <circle cx="12" cy="12" r="3" />
    </>,
    "fill"
  );

// Identity Staking (GtcStaking) - real gtcStaking knot geometry, currentColor
export const GtcStakingIcon: React.FC<IconProps> = ({ size = 22 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <path
      opacity={0.85}
      d="M17.8202 13.8133C21.2351 10.3984 26.7718 10.3984 30.1867 13.8133C33.6017 17.2283 33.6016 22.7649 30.1867 26.1798L22.5498 33.8167C19.1349 37.2317 13.5982 37.2317 10.1833 33.8167C6.76841 30.4018 6.76841 24.8651 10.1833 21.4502L17.8202 13.8133Z"
    />
    <path d="M30.1867 13.8201C33.6016 17.2351 33.6016 22.7717 30.1867 26.1867C26.7717 29.6016 21.2351 29.6016 17.8202 26.1867L14.0017 22.3682L10.1833 18.5498C6.76835 15.1348 6.76834 9.59817 10.1833 6.18325C13.5982 2.76833 19.1349 2.76833 22.5498 6.18325L26.3682 10.0017L30.1867 13.8201Z" />
  </svg>
);

// NFT - framed-image mark, currentColor (real asset is a raster PNG)
export const NftIcon: React.FC<IconProps> = ({ size = 22 }) =>
  box(
    size,
    "0 0 24 24",
    <>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="9" cy="9" r="1.6" />
      <path d="M4 16l4.5-4.5L14 17l3-3 3 3" />
    </>,
    "stroke"
  );

// Guild.xyz - shield / hex mark, currentColor
export const GuildIcon: React.FC<IconProps> = ({ size = 22 }) =>
  box(
    size,
    "0 0 24 24",
    <path d="M12 2.5 20 6v6c0 5-3.5 8-8 9.5C7.5 20 4 17 4 12V6l8-3.5Z" />,
    "stroke"
  );

// Lens - leaf / lens mark, currentColor
export const LensIcon: React.FC<IconProps> = ({ size = 22 }) =>
  box(
    size,
    "0 0 24 24",
    <path d="M12 3c-4 4-4 10 0 14 4-4 4-10 0-14Zm0 0c4 4 4 10 0 14M5 12c4-1.5 10-1.5 14 0" />,
    "stroke"
  );

// Snapshot - real snapshot lightning bolt (brand amber -> currentColor)
export const SnapshotIcon: React.FC<IconProps> = ({ size = 22 }) =>
  box(
    size,
    "0 0 105 126",
    <path d="M104.781694,54.7785 C104.270697,53.41 102.961707,52.5 101.498717,52.5 L59.2365129,52.5 L83.6138421,5.103 C84.3803368,3.612 83.9848395,1.7885 82.6653488,0.7525 C82.0283532,0.2485 81.2618586,0 80.498864,0 C79.6833697,0 78.8678754,0.287 78.21338,0.8505 L52.4990602,23.058 L1.21391953,67.3505 C0.107927276,68.306 -0.291069928,69.8495 0.219926491,71.218 C0.730922911,72.5865 2.03641376,73.5 3.49940351,73.5 L45.7616074,73.5 L21.3842782,120.897 C20.6177836,122.388 21.0132808,124.2115 22.3327715,125.2475 C22.9697671,125.7515 23.7362617,126 24.4992564,126 C25.3147506,126 26.1302449,125.713 26.7847403,125.1495 L52.4990602,102.942 L103.784201,58.6495 C104.893693,57.694 105.28919,56.1505 104.781694,54.7785 Z" />,
    "fill"
  );

// Safe (GnosisSafe) - vault / lock mark, currentColor
export const SafeIcon: React.FC<IconProps> = ({ size = 22 }) =>
  box(
    size,
    "0 0 24 24",
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 8.5V6M12 18v-2.5M15.5 12H18M6 12h2.5" />
    </>,
    "stroke"
  );

// BrightID - real brightid connected-nodes mark (brand -> currentColor)
export const BrightIdIcon: React.FC<IconProps> = ({ size = 22 }) =>
  box(
    size,
    "0 0 48 48",
    <>
      <path d="M17.8154 18.0378V24.5451C17.8154 28.1394 20.7222 31.053 24.3078 31.053C27.8935 31.053 30.8 28.1394 30.8 24.5451C30.8 20.951 27.8935 18.0374 24.3078 18.0374C24.2998 18.0374 24.292 18.038 24.284 18.038V18.0378H17.8154Z" />
      <path d="M25.3323 4H22.7155H17.8154V11.5295H24.2839V11.5301C24.2919 11.5301 24.2997 11.5295 24.3078 11.5295C31.4789 11.5295 37.2925 17.3565 37.2925 24.5452C37.2925 31.7336 31.4789 37.5606 24.3078 37.5606C17.1364 37.5606 11.3228 31.7336 11.3228 24.5452V18.0376H4V23.993H4.04782C4.05664 35.0442 12.9969 44 24.0239 44C35.0565 44 44.0006 35.0352 44.0006 23.9763C44.0006 13.3584 35.7545 4.6762 25.3323 4Z" />
      <path d="M11.3022 4H4.0459V11.5847H11.3022V4Z" />
    </>,
    "fill"
  );

// Idena - prism / diamond mark, currentColor
export const IdenaIcon: React.FC<IconProps> = ({ size = 22 }) =>
  box(
    size,
    "0 0 24 24",
    <path d="M12 2 3 12l9 10 9-10L12 2Zm0 4.5L17 12l-5 5.5L7 12l5-5.5Z" />,
    "fill"
  );

// zkSync - hex mark, currentColor
export const ZkSyncIcon: React.FC<IconProps> = ({ size = 22 }) =>
  box(
    size,
    "0 0 24 24",
    <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Zm0 2.3 7 3.9v7.6l-7 3.9-7-3.9V8.2l7-3.9Z" />,
    "stroke"
  );

/* ---- Web2 Platforms & Services ---- */

// Discord - real discord mark (currentColor)
export const DiscordIcon: React.FC<IconProps> = ({ size = 22 }) =>
  box(
    size,
    "0 0 126.644 96",
    <path d="M81.15,0c-1.2376,2.1973-2.3489,4.4704-3.3591,6.794-9.5975-1.4396-19.3718-1.4396-28.9945,0-.985-2.3236-2.1216-4.5967-3.3591-6.794-9.0166,1.5407-17.8059,4.2431-26.1405,8.0568C2.779,32.5304-1.6914,56.3725.5312,79.8863c9.6732,7.1476,20.5083,12.603,32.0505,16.0884,2.6014-3.4854,4.8998-7.1981,6.8698-11.0623-3.738-1.3891-7.3497-3.1318-10.8098-5.1523.9092-.6567,1.7932-1.3386,2.6519-1.9953,20.281,9.547,43.7696,9.547,64.0758,0,.8587.7072,1.7427,1.3891,2.6519,1.9953-3.4601,2.0457-7.0718,3.7632-10.835,5.1776,1.97,3.8642,4.2683,7.5769,6.8698,11.0623,11.5419-3.4854,22.3769-8.9156,32.0509-16.0631,2.626-27.2771-4.496-50.9172-18.817-71.8548C98.9811,4.2684,90.1918,1.5659,81.1752.0505l-.0252-.0505ZM42.2802,65.4144c-6.2383,0-11.4159-5.6575-11.4159-12.6535s4.9755-12.6788,11.3907-12.6788,11.5169,5.708,11.4159,12.6788c-.101,6.9708-5.026,12.6535-11.3907,12.6535ZM84.3576,65.4144c-6.2637,0-11.3907-5.6575-11.3907-12.6535s4.9755-12.6788,11.3907-12.6788,11.4917,5.708,11.3906,12.6788c-.101,6.9708-5.026,12.6535-11.3906,12.6535Z" />,
    "fill"
  );

// GitHub - real octocat mark (currentColor)
export const GithubIcon: React.FC<IconProps> = ({ size = 22 }) =>
  box(
    size,
    "0 0 40 40",
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M19.9929 1C15.2745 1.00245 10.7108 2.6736 7.11792 5.71465C3.52501 8.75569 1.13714 12.9683 0.381282 17.5993C-0.374577 22.2302 0.550855 26.9775 2.99212 30.9923C5.43339 35.007 9.23128 38.0275 13.7067 39.5135C14.6941 39.6967 15.066 39.0848 15.066 38.5645C15.066 38.0442 15.0462 36.5356 15.0396 34.8862C9.51046 36.0807 8.3421 32.553 8.3421 32.553C7.44032 30.2623 6.13701 29.6601 6.13701 29.6601C4.33345 28.4362 6.27196 28.4591 6.27196 28.4591C8.2697 28.5999 9.31959 30.4979 9.31959 30.4979C11.0902 33.5184 13.97 32.6446 15.1022 32.1341C15.2799 30.8546 15.7966 29.9841 16.366 29.49C11.9492 28.9926 7.30867 27.2974 7.30867 19.725C7.2813 17.7611 8.01422 15.8619 9.35579 14.4203C9.15174 13.9229 8.47045 11.9136 9.54996 9.1844C9.54996 9.1844 11.2186 8.65427 15.0166 11.2101C18.2743 10.3242 21.7114 10.3242 24.9691 11.2101C28.7638 8.65427 30.4291 9.1844 30.4291 9.1844C31.5119 11.9071 30.8307 13.9164 30.6266 14.4203C31.9724 15.8621 32.7069 17.7646 32.677 19.7315C32.677 27.3203 28.0266 28.9926 23.6033 29.4801C24.3142 30.0954 24.9494 31.2964 24.9494 33.142C24.9494 35.7862 24.9263 37.9133 24.9263 38.5645C24.9263 39.0913 25.285 39.7066 26.2921 39.5135C30.7681 38.0273 34.5664 35.0063 37.0076 30.9909C39.4488 26.9754 40.3738 22.2274 39.617 17.596C38.8603 12.9647 36.4713 8.75199 32.8772 5.71147C29.2831 2.67095 24.7184 1.0009 19.9994 1H19.9929Z"
    />,
    "fill"
  );

// Google - monochrome "G" mark, currentColor (real asset is 4-color)
export const GoogleIcon: React.FC<IconProps> = ({ size = 22 }) =>
  box(
    size,
    "0 0 24 24",
    <path d="M21.5 12.2c0-.7-.06-1.4-.18-2.05H12v3.88h5.34a4.57 4.57 0 0 1-1.98 3v2.5h3.2c1.87-1.73 2.94-4.28 2.94-7.33Z M12 22c2.7 0 4.96-.9 6.62-2.42l-3.2-2.5c-.9.6-2.04.95-3.42.95-2.63 0-4.86-1.78-5.66-4.17H3.04v2.58A10 10 0 0 0 12 22Z M6.34 13.86A6 6 0 0 1 6.02 12c0-.64.11-1.27.32-1.86V7.56H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.44l3.3-2.58Z M12 5.98c1.48 0 2.8.51 3.85 1.5l2.84-2.84A10 10 0 0 0 12 2 10 10 0 0 0 3.04 7.56l3.3 2.58C7.14 7.76 9.37 5.98 12 5.98Z" />,
    "fill"
  );

// LinkedIn - real "in" mark (brand blue -> currentColor, disc rendered as ring)
export const LinkedinIcon: React.FC<IconProps> = ({ size = 22 }) =>
  box(
    size,
    "0 0 48 48",
    <path d="M14 19H18V34H14zM15.988 17h-.022C14.772 17 14 16.11 14 14.999 14 13.864 14.796 13 16.011 13c1.217 0 1.966.864 1.989 1.999C18 16.11 17.228 17 15.988 17zM35 24.5c0-3.038-2.462-5.5-5.5-5.5-1.862 0-3.505.928-4.5 2.344V19h-4v15h4v-8c0-1.657 1.343-3 3-3s3 1.343 3 3v8h4C35 34 35 24.921 35 24.5z" />,
    "fill"
  );

// X - real xStampIcon.svg (currentColor)
export const XIcon: React.FC<IconProps> = ({ size = 22 }) =>
  box(
    size,
    "0 0 48 48",
    <path d="M36.6526 3.80762H43.3995L28.6594 20.6548L46 43.5797H32.4225L21.7881 29.6759L9.61989 43.5797H2.86886L18.6349 25.5599L2 3.80762H15.9222L25.5348 16.5165L36.6526 3.80762ZM34.2846 39.5414H38.0232L13.8908 7.63388H9.87892L34.2846 39.5414Z" />,
    "fill"
  );

/* ---- chain marks ---- */

// Optimism (OP Mainnet) chain glyph, redrawn monochrome (currentColor). The brand
// mark is a red disc carrying a soft lowercase "op"; here the disc carries a
// knocked-out RING ("o") plus a solid counter ("p"), so it reads as the Optimism
// "op" logomark on any surface without its brand red, and stays distinct from a
// plain dot. All shapes are evenodd counters on one filled disc, so it paints
// reliably at the small chain size (the prior finely detailed letterforms did
// not). Used next to the chain label.
export const OptimismIcon: React.FC<IconProps> = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
    focusable="false"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 1.5A10.5 10.5 0 1 0 12 22.5A10.5 10.5 0 1 0 12 1.5ZM9 9.2a2.9 2.9 0 1 0 0 5.8 2.9 2.9 0 0 0 0-5.8Zm0 1.9a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm6-1.9a2.9 2.9 0 1 0 0 5.8 2.9 2.9 0 0 0 0-5.8Z"
    />
  </svg>
);

/* ---- category icons (the real BASE_PLATFORM_CATEGORIES glyphs, currentColor) ---- */

const catSvg = (children: React.ReactNode, size: number) => (
  <svg
    width={size}
    height={size}
    viewBox="16 16 33 33"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.4}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
    focusable="false"
  >
    {children}
  </svg>
);

// Physical Verification - the id-card glyph
export const PhysicalCatIcon: React.FC<IconProps> = ({ size = 18 }) =>
  catSvg(
    <path d="M37.8332 29.6647H40.4998M37.8332 34.998H40.4998M24.7265 36.3314C25.0014 35.5501 25.512 34.8733 26.1879 34.3946C26.8638 33.9159 27.6716 33.6588 28.4998 33.6588C29.3281 33.6588 30.1359 33.9159 30.8118 34.3946C31.4877 34.8733 31.9983 35.5501 32.2732 36.3314M31.1665 30.998C31.1665 32.4708 29.9726 33.6647 28.4998 33.6647C27.0271 33.6647 25.8332 32.4708 25.8332 30.998C25.8332 29.5253 27.0271 28.3314 28.4998 28.3314C29.9726 28.3314 31.1665 29.5253 31.1665 30.998ZM21.8332 22.998H43.1665C44.6393 22.998 45.8332 24.192 45.8332 25.6647V38.998C45.8332 40.4708 44.6393 41.6647 43.1665 41.6647H21.8332C20.3604 41.6647 19.1665 40.4708 19.1665 38.998V25.6647C19.1665 24.192 20.3604 22.998 21.8332 22.998Z" />,
    size
  );

// Blockchain Networks and Activities - the globe glyph
export const BlockchainCatIcon: React.FC<IconProps> = ({ size = 18 }) =>
  catSvg(
    <path d="M45.8332 32.3314C45.8332 39.6952 39.8636 45.6647 32.4998 45.6647M45.8332 32.3314C45.8332 24.9676 39.8636 18.998 32.4998 18.998M45.8332 32.3314H19.1665M32.4998 45.6647C25.136 45.6647 19.1665 39.6952 19.1665 32.3314M32.4998 45.6647C29.0762 42.0698 27.1665 37.2957 27.1665 32.3314C27.1665 27.367 29.0762 22.5929 32.4998 18.998M32.4998 45.6647C35.9235 42.0698 37.8332 37.2957 37.8332 32.3314C37.8332 27.367 35.9235 22.5929 32.4998 18.998M19.1665 32.3314C19.1665 24.9676 25.136 18.998 32.4998 18.998" />,
    size
  );

// Web2 Platforms & Services - the person-in-circle glyph
export const Web2CatIcon: React.FC<IconProps> = ({ size = 18 }) =>
  catSvg(
    <path d="M40.4998 42.998C40.4998 40.8763 39.657 38.8415 38.1567 37.3412C36.6564 35.8409 34.6216 34.998 32.4998 34.998M32.4998 34.998C30.3781 34.998 28.3433 35.8409 26.843 37.3412C25.3427 38.8415 24.4998 40.8763 24.4998 42.998M32.4998 34.998C35.4454 34.998 37.8332 32.6102 37.8332 29.6647C37.8332 26.7192 35.4454 24.3314 32.4998 24.3314C29.5543 24.3314 27.1665 26.7192 27.1665 29.6647C27.1665 32.6102 29.5543 34.998 32.4998 34.998ZM45.8332 32.3314C45.8332 39.6952 39.8636 45.6647 32.4998 45.6647C25.136 45.6647 19.1665 39.6952 19.1665 32.3314C19.1665 24.9676 25.136 18.998 32.4998 18.998C39.8636 18.998 45.8332 24.9676 45.8332 32.3314Z" />,
    size
  );

/** Category glyphs keyed by the verbatim category name. */
export const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "Physical Verification": <PhysicalCatIcon />,
  "Blockchain Networks and Activities": <BlockchainCatIcon />,
  "Web2 Platforms & Services": <Web2CatIcon />,
};

/**
 * Every catalog platform's icon, keyed by the platform id used in the mock
 * catalog + the drawer detail map (matches passport's platform ids).
 */
export const STAMP_ICONS: Record<string, React.ReactNode> = {
  // Physical Verification
  Binance: <BinanceIcon />,
  Biometrics: <BiometricsIcon />,
  Civic: <CivicIcon />,
  CleanHands: <CleanHandsIcon />,
  Coinbase: <CoinbaseIcon />,
  HumanIdKyc: <GovIdIcon />,
  HumanIdPhone: <PhoneIcon />,
  // Blockchain Networks and Activities
  Ens: <EnsIcon />,
  ETH: <EthIcon />,
  Gitcoin: <GitcoinIcon />,
  GtcStaking: <GtcStakingIcon />,
  NFT: <NftIcon />,
  GuildXYZ: <GuildIcon />,
  Lens: <LensIcon />,
  Snapshot: <SnapshotIcon />,
  GnosisSafe: <SafeIcon />,
  Brightid: <BrightIdIcon />,
  Idena: <IdenaIcon />,
  ZkSync: <ZkSyncIcon />,
  // Web2 Platforms & Services
  Discord: <DiscordIcon />,
  Github: <GithubIcon />,
  Google: <GoogleIcon />,
  Linkedin: <LinkedinIcon />,
  X: <XIcon />,
};
