import type { Meta, StoryObj } from "@storybook/react";
import React from "react";
import { PassportShell } from "./PassportShell";
import { ScoreWindow } from "./ScoreWindow";
import { ThemePair, SAMPLE_ACCOUNT } from "./storyFrame";

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
        <ScoreWindow state="below" score={17} threshold={20} addVerificationsCta={{}} linkWalletCta={{}} />
      </PassportShell>
    </ThemePair>
  ),
  parameters: {
    docs: {
      description: {
        story:
          "App-icon slot (placeholder cube), the 'Shady.eth's Passport ▾' account selector, the ⓘ help affordance, and the shared footer, every element inside the rounded shell. Hover the app-icon / ⓘ for glass tooltips (edge-aware, never clipped).",
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

export const NoAccount: Story = {
  name: "Shell / Without account selector",
  render: () => (
    <ThemePair>
      <PassportShell>
        <ScoreWindow state="below" score={12} threshold={20} addVerificationsCta={{}} linkWalletCta={{}} />
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
        <ScoreWindow state="below" score={17} threshold={20} addVerificationsCta={{}} linkWalletCta={{}} />
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
  name: "Shell / Size variant: pill (scaffold)",
  render: () => (
    <ThemePair>
      <PassportShell size="pill" account={SAMPLE_ACCOUNT}>
        <ScoreWindow state="verified" score={24} threshold={20} onContinue={() => undefined} />
      </PassportShell>
    </ThemePair>
  ),
  parameters: {
    docs: {
      description: {
        story: "Scaffolded compact 'pill' size variant. The API exists; the full visual treatment is a later slice.",
      },
    },
  },
};

export const MiniVariant: Story = {
  name: "Shell / Size variant: mini (scaffold)",
  render: () => (
    <ThemePair>
      <PassportShell size="mini" account={SAMPLE_ACCOUNT}>
        <ScoreWindow state="verified" score={24} threshold={20} onContinue={() => undefined} />
      </PassportShell>
    </ThemePair>
  ),
  parameters: {
    docs: {
      description: {
        story: "Scaffolded compact 'mini' size variant. The API exists; the full visual treatment is a later slice.",
      },
    },
  },
};
