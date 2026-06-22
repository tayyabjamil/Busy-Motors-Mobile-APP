# carScrap — Known Issues

## Critical

### Android Release Uses Debug Keystore
**File:** `android/app/build.gradle`

```gradle
buildTypes {
  release {
    signingConfig = signingConfigs.debug   // ← wrong
  }
}
```

Release builds are signed with the debug keystore. This will be **rejected by Google Play Store**. A production release keystore must be generated and configured before any Android Play Store submission.

---

### Dual Axios Instances — Auth Headers May Not Propagate
**Files:** `scr/redux/api.js`, `scr/Services/apiHeader.js`

Two separate Axios instances are created. `axiosHeader()` sets `Authorization` and `device-id` on the instance in `apiHeader.js`, but the instance in `api.js` (used by all saga API calls) is a different object. If they don't share the same instance, API calls made through `api.js` may not include auth headers after login.

---

## High Priority

### No Token Refresh Mechanism
**Files:** `scr/redux/sagas/authSaga.js`, `scr/Services/apiHeader.js`

When the JWT token expires, the app silently fails on authenticated requests. There is no interceptor to detect 401 responses and trigger a token refresh or force logout. Users may see confusing empty states or errors instead of a re-login prompt.

**Fix needed:** Axios response interceptor that catches 401 → dispatches `logout()` or calls a refresh endpoint.

---

### No Global Error Interceptor
**File:** `scr/redux/api.js`

Each saga has its own try/catch but there are no Axios request/response interceptors. This means:
- No centralized 401 handling
- No centralized network error feedback
- No retry logic on transient failures
- No loading state cleanup if a saga throws unexpectedly

---

### Sensitive Data Logged to Console
**Files:** All saga files, `api.js`

Extensive `console.log` calls output full API responses including JWT tokens, user data, and subscription info. These are visible in Metro logs and on-device via flipper/logcat.

**Fix:** Remove all `console.log` in sagas, or gate behind `__DEV__`.

---

## Medium Priority

### Subscriptions Only Checked on Login
**File:** `scr/redux/sagas/subcriptionsSaga.js`

`checkSubscriptionRequest` is only dispatched during the login flow. If a user's subscription expires while the app is running, or if they cancel and reopen the app without logging out/in, the stale subscription state from redux-persist will be used.

**Fix:** Check subscription status on `AppState` change to `active` (app foreground).

---

### Notification Tap Always Navigates to CarListings
**File:** `scr/Services/useNotitifications.js`

When a push notification is tapped, navigation is hardcoded to the `CarListings` screen regardless of the notification type or payload. There's no deep-link routing based on notification data.

---

### Deep Linking Commented Out
**File:** `scr/Navigation.js`, `scr/Components/DeepLinkingRoute.ts`

Deep linking config exists but is commented out. The `DeepLinkingRoute.ts` file defines route mappings but the `linking` prop is not wired into the NavigationContainer.

---

### Build Number Not Committed Back to Repo
**File:** `.github/workflows/release.yml` + `ios/fastlane/Fastfile`

`increment_build_number` modifies `project.pbxproj` on the CI runner but this change is never committed back to the repository. Each CI run starts from the same build number in source control, causing inconsistent/duplicate build numbers in App Store Connect.

**Fix:** Add a `git commit` + `git push` step after incrementing, or use a build number derived from `$GITHUB_RUN_NUMBER`.

---

### Both CI Lanes Run on Every Push to `main`
**File:** `.github/workflows/release.yml`

Staging and production builds both run on every push regardless of intent. There's no mechanism to run only staging (e.g., for feature branches) or only production (e.g., for release tags).

**Fix:** Gate production lane on a git tag (e.g., `v*`), or add manual workflow dispatch inputs.

---

### `continue-on-error: true` Hides Build Failures
**File:** `.github/workflows/release.yml`

Both `fastlane staging` and `fastlane production` steps have `continue-on-error: true`. A build failure will not fail the GitHub Actions run, making it invisible in PR checks or commit status badges.

---

## Low Priority / Code Quality

### Naming Inconsistencies / Typos

| Current Name | Should Be | File |
|---|---|---|
| `qouteSlice.js` | `quoteSlice.js` | `scr/redux/slices/` |
| `qouteDataSlice.js` | `quoteDataSlice.js` | `scr/redux/slices/` |
| `qouteSaga.js` | `quoteSaga.js` | `scr/redux/sagas/` |
| `qouteDataSaga.js` | `quoteDataSaga.js` | `scr/redux/sagas/` |
| `subcriptionsSlice.js` | `subscriptionsSlice.js` | `scr/redux/slices/` |
| `subcriptionsSaga.js` | `subscriptionsSaga.js` | `scr/redux/sagas/` |
| `userProfileUpdateSage.js` | `userProfileUpdateSaga.js` | `scr/redux/sagas/` |
| `useNotitifications.js` | `useNotifications.js` | `scr/Services/` |
| `Permisions.js` | `Permissions.js` | `scr/Helper/` |
| `Savage/` screen folder | `Salvage/` | `scr/Screens/` |

---

### Default `.env` Points to Production

**File:** `.env`

The default environment file (used when no `ENVFILE` is specified) points to the production API. A developer running `react-native run-ios` without specifying an env will hit the production backend.

**Fix:** Change default `.env` to point to staging or a local dev server.

---

### Stripe Key Left in `.env` Files

All `.env` files contain:
```
STRIPE_KEY=pk_test_51Gzlwo...
```

Stripe integration was removed in favor of RevenueCat, but the test key remains in all env files. This is a test key (not a live key) but should be cleaned up.

---

### No Android CI/CD

No Fastlane configuration exists for Android. Android releases require manual builds with `./gradlew assembleRelease` or `bundleRelease`, and the release signing uses the debug keystore. See [[deployment-fastlane-github-actions]] for details.

---

### No Error Boundaries

No React error boundaries are configured. An unhandled JS exception in any screen will crash the entire app with the default RN red screen in dev, or a white screen in production.

---

### Network Logger Enabled in Production

**File:** `scr/redux/api.js`, `scr/Components/NetworkLoggerOverlay.tsx`

`react-native-network-logger` may be active in production builds, exposing all network requests (including auth tokens) through a shake-gesture overlay. This should be gated behind `__DEV__`.
