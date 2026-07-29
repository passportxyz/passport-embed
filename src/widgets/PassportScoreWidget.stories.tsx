import type { Meta, StoryObj, Decorator } from "@storybook/react";
import { http, HttpResponse, delay } from "msw";
import { PassportScoreWidget } from "./PassportScoreWidget";
import { DarkTheme, LightTheme } from "../utils/themes";
import { handlers } from "../../dev/src/mocks/handlers";
import { scenarioManager } from "../../dev/src/mocks/ScenarioManager";

/**
 * Offline stories for the PassportScoreWidget.
 *
 * These render the full widget (it wraps its own QueryClient + Theme
 * providers) against the SHARED dev mock harness in `dev/src/mocks`:
 *   - `handlers.ts`  -> mocks /embed/score, /embed/auto-verify, /embed/stamps/metadata
 *   - `ScenarioManager` + `scenarios.ts` -> per-state score / stamp fixtures
 *   - `mockHumanIdSdk.ts` (aliased in .storybook/main.ts) -> requestSBT / SBT checks
 *
 * The MSW score/verify responses are chosen by the "scenario" the
 * ScenarioManager currently points at, so each story selects its scenario
 * via a decorator. A unique `scorerId` per story keeps the module-level
 * react-query cache from bleeding between stories.
 */

const MOCK_ADDRESS = "0x1234567890123456789012345678901234567890";
const MOCK_SERVICE_URL = "http://localhost:8004";

// Fake signature callback so signature-gated stamps never touch a wallet.
const generateSignatureCallback = async (_message: string) => "0xmocked_signature_for_storybook";

// Select the active mock scenario before a story renders. ScenarioManager
// re-reads the scenario from the URL, and switchScenario() writes it there.
const withScenario =
  (scenario: string): Decorator =>
  (Story) => {
    scenarioManager.switchScenario(scenario);
    return <Story />;
  };

const meta: Meta<typeof PassportScoreWidget> = {
  title: "Widgets/PassportScoreWidget",
  component: PassportScoreWidget,
  parameters: {
    layout: "centered",
  },
  args: {
    apiKey: "storybook-mock-api-key",
    scorerId: "1",
    address: MOCK_ADDRESS,
    overrideEmbedServiceUrl: MOCK_SERVICE_URL,
    collapseMode: "off",
    theme: LightTheme,
    generateSignatureCallback,
    // Optimism RPC is never hit because the Human ID SDK is mocked.
    opRPCURL: "https://mainnet.optimism.io",
  },
  argTypes: {
    theme: {
      control: { type: "radio" },
      options: ["Light", "Dark"],
      mapping: { Light: LightTheme, Dark: DarkTheme },
    },
    collapseMode: {
      control: { type: "radio" },
      options: ["off", "shift", "overlay"],
    },
  },
};

export default meta;

type Story = StoryObj<typeof PassportScoreWidget>;

/**
 * No wallet connected yet. `address` is undefined so the widget shows the
 * ConnectWalletBody / "Connect" call to action.
 */
export const ConnectWallet: Story = {
  args: {
    scorerId: "connect",
    address: undefined,
    connectWalletCallback: async () => {
      // In a host app this resolves to a connected address; in the story it
      // is a no-op so the connect screen stays put.
    },
  },
};

/**
 * Score request is in flight. A never-resolving score handler freezes the
 * widget in its loading / "checking" treatment for design review.
 */
export const ScoringLoading: Story = {
  args: { scorerId: "loading" },
  parameters: {
    msw: {
      handlers: [
        http.get(`${MOCK_SERVICE_URL}/embed/score/:scorerId/:address`, async () => {
          await delay("infinite");
          return HttpResponse.json({});
        }),
        ...handlers,
      ],
    },
  },
};

/**
 * Passing score (25.5 >= threshold 20). Shows the score gauge in the header
 * and the CongratsBody. Light theme.
 */
export const PassingScoreLight: Story = {
  args: { scorerId: "passing-light", theme: LightTheme },
  decorators: [withScenario("default")],
};

/**
 * Same passing state rendered against the Dark theme.
 */
export const PassingScoreDark: Story = {
  args: { scorerId: "passing-dark", theme: DarkTheme },
  parameters: { backgrounds: { default: "dark" } },
  decorators: [withScenario("default")],
};

/**
 * Below threshold (12.5 < 20). The widget auto-verifies on mount, fails to
 * reach the threshold, and lands on ScoreTooLowBody ("Increase score to
 * participate!").
 */
export const BelowThreshold: Story = {
  args: { scorerId: "below-threshold" },
  decorators: [withScenario("low-score")],
};

/**
 * Below threshold, Dark theme — for reviewing the low-score treatment on a
 * dark surface.
 */
export const BelowThresholdDark: Story = {
  args: { scorerId: "below-threshold-dark", theme: DarkTheme },
  parameters: { backgrounds: { default: "dark" } },
  decorators: [withScenario("low-score")],
};

/**
 * Stamp / verification flow. Below threshold with the stamp-metadata endpoint
 * populated (Web3, Social, Identity categories). Click "Verify Stamps" to open
 * the stamp list, then a platform to reach the PlatformVerification step.
 */
export const StampVerificationFlow: Story = {
  args: { scorerId: "stamps-flow" },
  decorators: [withScenario("verification-adds-stamps")],
};

/**
 * Human-ID / clean-hands SDK flow. Prepends a stamp-metadata override that
 * surfaces a "Proof of Clean Hands" platform (requiresSDKFlow). Opening it and
 * clicking Verify runs the mocked Human ID SDK: an SBT lookup (miss) followed
 * by `requestSBT("clean-hands")`, which resolves successfully.
 */
export const HumanIdCleanHands: Story = {
  args: { scorerId: "clean-hands" },
  decorators: [withScenario("human-id-success")],
  parameters: {
    msw: {
      handlers: [
        http.get(`${MOCK_SERVICE_URL}/embed/stamps/metadata`, async () => {
          await delay(200);
          return HttpResponse.json([
            {
              header: "Identity Verification",
              platforms: [
                {
                  platformId: "CleanHands",
                  name: "Proof of Clean Hands",
                  description:
                    "Prove you are not on a sanctions list without revealing your identity.",
                  documentationLink: "https://docs.passport.xyz/stamps/clean-hands",
                  requiresSignature: false,
                  requiresSDKFlow: true,
                  icon: "🧼",
                  credentials: [
                    {
                      id: "clean-hands",
                      name: "Clean Hands",
                      description: "Sanctions-screened, privately",
                      score: 12.0,
                    },
                  ],
                  displayWeight: "12",
                },
                {
                  platformId: "HumanIdKyc",
                  name: "Government ID",
                  description: "Verify with a government-issued ID via Human ID.",
                  documentationLink: "https://docs.passport.xyz/stamps/human-id",
                  requiresSignature: false,
                  requiresSDKFlow: true,
                  icon: "🆔",
                  credentials: [
                    {
                      id: "humanid-kyc",
                      name: "KYC Verified",
                      description: "Government ID verified",
                      score: 10.0,
                    },
                  ],
                  displayWeight: "10",
                },
              ],
            },
          ]);
        }),
        ...handlers,
      ],
    },
  },
};

/**
 * Error treatment. The score endpoint returns 500 so the widget renders
 * ErrorBody.
 */
export const ErrorState: Story = {
  args: { scorerId: "error" },
  parameters: {
    msw: {
      handlers: [
        http.get(`${MOCK_SERVICE_URL}/embed/score/:scorerId/:address`, async () => {
          await delay(200);
          return new HttpResponse(JSON.stringify({ error: "Internal server error" }), {
            status: 500,
          });
        }),
        ...handlers,
      ],
    },
  },
};
