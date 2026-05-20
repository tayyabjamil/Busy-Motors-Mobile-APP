# carScrap — State Management

## Overview

Redux Toolkit + Redux-Saga + Redux-Persist.

- **Redux Toolkit** — slices with `createSlice`; no manual action creators
- **Redux-Saga** — all async side effects (API calls) handled in sagas
- **Redux-Persist** — persists selected slices to AsyncStorage across app restarts
- **No RTK Query** — sagas call raw Axios functions from `redux/api.js`

## Store Configuration

**File:** `scr/redux/store.js`

```js
// Key decisions:
// - serializableCheck disabled (saga compatibility)
// - thunk middleware disabled (sagas handle async)
// - redux-persist wraps root reducer
```

**Persisted slices:**
```
auth, carListings, user, profileUpdate,
favourite, favListings, viewCount, qoute, getQuoteData
```

`notificationsSlice` and `subcriptionsSlice` are NOT persisted (always fetched fresh).

## Slices

### 1. `authSlice.js`

**State:**
```js
{
  loading: false,
  user: null,
  error: null,
  registerResponse: null,
  loginResponse: null,
  token: null,         // JWT — persisted
  deviceId: null,
  guestLoading: false,
}
```

**Actions:**
- `loginRequest` / `loginSuccess` / `loginFailure`
- `registerRequest` / `registerSuccess` / `registerFailure`
- `guestLoginRequest` / `guestLoginSuccess` / `guestLoginFailure`
- `logout` — clears token + user
- `resetRegisterResponse`

---

### 2. `carListingsSlice.js`

**State:** `{ loading, data: [], error }`

**Actions:** `getUserRequest` / `getUserSuccess` / `getUserFailure`

Saga fetches `GET /car/get-all-listing` on `getUserRequest`.

---

### 3. `userDetail.js`

**State:** `{ loading, data: null, error }`

**Actions:** `fetchUserRequest` / `fetchUserSuccess` / `fetchUserFailure`

Saga fetches `GET /auth/get-user-details`.

---

### 4. `favouriteSlice.js`

**State:** `{ loading, favorites: [], error }`

**Actions:** `toggleFavoriteRequest` / `toggleFavoriteSuccess` / `toggleFavoriteFailure`

Saga calls `POST /auth/add-to-saved/{carId}`.

---

### 5. `favouriteListingSlice.js`

**State:** `{ loading, data: [], error }`

Saga fetches `GET /auth/list-all-saved`.

---

### 6. `qouteSlice.js`  *(typo: should be quoteSlice)*

**State:** `{ loading, data: null, error }`

**Actions:** `sendQuoteRequest` / `sendQuoteSuccess` / `sendQuoteFailure`

Saga calls `POST /quotes/create`.

---

### 7. `qouteDataSlice.js`

**State:** `{ loading, data: [], error }`

Saga fetches `GET /quotes/agent/{userId}`.

---

### 8. `notificationsSlice.js`

**State:**
```js
{
  notifications: [],
  loading: false,
  error: null,
  page: 1,
  hasMore: true,
  refreshTrigger: 0,   // increment to force re-fetch
  unreadCount: 0,
}
```

**Actions:**
- `setNotificationsLoading`
- `setNotifications` — replaces list (page 1 refresh)
- `appendNotifications` — adds to list (pagination)
- `setPagination` — updates `page` + `hasMore`
- `triggerNotificationsRefresh` — increments `refreshTrigger`
- `setUnreadCount`

Supports infinite scroll pagination. Not persisted.

---

### 9. `subcriptionsSlice.js`  *(typo: should be subscriptionsSlice)*

**State:**
```js
{
  loading: false,
  subscriptionData: null,
  error: null,
  activeSubscriptions: [],
}
```

**Actions:**
- `checkSubscriptionRequest` / `checkSubscriptionSuccess` / `checkSubscriptionFailure`
- `setActiveSubscriptions`
- `updateActiveSubscriptions`

Integrates with RevenueCat. Subscription check triggered on login. Not persisted.

---

### 10. `userProfileUpdateSlice.js`

**State:** `{ loading, data: null, error }`

Saga calls `PUT /auth/update-user-profile` (multipart/form-data).

---

### 11. `viewCount.js`

**State:** `{ loading, data: null, error }`

Saga calls `POST /car/{carId}/view` to increment view count.

---

## Sagas

All sagas live in `scr/redux/sagas/`. Root saga combines them with `all([])`.

| Saga File | Watches | API Call |
|---|---|---|
| `authSaga.js` | `loginRequest`, `guestLoginRequest`, `registerRequest` | `/auth/login`, `/auth/guest-login`, `/auth/register` |
| `carListingsSaga.js` | `getUserRequest` | `GET /car/get-all-listing` |
| `userDetailSaga.js` | `fetchUserRequest` | `GET /auth/get-user-details` |
| `userProfileUpdateSage.js` | profile update action | `PUT /auth/update-user-profile` |
| `favouriteSaga.js` | `toggleFavoriteRequest` | `POST /auth/add-to-saved/{id}` |
| `favListingsSaga.js` | fav listing fetch action | `GET /auth/list-all-saved` |
| `qouteSaga.js` | `sendQuoteRequest` | `POST /quotes/create` |
| `qouteDataSaga.js` | quote data fetch action | `GET /quotes/agent/{userId}` |
| `viewCountSaga.js` | view count action | `POST /car/{carId}/view` |
| `subcriptionsSaga.js` | `checkSubscriptionRequest` | RevenueCat SDK call |

**Pattern used in every saga:**
```js
function* handleX(action) {
  try {
    const response = yield call(apiFunction, action.payload);
    yield put(xSuccess(response));
  } catch (error) {
    yield put(xFailure(error.message));
  }
}

function* watchX() {
  yield takeLatest(xRequest.type, handleX);
}
```

## Persistence

**Library:** `redux-persist` v6 with `AsyncStorage`

**Not persisted:** `notifications`, `subscriptions` (always fetched fresh on mount)

**Rehydration:** `PersistGate` in `App.tsx` delays rendering until state is rehydrated from AsyncStorage.

## Common Dispatch Patterns (component side)

```js
// Trigger login
dispatch(loginRequest({ email, password }));

// Trigger data fetch
dispatch(getUserRequest());

// Refresh notifications (force re-fetch)
dispatch(triggerNotificationsRefresh());

// Logout
dispatch(logout());
```

## Known State Issues

- No token refresh logic — expired JWT requires re-login
- `notificationsSlice.refreshTrigger` is a workaround for manual refresh (increment to trigger useEffect)
- Subscriptions only checked on login, not on app resume or foreground
- Sagas log sensitive data (tokens, full API responses) via `console.log`
