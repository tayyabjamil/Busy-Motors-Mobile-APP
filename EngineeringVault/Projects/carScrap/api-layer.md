# carScrap — API Layer

## Overview

All API calls are plain Axios functions defined in `scr/redux/api.js`. There is no RTK Query or React Query — sagas call these functions directly via `yield call(...)`.

A separate Axios instance is configured in `scr/Services/apiHeader.js` and its headers are mutated dynamically after login.


**File:** `scr/redux/api.js`

```js
import axios from 'axios';
import Config from 'react-native-config';

const axiosInstance = axios.create({
  baseURL: Config.API_URL,   // e.g. https://scrape4you-production.onrender.com/api
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});
```

**Network logging:** `react-native-network-logger` is enabled — visible via `NetworkLoggerOverlay` in the dev menu.

## Header Setup

**File:** `scr/Services/apiHeader.js`

```js
import axios from 'axios';
import DeviceInfo from 'react-native-device-info';

const axiosInstance = axios.create({ baseURL: Config.API_URL });

export const axiosHeader = async (token) => {
  const deviceId = await DeviceInfo.getUniqueId();
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  axiosInstance.defaults.headers.common['device-id'] = deviceId;
};
```

`axiosHeader()` is called by `authSaga` after a successful login to inject auth headers into all subsequent requests.

> **Note:** Two separate Axios instances exist — one in `api.js` and one in `apiHeader.js`. The auth headers set in `apiHeader.js` may not propagate to the instance in `api.js` unless they share the same instance reference. This is a potential bug.

## Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/login` | Standard email/password login |
| `POST` | `/auth/attemptLogin` | Login with device-id check (commented out in production flow) |
| `POST` | `/auth/guest-login` | Guest/anonymous login |
| `POST` | `/auth/register` | New user registration |
| `GET` | `/auth/get-user-details` | Fetch authenticated user profile |
| `PUT` | `/auth/update-user-profile` | Update profile (multipart/form-data) |

### Car Listings

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/car/get-all-listing` | Fetch all car listings |
| `POST` | `/car/{carId}/view` | Increment view count for a listing |

### Favourites

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/add-to-saved/{carId}` | Toggle car as favourite |
| `GET` | `/auth/list-all-saved` | Get user's saved/favourite listings |

### Quotes

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/quotes/create` | Send a quote/offer on a listing |
| `GET` | `/quotes/agent/{userId}` | Get all quotes for an agent/user |

### Notifications

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/notifications/list?page={n}&limit={n}` | Paginated notification list |

### Subscriptions

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/auth/save-subscription` | Save RevenueCat subscription info to backend |

## Request Headers

Every authenticated request sends:

```
Content-Type: application/json
Authorization: Bearer {token}
device-id: {uniqueDeviceId}
Cache-Control: no-cache    (certain endpoints)
```

For profile updates:
```
Content-Type: multipart/form-data
```

## Error Handling

Currently handled per-saga with try/catch:

```js
try {
  const response = yield call(loginApi, payload);
  // check response.status manually
  if (response.status === 401) {
    yield put(loginFailure('Invalid credentials'));
    return;
  }
  yield put(loginSuccess(response.data));
} catch (error) {
  yield put(loginFailure(error.message));
}
```

**No global interceptors.** Errors are dispatched into Redux slices as `error` strings.

## Environment-Based URLs

Configured via `react-native-config`:

```
# .env (default, points to production)
API_URL=https://scrape4you-production.onrender.com/api

# .env.staging
API_URL=https://scrape4you-zb9f.onrender.com/api

# .env.production
API_URL=https://scrape4you-production.onrender.com/api
```

Switch environment via npm scripts:
```bash
ENVFILE=.env.staging react-native run-ios
ENVFILE=.env.production react-native run-android
```

## RevenueCat Integration

Subscription management is handled via RevenueCat SDK (not a REST call):

```js
// subcriptionsSaga.js
import Purchases from 'react-native-purchases';

const offerings = yield call([Purchases, Purchases.getOfferings]);
const purchaserInfo = yield call([Purchases, Purchases.getCustomerInfo]);
```

After a successful RevenueCat purchase, the app calls `POST /auth/save-subscription` to sync with the backend.

**RevenueCat Key (iOS):** `appl_czoNDoTtKaWVrkOrwjVvLpsPdQC` (from `REVENUECAT_KEY` env var)

## Firebase Cloud Messaging (Push Notifications)

Not a REST call — uses `@react-native-firebase/messaging`:

```js
// Services/useNotitifications.js
messaging().onMessage(remoteMessage => { ... });          // foreground
messaging().setBackgroundMessageHandler(remoteMessage => { ... }); // background
messaging().getInitialNotification();                     // quit state
```

On notification tap → navigates to `CarListings` screen (hardcoded).

## Known API Issues

1. **Dual Axios instances** — `api.js` and `apiHeader.js` create separate instances; header mutation in one may not affect the other.
2. **No request interceptors** — auth token must be manually set via `axiosHeader()`; easy to miss after token changes.
3. **No response interceptors** — 401 responses don't automatically trigger logout or token refresh.
4. **No token refresh** — expired JWTs require the user to log in again manually.
5. **Sensitive logging** — full API responses including tokens are logged via `console.log`.
6. **Profile upload headers** — `multipart/form-data` set manually per-call; potential conflict with default `application/json`.
