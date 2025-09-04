# MSW Dev Environment Testing

## MSW Dev Environment Successful State

**Date:** 2025-08-28  
The Passport widget test environment shows the successful "Congratulations" screen when a user passes the threshold. The UI displays:

- Header shows "CONGRATULATIONS" with green checkmark and score "25"
- Body shows congratulatory message: "You have proven your unique humanity. Please proceed!"
- Mock wallet selector is visible at top showing "Mock Wallet (Testing)"
- Orange "MSW Active" badge in bottom-left indicates MSW is running
- MSW Scenario switcher in bottom-right shows "Normal user with good score" scenario
- Debug info below widget shows passport score of 25.5, threshold of 20, and passing status true
- Individual stamp data visible (Google: 5, Twitter: 4.5, GitHub: 5.5) with expiration dates

**Related files:**

- `dev/src/mocks/scenarios.ts`
- `src/components/Body/CongratsBody.tsx`
