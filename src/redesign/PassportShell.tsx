import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./PassportShell.module.css";
import { Tooltip } from "../components/Tooltip";
import { CaretDownIcon, CubeIcon, InfoIcon, ShieldIcon } from "./icons";

export type ShellAccountOption = {
  /** Display name, e.g. "Shady.eth" or "0x1332…4a9f". */
  display: string;
  /** Short kind label, e.g. "ENS" / "Wallet". */
  kind?: string;
};

export type ShellAccount = {
  /** The active identity's display name, e.g. "Shady.eth". */
  display: string;
  /** The active identity's kind, e.g. "ENS". */
  kind?: string;
  /** Selectable identities for the dropdown (defaults to just the active one). */
  accounts?: ShellAccountOption[];
};

export type PassportShellProps = {
  /** Integrator's product icon (top-left slot). Defaults to a placeholder cube. */
  appIcon?: React.ReactNode;
  /** Copy for the app-icon hover tooltip. */
  appIconTooltip?: React.ReactNode;
  /** The passport identity + switch list. Omit to hide the selector. */
  account?: ShellAccount;
  /** Index of the active account within `account.accounts`. */
  activeAccountIndex?: number;
  /** Called with the selected account index. */
  onSelectAccount?: (index: number) => void;
  /** ⓘ help tooltip content. */
  infoTooltip?: React.ReactNode;
  /** Render the account dropdown open on mount (stories / controlled first-paint). */
  defaultAccountMenuOpen?: boolean;
  /** The window content (Score window, drill-down, …). */
  children: React.ReactNode;
  className?: string;
};

const DEFAULT_APP_ICON_TIP =
  "App-icon slot — the integrator's own product icon renders here. It's their brand, not ours.";
const DEFAULT_INFO_TIP =
  "Your humanity score, proven with zero-knowledge. Private by default — nothing personal is revealed.";

const AccountSelector: React.FC<{
  account: ShellAccount;
  activeIndex: number;
  onSelect?: (index: number) => void;
  defaultOpen?: boolean;
}> = ({ account, activeIndex, onSelect, defaultOpen }) => {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  const wrapRef = useRef<HTMLDivElement>(null);

  const options: ShellAccountOption[] = useMemo(
    () => (account.accounts && account.accounts.length ? account.accounts : [{ display: account.display, kind: account.kind }]),
    [account]
  );

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const select = (index: number) => {
    onSelect?.(index);
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className={`${styles.acctWrap} ${open ? styles.acctOpen : ""}`}>
      <button
        type="button"
        className={styles.acct}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <span className={styles.acctLabel}>Signed in</span>
        <span className={styles.acctWho}>
          <span className={styles.acctName}>{account.display}</span>
          <span className={styles.acctOf}>&rsquo;s Passport</span>
          <CaretDownIcon className={styles.acctCaret} size={13} />
        </span>
      </button>
      <div className={styles.menu} role="menu" aria-label="Switch identity">
        <div className={styles.menuHead}>Switch identity</div>
        {options.map((opt, i) => (
          <button
            type="button"
            key={`${opt.display}-${i}`}
            role="menuitem"
            className={`${styles.menuItem} ${i === activeIndex ? styles.menuItemOn : ""}`}
            onClick={() => select(i)}
          >
            <span className={styles.menuAvatar} aria-hidden="true" />
            <span className={styles.menuName}>{opt.display}</span>
            {opt.kind ? <span className={styles.menuKind}>{opt.kind}</span> : null}
          </button>
        ))}
      </div>
    </div>
  );
};

/**
 * PassportShell — the persistent binding around every window (SOP §4 "Shell
 * chrome"). App-icon slot · account selector · ⓘ help · "Secured by human.tech"
 * footer, all INSIDE the rounded bounds. Presentational: props only, no data
 * hooks (SOP §3), fully self-contained + theme-driven (SOP §2 / §7).
 */
export const PassportShell: React.FC<PassportShellProps> = ({
  appIcon,
  appIconTooltip = DEFAULT_APP_ICON_TIP,
  account,
  activeAccountIndex = 0,
  onSelectAccount,
  infoTooltip = DEFAULT_INFO_TIP,
  defaultAccountMenuOpen,
  children,
  className = "",
}) => {
  const handleSelect = useCallback((i: number) => onSelectAccount?.(i), [onSelectAccount]);

  return (
    <div className={`${styles.shell} ${className}`}>
      <div className={styles.fx} aria-hidden="true" />

      <div className={styles.chrome}>
        <Tooltip content={appIconTooltip} placement="bottom-start">
          <span className={styles.appIcon} tabIndex={0} role="img" aria-label="App icon">
            {appIcon ?? <CubeIcon className={styles.gl} size={18} />}
          </span>
        </Tooltip>

        {account ? (
          <AccountSelector
            account={account}
            activeIndex={activeAccountIndex}
            onSelect={handleSelect}
            defaultOpen={defaultAccountMenuOpen}
          />
        ) : (
          <span className={styles.spacer} />
        )}

        <Tooltip content={infoTooltip} placement="bottom-end">
          <span className={styles.info} tabIndex={0} role="button" aria-label="About your score">
            <InfoIcon className={styles.gl} size={13} />
          </span>
        </Tooltip>
      </div>

      <div className={styles.content}>{children}</div>

      <div className={styles.footer}>
        <ShieldIcon className={styles.gl} size={12} />
        <span>Secured by human.tech</span>
      </div>
    </div>
  );
};
