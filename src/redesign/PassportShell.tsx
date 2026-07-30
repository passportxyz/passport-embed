import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./PassportShell.module.css";
import glass from "./glassTip.module.css";
import { Tooltip } from "../components/Tooltip";
import { CaretDownIcon, CubeIcon, InfoIcon, LogoutIcon, PlusIcon, SwitchIcon, WaaPIcon, WalletIcon } from "./icons";
import { SecuredByFooter } from "./SecuredByFooter";

export type ShellAccountOption = {
  /** Display name, e.g. "Shady.eth" or "0x1332…4a9f". */
  display: string;
  /** Short kind label, e.g. "ENS" / "Wallet". */
  kind?: string;
};

export type LinkedWallet = {
  /** Display name, e.g. "0x1332…4a9f" or "vault.eth". */
  display: string;
  /** Short kind label, e.g. "Wallet" / "ENS" / "Safe". */
  kind?: string;
};

export type ShellAccount = {
  /** The passport account name, e.g. "Shady.eth". */
  display: string;
  /** The passport account's kind, e.g. "ENS". */
  kind?: string;
  /** The WaaP account's email (the account behind the passport). */
  email?: string;
  /** The WaaP account's address. */
  address?: string;
  /** Wallets / accounts already linked to this passport. */
  linkedWallets?: LinkedWallet[];
  /** Selectable identities for the switch-accounts zone. */
  accounts?: ShellAccountOption[];
};

export type ShellSize = "full" | "pill" | "mini";

export type PassportShellProps = {
  /** Integrator's product icon (top-left slot). Defaults to a placeholder cube. */
  appIcon?: React.ReactNode;
  /** Copy for the app-icon hover tooltip. */
  appIconTooltip?: React.ReactNode;
  /** The passport identity + account menu. Omit to hide the selector. */
  account?: ShellAccount;
  /** Index of the active account within `account.accounts`. */
  activeAccountIndex?: number;
  /** Called with the selected account index (switch accounts). */
  onSelectAccount?: (index: number) => void;
  /** Link an additional wallet to the passport (middle zone CTA). */
  onLinkWallet?: () => void;
  /** Sign out of the account (bottom zone). */
  onSignOut?: () => void;
  /** ⓘ help tooltip content. */
  infoTooltip?: React.ReactNode;
  /** Render the account menu open on mount (stories / controlled first-paint). */
  defaultAccountMenuOpen?: boolean;
  /**
   * Paper-shader wash color as an "r, g, b" triplet, integrator-configurable.
   * Defaults to the accent (emerald). Sets --rd-wash on the shell.
   */
  washRgb?: string;
  /**
   * Size variant. `full` (default) is the state we are building; `pill` and
   * `mini` are scaffolded compact variants so the API exists.
   */
  size?: ShellSize;
  /** The window content (Score window, drill-down, …). */
  children: React.ReactNode;
  className?: string;
};

const DEFAULT_APP_ICON_TIP =
  "The integrator's own product icon renders in this slot. It is their brand, not ours.";
const DEFAULT_INFO_TIP =
  "Your humanity score, proven with zero knowledge. Private by default. Nothing personal is revealed.";

const AccountMenu: React.FC<{
  account: ShellAccount;
  activeIndex: number;
  onSelect?: (index: number) => void;
  onLinkWallet?: () => void;
  onSignOut?: () => void;
  defaultOpen?: boolean;
}> = ({ account, activeIndex, onSelect, onLinkWallet, onSignOut, defaultOpen }) => {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  const wrapRef = useRef<HTMLDivElement>(null);

  const switchOptions: ShellAccountOption[] = useMemo(
    () =>
      account.accounts && account.accounts.length
        ? account.accounts
        : [{ display: account.display, kind: account.kind }],
    [account]
  );
  const linkedWallets = account.linkedWallets ?? [];

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

      <div className={styles.menu} role="menu" aria-label="Account">
        {/* (a) top: the passport account = the WaaP account behind it */}
        <div className={styles.zoneTop}>
          <span className={styles.waapMark} aria-hidden="true">
            <WaaPIcon size={20} />
          </span>
          <span className={styles.waapMeta}>
            <span className={styles.waapName}>{account.display}</span>
            {account.email ? <span className={styles.waapLine}>{account.email}</span> : null}
            {account.address ? <span className={styles.waapAddr}>{account.address}</span> : null}
          </span>
        </div>

        {/* (b) middle: linked wallets + link-additional-wallet CTA */}
        <div className={styles.zoneMid}>
          <div className={styles.zoneHead}>Linked wallets</div>
          {linkedWallets.length ? (
            linkedWallets.map((w, i) => (
              <div key={`${w.display}-${i}`} className={styles.walletRow}>
                <span className={styles.walletIcon} aria-hidden="true">
                  <WalletIcon size={15} strokeWidth={1.8} />
                </span>
                <span className={styles.walletName}>{w.display}</span>
                {w.kind ? <span className={styles.walletKind}>{w.kind}</span> : null}
              </div>
            ))
          ) : (
            <div className={styles.zoneEmpty}>No wallets linked yet.</div>
          )}
          <button type="button" className={styles.linkWalletBtn} onClick={onLinkWallet}>
            <PlusIcon size={15} strokeWidth={2} />
            Link additional wallet
          </button>
        </div>

        {/* (c) bottom: switch accounts + sign out */}
        <div className={styles.zoneBottom}>
          {switchOptions.length > 1 ? (
            <div className={styles.switchGroup} role="group" aria-label="Switch accounts">
              <div className={styles.zoneHead}>
                <SwitchIcon size={13} strokeWidth={1.8} />
                Switch accounts
              </div>
              {switchOptions.map((opt, i) => (
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
          ) : null}
          <button type="button" className={styles.signOut} onClick={onSignOut}>
            <LogoutIcon size={15} strokeWidth={1.8} />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * PassportShell - the persistent binding around every window. App-icon slot ·
 * account menu · ⓘ help · the shared "Secured by human.tech" footer, all INSIDE
 * the rounded bounds. Structure is space and tone, not hard lines. Presentational:
 * props only, no data hooks, fully self-contained + theme-driven.
 */
export const PassportShell: React.FC<PassportShellProps> = ({
  appIcon,
  appIconTooltip = DEFAULT_APP_ICON_TIP,
  account,
  activeAccountIndex = 0,
  onSelectAccount,
  onLinkWallet,
  onSignOut,
  infoTooltip = DEFAULT_INFO_TIP,
  defaultAccountMenuOpen,
  washRgb,
  size = "full",
  children,
  className = "",
}) => {
  const handleSelect = useCallback((i: number) => onSelectAccount?.(i), [onSelectAccount]);

  return (
    <div
      className={`${styles.shell} ${styles[size]} ${className}`}
      style={washRgb ? ({ "--rd-wash": washRgb } as React.CSSProperties) : undefined}
    >
      <div className={styles.fx} aria-hidden="true" />

      <div className={styles.chrome}>
        <Tooltip content={appIconTooltip} placement="bottom-start" className={glass.tip}>
          <span className={styles.appIcon} tabIndex={0} role="img" aria-label="App icon">
            {appIcon ?? <CubeIcon className={styles.gl} size={18} />}
          </span>
        </Tooltip>

        {account ? (
          <AccountMenu
            account={account}
            activeIndex={activeAccountIndex}
            onSelect={handleSelect}
            onLinkWallet={onLinkWallet}
            onSignOut={onSignOut}
            defaultOpen={defaultAccountMenuOpen}
          />
        ) : (
          <span className={styles.spacer} />
        )}

        <Tooltip content={infoTooltip} placement="bottom-end" className={glass.tip}>
          <span className={styles.info} tabIndex={0} role="button" aria-label="About your score">
            <InfoIcon className={styles.gl} size={13} />
          </span>
        </Tooltip>
      </div>

      <div className={styles.content}>{children}</div>

      <SecuredByFooter />
    </div>
  );
};
