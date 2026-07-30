/**
 * Redesign slice 1 - Shell + Score window (SOP §4 / spine.md).
 *
 * Presentational, props-only components (no data hooks), rendered alongside the
 * existing shipped widget. The shipped `PassportScoreWidget` is untouched.
 */
export { PassportShell } from "./PassportShell";
export type {
  PassportShellProps,
  ShellAccount,
  ShellAccountOption,
  LinkedWallet,
  LinkedWalletStatus,
  ShellSize,
} from "./PassportShell";

export { ScoreWindow } from "./ScoreWindow";
export type { ScoreWindowProps, ScoreWindowState, ShellCta } from "./ScoreWindow";

export { ScoreDrilldown } from "./ScoreDrilldown";
export type { ScoreDrilldownProps, StampContribution } from "./ScoreDrilldown";

export { ScoreHome } from "./ScoreHome";
export type { ScoreHomeProps } from "./ScoreHome";

export { SecuredByFooter } from "./SecuredByFooter";

export { humanizeError, classifyError } from "./humanizeError";
export type { ErrorKind, HumanError } from "./humanizeError";
