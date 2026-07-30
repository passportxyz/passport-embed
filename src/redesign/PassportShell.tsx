import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./PassportShell.module.css";
import glass from "./glassTip.module.css";
import { Tooltip } from "../components/Tooltip";
import {
  CaretDownIcon,
  CheckIcon,
  ClockIcon,
  CopyIcon,
  InfoIcon,
  LogoutIcon,
  PlusIcon,
  SwitchIcon,
  UnlinkIcon,
  WaaPIcon,
  WalletIcon,
} from "./icons";
import { SecuredByFooter } from "./SecuredByFooter";

export type ShellAccountOption = {
  /** Display name, e.g. "Shady.eth" or "0x1332…4a9f". */
  display: string;
  /** Short kind label, e.g. "ENS" / "Wallet". */
  kind?: string;
};

/** Linking status of a wallet on the passport. */
export type LinkedWalletStatus = "active" | "cooldown" | "pending";

export type LinkedWallet = {
  /** Display name, e.g. "0x1332…4a9f" or "vault.eth". */
  display: string;
  /**
   * Full address to copy from the hover-to-copy control. When omitted, the copy
   * affordance falls back to copying `display`. Lets the row show a short /
   * truncated name while the clipboard still gets the complete address.
   */
  address?: string;
  /** Short kind label, e.g. "Wallet" / "ENS" / "Safe". */
  kind?: string;
  /** Linking state. Defaults to "active" when omitted. */
  status?: LinkedWalletStatus;
  /**
   * Short human reason shown for a non-active wallet, e.g. "Cooldown until Aug 3"
   * or "Linking in progress". Kept plain; no crypto jargon.
   */
  cooldownUntil?: string;
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
  /**
   * Integrator's product icon (top-left slot). OPTIONAL and OFF by default:
   * when omitted, the slot renders nothing (no placeholder box) and the header
   * leads with the account selector. Pass a node to lead the header with the
   * integrator's own brand mark.
   */
  appIcon?: React.ReactNode;
  /**
   * Optional integrator-supplied hover tooltip for the app-icon. Defaults to
   * NONE: the app-icon is the integrator's brand, so we ship no explanatory
   * copy of our own. When omitted, the icon renders with no tooltip. Only has
   * an effect when `appIcon` is also supplied.
   */
  appIconTooltip?: React.ReactNode;
  /** The passport identity + account menu. Omit to hide the selector. */
  account?: ShellAccount;
  /**
   * Customization-API knob: show or hide the account selector in the header.
   * Defaults to `true`. When `false`, the header omits the account selector
   * entirely (leading with the app-icon if one is supplied, else nothing), even
   * when `account` is provided. Useful for integrators who drive identity in
   * their own chrome.
   */
  accountSelector?: boolean;
  /** Index of the active account within `account.accounts`. */
  activeAccountIndex?: number;
  /** Called with the selected account index (switch accounts). */
  onSelectAccount?: (index: number) => void;
  /** Link an additional wallet to the passport (middle zone CTA). */
  onLinkWallet?: () => void;
  /** Unlink a linked wallet. Receives its index within `account.linkedWallets`. */
  onUnlinkWallet?: (index: number) => void;
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
   * Size variant. `full` (default) is the crafted card; `mini` is a condensed
   * ~half-size card; `pill` is a compact single-row pill.
   */
  size?: ShellSize;
  /** The window content (Score window, drill-down, …). */
  children: React.ReactNode;
  className?: string;
};

const DEFAULT_INFO_TIP =
  "Your humanity score, proven with zero knowledge. Private by default. Nothing personal is revealed.";

/** How many linked wallets show per page before the menu paginates (never scrolls). */
const WALLETS_PER_PAGE = 3;

const STATUS_LABEL: Record<LinkedWalletStatus, string> = {
  active: "",
  cooldown: "Cooldown",
  pending: "Pending",
};

/**
 * Hover-to-copy affordance for a wallet / address row. A small copy icon that
 * stays hidden until the row is hovered or the button itself is focused (so it
 * is keyboard-reachable). Clicking copies the full value to the clipboard and
 * briefly swaps to a check + "Copied", reverting after ~1.5s. Presentational and
 * self-contained; uses navigator.clipboard.writeText.
 */
const COPIED_MS = 1500;

const CopyButton: React.FC<{ value: string; label: string }> = ({ value, label }) => {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const copy = useCallback(() => {
    const done = () => {
      setCopied(true);
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), COPIED_MS);
    };
    try {
      const clip = typeof navigator !== "undefined" ? navigator.clipboard : undefined;
      if (clip?.writeText) {
        clip.writeText(value).then(done, done);
      } else {
        done();
      }
    } catch {
      // Clipboard may be blocked (insecure context, permissions); still confirm.
      done();
    }
  }, [value]);

  return (
    <button
      type="button"
      className={`${styles.copyBtn} ${copied ? styles.copyBtnDone : ""}`}
      onClick={copy}
      aria-label={copied ? "Copied" : label}
      title={copied ? "Copied" : label}
    >
      <span className={styles.copyGlyph} aria-hidden="true">
        {copied ? <CheckIcon size={13} strokeWidth={2.2} /> : <CopyIcon size={13} strokeWidth={1.7} />}
      </span>
      {copied ? <span className={styles.copyText}>Copied</span> : null}
    </button>
  );
};

const LinkedWalletRow: React.FC<{
  wallet: LinkedWallet;
  index: number;
  onUnlink?: (index: number) => void;
}> = ({ wallet, index, onUnlink }) => {
  const status = wallet.status ?? "active";
  const muted = status !== "active";
  // Pending links are still settling, so unlink is not offered yet.
  const canUnlink = Boolean(onUnlink) && status !== "pending";

  return (
    <div className={`${styles.walletRow} ${muted ? styles.walletRowMuted : ""}`}>
      <span className={styles.walletIcon} aria-hidden="true">
        <WalletIcon size={15} strokeWidth={1.8} />
      </span>
      <span className={styles.walletMeta}>
        <span className={styles.walletName}>{wallet.display}</span>
        {muted && wallet.cooldownUntil ? (
          <span className={styles.walletReason}>{wallet.cooldownUntil}</span>
        ) : null}
      </span>
      {muted ? (
        <span className={styles.walletStatus} aria-label={STATUS_LABEL[status]}>
          <ClockIcon size={11} strokeWidth={1.9} />
          {STATUS_LABEL[status]}
        </span>
      ) : wallet.kind ? (
        <span className={styles.walletKind}>{wallet.kind}</span>
      ) : null}
      <CopyButton value={wallet.address ?? wallet.display} label={`Copy ${wallet.display}`} />
      {canUnlink ? (
        <button
          type="button"
          className={styles.unlinkBtn}
          onClick={() => onUnlink?.(index)}
          aria-label={`Unlink ${wallet.display}`}
          title={`Unlink ${wallet.display}`}
        >
          <UnlinkIcon size={14} strokeWidth={1.8} />
        </button>
      ) : null}
    </div>
  );
};

const AccountMenu: React.FC<{
  account: ShellAccount;
  activeIndex: number;
  onSelect?: (index: number) => void;
  onLinkWallet?: () => void;
  onUnlinkWallet?: (index: number) => void;
  onSignOut?: () => void;
  defaultOpen?: boolean;
}> = ({ account, activeIndex, onSelect, onLinkWallet, onUnlinkWallet, onSignOut, defaultOpen }) => {
  const [open, setOpen] = useState(Boolean(defaultOpen));
  const [walletPage, setWalletPage] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const switchOptions: ShellAccountOption[] = useMemo(
    () =>
      account.accounts && account.accounts.length
        ? account.accounts
        : [{ display: account.display, kind: account.kind }],
    [account]
  );
  const linkedWallets = account.linkedWallets ?? [];
  const pageCount = Math.max(1, Math.ceil(linkedWallets.length / WALLETS_PER_PAGE));
  // Clamp in case the active page falls off the end (e.g. after an unlink).
  const page = Math.min(walletPage, pageCount - 1);
  const pageStart = page * WALLETS_PER_PAGE;
  const pageWallets = linkedWallets.slice(pageStart, pageStart + WALLETS_PER_PAGE);

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
            {account.address ? (
              <span className={styles.waapAddrRow}>
                <span className={styles.waapAddr}>{account.address}</span>
                <CopyButton value={account.address} label="Copy address" />
              </span>
            ) : null}
          </span>
        </div>

        {/* (b) middle: linked wallets (paginated, never scrolled) + link CTA */}
        <div className={styles.zoneMid}>
          <div className={styles.zoneHead}>Linked wallets</div>
          {linkedWallets.length ? (
            <>
              {pageWallets.map((w, i) => (
                <LinkedWalletRow
                  key={`${w.display}-${pageStart + i}`}
                  wallet={w}
                  index={pageStart + i}
                  onUnlink={onUnlinkWallet}
                />
              ))}
              {pageCount > 1 ? (
                <div className={styles.walletPager} role="group" aria-label="Linked wallet pages">
                  <button
                    type="button"
                    className={styles.pagerArrow}
                    onClick={() => setWalletPage(Math.max(0, page - 1))}
                    disabled={page === 0}
                    aria-label="Previous wallets"
                  >
                    <CaretDownIcon className={styles.pagerPrev} size={13} />
                  </button>
                  <span className={styles.pagerDots}>
                    {Array.from({ length: pageCount }).map((_, i) => (
                      <button
                        type="button"
                        key={i}
                        className={`${styles.pagerDot} ${i === page ? styles.pagerDotOn : ""}`}
                        onClick={() => setWalletPage(i)}
                        aria-label={`Wallet page ${i + 1}`}
                        aria-current={i === page ? "true" : undefined}
                      />
                    ))}
                  </span>
                  <button
                    type="button"
                    className={styles.pagerArrow}
                    onClick={() => setWalletPage(Math.min(pageCount - 1, page + 1))}
                    disabled={page === pageCount - 1}
                    aria-label="More wallets"
                  >
                    <CaretDownIcon className={styles.pagerNext} size={13} />
                  </button>
                </div>
              ) : null}
            </>
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
  appIconTooltip,
  account,
  accountSelector = true,
  activeAccountIndex = 0,
  onSelectAccount,
  onLinkWallet,
  onUnlinkWallet,
  onSignOut,
  infoTooltip = DEFAULT_INFO_TIP,
  defaultAccountMenuOpen,
  washRgb,
  size = "full",
  children,
  className = "",
}) => {
  const handleSelect = useCallback((i: number) => onSelectAccount?.(i), [onSelectAccount]);

  // App-icon slot is OFF by default: only render it when the integrator supplies
  // their own mark. When absent, the header simply leads with the account.
  const appIconEl = appIcon ? (
    <span className={styles.appIcon} tabIndex={appIconTooltip ? 0 : undefined} role="img" aria-label="App icon">
      {appIcon}
    </span>
  ) : null;

  // Whether the account selector actually shows: gated by the accountSelector
  // knob AND by an account being supplied.
  const showAccount = accountSelector && Boolean(account);

  // The pill is a true single row: the score ring stands in for the app-icon,
  // the account preview and the one action live in the window itself. It carries
  // no header chrome (no app-icon, no account menu, no ⓘ), but it DOES keep the
  // shared "Secured by human.tech" lockup in a compact form beneath the row so
  // the mark is never dropped. (See PassportShell.stories / item 1.)
  if (size === "pill") {
    return (
      <div
        className={`${styles.shell} ${styles.pill} ${className}`}
        style={washRgb ? ({ "--rd-wash": washRgb } as React.CSSProperties) : undefined}
      >
        <div className={styles.fx} aria-hidden="true" />
        <div className={styles.content}>{children}</div>
        <SecuredByFooter compact />
      </div>
    );
  }

  return (
    <div
      className={`${styles.shell} ${styles[size]} ${className}`}
      style={washRgb ? ({ "--rd-wash": washRgb } as React.CSSProperties) : undefined}
    >
      <div className={styles.fx} aria-hidden="true" />

      <div className={styles.chrome}>
        {/* The app-icon slot only appears when the integrator passes appIcon.
            No default tooltip either: the icon is the integrator's brand, so we
            wrap it only when they supply their own appIconTooltip copy. */}
        {appIconEl ? (
          appIconTooltip ? (
            <Tooltip content={appIconTooltip} placement="bottom-start" className={glass.tip}>
              {appIconEl}
            </Tooltip>
          ) : (
            appIconEl
          )
        ) : null}

        {showAccount && account ? (
          <AccountMenu
            account={account}
            activeIndex={activeAccountIndex}
            onSelect={handleSelect}
            onLinkWallet={onLinkWallet}
            onUnlinkWallet={onUnlinkWallet}
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
