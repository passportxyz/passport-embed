import { scenarios } from './scenarios';
import { HttpResponse } from 'msw';

class ScenarioManager {
  constructor() {
    // Only check URL params - simpler!
    this.current = this.detectScenario();
  }
  
  detectScenario() {
    // URL params only - no localStorage complexity
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const urlScenario = urlParams.get('scenario');
      return (urlScenario && scenarios[urlScenario]) ? urlScenario : 'default';
    }
    return 'default';
  }
  
  switchScenario(name) {
    if (!scenarios[name]) {
      console.warn(`Unknown scenario: ${name}`);
      return;
    }
    this.current = name;
    // No reload needed - we'll invalidate React Query cache instead
    const url = new URL(window.location);
    url.searchParams.set('scenario', name);
    window.history.pushState({}, '', url);
  }
  
  getCurrentScenario() {
    return scenarios[this.current];
  }
  
  // Encapsulate all response generation logic
  getScoreResponse(address) {
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
  
  getVerifyResponse(address, credentialIds) {
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
        }), {}) || {};
        
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