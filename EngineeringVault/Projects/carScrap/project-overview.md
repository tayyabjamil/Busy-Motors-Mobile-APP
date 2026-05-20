# carScrap — Project Overview

## App Identity

| Field | Value |
|---|---|
| App Name | carScrap |
| Bundle ID (iOS) | `com.carscrape.rniap` |
| Application ID (Android) | `com.busymotors.app` |
| Version | 0.0.1 (versionName 1.0, versionCode 4) |
| Apple Team ID | `3ZZTDYP4ZM` |
| Apple ID | salvagemotor4cash@gmail.com |

## Purpose

Mobile marketplace for car salvage/scrap listings. Users can browse, save, and request quotes on scrapped vehicles. Agents/sellers can manage listings. Subscriptions gate access to premium features.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native 0.82.1 / React 19.1.1 |
| Language | TypeScript 5.0.4 |
| State | Redux Toolkit + Redux-Saga + Redux-Persist |
| Navigation | React Navigation v7 (Stack + Bottom Tabs) |
| API | Axios + REST (Render.com backend) |
| Auth | Token-based + device-id tracking |
| Payments | RevenueCat 8.11.7 |
| Notifications | Firebase Cloud Messaging |
| Maps | react-native-maps + react-native-geolocation-service |
| Storage | AsyncStorage (via redux-persist) |
| Config | react-native-config (.env per environment) |

## Key Dependencies

```json
"@reduxjs/toolkit": "^2.5.0"
"redux-saga": "^1.3.0"
"redux-persist": "^6.0.0"
"axios": "^1.7.9"
"@react-navigation/native": "^7.0.13"
"react-native-purchases": "^8.11.7"
"@react-native-firebase/messaging": "^20.4.0"
"react-native-maps": "1.18.0"
"react-native-config": "^1.6.1"
"react-native-device-info": "^14.0.4"
"react-native-image-crop-picker": "^0.50.1"
```

## Environments

| Env | API Base URL |
|---|---|
| Development | `https://scrape4you-production.onrender.com/api` (defaults to prod) |
| Staging | `https://scrape4you-zb9f.onrender.com/api` |
| Production | `https://scrape4you-production.onrender.com/api` |

### Run Scripts

```bash
# iOS
npm run ios                  # default env
npm run ios:staging          # ENVFILE=.env.staging
npm run ios:prod             # ENVFILE=.env.production

# Android
npm run android:staging
npm run android:prod
```

## Firebase

- iOS config: `ios/carScrap/GoogleService-Info.plist`
- Android config: `android/app/google-services.json`

## RevenueCat

- Key stored in `.env` as `REVENUECAT_KEY`
- iOS key: `appl_czoNDoTtKaWVrkOrwjVvLpsPdQC`
- Manages subscription entitlements; replaced Stripe payments

## Source Layout

```
scr/
├── Components/       # Reusable UI components
├── Screens/          # 16 feature screens
├── redux/            # Store, slices, sagas, api
├── Services/         # Axios header setup, notification hook
├── Helper/           # Colors, Fonts, Responsive utils, keys
├── Permissions/      # Gallery permission helper
├── Functions/        # MediaManager (image picking/upload)
├── assets/           # Icons, images, sounds
├── Navigation.js     # Root navigator
└── navigationRef.js  # Programmatic navigation ref
```

## Related Notes

- [[architecture]]
- [[state-management]]
- [[api-layer]]
- [[deployment-fastlane-github-actions]]
- [[known-issues]]
