import { http, HttpResponse, delay } from "msw";
import { scenarioManager } from "./ScenarioManager";

// Use wildcard patterns to match any base URL
export const handlers = [
  // Match score endpoint with any base URL
  http.get("*/embed/score/:scorerId/:address", async ({ params }) => {
    console.log("[MSW] Intercepted score request:", params);
    await delay(300);
    try {
      const response = scenarioManager.getScoreResponse(params.address as string);
      return HttpResponse.json(response);
    } catch (error) {
      if (error instanceof HttpResponse) return error;
      throw error;
    }
  }),

  // Match verify endpoint
  http.post("*/embed/verify/:scorerId/:address", async ({ request, params }) => {
    const body = (await request.json()) as { credentialIds: string[] };

    console.log("%c[Stamp Verify] Manual stamp verification requested", "color: #2196F3; font-weight: bold");
    console.log(`%c   Verifying stamps: ${body.credentialIds.join(", ")}`, "color: #888");

    await delay(500);

    try {
      const response = scenarioManager.getVerifyResponse(params.address as string, body.credentialIds);
      console.log("%c[Stamp Verify] Stamps successfully added", "color: #4CAF50");
      return HttpResponse.json(response);
    } catch (error) {
      console.log("%c[Stamp Verify] Verification failed", "color: #f44336");
      if (error instanceof HttpResponse) return error;
      throw error;
    }
  }),

  // Match platform verify endpoint
  http.post("*/api/v1/platform/:platform/verify", async ({ params }) => {
    const platform = params.platform as string;

    console.log(`%c[OAuth Platform] ${platform} verification initiated`, "color: #FF5722; font-weight: bold");

    await delay(400);

    const scenario = scenarioManager.getCurrentScenario();

    if (scenario.verificationBehavior === "failure") {
      console.log(`%c[OAuth Platform] ${platform} verification failed`, "color: #f44336");
      return new HttpResponse(null, { status: 400 });
    }

    console.log(`%c[OAuth Platform] ${platform} verification successful`, "color: #4CAF50");

    return HttpResponse.json({
      platform,
      verified: true,
      score: 3.5,
      expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    });
  }),

  // Match stamp pages metadata endpoint
  http.get("*/embed/stamps/metadata", async () => {
    console.log("%c[MSW] Stamp Pages Handler called", "color: #4CAF50");
    await delay(300);

    return HttpResponse.json([
      {
        header: "Web3 & DeFi",
        platforms: [
          {
            platformId: "ETH",
            name: "ETH",
            description: "Hold at least 0.01 ETH",
            documentationLink: "https://docs.passport.xyz/stamps/eth",
            requiresSignature: false,
            credentials: [
              {
                id: "eth-balance",
                name: "ETH Balance",
                description: "0.01+ ETH",
                score: 5.0,
              },
            ],
            displayWeight: "1",
          },
          {
            platformId: "NFT",
            name: "NFT",
            description: "Own an NFT",
            documentationLink: "https://docs.passport.xyz/stamps/nft",
            requiresSignature: false,
            credentials: [
              {
                id: "nft-holder",
                name: "NFT Holder",
                description: "Own 1+ NFT",
                score: 3.5,
              },
            ],
            displayWeight: "2",
          },
        ],
      },
      {
        header: "Social & Community",
        platforms: [
          {
            platformId: "Discord",
            name: "Discord",
            description: "Active Discord member",
            documentationLink: "https://docs.passport.xyz/stamps/discord",
            requiresSignature: false,
            requiresPopup: true,
            popupUrl: "https://discord.com/oauth/authorize",
            credentials: [
              {
                id: "discord-member",
                name: "Discord Member",
                description: "Member for 90+ days",
                score: 4.0,
              },
            ],
            displayWeight: "1",
          },
          {
            platformId: "LinkedIn",
            name: "LinkedIn",
            description: "Verified LinkedIn account",
            documentationLink: "https://docs.passport.xyz/stamps/linkedin",
            requiresSignature: false,
            requiresPopup: true,
            popupUrl: "https://linkedin.com/oauth/authorize",
            credentials: [
              {
                id: "linkedin-verified",
                name: "LinkedIn Verified",
                description: "Verified profile",
                score: 6.0,
              },
            ],
            displayWeight: "2",
          },
        ],
      },
      {
        header: "Identity Verification",
        platforms: [
          {
            platformId: "HumanIdKyc",
            name: "Government ID",
            description: "Verify with government-issued ID",
            documentationLink: "https://docs.passport.xyz/stamps/human-id",
            requiresSignature: false,
            credentials: [
              {
                id: "humanid-kyc",
                name: "KYC Verified",
                description: "Government ID verified",
                score: 10.0,
              },
            ],
            displayWeight: "1",
          },
          {
            platformId: "Binance",
            name: "Binance",
            description: "Verified Binance account",
            documentationLink: "https://docs.passport.xyz/stamps/binance",
            requiresSignature: true,
            requiresPopup: true,
            popupUrl: "https://binance.com/oauth/authorize",
            credentials: [
              {
                id: "binance-verified",
                name: "Binance KYC",
                description: "KYC verified account",
                score: 8.0,
              },
            ],
            displayWeight: "2",
          },
        ],
      },
    ]);
  }),

  // Match auto-verify endpoint
  http.post("*/embed/auto-verify", async ({ request }) => {
    const body = (await request.json()) as { address: string; scorerId: string; credentialIds?: string[] };
    const credentialIds = body.credentialIds || ["eth-balance"];

    console.log("%c[Auto-Verify] Simulating automatic verification...", "color: #9C27B0; font-weight: bold");

    await delay(400);

    try {
      const response = scenarioManager.getVerifyResponse(body.address, credentialIds);
      console.log("%c[Auto-Verify] Verification complete", "color: #4CAF50");
      return HttpResponse.json(response);
    } catch (error) {
      console.log("%c[Auto-Verify] Verification failed", "color: #f44336");
      if (error instanceof HttpResponse) return error;
      throw error;
    }
  }),

  // Catch-all for any embed/* requests that weren't matched above
  http.all("*/embed/*", async ({ request }) => {
    console.warn("[MSW] Unhandled embed request:", request.method, request.url);
    return HttpResponse.json(
      { error: "Not found", message: "This endpoint is not mocked" },
      { status: 404 }
    );
  }),
];
