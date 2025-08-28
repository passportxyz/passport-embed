import { scenarios, Scenario } from './scenarios';
import { HttpResponse } from 'msw';

interface Stamp {
  score: number;
  dedup: boolean;
  expirationDate: Date;
}

interface ScoreResponse {
  address: string;
  score: number;
  passingScore: boolean;
  threshold: number;
  stamps: Record<string, Stamp>;
  lastScoreTimestamp: Date;
  expirationTimestamp: Date;
}

class ScenarioManager {
  private current: string;

  constructor() {
    // Only check URL params - simpler!
    this.current = this.detectScenario();
  }
  
  detectScenario(): string {
    // URL params only - no localStorage complexity
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlScenario = urlParams.get('scenario');
      return (urlScenario && scenarios[urlScenario]) ? urlScenario : 'default';
    }
    return 'default';
  }
  
  switchScenario(name: string): void {
    if (!scenarios[name]) {
      console.warn(`Unknown scenario: ${name}`);
      return;
    }
    this.current = name;
    // No reload needed - we'll invalidate React Query cache instead
    const url = new URL(window.location.href);
    url.searchParams.set('scenario', name);
    window.history.pushState({}, '', url);
  }
  
  getCurrentScenario(): Scenario {
    return scenarios[this.current];
  }
  
  // Encapsulate all response generation logic
  getScoreResponse(address: string): ScoreResponse {
    const scenario = this.getCurrentScenario();
    
    // Handle rate limiting
    if (scenario.verificationBehavior === 'rate-limit') {
      throw new HttpResponse(null, { 
        status: 429,
        statusText: 'Too Many Requests',
        headers: { 'Retry-After': '60' }
      });
    }
    
    // Return score data
    return {
      ...scenario.passportScore,
      address,
      lastScoreTimestamp: new Date(),
      expirationTimestamp: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    };
  }
  
  getVerifyResponse(address: string, credentialIds?: string[]): ScoreResponse {
    const scenario = this.getCurrentScenario();
    
    // Handle different verification behaviors
    switch (scenario.verificationBehavior) {
      case 'rate-limit':
        throw new HttpResponse(null, { 
          status: 429,
          statusText: 'Too Many Requests' 
        });
        
      case 'failure':
        throw new HttpResponse(
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
          return this.getScoreResponse(address);
        }
        
        // Add new stamps logic
        const newStamps = credentialIds?.reduce((acc, id) => ({
          ...acc,
          [id]: { score: 3.5, dedup: true, expirationDate: new Date() }
        }), {} as Record<string, Stamp>) || {};
        
        const newStampScore = Object.values(newStamps).reduce((sum, stamp) => sum + stamp.score, 0);
        const updatedScore = scenario.passportScore.score + newStampScore;
        
        return {
          ...scenario.passportScore,
          address,
          score: updatedScore,
          passingScore: updatedScore >= scenario.passportScore.threshold,
          stamps: {
            ...scenario.passportScore.stamps,
            ...newStamps
          },
          lastScoreTimestamp: new Date(),
          expirationTimestamp: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        };
    }
  }
}

export const scenarioManager = new ScenarioManager();