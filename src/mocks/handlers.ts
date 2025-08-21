import { http, HttpResponse, delay } from 'msw';
import { DEFAULT_EMBED_SERVICE_URL } from '../contexts/QueryContext';
import { getCurrentScenario } from './scenarios';

export const handlers = [
  // Mock the passport score endpoint
  http.get(`${DEFAULT_EMBED_SERVICE_URL}/api/v1/score/:scorerId/:address`, async ({ params }) => {
    // Add realistic delay
    await delay(300);
    
    const scenario = getCurrentScenario();
    
    // Check if this is a rate-limited scenario
    if (scenario.verificationBehavior === 'rate-limit') {
      return new HttpResponse(null, { 
        status: 429,
        statusText: 'Too Many Requests',
        headers: {
          'Retry-After': '60'
        }
      });
    }
    
    // Return the scenario's passport score
    return HttpResponse.json({
      ...scenario.passportScore,
      address: params.address as string,
      lastScoreTimestamp: new Date(),
      expirationTimestamp: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
  }),

  // Mock verify credentials endpoint
  http.post(`${DEFAULT_EMBED_SERVICE_URL}/api/v1/verify/:scorerId/:address`, async ({ request, params }) => {
    await delay(500);
    
    const scenario = getCurrentScenario();
    const body = await request.json() as { credentialIds?: string[] };
    
    // Handle different verification behaviors
    switch (scenario.verificationBehavior) {
      case 'rate-limit':
        return new HttpResponse(null, { 
          status: 429,
          statusText: 'Too Many Requests' 
        });
        
      case 'failure':
        return new HttpResponse(
          JSON.stringify({ 
            error: 'Verification failed',
            message: 'Unable to verify credentials at this time'
          }), 
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          }
        );
        
      case 'success':
      default:
        if (!scenario.canAddStamps) {
          // Return current score without changes
          return HttpResponse.json({
            ...scenario.passportScore,
            address: params.address as string,
            lastScoreTimestamp: new Date(),
            expirationTimestamp: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          });
        }
        
        // Add new stamps and increase score
        const newStamps = body.credentialIds?.reduce((acc, id) => ({
          ...acc,
          [id]: { score: 3.5, dedup: true, expirationDate: new Date() }
        }), {}) || {};
        
        const newStampScore = Object.values(newStamps).reduce((sum, stamp) => sum + stamp.score, 0);
        const updatedScore = scenario.passportScore.score + newStampScore;
        
        return HttpResponse.json({
          ...scenario.passportScore,
          address: params.address as string,
          score: updatedScore,
          passingScore: updatedScore >= scenario.passportScore.threshold,
          stamps: {
            ...scenario.passportScore.stamps,
            ...newStamps
          },
          lastScoreTimestamp: new Date(),
          expirationTimestamp: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });
    }
  }),

  // Mock platform verification endpoints (for individual stamp verification)
  http.post(`${DEFAULT_EMBED_SERVICE_URL}/api/v1/platform/:platform/verify`, async ({ params }) => {
    await delay(400);
    
    const scenario = getCurrentScenario();
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