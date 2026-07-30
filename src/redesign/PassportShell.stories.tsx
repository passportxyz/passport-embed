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

export const Default: Story = {
  name: "Shell / Default (menu closed)",
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
          "App-icon slot (placeholder cube), the 'Shady.eth's Passport ▾' account selector, the ⓘ help affordance, and the shared footer, every element inside the rounded shell. The app-icon ships with NO tooltip by default (it is the integrator's brand). Hover the ⓘ for a glass tooltip (edge-aware, never clipped).",
      },
    },
  },
};

export const AppIconTooltip: Story = {
  name: "Shell / App-icon slot (integrator brand)",
  render: () => (
    <ThemePair>
      <PassportShell
        account={SAMPLE_ACCOUNT}
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
        // shipped component. It used to be the app-icon's default tooltip and
        // would have rendered in every real integration.
        story:
          "The integrator's own product icon renders in this slot. It is their brand, not ours. The shipped component therefore ships no explanatory tooltip of its own. It renders one only when the integrator supplies appIconTooltip, shown here with sample integrator copy.",
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
      <PassportShell size="pill" account={SAMPLE_ACCOUNT}>
        <ScoreWindow size="pill" state="verified" score={24} threshold={20} onContinue={() => undefined} />
      </PassportShell>
    </ThemePair>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "The compact 'pill' size: one short horizontal row - a small score ring, a status label, and a single action - inside a short shell. Distinct from mini and full.",
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
          "The 'mini' size: a condensed roughly half-height card with a smaller ring, tighter spacing, and a single action. Distinct from the single-row pill and the full card.",
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
            <PassportShell size={s} account={SAMPLE_ACCOUNT}>
              <ScoreWindow size={s} state="verified" score={24} threshold={20} onContinue={() => undefined} />
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
