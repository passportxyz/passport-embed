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
];