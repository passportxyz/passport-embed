/**
 * K6 Load Test for Embed Service
 *
 * This script tests the embed service's auto-verify and score endpoints
 * using addresses with actual on-chain stamps.
 *
 * Usage:
 *   # Basic test
 *   k6 run --env EMBED_API_URL=https://embed.staging.passport.xyz \
 *          --env API_KEY=your-api-key \
 *          --env SCORER_ID=12345 \
 *          load-tests/embed-load-test.js
 *
 *   # With custom address list
 *   k6 run --env ADDRESSES_FILE=addresses.json load-tests/embed-load-test.js
 *
 *   # Smoke test (1 VU, 30s)
 *   k6 run --stage 30s:1 load-tests/embed-load-test.js
 *
 *   # Load test (ramp to 100 VUs over 2m, hold 5m, ramp down 2m)
 *   k6 run --stage 2m:100 --stage 5m:100 --stage 2m:0 load-tests/embed-load-test.js
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// Custom metrics
const scoreGetErrors = new Rate('score_get_errors');
const autoVerifyErrors = new Rate('auto_verify_errors');
const scoreGetDuration = new Trend('score_get_duration');
const autoVerifyDuration = new Trend('auto_verify_duration');

// Configuration from environment variables
const EMBED_API_URL = __ENV.EMBED_API_URL || 'https://embed.staging.passport.xyz';
const API_KEY = __ENV.API_KEY;
const SCORER_ID = __ENV.SCORER_ID;
const ADDRESSES_FILE = __ENV.ADDRESSES_FILE || './addresses.json';

// Load addresses from file
let addresses;
try {
  const addressesData = open(ADDRESSES_FILE);
  addresses = JSON.parse(addressesData);
  if (!Array.isArray(addresses)) {
    throw new Error('Addresses file must contain a JSON array');
  }
} catch (e) {
  console.error(`Failed to load addresses from ${ADDRESSES_FILE}: ${e.message}`);
  console.error('Please provide addresses via --env ADDRESSES_FILE=path/to/addresses.json');
  throw e;
}

// Validate required config
if (!API_KEY) {
  throw new Error('API_KEY environment variable is required');
}
if (!SCORER_ID) {
  throw new Error('SCORER_ID environment variable is required');
}

console.log(`Loaded ${addresses.length} addresses for testing`);
console.log(`API URL: ${EMBED_API_URL}`);
console.log(`Scorer ID: ${SCORER_ID}`);

// Test configuration
export const options = {
  // Default stages (can be overridden with --stage CLI args)
  stages: [
    { duration: '2m', target: 20 },   // Ramp up to 20 VUs over 2 minutes
    { duration: '5m', target: 20 },   // Hold at 20 VUs for 5 minutes
    { duration: '2m', target: 0 },    // Ramp down over 2 minutes
  ],

  // Thresholds
  thresholds: {
    http_req_failed: ['rate<0.05'],        // <5% error rate
    http_req_duration: ['p(95)<2000'],     // 95% of requests <2s
    score_get_duration: ['p(95)<1000'],    // 95% of score gets <1s
    auto_verify_duration: ['p(95)<3000'],  // 95% of auto-verifies <3s
  },
};

// Helper function to get random address from pool
function getRandomAddress() {
  return addresses[Math.floor(Math.random() * addresses.length)];
}

// Test scenario
export default function () {
  const address = getRandomAddress();
  const headers = {
    'X-API-KEY': API_KEY,
    'Content-Type': 'application/json',
  };

  // Test 1: GET /embed/score/{scorerId}/{address}
  const scoreUrl = `${EMBED_API_URL}/embed/score/${SCORER_ID}/${address}`;
  const scoreStartTime = new Date();
  const scoreResponse = http.get(scoreUrl, { headers });
  scoreGetDuration.add(new Date() - scoreStartTime);

  const scoreSuccess = check(scoreResponse, {
    'score GET status is 200': (r) => r.status === 200,
    'score GET has score field': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.score !== undefined;
      } catch {
        return false;
      }
    },
  });
  scoreGetErrors.add(!scoreSuccess);

  // Small delay between requests
  sleep(0.1);

  // Test 2: POST /embed/auto-verify
  const autoVerifyUrl = `${EMBED_API_URL}/embed/auto-verify`;
  const autoVerifyPayload = JSON.stringify({
    address: address,
    scorerId: SCORER_ID,
  });

  const autoVerifyStartTime = new Date();
  const autoVerifyResponse = http.post(autoVerifyUrl, autoVerifyPayload, { headers });
  autoVerifyDuration.add(new Date() - autoVerifyStartTime);

  const autoVerifySuccess = check(autoVerifyResponse, {
    'auto-verify POST status is 200': (r) => r.status === 200,
    'auto-verify POST has score': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.score !== undefined;
      } catch {
        return false;
      }
    },
  });
  autoVerifyErrors.add(!autoVerifySuccess);

  // Log errors for debugging
  if (!scoreSuccess) {
    console.error(`Score GET failed for ${address}: ${scoreResponse.status} ${scoreResponse.body}`);
  }
  if (!autoVerifySuccess) {
    console.error(`Auto-verify failed for ${address}: ${autoVerifyResponse.status} ${autoVerifyResponse.body}`);
  }

  // Think time between iterations
  sleep(1);
}

// Setup function (runs once at start)
export function setup() {
  console.log('Starting load test...');
  console.log(`Testing with ${addresses.length} addresses`);
  return { startTime: new Date() };
}

// Teardown function (runs once at end)
export function teardown(data) {
  const duration = (new Date() - data.startTime) / 1000;
  console.log(`Load test completed in ${duration.toFixed(2)} seconds`);
}
