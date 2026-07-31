import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { PassportShell } from "./PassportShell";
import { ScoreWindow } from "./ScoreWindow";
import { Widget } from "../widgets/Widget";
import { LightTheme } from "../utils/themes";
import {
  ThemePair,
  SAMPLE_ACCOUNT,
  ACCOUNT_ONE_WALLET,
  ACCOUNT_THREE_WALLETS,
  ACCOUNT_SIX_WALLETS,
  ACCOUNT_COOLDOWN,
} from "./storyFrame";

/**
 * PassportShell - the chrome binding: app-icon slot · account menu · ⓘ · the
 * shared "Secured by human.tech" footer, all INSIDE the rounded bounds. No hard
 * lines. Rendered in both themes on matching host backgrounds.
 */
const meta: Meta<typeof PassportShell> = {
  title: "Redesign/Shell",
  component: PassportShell,
  parameters: { layout: "centered" },
};
export default meta;
type Story = StoryObj<typeof PassportShell>;

/** A stand-in for an integrator's own brand mark, passed via the appIcon prop. */
const SampleAppIcon = (
  <span
    style={{
      display: "grid",
      placeItems: "center",
      width: 20,
      height: 20,
      borderRadius: 5,
      background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
      color: "#fff",
      fontWeight: 700,
      fontSize: 12,
    }}
  >
    A
  </span>
);

export const Default: Story = {
  name: "Shell / Default (no app-icon)",
  render: () => (
    <ThemePair>
      <PassportShell account={SAMPLE_ACCOUNT}>
        <ScoreWindow state="below" score={17} threshold={20} addVerificationsCta={{}} linkIdentityCta={{}} />
      </PassportShell>
    </ThemePair>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The default: NO app-icon. The slot renders nothing (no placeholder box) and the header leads with the 'Shady.eth's Passport ▾' account selector, then the ⓘ help affordance, all inside the rounded shell. Hover the ⓘ for a glass tooltip (edge-aware, never clipped). Note the soft light edge separating the widget from the host background, clearest on the dark host.",
      },
    },
  },
};

export const AppIconTooltip: Story = {
  name: "Shell / With integrator app-icon",
  render: () => (
    <ThemePair>
      <PassportShell
        account={SAMPLE_ACCOUNT}
        appIcon={SampleAppIcon}
        appIconTooltip="Verify with Acme to keep your account in good standing."
      >
        <ScoreWindow state="below" score={17} threshold={20} addVerificationsCta={{}} linkIdentityCta={{}} />
      </PassportShell>
    </ThemePair>
  ),
  parameters: {
    docs: {
      description: {
        // The explanatory sentence lives HERE (dev documentation), never in the
        // shipped component. It is the app-icon's tooltip only because the
        // integrator supplied it via appIconTooltip.
        story:
          "When the integrator passes appIcon, their own product icon leads the header (here a sample 'Acme' mark). It is their brand, not ours, so the component ships no explanatory tooltip of its own. It renders one only when the integrator also supplies appIconTooltip, shown here with sample integrator copy.",
      },
    },
  },
};

export const AccountMenuOpen: Story = {
  name: "Shell / Account menu open (three zones)",
  render: () => (
    <ThemePair>
      <PassportShell
        account={SAMPLE_ACCOUNT}
        defaultAccountMenuOpen
        onLinkWallet={() => undefined}
        onUnlinkWallet={() => undefined}
        onSignOut={() => undefined}
      >
        <ScoreWindow state="verified" score={24} threshold={20} onContinue={() => undefined} />
      </PassportShell>
    </ThemePair>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The account menu in three zones. Top: the WaaP account behind the passport (mark + name + email + address). Middle: linked wallets plus a 'Link additional wallet' CTA. Bottom: switch accounts and sign out. Left-aligned, near-opaque glass, top z-index, contained within the shell.",
      },
    },
  },
};

export const OneLinkedWallet: Story = {
  name: "Shell / Wallets: one linked",
  render: () => (
    <ThemePair>
      <PassportShell account={ACCOUNT_ONE_WALLET} defaultAccountMenuOpen onUnlinkWallet={() => undefined}>
        <ScoreWindow state="verified" score={24} threshold={20} onContinue={() => undefined} />
      </PassportShell>
    </ThemePair>
  ),
  parameters: {
    docs: {
      description: { story: "A single linked wallet. Hover the row (or tab to it) to reveal the unlink control. No pager." },
    },
  },
};

export const ThreeLinkedWallets: Story = {
  name: "Shell / Wallets: three linked",
  render: () => (
    <ThemePair>
      <PassportShell account={ACCOUNT_THREE_WALLETS} defaultAccountMenuOpen onUnlinkWallet={() => undefined}>
        <ScoreWindow state="verified" score={24} threshold={20} onContinue={() => undefined} />
      </PassportShell>
    </ThemePair>
  ),
  parameters: {
    docs: {
      description: { story: "Three wallets fill one page exactly, so no pager appears. Each row exposes an unlink control on hover / focus." },
    },
  },
};

export const SixLinkedWallets: Story = {
  name: "Shell / Wallets: six linked (paginated)",
  render: () => (
    <ThemePair>
      <PassportShell account={ACCOUNT_SIX_WALLETS} defaultAccountMenuOpen onUnlinkWallet={() => undefined}>
        <ScoreWindow state="verified" score={24} threshold={20} onContinue={() => undefined} />
      </PassportShell>
    </ThemePair>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "More than three wallets paginate into pages of three with dots and arrows. There is never a scrollbar (SOP never-scroll rule). Arrows and dots are keyboard-reachable.",
      },
    },
  },
};

export const WalletCooldown: Story = {
  name: "Shell / Wallets: cooldown + pending",
  render: () => (
    <ThemePair>
      <PassportShell account={ACCOUNT_COOLDOWN} defaultAccountMenuOpen onUnlinkWallet={() => undefined}>
        <ScoreWindow state="verified" score={24} threshold={20} onContinue={() => undefined} />
      </PassportShell>
    </ThemePair>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "A wallet in cooldown and one still pending each render a dimmed row with an amber status pill and a short plain reason. Pending wallets are not yet unlinkable; cooldown wallets still expose unlink.",
      },
    },
  },
};

export const NoAccount: Story = {
  name: "Shell / Without account selector",
  render: () => (
    <ThemePair>
      <PassportShell>
        <ScoreWindow state="below" score={12} threshold={20} addVerificationsCta={{}} linkIdentityCta={{}} />
      </PassportShell>
    </ThemePair>
  ),
  parameters: {
    docs: {
      description: {
        story: "Integrator supplies no account identity, so the selector collapses and the chrome stays balanced (app-icon + ⓘ).",
      },
    },
  },
};

export const HiddenAccountSelector: Story = {
  name: "Shell / Account selector hidden (accountSelector=false)",
  render: () => (
    <ThemePair>
      <PassportShell account={SAMPLE_ACCOUNT} appIcon={SampleAppIcon} accountSelector={false}>
        <ScoreWindow state="below" score={17} threshold={20} addVerificationsCta={{}} linkIdentityCta={{}} />
      </PassportShell>
    </ThemePair>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The accountSelector={false} customization knob hides the account selector from the header even though an account is supplied. The header leads with the integrator's app-icon (or nothing when no app-icon is given), then the ⓘ. Use this when the integrator drives identity in their own chrome.",
      },
    },
  },
};

export const CopyOnHover: Story = {
  name: "Shell / Copy address on hover",
  render: () => (
    <ThemePair>
      <PassportShell account={SAMPLE_ACCOUNT} defaultAccountMenuOpen onUnlinkWallet={() => undefined}>
        <ScoreWindow state="verified" score={24} threshold={20} onContinue={() => undefined} />
      </PassportShell>
    </ThemePair>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "Hover (or tab to) the passport account address and any linked wallet row to reveal a small copy control. Clicking copies the FULL address to the clipboard (the rows show a truncated form) and briefly shows a check + 'Copied', reverting after ~1.5s. Keyboard-reachable.",
      },
    },
  },
};

export const CustomWash: Story = {
  name: "Shell / Integrator wash color",
  render: () => (
    <ThemePair>
      <PassportShell account={SAMPLE_ACCOUNT} washRgb="139, 92, 246">
        <ScoreWindow state="below" score={17} threshold={20} addVerificationsCta={{}} linkIdentityCta={{}} />
      </PassportShell>
    </ThemePair>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The paper-shader wash is integrator-configurable via the washRgb prop (an r, g, b triplet). Here a violet wash replaces the default emerald, while the ring / CTA accent stays on the theme.",
      },
    },
  },
};

export const PillVariant: Story = {
  name: "Shell / Size variant: pill",
  render: () => (
    <ThemePair>
      <PassportShell size="pill">
        <ScoreWindow
          size="pill"
          state="verified"
          score={24}
          threshold={20}
          accountPreview={SAMPLE_ACCOUNT.display}
          onContinue={() => undefined}
        />
      </PassportShell>
    </ThemePair>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The compact 'pill' size: one true single row. The score ring stands in for the app-icon at the left (showing the score, e.g. 24), then the account name / short address preview, then a narrow Continue action, all on the same pill-height row. No app-icon, no ⓘ, no 'Verified' word, and no footer. The only tooltip is the score-hover on the ring. Clearly distinct from mini and full.",
      },
    },
  },
};

export const PillLoading: Story = {
  name: "Shell / Pill: loading",
  render: () => (
    <ThemePair>
      <PassportShell size="pill">
        <ScoreWindow size="pill" state="loading" />
      </PassportShell>
    </ThemePair>
  ),
  parameters: {
    docs: {
      description: {
        story: "The pill loading state: a small loader stands in for the ring plus a short label, all on the one pill row, with the compact 'Secured by human.tech' lockup beneath.",
      },
    },
  },
};

export const PillBelow: Story = {
  name: "Shell / Pill: below threshold",
  render: () => (
    <ThemePair>
      <PassportShell size="pill">
        <ScoreWindow
          size="pill"
          state="below"
          score={17}
          threshold={20}
          addVerificationsCta={{ onClick: () => undefined }}
        />
      </PassportShell>
    </ThemePair>
  ),
  parameters: {
    docs: {
      description: {
        story: "The pill below-threshold state: the small amber ring, a 'N to go' label, and one compact 'Verify' action, kept to a single short row.",
      },
    },
  },
};

export const PillVerified: Story = {
  name: "Shell / Pill: verified",
  render: () => (
    <ThemePair>
      <PassportShell size="pill">
        <ScoreWindow
          size="pill"
          state="verified"
          score={24}
          threshold={20}
          accountPreview={SAMPLE_ACCOUNT.display}
          onContinue={() => undefined}
        />
      </PassportShell>
    </ThemePair>
  ),
  parameters: {
    docs: {
      description: {
        story: "The pill verified state: the completed emerald ring, the account preview, and a compact Continue hand-off, all on one row.",
      },
    },
  },
};

export const PillError: Story = {
  name: "Shell / Pill: error",
  render: () => (
    <ThemePair>
      <PassportShell size="pill">
        <ScoreWindow size="pill" state="error" errorKind="network" onRetry={() => undefined} />
      </PassportShell>
    </ThemePair>
  ),
  parameters: {
    docs: {
      description: {
        story: "The pill error state: a compact danger mark, the short humanized title (never a raw error message), and a compact Retry, all on one row.",
      },
    },
  },
};

export const PillStatusOnly: Story = {
  name: "Shell / Pill: verified, no action (showAction=false)",
  render: () => (
    <ThemePair>
      <PassportShell size="pill">
        <ScoreWindow
          size="pill"
          state="verified"
          score={24}
          threshold={20}
          accountPreview={SAMPLE_ACCOUNT.display}
          showAction={false}
        />
      </PassportShell>
    </ThemePair>
  ),
  parameters: {
    docs: {
      description: {
        story: "The button on/off option: showAction={false} renders a status-only pill with no action button, just the score ring and the account preview. The integrator drives any hand-off in their own UI.",
      },
    },
  },
};

export const MiniVariant: Story = {
  name: "Shell / Size variant: mini",
  render: () => (
    <ThemePair>
      <PassportShell size="mini" account={SAMPLE_ACCOUNT}>
        <ScoreWindow size="mini" state="verified" score={24} threshold={20} onContinue={() => undefined} />
      </PassportShell>
    </ThemePair>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The 'mini' size: a condensed roughly half-height card with a smaller ring, tighter spacing, and a single action. In the verified state the 'You're verified' line folds INTO the CTA (check + 'You're verified', which continues on tap) to save vertical space: ring + that one button + footer, no standalone verified line. Distinct from the single-row pill and the full card.",
      },
    },
  },
};

export const SizeComparison: Story = {
  name: "Shell / All three sizes",
  render: () => (
    <div
      style={{
        display: "flex",
        gap: 28,
        flexWrap: "wrap",
        alignItems: "flex-start",
        padding: 24,
        borderRadius: 20,
        background: "#eef0f4",
      }}
    >
      {(["full", "mini", "pill"] as const).map((s) => (
        <div key={s} style={{ width: 300 }}>
          <Widget theme={LightTheme}>
            <PassportShell size={s} account={s === "pill" ? undefined : SAMPLE_ACCOUNT}>
              <ScoreWindow
                size={s}
                state="verified"
                score={24}
                threshold={20}
                accountPreview={s === "pill" ? SAMPLE_ACCOUNT.display : undefined}
                onContinue={() => undefined}
              />
            </PassportShell>
          </Widget>
        </div>
      ))}
    </div>
  ),
  parameters: {
    docs: {
      description: { story: "full, mini, and pill side by side so the three variants visibly differ in size and layout." },
    },
  },
};

export const PersistentScore: Story = {
  name: "Shell / Persistent score in chrome",
  render: () => (
    <ThemePair>
      <PassportShell account={SAMPLE_ACCOUNT} score={17} threshold={20} onScoreClick={() => undefined}>
        <ScoreWindow state="below" score={17} threshold={20} addVerificationsCta={{}} linkIdentityCta={{}} />
      </PassportShell>
      <PassportShell account={SAMPLE_ACCOUNT} score={24} threshold={20} onScoreClick={() => undefined}>
        <ScoreWindow state="verified" score={24} threshold={20} onContinue={() => undefined} />
      </PassportShell>
    </ThemePair>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The compact score lives in the shell chrome, top-left, so it is visible on every window. It reuses the Score window color logic: amber below the threshold (left, 17/20), emerald at or above it (right, 24/20). Tapping it opens the Score window / drilldown. The full big-ring Score window still exists; this is the persistent mini indicator.",
      },
    },
  },
};
