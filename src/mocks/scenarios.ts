// Define different test scenarios for MSW
export type ScenarioName = 
  | 'default'
  | 'low-score'
  | 'high-score'
  | 'no-stamps'
  | 'rate-limited'
  | 'verification-fails'
  | 'verification-adds-stamps'
  | 'near-threshold';

export interface Scenario {
  name: ScenarioName;
  description: string;
  passportScore: {
    address: string;
    score: number;
    passingScore: boolean;
    threshold: number;
    stamps: Record<string, { score: number; dedup: boolean; expirationDate: Date }>;
  };
  verificationBehavior?: 'success' | 'failure' | 'rate-limit';
  canAddStamps?: boolean;
}

// Define all available scenarios
export const scenarios: Record<ScenarioName, Scenario> = {
  default: {
    name: 'default',
    description: 'Normal user with good score',
    passportScore: {
      address: '0x1234567890123456789012345678901234567890',
      score: 25.5,
      passingScore: true,
      threshold: 20,
      stamps: {
        'Google': { score: 5.0, dedup: true, expirationDate: new Date() },
        'Twitter': { score: 4.5, dedup: true, expirationDate: new Date() },
        'GitHub': { score: 6.0, dedup: false, expirationDate: new Date() },
        'LinkedIn': { score: 10.0, dedup: true, expirationDate: new Date() },
      }
    },
    verificationBehavior: 'success',
    canAddStamps: true,
  },
  
  'low-score': {
    name: 'low-score',
    description: 'User below threshold',
    passportScore: {
      address: '0x1234567890123456789012345678901234567890',
      score: 12.5,
      passingScore: false,
      threshold: 20,
      stamps: {
        'Google': { score: 5.0, dedup: true, expirationDate: new Date() },
        'Twitter': { score: 4.5, dedup: true, expirationDate: new Date() },
        'GitHub': { score: 3.0, dedup: false, expirationDate: new Date() },
      }
    },
    verificationBehavior: 'success',
    canAddStamps: true,
  },
  
  'high-score': {
    name: 'high-score',
    description: 'Power user with many stamps',
    passportScore: {
      address: '0x1234567890123456789012345678901234567890',
      score: 45.5,
      passingScore: true,
      threshold: 20,
      stamps: {
        'Google': { score: 5.0, dedup: true, expirationDate: new Date() },
        'Twitter': { score: 4.5, dedup: true, expirationDate: new Date() },
        'GitHub': { score: 6.0, dedup: true, expirationDate: new Date() },
        'LinkedIn': { score: 10.0, dedup: true, expirationDate: new Date() },
        'Discord': { score: 5.0, dedup: true, expirationDate: new Date() },
        'Telegram': { score: 3.0, dedup: true, expirationDate: new Date() },
        'Facebook': { score: 4.0, dedup: true, expirationDate: new Date() },
        'Instagram': { score: 3.0, dedup: true, expirationDate: new Date() },
        'Reddit': { score: 5.0, dedup: true, expirationDate: new Date() },
      }
    },
    verificationBehavior: 'success',
    canAddStamps: true,
  },
  
  'no-stamps': {
    name: 'no-stamps',
    description: 'New user with no stamps',
    passportScore: {
      address: '0x1234567890123456789012345678901234567890',
      score: 0,
      passingScore: false,
      threshold: 20,
      stamps: {}
    },
    verificationBehavior: 'success',
    canAddStamps: true,
  },
  
  'rate-limited': {
    name: 'rate-limited',
    description: 'API rate limiting active',
    passportScore: {
      address: '0x1234567890123456789012345678901234567890',
      score: 20,
      passingScore: true,
      threshold: 20,
      stamps: {
        'Google': { score: 20.0, dedup: true, expirationDate: new Date() },
      }
    },
    verificationBehavior: 'rate-limit',
    canAddStamps: false,
  },
  
  'verification-fails': {
    name: 'verification-fails',
    description: 'Stamp verification always fails',
    passportScore: {
      address: '0x1234567890123456789012345678901234567890',
      score: 15,
      passingScore: false,
      threshold: 20,
      stamps: {
        'Google': { score: 5.0, dedup: true, expirationDate: new Date() },
        'Twitter': { score: 4.5, dedup: true, expirationDate: new Date() },
        'GitHub': { score: 5.5, dedup: false, expirationDate: new Date() },
      }
    },
    verificationBehavior: 'failure',
    canAddStamps: false,
  },
  
  'verification-adds-stamps': {
    name: 'verification-adds-stamps',
    description: 'Can successfully add new stamps',
    passportScore: {
      address: '0x1234567890123456789012345678901234567890',
      score: 18,
      passingScore: false,
      threshold: 20,
      stamps: {
        'Google': { score: 5.0, dedup: true, expirationDate: new Date() },
        'Twitter': { score: 4.5, dedup: true, expirationDate: new Date() },
        'GitHub': { score: 8.5, dedup: false, expirationDate: new Date() },
      }
    },
    verificationBehavior: 'success',
    canAddStamps: true,
  },
  
  'near-threshold': {
    name: 'near-threshold',
    description: 'Just below passing threshold',
    passportScore: {
      address: '0x1234567890123456789012345678901234567890',
      score: 19.5,
      passingScore: false,
      threshold: 20,
      stamps: {
        'Google': { score: 5.0, dedup: true, expirationDate: new Date() },
        'Twitter': { score: 4.5, dedup: true, expirationDate: new Date() },
        'GitHub': { score: 6.0, dedup: false, expirationDate: new Date() },
        'LinkedIn': { score: 4.0, dedup: true, expirationDate: new Date() },
      }
    },
    verificationBehavior: 'success',
    canAddStamps: true,
  },
};

// Helper to get current scenario from localStorage or URL
export function getCurrentScenario(): Scenario {
  // Check URL parameter first
  if (typeof window !== 'undefined') {
    const urlParams = new URLSearchParams(window.location.search);
    const scenarioName = urlParams.get('scenario') as ScenarioName;
    if (scenarioName && scenarios[scenarioName]) {
      return scenarios[scenarioName];
    }
    
    // Check localStorage
    const stored = localStorage.getItem('msw-scenario') as ScenarioName;
    if (stored && scenarios[stored]) {
      return scenarios[stored];
    }
  }
  
  return scenarios.default;
}

// Helper to set scenario
export function setScenario(name: ScenarioName) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('msw-scenario', name);
    // Optionally reload to apply new scenario
    window.location.reload();
  }
}