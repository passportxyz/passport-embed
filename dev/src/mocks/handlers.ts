import { http, HttpResponse, delay } from 'msw';
import { scenarioManager } from './ScenarioManager';

// Import from SDK build instead of src
const API_BASE = 'http://localhost:8004';

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
    await delay(500);
    try {
      const body = await request.json() as { credentialIds: string[] };
      const response = scenarioManager.getVerifyResponse(params.address as string, body.credentialIds);
      return HttpResponse.json(response);
    } catch (error) {
      if (error instanceof HttpResponse) return error;
      throw error;
    }
  }),

  // Mock platform verification endpoints (for individual stamp verification)
  http.post(`${API_BASE}/api/v1/platform/:platform/verify`, async ({ params }) => {
    await delay(400);
    
    const scenario = scenarioManager.getCurrentScenario();
    const platform = params.platform as string;
    
    if (scenario.verificationBehavior === 'failure') {
      return new HttpResponse(null, { status: 400 });
    }
    
    return HttpResponse.json({
      platform,
      verified: true,
      score: 3.5,
      expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    });
  }),

  // Mock stamps metadata endpoint - returns available stamps for verification
  http.get(`${API_BASE}/embed/stamps/metadata`, async () => {
    await delay(300);
    
    // Return mock stamp pages with available platforms
    return HttpResponse.json([
      {
        header: "Web3 & DeFi",
        platforms: [
          {
            name: "ETH",
            description: "Hold at least 0.01 ETH",
            documentationLink: "https://docs.passport.xyz/stamps/eth",
            requiresSignature: false,
            credentials: [
              {
                id: "eth-balance",
                name: "ETH Balance",
                description: "0.01+ ETH",
                score: 5.0
              }
            ],
            displayWeight: "1"
          },
          {
            name: "NFT",
            description: "Own an NFT",
            documentationLink: "https://docs.passport.xyz/stamps/nft",
            requiresSignature: false,
            credentials: [
              {
                id: "nft-holder",
                name: "NFT Holder",
                description: "Own 1+ NFT",
                score: 3.5
              }
            ],
            displayWeight: "2"
          }
        ]
      },
      {
        header: "Social & Community",
        platforms: [
          {
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
                score: 4.0
              }
            ],
            displayWeight: "1"
          },
          {
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
                score: 6.0
              }
            ],
            displayWeight: "2"
          }
        ]
      }
    ]);
  }),

  // Mock auto-verify endpoint - attempts to verify credentials automatically
  http.post(`${API_BASE}/embed/auto-verify`, async ({ request }) => {
    await delay(400);
    
    const body = await request.json() as { address: string; scorerId: string; credentialIds?: string[] };
    
    // Auto-verify with the specified credentials (if any)
    // This mimics the behavior of trying to automatically add stamps
    try {
      const response = scenarioManager.getVerifyResponse(body.address, body.credentialIds || ['eth-balance']);
      return HttpResponse.json(response);
    } catch (error) {
      if (error instanceof HttpResponse) return error;
      throw error;
    }
  }),
];