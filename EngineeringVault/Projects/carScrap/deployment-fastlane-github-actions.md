# carScrap — Deployment: Fastlane & GitHub Actions

## Overview

iOS builds are fully automated via GitHub Actions on every push to `main`. The pipeline:

1. Provisions certificates and profiles from GitHub Secrets
2. Writes environment files
3. Runs `fastlane staging` and `fastlane production`
4. Both lanes upload to **TestFlight**

Android has **no CI/CD** — builds are manual.

---

## Fastlane — iOS

### File Locations

```
ios/
├── fastlane/
│   ├── Fastfile      ← lane definitions
│   └── Appfile       ← app identity
└── Gemfile           ← Ruby dependencies
```

### Appfile

```ruby
app_identifier "com.carscrape.rniap"
apple_id "salvagemotor4cash@gmail.com"
team_id "3ZZTDYP4ZM"
```

### Gemfile

```ruby
source "https://rubygems.org"
gem "fastlane"
gem "openssl", "~> 3.0"
```

### Fastfile — Lanes

#### Staging Lane

```ruby
lane :staging do
  # 1. Increment build number
  increment_build_number(xcodeproj: "carScrap.xcodeproj")

  # 2. Get provisioning profile via App Store Connect API
  api_key = app_store_connect_api_key(
    key_id: "YUFRC8H2Y6",
    issuer_id: "84ab350a-e81d-4ec1-a405-fd8ee68492a4",
    key_content: ENV["APP_STORE_CONNECT_API_KEY"],
  )
  get_provisioning_profile(api_key: api_key)

  # 3. Update code signing settings
  update_code_signing_settings(
    use_automatic_signing: false,
    team_id: "3ZZTDYP4ZM",
    code_sign_identity: "Apple Distribution",
    profile_name: "carScrap AppStore",
  )

  # 4. Build for App Store
  build_app(
    scheme: "car scrap staging",
    export_method: "app-store",
    xcargs: "ENVFILE=.env.staging",
  )

  # 5. Upload to TestFlight
  upload_to_testflight(api_key: api_key, skip_waiting_for_build_processing: true)
end
```

#### Production Lane

Identical to staging except:
- Scheme: `carScrapProduction`
- `xcargs: "ENVFILE=.env.production"`

### App Store Connect API Key

| Field | Value |
|---|---|
| Key ID | `YUFRC8H2Y6` |
| Issuer ID | `84ab350a-e81d-4ec1-a405-fd8ee68492a4` |
| Key Content | From `APP_STORE_CONNECT_API_KEY` env var / GitHub Secret |
| Key File Written To | `ios/fastlane/app_store_connect_api_key.p8` |

---

## GitHub Actions

**File:** `.github/workflows/release.yml`

**Trigger:** Push to `main` branch

**Runner:** `macos-latest`

### Full Pipeline Steps

```
Step 1:  Checkout (full history, fetch-depth: 0)
Step 2:  Setup Node 20 (npm cache)
Step 3:  npm install --legacy-peer-deps
Step 4:  Setup Ruby 3.1 (bundler cache)
Step 5:  cd ios && pod install
Step 6:  Import Distribution Certificate
Step 7:  Import Provisioning Profile
Step 8:  Write App Store Connect API Key
Step 9:  Write Environment Files (.env.staging, .env.production)
Step 10: cd ios && bundle install
Step 11: Verify Secrets & Files (diagnostic step)
Step 12: fastlane staging   (continue-on-error: true)
Step 13: fastlane production (continue-on-error: true)
Step 14: Print gym logs on failure
```

### Step Details

#### Step 6 — Import Distribution Certificate

```bash
echo "$DISTRIBUTION_CERT_P12" | base64 --decode > certificate.p12
security create-keychain -p "" build.keychain
security import certificate.p12 -k build.keychain -P "$CERT_PASSWORD" -T /usr/bin/codesign
security list-keychains -s build.keychain
security default-keychain -s build.keychain
security unlock-keychain -p "" build.keychain
security set-key-partition-list -S apple-tool:,apple: -s -k "" build.keychain
```

#### Step 7 — Import Provisioning Profile

```bash
echo "$PROVISIONING_PROFILE" | base64 --decode > profile.mobileprovision
mkdir -p ~/Library/MobileDevice/Provisioning\ Profiles
cp profile.mobileprovision ~/Library/MobileDevice/Provisioning\ Profiles/
```

#### Step 8 — Write API Key

```bash
echo "$APP_STORE_CONNECT_API_KEY" > ios/fastlane/app_store_connect_api_key.p8
```

#### Step 9 — Write Env Files

```bash
echo "$ENV_STAGING"    > .env.staging
echo "$ENV_PRODUCTION" > .env.production
```

#### Step 11 — Verify Secrets (Diagnostic)

```bash
security find-identity -v -p codesigning          # list installed certs
ls ~/Library/MobileDevice/Provisioning\ Profiles/ # list profiles
[ -f ios/fastlane/app_store_connect_api_key.p8 ]  # check API key file
cat .env.staging | head -3                         # spot-check env
xcodebuild -list -workspace ios/carScrap.xcworkspace # list schemes
```

#### Step 14 — Print Build Logs on Failure

```bash
cat ~/Library/Logs/gym/car\ scrap\ staging-carScrap.log || true
cat ~/Library/Logs/gym/carScrapProduction-carScrap.log || true
```

### Required GitHub Secrets

| Secret | Description |
|---|---|
| `DISTRIBUTION_CERT_P12` | Base64-encoded Apple Distribution certificate (.p12) |
| `CERT_PASSWORD` | Password for the .p12 certificate |
| `PROVISIONING_PROFILE` | Base64-encoded provisioning profile (.mobileprovision) |
| `APP_STORE_CONNECT_API_KEY` | Contents of App Store Connect API key (.p8 file) |
| `ENV_STAGING` | Full contents of `.env.staging` file |
| `ENV_PRODUCTION` | Full contents of `.env.production` file |

### Encoding Certificates for GitHub Secrets

```bash
# On macOS, export .p12 from Keychain Access, then:
base64 -i distribution.p12 | pbcopy

# For provisioning profile:
base64 -i profile.mobileprovision | pbcopy

# For API key:
cat AuthKey_YUFRC8H2Y6.p8 | pbcopy   # paste directly (no base64 needed)
```

---

## Android Deployment

**Status: No Fastlane / No CI/CD configured.**

Current Android state:
- Release builds use **debug keystore** (not suitable for Play Store)
- No `android/fastlane/` directory exists
- Manual build required: `cd android && ./gradlew assembleRelease`

To deploy to Play Store, the following would be needed:
1. Generate a release keystore
2. Configure signing in `android/app/build.gradle`
3. Add Fastlane + supply (Play Store upload)
4. Add Android job to GitHub Actions workflow

---

## Deployment Sequence (End-to-End)

```
Developer pushes to main
        │
        ▼
GitHub Actions triggers (macos-latest)
        │
        ├── Install deps (Node, Ruby, CocoaPods)
        ├── Provision keychain + certificate
        ├── Install provisioning profile
        ├── Write secrets to disk (.env, .p8)
        │
        ├── fastlane staging
        │       ├── Increment build number
        │       ├── Fetch provisioning profile (App Store Connect API)
        │       ├── Build (scheme: "car scrap staging", ENVFILE=.env.staging)
        │       └── Upload to TestFlight
        │
        └── fastlane production
                ├── Increment build number
                ├── Fetch provisioning profile (App Store Connect API)
                ├── Build (scheme: carScrapProduction, ENVFILE=.env.production)
                └── Upload to TestFlight
```

---

## Known Deployment Issues

1. **Both lanes run on every push to main** — staging and production both upload to TestFlight regardless of intent. No branch-based or tag-based gating.
2. **`continue-on-error: true`** on both build steps — a failed build won't fail the workflow, making failures easy to miss.
3. **`skip_waiting_for_build_processing: true`** — TestFlight upload succeeds but processing errors won't be caught.
4. **Build number incremented locally** — `increment_build_number` modifies `project.pbxproj` in the runner but isn't committed back to the repo. Build numbers may not be sequential across runs.
5. **Android has no CI/CD** — manual deployment only, and release signing uses debug keystore.
6. **Single provisioning profile** — both staging and production use `carScrap AppStore` profile. If they have different bundle IDs or entitlements, this could cause issues.
7. **No Slack/email notification** — no alerting configured for build success or failure.
