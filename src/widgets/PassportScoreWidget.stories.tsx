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
 *
 * Stories are grouped in the sidebar by category (Connect / Passing / Below
 * Threshold / Stamps / Verify / Human ID / Errors / Layout) via slash-separated
 * story names so a reviewer can walk each flow by persona.
 *
 * Several deep screens only exist after user interaction (open the stamp list,
 * open a platform, click Verify). Those stories drive themselves there with a
 * best-effort `play` function built on plain DOM clicks (this repo has no
 * @storybook/test). The helpers never throw: if a step can't be reached the
 * story simply rests on the closest state and the description notes the limit.
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

// --- play() helpers (plain DOM, no @storybook/test) -------------------------
// Every helper is tolerant: it polls for an element and no-ops if it never
// appears, so a story that can't reach a deep screen degrades gracefully.

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const findClickable = (root: HTMLElement, text: string): HTMLElement | undefined =>
  (Array.from(root.querySelectorAll("button, a, [role='button']")) as HTMLElement[]).find((el) =>
    (el.textContent || "").includes(text)
  );

const waitForClickable = async (
  root: HTMLElement,
  text: string,
  timeout = 8000
): Promise<HTMLElement | undefined> => {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    const el = findClickable(root, text);
    if (el) return el;
    await sleep(80);
  }
  return undefined;
};

// Click a button/link whose text contains `text`, waiting for it to appear.
const clickText = async (root: HTMLElement, text: string, timeout = 8000) => {
  const el = await waitForClickable(root, text, timeout);
  el?.click();
  return el;
};

// InitialTooLow ("Verify Stamps") -> AddStamps list -> open a named platform.
const openPlatform = async (root: HTMLElement, platformName: string) => {
  await clickText(root, "Verify Stamps");
  await clickText(root, platformName);
};

// A stamp-metadata override for a single ad-hoc page of platforms. Used to
// surface platform variants the default handler doesn't expose (extra Human ID
// credential types, a signature-only stamp). This overrides only the story's
// MSW handler set, not the shared mocks.
const stampsMetadataHandler = (pages: object) =>
  http.get(`${MOCK_SERVICE_URL}/embed/stamps/metadata`, async () => {
    await delay(200);
    return HttpResponse.json(pages);
  });

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

/* ========================================================================== *
 * Connect
 * ========================================================================== */

/**
 * No wallet connected yet. `address` is undefined so the widget shows the
 * ConnectWalletBody / "Connect" call to action.
 */
export const ConnectWallet: Story = {
  name: "Connect / With Wallet Callback",
  args: {
    scorerId: "connect",
    address: undefined,
    connectWalletCallback: async () => {
      // In a host app this resolves to a connected address; in the story it
      // is a no-op so the connect screen stays put.
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "First-touch visitor: no wallet connected, a connectWalletCallback IS provided, so the copy reads “Connect your wallet” and the Connect button renders.",
      },
    },
  },
};

/**
 * connectWalletCallback undefined -> the host has no wallet integration, so the
 * connect screen drops its button and switches to the "Connect to the dapp"
 * copy variant.
 */
export const ConnectNoCallback: Story = {
  name: "Connect / No Callback",
  args: {
    scorerId: "connect-no-cb",
    address: undefined,
    connectWalletCallback: undefined,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Host with no wallet integration: connectWalletCallback is undefined, so there is no Connect button and the copy reads “Connect to the dapp”.",
      },
    },
  },
};

/* ========================================================================== *
 * Passing
 * ========================================================================== */

/**
 * Passing score (25.5 >= threshold 20). Shows the score gauge in the header
 * and the CongratsBody. Light theme.
 */
export const PassingScoreLight: Story = {
  name: "Passing / Light",
  args: { scorerId: "passing-light", theme: LightTheme },
  decorators: [withScenario("default")],
  parameters: {
    docs: {
      description: {
        story: "Happy path (score 25.5 ≥ 20): CongratsBody “proven your unique humanity” on the light theme.",
      },
    },
  },
};

/**
 * Same passing state rendered against the Dark theme.
 */
export const PassingScoreDark: Story = {
  name: "Passing / Dark",
  args: { scorerId: "passing-dark", theme: DarkTheme },
  parameters: {
    backgrounds: { default: "dark" },
    docs: {
      description: { story: "The passing CongratsBody on the dark / teal-gradient theme." },
    },
  },
  decorators: [withScenario("default")],
};

/**
 * Power user: 9 stamps, score 45.5. Exercises the passing header/gauge with a
 * large stamp set behind it.
 */
export const HighScorePowerUser: Story = {
  name: "Passing / High Score",
  args: { scorerId: "high-score" },
  decorators: [withScenario("high-score")],
  parameters: {
    docs: {
      description: {
        story: "Power-user persona: 9 verified stamps, score 45.5 — comfortably passing CongratsBody.",
      },
    },
  },
};

/* ========================================================================== *
 * Loading
 * ========================================================================== */

/**
 * Score request is in flight. A never-resolving score handler freezes the
 * widget in its loading / "checking" treatment for design review.
 */
export const ScoringLoading: Story = {
  name: "Loading / Scoring",
  args: { scorerId: "loading" },
  parameters: {
    docs: {
      description: { story: "Score request in flight: the widget is frozen in its loading / “checking” treatment." },
    },
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

/* ========================================================================== *
 * Below Threshold
 * ========================================================================== */

/**
 * Below threshold (12.5 < 20). The widget auto-verifies on mount, fails to
 * reach the threshold, and lands on ScoreTooLowBody ("Increase score to
 * participate!").
 */
export const BelowThreshold: Story = {
  name: "Below Threshold / Light",
  args: { scorerId: "below-threshold" },
  decorators: [withScenario("low-score")],
  parameters: {
    docs: {
      description: { story: "Score 12.5 < 20: after the mount auto-verify, ScoreTooLowBody “Increase score to participate!”." },
    },
  },
};

/**
 * Below threshold, Dark theme — for reviewing the low-score treatment on a
 * dark surface.
 */
export const BelowThresholdDark: Story = {
  name: "Below Threshold / Dark",
  args: { scorerId: "below-threshold-dark", theme: DarkTheme },
  parameters: {
    backgrounds: { default: "dark" },
    docs: { description: { story: "The below-threshold ScoreTooLowBody on the dark theme." } },
  },
  decorators: [withScenario("low-score")],
};

/**
 * Near-threshold quick win (19.5 / 20). One small stamp away from passing —
 * the persona most likely to complete verification.
 */
export const NearThresholdQuickWin: Story = {
  name: "Below Threshold / Near (Quick Win)",
  args: { scorerId: "near-threshold" },
  decorators: [withScenario("near-threshold")],
  parameters: {
    docs: {
      description: {
        story: "Almost-there persona: 19.5 / 20, a single stamp from passing — lands on ScoreTooLowBody.",
      },
    },
  },
};

/**
 * Brand-new user, score 0, no stamps. The onboarding entry point into the
 * ScoreTooLowBody / add-stamps journey.
 */
export const NoStampsZeroScore: Story = {
  name: "Below Threshold / No Stamps (Onboarding)",
  args: { scorerId: "no-stamps" },
  decorators: [withScenario("no-stamps")],
  parameters: {
    docs: {
      description: { story: "Cold-start persona: score 0, zero stamps — onboarding ScoreTooLowBody “Increase score”." },
    },
  },
};

/* ========================================================================== *
 * Stamps (add-stamps list, platform entry states, stamp-page errors)
 * ========================================================================== */

/**
 * Stamp / verification flow. Below threshold with the stamp-metadata endpoint
 * populated (Web3, Social, Identity categories). Click "Verify Stamps" to open
 * the stamp list, then a platform to reach the PlatformVerification step.
 */
export const StampVerificationFlow: Story = {
  name: "Stamps / Verify Flow",
  args: { scorerId: "stamps-flow" },
  decorators: [withScenario("verification-adds-stamps")],
  parameters: {
    docs: {
      description: {
        story: "Opens the AddStamps list (Web3 / Social / Identity categories). Auto-advances into the list for review.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    await clickText(canvasElement, "Verify Stamps");
  },
};

/**
 * Signature-strategy platform. A stamp that only needs an EIP-712 signature
 * (requiresSignature, no popup). generateSignatureCallback IS provided, so the
 * verify entry renders. NOTE: clicking Verify would call /embed/challenge which
 * is not mocked, so this story rests on the platform entry state.
 */
export const SignatureStrategy: Story = {
  name: "Stamps / Signature Strategy",
  args: { scorerId: "sig-strategy" },
  decorators: [withScenario("verification-adds-stamps")],
  parameters: {
    docs: {
      description: {
        story:
          "requiresSignature-only platform (EIP-712, no popup) with a signature callback present — rests on the PlatformVerification entry. Verify itself needs the unmocked /embed/challenge endpoint, so it is not driven here.",
      },
    },
    msw: {
      handlers: [
        stampsMetadataHandler([
          {
            header: "Signature Stamps",
            platforms: [
              {
                platformId: "Signer",
                name: "Signature Stamp",
                description: "Prove wallet ownership with an EIP-712 signature.",
                documentationLink: "https://docs.passport.xyz/stamps/signer",
                requiresSignature: true,
                icon: "✍️",
                credentials: [
                  { id: "signer", name: "Signer", description: "Signed challenge", score: 4.0 },
                ],
                displayWeight: "4",
              },
            ],
          },
        ]),
        ...handlers,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    await openPlatform(canvasElement, "Signature Stamp");
  },
};

/**
 * OAuth-popup-strategy platform. Discord requires a popup (requiresPopup +
 * popupUrl). NOTE: Storybook can't open a real OAuth popup, so this rests on
 * the platform verify entry state; clicking Verify would attempt window.open.
 */
export const OAuthPopupStrategy: Story = {
  name: "Stamps / OAuth Popup Strategy",
  args: { scorerId: "oauth-popup" },
  decorators: [withScenario("verification-adds-stamps")],
  parameters: {
    docs: {
      description: {
        story:
          "requiresPopup platform (Discord OAuth). Rests on the PlatformVerification entry — Storybook cannot open a real popup, so the Verify → window.open step is not driven.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    await openPlatform(canvasElement, "Discord");
  },
};

/**
 * Configuration error. Binance requires a signature (requiresSignature) but no
 * generateSignatureCallback is provided, so PlatformVerification renders the
 * "Something's missing!" configuration-error copy with a "Go Back" button.
 */
export const ConfigErrorMissingSignatureCallback: Story = {
  name: "Stamps / Missing Signature Callback",
  args: { scorerId: "config-missing-sig", generateSignatureCallback: undefined },
  decorators: [withScenario("verification-adds-stamps")],
  parameters: {
    docs: {
      description: {
        story:
          "Integrator misconfig: a requiresSignature platform (Binance) with NO generateSignatureCallback → “Something’s missing!” config-error state.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    await openPlatform(canvasElement, "Binance");
  },
};

/**
 * Deduplication. Intended to show the "Deduplicated" badge + "Already claimed
 * elsewhere" notice. LIMIT: not reachable with existing scenarios/mocks.
 * usePlatformDeduplication requires a stamp keyed by the platform's
 * credential.id with dedup === true AND score === 0. No scenario provides a
 * score-0 deduped stamp keyed to a metadata credential id (default dedup stamps
 * have score > 0 and provider-name keys that don't match credential ids), so
 * this rests on the AddStamps list without the dedup treatment.
 */
export const DedupAlreadyClaimed: Story = {
  name: "Stamps / Dedup Claimed (not reachable)",
  args: { scorerId: "dedup-claimed" },
  decorators: [withScenario("default")],
  parameters: {
    docs: {
      description: {
        story:
          "LIMIT: the dedup badge / “Already claimed elsewhere” notice is not reachable via existing mocks — it needs a stamp keyed by credential.id with dedup:true AND score:0, which no scenario provides. Would require a scenarios.ts change. Rests on the stamp list.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    // default is a passing score, so there is no "Verify Stamps" entry; nothing
    // to drive. Story documents the gap.
    await sleep(0);
  },
};

/**
 * Stamp-pages server error (500). Opening AddStamps hits /embed/stamps/metadata
 * which returns 500, so the list shows the axios error message + "Try Again".
 */
export const StampsFetchError: Story = {
  name: "Stamps / Fetch Error (500)",
  args: { scorerId: "stamps-500" },
  decorators: [withScenario("stamps-fetch-error")],
  parameters: {
    docs: {
      description: {
        story: "Stamp metadata 500: AddStamps shows “Request failed with status code 500” + Try Again (after React Query retries).",
      },
    },
  },
  play: async ({ canvasElement }) => {
    await clickText(canvasElement, "Verify Stamps");
  },
};

/**
 * Stamp-pages config error (401 invalid API key).
 */
export const StampsConfigError: Story = {
  name: "Stamps / Config Error (401)",
  args: { scorerId: "stamps-401" },
  decorators: [withScenario("stamps-config-error")],
  parameters: {
    docs: {
      description: {
        story: "Invalid API key: stamp metadata 401 → AddStamps error “Request failed with status code 401” + Try Again.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    await clickText(canvasElement, "Verify Stamps");
  },
};

/**
 * Stamp-pages not found (404). NOTE: this renders the axios 404 error message,
 * not the empty "No Stamps Available" state — that empty state needs an empty
 * stampPages array, which no scenario/mock produces.
 */
export const StampsNotFound: Story = {
  name: "Stamps / Not Found (404)",
  args: { scorerId: "stamps-404" },
  decorators: [withScenario("stamps-not-found")],
  parameters: {
    docs: {
      description: {
        story:
          "Scorer not found: stamp metadata 404 → AddStamps error “Request failed with status code 404”. LIMIT: the empty “No Stamps Available” state (stampPages === []) is not reachable via existing mocks.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    await clickText(canvasElement, "Verify Stamps");
  },
};

/**
 * Stamp-pages rate limited (429). Opening AddStamps returns 429 (no retry) so
 * the list shows the rate-limit error + "Try Again".
 */
export const StampsRateLimited: Story = {
  name: "Stamps / Rate Limited (429)",
  args: { scorerId: "stamps-429" },
  decorators: [withScenario("stamps-rate-limited")],
  parameters: {
    docs: {
      description: {
        story: "Stamp metadata 429: AddStamps shows “Request failed with status code 429” + Try Again (429 is not retried).",
      },
    },
  },
  play: async ({ canvasElement }) => {
    await clickText(canvasElement, "Verify Stamps");
  },
};

/* ========================================================================== *
 * Verify (StampClaimResult outcomes)
 * ========================================================================== */

/**
 * Successful claim. Below threshold, canAddStamps. Drives: open stamp list ->
 * ETH (no signature/popup/SDK) -> Verify -> the mock adds the stamp -> the
 * "Congratulations!" StampClaimResult success screen.
 */
export const StampClaimResultSuccess: Story = {
  name: "Verify / Success (Congratulations)",
  args: { scorerId: "claim-success" },
  decorators: [withScenario("verification-adds-stamps")],
  parameters: {
    docs: {
      description: {
        story:
          "Post-verify success: opens ETH, clicks Verify, the mock adds the credential → StampClaimResult “Congratulations!” claim screen.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    await openPlatform(canvasElement, "ETH");
    await clickText(canvasElement, "Verify");
  },
};

/**
 * Failed verification. verification-fails scenario returns 400 on verify, so
 * the credential is never added: StampClaimResult renders the "Stamp
 * Verification Unsuccessful" treatment.
 */
export const VerificationFailure: Story = {
  name: "Verify / Failure (Unsuccessful)",
  args: { scorerId: "verify-failure" },
  decorators: [withScenario("verification-fails")],
  parameters: {
    docs: {
      description: {
        story:
          "Verify returns 400: opens ETH and clicks Verify → StampClaimResult “Stamp Verification Unsuccessful” (after React Query retries).",
      },
    },
  },
  play: async ({ canvasElement }) => {
    await openPlatform(canvasElement, "ETH");
    await clickText(canvasElement, "Verify");
  },
};

/**
 * Multi-error carousel. all-verifications-fail returns a 200 verify response
 * carrying 3 credentialErrors. Drives: open stamp list -> ETH -> Verify ->
 * "Stamp Verification Unsuccessful" -> "Details" to open the 1/3 error pager.
 */
export const MultiErrorCarousel: Story = {
  name: "Verify / Multi Error Carousel",
  args: { scorerId: "multi-error" },
  decorators: [withScenario("all-verifications-fail")],
  parameters: {
    docs: {
      description: {
        story:
          "Three credentialErrors from one verify: opens ETH → Verify → Details, revealing the paged error carousel (1/3) with codes and arrows.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    await openPlatform(canvasElement, "ETH");
    await clickText(canvasElement, "Verify");
    await clickText(canvasElement, "Details");
  },
};

/**
 * Human-ID / clean-hands SDK flow. Prepends a stamp-metadata override that
 * surfaces a "Proof of Clean Hands" platform (requiresSDKFlow). Opening it and
 * clicking Verify runs the mocked Human ID SDK: an SBT lookup (miss) followed
 * by `requestSBT("clean-hands")`, which resolves successfully.
 */
export const HumanIdCleanHands: Story = {
  name: "Verify / Clean Hands (Human ID)",
  args: { scorerId: "clean-hands" },
  decorators: [withScenario("human-id-success")],
  parameters: {
    docs: {
      description: {
        story:
          "Proof of Clean Hands (requiresSDKFlow): open the platform and Verify to run the mocked Human ID SDK (SBT miss → requestSBT succeeds). Opens the platform for review.",
      },
    },
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
  play: async ({ canvasElement }) => {
    await openPlatform(canvasElement, "Proof of Clean Hands");
  },
};

/* ========================================================================== *
 * Human ID (credential-type variants + existing SBT)
 * ========================================================================== */

/**
 * Existing SBT / instant pass. hasExistingSBTs=["kyc"], so opening Government
 * ID and clicking Verify finds the SBT on-chain and skips requestSBT entirely,
 * going straight to the credential verify + success.
 */
export const HumanIdExistingSBT: Story = {
  name: "Human ID / Existing SBT (Instant)",
  args: { scorerId: "humanid-existing-sbt" },
  decorators: [withScenario("human-id-existing-sbt")],
  parameters: {
    docs: {
      description: {
        story:
          "Returning KYC holder: the mock SBT check hits, so Verify skips requestSBT (no 1.5s SDK flow) and lands on the claim result. Opens Government ID and clicks Verify.",
      },
    },
  },
  play: async ({ canvasElement }) => {
    await openPlatform(canvasElement, "Government ID");
    await clickText(canvasElement, "Verify");
  },
};

/**
 * Human-ID phone credential. Surfaces a HumanIdPhone platform (in the SDK safe
 * list) via a metadata override; Verify runs the mocked phone SBT flow.
 */
export const HumanIdPhone: Story = {
  name: "Human ID / Phone",
  args: { scorerId: "humanid-phone" },
  decorators: [withScenario("human-id-success")],
  parameters: {
    docs: {
      description: {
        story: "Human ID phone credential (platformId HumanIdPhone, requiresSDKFlow). Opens the platform verify entry; Verify runs the mocked phone SBT flow.",
      },
    },
    msw: {
      handlers: [
        stampsMetadataHandler([
          {
            header: "Identity Verification",
            platforms: [
              {
                platformId: "HumanIdPhone",
                name: "Phone Verification",
                description: "Verify a phone number privately via Human ID.",
                documentationLink: "https://docs.passport.xyz/stamps/human-id",
                requiresSignature: false,
                requiresSDKFlow: true,
                icon: "📱",
                credentials: [
                  { id: "humanid-phone", name: "Phone Verified", description: "Phone verified", score: 8.0 },
                ],
                displayWeight: "8",
              },
            ],
          },
        ]),
        ...handlers,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    await openPlatform(canvasElement, "Phone Verification");
  },
};

/**
 * Human-ID biometrics credential. Surfaces a Biometrics platform via a metadata
 * override; Verify runs the mocked biometrics SBT flow.
 */
export const HumanIdBiometrics: Story = {
  name: "Human ID / Biometrics",
  args: { scorerId: "humanid-biometrics" },
  decorators: [withScenario("human-id-success")],
  parameters: {
    docs: {
      description: {
        story: "Human ID biometrics credential (platformId Biometrics, requiresSDKFlow). Opens the platform verify entry; Verify runs the mocked biometrics SBT flow.",
      },
    },
    msw: {
      handlers: [
        stampsMetadataHandler([
          {
            header: "Identity Verification",
            platforms: [
              {
                platformId: "Biometrics",
                name: "Biometric Verification",
                description: "Prove unique personhood with a privacy-preserving biometric.",
                documentationLink: "https://docs.passport.xyz/stamps/human-id",
                requiresSignature: false,
                requiresSDKFlow: true,
                icon: "👁️",
                credentials: [
                  { id: "humanid-biometrics", name: "Biometrics", description: "Biometric verified", score: 10.0 },
                ],
                displayWeight: "10",
              },
            ],
          },
        ]),
        ...handlers,
      ],
    },
  },
  play: async ({ canvasElement }) => {
    await openPlatform(canvasElement, "Biometric Verification");
  },
};

/* ========================================================================== *
 * Errors
 * ========================================================================== */

/**
 * Error treatment. The score endpoint returns 500 so the widget renders
 * ErrorBody.
 */
export const ErrorState: Story = {
  name: "Errors / Score Error",
  args: { scorerId: "error" },
  parameters: {
    docs: {
      description: { story: "Score endpoint 500 → the widget renders the ErrorBody treatment." },
    },
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

/**
 * Rate-limited scenario. LIMIT: the 429 in this scenario is thrown only on the
 * verify / auto-verify path, and the scenario's score (20) is passing, so the
 * widget renders Congrats and the auto-verify 429 is swallowed silently. There
 * is no distinct rate-limit SCREEN on the score path — the visible rate-limit
 * UI is "Stamps / Rate Limited (429)". This story documents the score-path
 * behavior.
 */
export const RateLimited: Story = {
  name: "Errors / Rate Limited (score path)",
  args: { scorerId: "rate-limited" },
  decorators: [withScenario("rate-limited")],
  parameters: {
    docs: {
      description: {
        story:
          "LIMIT: the verify-path 429 is not surfaced as its own screen — this scenario's score (20) is passing so it renders Congrats and the mount auto-verify 429 is swallowed. See “Stamps / Rate Limited (429)” for the visible rate-limit UI.",
      },
    },
  },
};

/* ========================================================================== *
 * Layout (collapse modes)
 * ========================================================================== */

/**
 * Collapse mode "shift": the widget renders collapsed with a collapsible header
 * that shifts the body open/closed. Uses a passing score for content.
 */
export const CollapseModeShift: Story = {
  name: "Layout / Collapse Shift",
  args: { scorerId: "collapse-shift", collapseMode: "shift" },
  decorators: [withScenario("default")],
  parameters: {
    docs: {
      description: { story: "collapseMode “shift”: collapsible header, body pushes layout as it expands. Passing score behind it." },
    },
  },
};

/**
 * Collapse mode "overlay": the collapsible body overlays surrounding content
 * instead of shifting it.
 */
export const CollapseModeOverlay: Story = {
  name: "Layout / Collapse Overlay",
  args: { scorerId: "collapse-overlay", collapseMode: "overlay" },
  decorators: [withScenario("default")],
  parameters: {
    docs: {
      description: { story: "collapseMode “overlay”: the expanded body overlays surrounding content rather than shifting it." },
    },
  },
};
