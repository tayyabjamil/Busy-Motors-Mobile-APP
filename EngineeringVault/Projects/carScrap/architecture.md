# carScrap — Architecture

## High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│                   App.tsx                        │
│  Redux Provider → PersistGate → Navigation       │
└────────────────────┬────────────────────────────┘
                     │
         ┌───────────▼───────────┐
         │    Navigation.js      │
         │  (Root Stack + Tabs)  │
         └───────────┬───────────┘
                     │
        ┌────────────┴────────────┐
        │                        │
   AuthStack                 MainStack
  (unauthenticated)          (authenticated)
```

## Navigation Structure

```
Root Stack
├── Splash              ← initial route; checks auth token
│
├── Auth Stack (no token)
│   ├── Login
│   ├── Register
│   ├── ForgotPassword
│   ├── GetOTP
│   └── ResetPassword
│
└── Main Stack (has token)
    ├── MainTabs (Custom Bottom Tab Bar)
    │   ├── CarListings    ← Home feed
    │   ├── MapListings    ← Map view of listings
    │   ├── Dashboard      ← Agent/seller dashboard
    │   └── Profile        ← User profile
    │
    ├── CarDetails         ← Pushed from CarListings/MapListings
    ├── Subscriptions      ← RevenueCat paywall
    ├── Savage             ← Salvage listing details
    ├── Notifications      ← Paginated notification list
    └── QuoteMessages      ← Quote/offer chat
```

**Key files:**
- `scr/Navigation.js` — all navigator definitions
- `scr/navigationRef.js` — `navigationRef` exported for use outside React tree (e.g., Firebase notification handler)
- `scr/Components/CustomTabBar.tsx` — custom rendered tab bar UI

## Screen Inventory (16 screens)

| Screen | Path | Purpose |
|---|---|---|
| Splash | `Screens/Splash/` | Auth gate |
| Login | `Screens/Login/` | Email/password login |
| Register | `Screens/Register/` | Account creation |
| ForgotPassword | `Screens/ForgotPassword/` | Password reset initiation |
| GetOTP | `Screens/GetOTP/` | OTP input |
| ResetPassword | `Screens/ResetPassword/` | Set new password |
| CarListings | `Screens/carListings/` | Main listing feed |
| CarDetails | `Screens/CarDetails/` | Individual listing view |
| MapListings | `Screens/MapListings/` | Map-based listing view |
| Dashboard | `Screens/Dashboard/` | Agent dashboard |
| Profile | `Screens/Profile/` | User profile & settings |
| Subscriptions | `Screens/Subscriptions/` | RevenueCat subscription screen |
| Notifications | `Screens/Notifications/` | Push notification history |
| QuoteMessage | `Screens/QuoteMessage/` | Quote messaging UI |
| Savage | `Screens/Savage/` | Salvage detail view |

## Component Layer

**Reusable components (`scr/Components/`):**

| Component | Purpose |
|---|---|
| `Banner.tsx` | Promotional/info banner |
| `CarList.tsx` | Car listing card |
| `CustomTabBar.tsx` | Bottom tab bar renderer |
| `ForgroundNotification.tsx` | In-app notification popup with sound |
| `Header.tsx` | Screen header |
| `NetworkLoggerOverlay.tsx` | Dev-only network request overlay |
| `DeepLinkingRoute.ts` | Deep link route config (currently unused/commented) |

## Services Layer

| File | Purpose |
|---|---|
| `Services/apiHeader.js` | Axios instance factory; `axiosHeader()` sets `Authorization` + `device-id` headers |
| `Services/useNotitifications.js` | Firebase messaging hook — handles foreground/background/quit-state notifications, plays custom sound, dispatches navigation |

## Helper Layer

| File | Purpose |
|---|---|
| `Helper/Colors.js` | App color palette & design tokens |
| `Helper/Fonts.js` | Font family constants |
| `Helper/Responsive.js` | Screen dimension utilities |
| `Helper/Permisions.js` | Permission request helpers |
| `Helper/DummyData.js` | Static seed/mock data |
| `Helper/keys.js` | API keys and constant values |

## Data Flow

```
User Action
    │
    ▼
React Component
    │  dispatch(action)
    ▼
Redux Slice  ──────────────►  Redux State (UI updates)
    │
    │  saga watches action
    ▼
Redux-Saga
    │  call(apiFunction)
    ▼
API Layer (redux/api.js)
    │  axios request
    ▼
Backend REST API
    │
    ▼
Response → put(successAction) or put(failureAction) → Redux State
```

## Authentication Flow

1. Splash reads `auth.token` from persisted Redux state
2. Token present → navigate to MainStack
3. No token → navigate to AuthStack
4. Login success → `authSaga` stores token in `authSlice`
5. `axiosHeader()` called to update Authorization header on all subsequent Axios requests
6. `device-id` (from `react-native-device-info`) sent on every request

## iOS Native Setup

- **Min iOS:** 13.0
- **C++ standard:** C++20
- **CocoaPods permissions configured:**
  - PhotoLibrary, Camera, LocationAccuracy, LocationAlways, LocationWhenInUse
- **Excluded from library distribution:** react-native-slider, RevenueCat, RNPurchases, PurchasesHybridCommon
- **Fonts bundled:** MaterialCommunityIcons.ttf, MaterialIcons.ttf
- **Sounds:** `notif_sound.wav`

## Android Native Setup

- **Min SDK:** 24
- **Compile/Target SDK:** 36
- **Build Tools:** 36.0.0
- **NDK:** 27.1.12297006
- **Kotlin:** 2.1.20
- **Sound:** `notif_sound.mp3` (Android uses mp3, iOS uses wav)

## Entry Points

| File | Role |
|---|---|
| `index.js` | Registers root component with AppRegistry |
| `App.tsx` | Provider tree: Redux + PersistGate + Navigator |
| `metro.config.js` | Metro bundler config |
| `babel.config.js` | Babel preset config |
| `app.json` | App name for AppRegistry (`carScrap`) |
