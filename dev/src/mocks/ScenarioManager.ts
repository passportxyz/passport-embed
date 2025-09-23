import { scenarios, Scenario } from "./scenarios";
import { HttpResponse } from "msw";

interface Stamp {
  score: number;
  dedup: boolean;
  expirationDate: Date;
}

// Removed unused interface - ScoreResponse

class ScenarioManager {
  private current: string;
  private accumulatedStamps: Map<string, Record<string, Stamp>> = new Map();

  constructor() {
    // Only check URL params - simpler!
    this.current = this.detectScenario();
  }

  detectScenario(): string {
    // URL params only - no localStorage complexity
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const urlScenario = urlParams.get("scenario");
      return urlScenario && scenarios[urlScenario] ? urlScenario : "default";
    }
    return "default";
  }

  switchScenario(name: string): void {
    if (!scenarios[name]) {
      console.warn(`Unknown scenario: ${name}`);
      return;
    }
    this.current = name;
    // Clear accumulated stamps when switching scenarios
    this.accumulatedStamps.clear();
    // No reload needed - we'll invalidate React Query cache instead
    const url = new URL(window.location.href);
    url.searchParams.set("scenario", name);
    window.history.pushState({}, "", url);
  }

  getCurrentScenario(): Scenario {
    // Always re-detect the scenario from URL to handle navigation
    this.current = this.detectScenario();
    return scenarios[this.current];
  }

  // Encapsulate all response generation logic
  getScoreResponse(address: string): Record<string, unknown> {
    const scenario = this.getCurrentScenario();

    // Handle rate limiting
    if (scenario.verificationBehavior === "rate-limit") {
      throw new HttpResponse(null, {
        status: 429,
        statusText: "Too Many Requests",
        headers: { "Retry-After": "60" },
      });
    }

    // Get the accumulated stamps for this scenario, or use base stamps
    const scenarioKey = `${this.current}_${address}`;
    const currentStamps = this.accumulatedStamps.get(scenarioKey) || scenario.passportScore.stamps;

    // Calculate the total score from current stamps
    const totalScore = Object.values(currentStamps).reduce((sum, stamp) => sum + stamp.score, 0);

    // Convert stamps to API format with snake_case
    const apiStamps: Record<string, { score: string; expiration_date: string; dedup: boolean }> = {};
    Object.entries(currentStamps).forEach(([key, stamp]) => {
      apiStamps[key] = {
        score: stamp.score.toString(),
        expiration_date: stamp.expirationDate.toISOString(),
        dedup: stamp.dedup,
      };
    });

    // Return score data in API format (snake_case)
    // Note: GET score endpoint does not include credentialErrors
    return {
      address,
      score: totalScore.toString(),
      passing_score: totalScore >= scenario.passportScore.threshold,
      last_score_timestamp: new Date().toISOString(),
      expiration_timestamp: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      threshold: scenario.passportScore.threshold.toString(),
      stamps: apiStamps,
    };
  }

  getVerifyResponse(address: string, credentialIds?: string[]): Record<string, unknown> {
    const scenario = this.getCurrentScenario();

    // Handle different verification behaviors
    switch (scenario.verificationBehavior) {
      case "rate-limit":
        throw new HttpResponse(null, {
          status: 429,
          statusText: "Too Many Requests",
        });

      case "failure":
        throw new HttpResponse(
          JSON.stringify({
            error: "Verification failed",
            message: "Unable to verify credentials at this time",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );

      case "partial-failure": {
        // Return success with credentialErrors for partial failures
        const response = this.getSuccessfulVerificationResponse(address, credentialIds, scenario);
        return {
          ...response,
          credentialErrors: scenario.verificationErrors || [],
        };
      }

      case "success":
      default: {
        const response = this.getSuccessfulVerificationResponse(address, credentialIds, scenario);
        // For success scenarios, include empty credentialErrors array
        return {
          ...response,
          credentialErrors: [],
        };
      }
    }
  }

  private getSuccessfulVerificationResponse(
    address: string,
    credentialIds: string[] | undefined,
    scenario: Scenario
  ): Record<string, unknown> {
    if (!scenario.canAddStamps) {
      return this.getScoreResponse(address);
    }

    // Get existing accumulated stamps or start with base stamps
    const scenarioKey = `${this.current}_${address}`;
    const existingStamps = this.accumulatedStamps.get(scenarioKey) || scenario.passportScore.stamps;

    // Add new stamps logic
    const newStamps =
      credentialIds?.reduce(
        (acc, id) => ({
          ...acc,
          [id]: { score: 3.5, dedup: true, expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) },
        }),
        {} as Record<string, Stamp>
      ) || {};

    // Combine existing and new stamps
    const allStamps = {
      ...existingStamps,
      ...newStamps,
    };

    // Save the accumulated stamps for future requests
    this.accumulatedStamps.set(scenarioKey, allStamps);

    // Calculate the total score from all stamps
    const updatedScore = Object.values(allStamps).reduce((sum, stamp) => sum + stamp.score, 0);

    // Convert stamps to API format with snake_case
    const apiStamps: Record<string, { score: string; expiration_date: string; dedup: boolean }> = {};
    Object.entries(allStamps).forEach(([key, stamp]) => {
      apiStamps[key] = {
        score: stamp.score.toString(),
        expiration_date: stamp.expirationDate.toISOString(),
        dedup: stamp.dedup,
      };
    });

    // Return updated score data in API format (snake_case)
    return {
      address,
      score: updatedScore.toString(),
      passing_score: updatedScore >= scenario.passportScore.threshold,
      last_score_timestamp: new Date().toISOString(),
      expiration_timestamp: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      threshold: scenario.passportScore.threshold.toString(),
      stamps: apiStamps,
    };
  }
}

export const scenarioManager = new ScenarioManager();
