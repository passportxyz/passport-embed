import { http, HttpResponse, delay } from "msw";
import { scenarioManager } from "./ScenarioManager";

// Import from SDK build instead of src
const API_BASE = "http://localhost:8004";

export const handlers = [
  // Clean handler - no scenario logic
  http.get(`${API_BASE}/embed/score/:scorerId/:address`, async ({ params }) => {
    await delay(300); // Realistic delay
    try {
      const response = scenarioManager.getScoreResponse(params.address as string);
      return HttpResponse.json(response);
    } catch (error) {
      if (error instanceof HttpResponse) return error;
      throw error;
    }
  }),

  http.post(`${API_BASE}/embed/verify/:scorerId/:address`, async ({ request, params }) => {
    const body = (await request.json()) as { credentialIds: string[] };

    console.log("%c🎯 [Stamp Verify] Manual stamp verification requested", "color: #2196F3; font-weight: bold");
    console.log(`%c   → Verifying stamps: ${body.credentialIds.join(", ")}`, "color: #888");
    console.log(`%c   → This would normally validate credentials with external services`, "color: #888");

    await delay(500);

    try {
      const response = scenarioManager.getVerifyResponse(params.address as string, body.credentialIds);
      console.log(`%c✅ [Stamp Verify] Stamps successfully added`, "color: #4CAF50");
      return HttpResponse.json(response);
    } catch (error) {
      console.log(`%c❌ [Stamp Verify] Verification failed`, "color: #f44336");
      if (error instanceof HttpResponse) return error;
      throw error;
    }
  }),

  // Mock platform verification endpoints (for individual stamp verification)
  http.post(`${API_BASE}/api/v1/platform/:platform/verify`, async ({ params }) => {
    const platform = params.platform as string;

    console.log(`%c🔗 [OAuth Platform] ${platform} verification initiated`, "color: #FF5722; font-weight: bold");
    console.log(`%c   → User would be redirected to ${platform} OAuth page`, "color: #888");
    console.log(`%c   → Simulating user authorizing app on ${platform}`, "color: #888");

    await delay(400);

    const scenario = scenarioManager.getCurrentScenario();

    if (scenario.verificationBehavior === "failure") {
      console.log(`%c❌ [OAuth Platform] ${platform} verification failed`, "color: #f44336");
      console.log(`%c   → User might have denied permission or verification failed`, "color: #888");
      return new HttpResponse(null, { status: 400 });
    }

    console.log(`%c✅ [OAuth Platform] ${platform} verification successful`, "color: #4CAF50");
    console.log(`%c   → User successfully authenticated with ${platform}`, "color: #888");
    console.log(`%c   → Platform stamp will be added to passport`, "color: #888");

    return HttpResponse.json({
      platform,
      verified: true,
      score: 3.5,
      expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    });
  }),

  // Mock stamps metadata endpoint - returns available stamps for verification
  http.get(`${API_BASE}/embed/stamps/metadata`, async () => {
    console.log("%c📍 [Stamp Pages] Handler called", "color: #4CAF50");
    await delay(300);

    const scenario = scenarioManager.getCurrentScenario();
    console.log("%c📍 [Stamp Pages] Current scenario:", "color: #4CAF50", scenario.name);
    console.log("%c📍 [Stamp Pages] stampPagesBehavior:", "color: #4CAF50", scenario.stampPagesBehavior);

    // Handle error scenarios for stamp pages
    if (scenario.stampPagesBehavior === "error") {
      console.log("%c❌ [Stamp Pages] Server error fetching stamp metadata", "color: #f44336");
      return new HttpResponse(
        JSON.stringify({ error: "Internal server error", message: "Failed to fetch stamp metadata" }),
        { status: 500 }
      );
    }

    if (scenario.stampPagesBehavior === "config-error") {
      console.log("%c❌ [Stamp Pages] Invalid API key", "color: #f44336");
      return new HttpResponse(JSON.stringify({ error: "Unauthorized", message: "Invalid API key provided" }), {
        status: 401,
      });
    }

    if (scenario.stampPagesBehavior === "not-found") {
      console.log("%c❌ [Stamp Pages] Scorer not found", "color: #f44336");
      return new HttpResponse(JSON.stringify({ error: "Not found", message: "Scorer configuration not found" }), {
        status: 404,
      });
    }

    if (scenario.stampPagesBehavior === "rate-limit") {
      console.log("%c❌ [Stamp Pages] Rate limited", "color: #f44336");
      return new HttpResponse(
        JSON.stringify({ error: "Too many requests", message: "Rate limit exceeded. Please try again later." }),
        {
          status: 429,
          headers: {
            "Retry-After": "60",
          },
        }
      );
    }

    // Return mock stamp pages with available platforms
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
            icon: "<svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M12 2L2 12L12 22L22 12L12 2Z' fill='#627EEA'/></svg>",
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
            icon: "🖼️",
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
            icon: "<svg viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'><path d='M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.994a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z' fill='#5865F2'/></svg>",
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
            icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/linkedin.svg",
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
            icon: "🆔",
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
            icon: "https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/binance.svg",
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

  // Mock auto-verify endpoint - attempts to verify credentials automatically
  http.post(`${API_BASE}/embed/auto-verify`, async ({ request }) => {
    const body = (await request.json()) as { address: string; scorerId: string; credentialIds?: string[] };
    const credentialIds = body.credentialIds || ["eth-balance"];

    console.log("%c🔍 [Auto-Verify] Simulating automatic verification...", "color: #9C27B0; font-weight: bold");
    console.log(`%c   → Checking onchain data for address: ${body.address.substring(0, 10)}...`, "color: #888");
    console.log(`%c   → Credentials being verified: ${credentialIds.join(", ")}`, "color: #888");
    console.log(`%c   → This would normally query blockchain/APIs in background`, "color: #888");

    await delay(400);

    // Auto-verify with the specified credentials (if any)
    // This mimics the behavior of trying to automatically add stamps
    try {
      const response = scenarioManager.getVerifyResponse(body.address, credentialIds);
      console.log(`%c✅ [Auto-Verify] Verification complete`, "color: #4CAF50");
      console.log(`%c   → Found ${credentialIds.length} valid stamp(s)`, "color: #888");
      return HttpResponse.json(response);
    } catch (error) {
      console.log(`%c❌ [Auto-Verify] Verification failed`, "color: #f44336");
      if (error instanceof HttpResponse) return error;
      throw error;
    }
  }),
];
