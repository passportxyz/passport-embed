// Define test scenarios for MSW

interface Stamp {
  score: number;
  dedup: boolean;
  expirationDate: Date;
}

interface PassportScore {
  address: string;
  score: number;
  passingScore: boolean;
  threshold: number;
  stamps: Record<string, Stamp>;
}

export interface Scenario {
  name: string;
  description: string;
  passportScore: PassportScore;
  verificationBehavior: "success" | "failure" | "rate-limit";
  canAddStamps: boolean;
  stampPagesBehavior?: "success" | "error" | "config-error" | "not-found" | "rate-limit";
}

export const scenarios: Record<string, Scenario> = {
  "low-score": {
    name: "low-score",
    description: "User with score below threshold",
    passportScore: {
      address: "0x1234567890123456789012345678901234567890",
      score: 12.5,
      passingScore: false,
      threshold: 20,
      stamps: {
        Google: { score: 5.0, dedup: true, expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) },
        Twitter: { score: 4.5, dedup: true, expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) },
        GitHub: { score: 3.0, dedup: false, expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) },
      },
    },
    verificationBehavior: "success",
    canAddStamps: true,
  },

  "high-score": {
    name: "high-score",
    description: "User with score above threshold",
    passportScore: {
      address: "0x1234567890123456789012345678901234567890",
      score: 25.0,
      passingScore: true,
      threshold: 20,
      stamps: {
        Google: { score: 5.0, dedup: true, expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) },
        Twitter: { score: 4.5, dedup: true, expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) },
        GitHub: { score: 6.0, dedup: true, expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) },
        LinkedIn: { score: 5.0, dedup: true, expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) },
        Discord: { score: 4.5, dedup: true, expirationDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) },
      },
    },
    verificationBehavior: "success",
    canAddStamps: true,
  },
};
