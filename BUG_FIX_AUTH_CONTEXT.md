# Bug Fix Report: Authentication Context & Experiment Analysis

## Issue Description
1. **Analytics Visibility:** User could not see previous quiz analytics in the experiment simulation section.
2. **Login State:** User was asked to login even when already logged in ("login to view analysis").
3. **Data Verification:** User wanted to know where data is stored in MongoDB.
4. **Token Usage:** User asked how tokens are being used in the app.

## Root Cause Analysis
- **Missing User ID:** The `AuthContext.tsx` was using a mock implementation that only checked for `nmmsUser` in `localStorage`.
- **Inconsistent Storage:** The `Login.tsx` page stores user data in `currentUser` and `student` keys in `localStorage`, while `LoginStudent.tsx` stores it in `Login_student`.
- **Result:** Assuming `nmmsUser` was missing (since real login was used), `useAuth()` returned `null` for the user.
- **Consequences:**
    - `LabQuiz.tsx` defaulted to "guest" user.
    - `ExperimentAnalytics.tsx` saw no user and displayed the "Login Required" screen.

## Fix Implementation
Modified `src/contexts/AuthContext.tsx` to:
1.  Check `localStorage` for `currentUser` (set by main login page).
2.  Check `localStorage` for `Login_student` (set by alternative student login page) as a fallback.
3.  Retain check for `nmmsUser` (mock/demo login).
4.  Correctly parse the stored JSON and map `_id` or `studentId` to the standard `user.id` property used by the app.

## Verification
- Validated that `ExperimentAttempt` model in MongoDB saves the data correctly in the `experimentattempts` collection.
- Verified parsing logic with test script covering all login scenarios.

## Token Usage Explanation
- **Current State:** The experiment quiz submission (`/api/experiments/attempt`) and analytics (`/api/experiments/analytics/:studentId`) endpoints are currently public and do not require an Authentication Token (JWT) in the header.
- **Mechanism:** They rely on the `studentId` passed in the request body (for submission) or URL parameters (for analytics).
- **Security:** While the login process returns a token (stored in `localStorage` inside the user object), it is not actively strictly enforced for this specific feature's API routes. The application relies on client-side state correctly providing the `studentId`.
