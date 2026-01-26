import { scenarios, Scenario } from "./scenarios";
import { HttpResponse } from "msw";

interface Stamp {
  score: number;
  dedup: boolean;
  expirationDate: Date;
}

class ScenarioManager {
  private current: string;
  private accumulatedStamps: Map<string, Record<string, Stamp>> = new Map();

  constructor() {
    this.current = this.detectScenario();
  }

  detectScenario(): string {
    if (typeof window !== "undefined") {
      // Check URL params
      const urlParams = new URLSearchParams(window.location.search);
      const urlScenario = urlParams.get("scenario");
      if (urlScenario && scenarios[urlScenario]) {
        return urlScenario;
      }

      // Check config param (encoded JSON)
      const configParam = urlParams.get("config");
      if (configParam) {
        try {
          const config = JSON.parse(decodeURIComponent(atob(configParam)));
          if (config.scenario && scenarios[config.scenario]) {
            return config.scenario;
          }
        } catch {
          // Ignore parse errors
        }
      }
    }
    return "low-score";
  }

  switchScenario(name: string): void {
    if (!scenarios[name]) {
      console.warn(`Unknown scenario: ${name}`);
      return;
    }
    this.current = name;
    this.accumulatedStamps.clear();

    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("scenario", name);
      window.history.pushState({}, "", url);
    }
  }

  getCurrentScenario(): Scenario {
    const newScenario = this.detectScenario();
    // Clear accumulated stamps when scenario changes
    if (newScenario !== this.current) {
      this.accumulatedStamps.clear();
      this.current = newScenario;
    }
    return scenarios[this.current];
  }

  getScoreResponse(address: string): Record<string, unknown> {
    const scenario = this.getCurrentScenario();

    if (scenario.verificationBehavior === "rate-limit") {
      throw new HttpResponse(null, {
        status: 429,
        statusText: "Too Many Requests",
        headers: { "Retry-After": "60" },
      });
    }

    const scenarioKey = `${this.current}_${address}`;
    const currentStamps = this.accumulatedStamps.get(scenarioKey) || scenario.passportScore.stamps;

    const totalScore = Object.values(currentStamps).reduce((sum, stamp) => sum + stamp.score, 0);

    const apiStamps: Record<string, { score: string; expiration_date: string; dedup: boolean }> = {};
    Object.entries(currentStamps).forEach(([key, stamp]) => {
      apiStamps[key] = {
        score: stamp.score.toString(),
        expiration_date: stamp.expirationDate.toISOString(),
        dedup: stamp.dedup,
      };
    });

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

      case "success":
      default: {
        if (!scenario.canAddStamps) {
          return this.getScoreResponse(address);
        }

        const scenarioKey = `${this.current}_${address}`;
        const existingStamps = this.accumulatedStamps.get(scenarioKey) || scenario.passportScore.stamps;

        const newStamps =
          credentialIds?.reduce(
            (acc, id) => ({
              ...acc,
              [id]: { score: 3.5, dedup: true, expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) },
            }),
            {} as Record<string, Stamp>
          ) || {};

        const allStamps = {
          ...existingStamps,
          ...newStamps,
        };

        this.accumulatedStamps.set(scenarioKey, allStamps);

        const updatedScore = Object.values(allStamps).reduce((sum, stamp) => sum + stamp.score, 0);

        const apiStamps: Record<string, { score: string; expiration_date: string; dedup: boolean }> = {};
        Object.entries(allStamps).forEach(([key, stamp]) => {
          apiStamps[key] = {
            score: stamp.score.toString(),
            expiration_date: stamp.expirationDate.toISOString(),
            dedup: stamp.dedup,
          };
        });

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
  }
}

export const scenarioManager = new ScenarioManager();
