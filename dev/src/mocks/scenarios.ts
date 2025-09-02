// Define different test scenarios for MSW

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
  verificationBehavior: 'success' | 'failure' | 'rate-limit';
  canAddStamps: boolean;
  stampPagesBehavior?: 'success' | 'error' | 'config-error' | 'not-found' | 'rate-limit';
}

export const scenarios: Record<string, Scenario> = {
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
  
  'stamps-fetch-error': {
    name: 'stamps-fetch-error',
    description: 'Server error fetching stamp pages',
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
    stampPagesBehavior: 'error',
  },
  
  'stamps-config-error': {
    name: 'stamps-config-error',
    description: 'Invalid API key for stamp pages',
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
    verificationBehavior: 'success',
    canAddStamps: true,
    stampPagesBehavior: 'config-error',
  },
  
  'stamps-not-found': {
    name: 'stamps-not-found',
    description: 'Scorer not found for stamp pages',
    passportScore: {
      address: '0x1234567890123456789012345678901234567890',
      score: 10,
      passingScore: false,
      threshold: 20,
      stamps: {
        'Google': { score: 5.0, dedup: true, expirationDate: new Date() },
        'Twitter': { score: 5.0, dedup: true, expirationDate: new Date() },
      }
    },
    verificationBehavior: 'success',
    canAddStamps: true,
    stampPagesBehavior: 'not-found',
  },
  
  'stamps-rate-limited': {
    name: 'stamps-rate-limited',
    description: 'Rate limited on stamp pages endpoint',
    passportScore: {
      address: '0x1234567890123456789012345678901234567890',
      score: 14,
      passingScore: false,
      threshold: 20,
      stamps: {
        'Google': { score: 5.0, dedup: true, expirationDate: new Date() },
        'Twitter': { score: 4.5, dedup: true, expirationDate: new Date() },
        'GitHub': { score: 4.5, dedup: false, expirationDate: new Date() },
      }
    },
    verificationBehavior: 'success',
    canAddStamps: false,
    stampPagesBehavior: 'rate-limit',
  },
};