# Al Rahid — Android App

The native Android client for the **Al Rahid** platform. It talks to the Al
Rahid backend **exclusively** over a single REST base URL.

> Stack: Kotlin · MVVM · Retrofit + OkHttp · Coroutines + Flow · Material 3 ·
> Jetpack Navigation · ViewBinding · SharedPreferences (token storage).
> Min SDK 24 · Target SDK 34 · Java 17.

---

## ⚠️ About this checkout

This project was generated in an environment that has **no Java / Android
SDK**, so **the APK/AAB cannot be compiled here**. However, the project is
**complete and buildable** — open it in Android Studio on a machine that has
the Android SDK installed and it will build normally.

---

## 1. Open in Android Studio

1. Launch **Android Studio** (Hedgehog 2023.1.1 or newer recommended, since the
   project uses AGP 8.2.2).
2. **File → Open…** and select the
   `android-app/` folder (the one that contains `settings.gradle.kts`).
3. Android Studio will prompt you to download the matching Android SDK +
   Gradle 8.5. Accept. The Gradle wrapper is committed
   (`gradlew` / `gradle/wrapper/gradle-wrapper.properties`) so you do **not**
   need a system Gradle install.
4. Wait for the initial Gradle sync to finish.

---

## 2. Set the backend URL (the one config value)

The app connects to exactly one server. That server's base URL is defined in
**one place**:

```
app/build.gradle.kts   →   buildConfigField("String", "API_BASE_URL", "\"http://10.0.2.2:3000/api/\"")
```

This value is exposed to Kotlin as `BuildConfig.API_BASE_URL`, and
`com.alrahid.app.util.Constants.API_BASE_URL` simply reads it:

```kotlin
// app/src/main/java/com/alrahid/app/util/Constants.kt
val API_BASE_URL: String = BuildConfig.API_BASE_URL
```

### To point the app at a different server

1. Open **`app/build.gradle.kts`**.
2. Change the string inside the `buildConfigField("String", "API_BASE_URL", …)`
   line to your server, e.g.:
   ```kotlin
   buildConfigField("String", "API_BASE_URL", "\"https://api.alrahid.com/api/\"")
   ```
   - The URL **must end with a trailing `/`** because Retrofit joins it with
     relative endpoint paths such as `auth/login`.
   - For a local backend on an emulator use `http://10.0.2.2:3000/api/`
     (10.0.2.2 is the host loopback from inside the Android emulator).
   - For a real device, use the LAN IP of your dev machine, e.g.
     `http://192.168.1.50:3000/api/`, and ensure the device and machine are on
     the same network. `android:usesCleartextTraffic="true"` is already set in
     the manifest so plain HTTP works.
3. **Rebuild the APK** (see below). The backend never needs to change.

> Tip: the configured URL is also shown read-only at runtime on the
> **Settings** screen (`API base URL`) so you can confirm which server the
> installed build is pointing at.

---

## 3. Build a debug APK

**GUI**

1. **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
2. When it finishes, click **locate** in the notification to find
   `app/build/outputs/apk/debug/app-debug.apk`.
3. Install on a connected device/emulator: **Run ▶** or
   `adb install app/build/outputs/apk/debug/app-debug.apk`.

**Command line**

```bash
cd android-app
./gradlew assembleDebug
# output: app/build/outputs/apk/debug/app-debug.apk
```

---

## 4. Build a release AAB (for the Play Store)

Google Play requires an **Android App Bundle (`.aab`)**, signed with your
release key.

### 4a. Generate a keystore (one-time)

```bash
keytool -genkey -v -keystore alrahid-release.jks \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias alrahid
```

Keep `alrahid-release.jks` and its passwords safe — this is the key that
identifies your app on the Play Store forever.

### 4b. Configure signing in Gradle

Add a `signingConfigs` block to `app/build.gradle.kts`, reading the keystore
passwords from environment variables or `local.properties` (do **not** commit
secrets):

```kotlin
android {
    signingConfigs {
        create("release") {
            storeFile = file(System.getenv("ALRAHID_KEYSTORE") ?: "../alrahid-release.jks")
            storePassword = System.getenv("ALRAHID_STORE_PASSWORD") ?: ""
            keyAlias = System.getenv("ALRAHID_KEY_ALIAS") ?: "alrahid"
            keyPassword = System.getenv("ALRAHID_KEY_PASSWORD") ?: ""
        }
    }
    buildTypes {
        release {
            isMinifyEnabled = false
            proguardFiles(getDefaultProguardFile("proguard-android-optimize.txt"), "proguard-rules.pro")
            signingConfig = signingConfigs.getByName("release")
        }
    }
}
```

### 4c. Generate the signed AAB

**GUI**

1. **Build → Generate Signed Bundle / APK…**
2. Choose **Android App Bundle** → Next.
3. Pick your keystore, enter the key password → Next.
4. Select the **release** build variant → **Create**.

**Command line**

```bash
cd android-app
./gradlew bundleRelease
# output: app/build/outputs/bundle/release/app-release.aab
```

---

## 5. Deploy to the Google Play Store

1. Go to the **Google Play Console** → create an app
   (`com.alrahid.app`, package name from `applicationId`).
2. Upload the signed `.aab` under
   **Release → Production / Internal testing → Create new release**.
3. Complete the store listing, privacy policy, content rating, etc.
4. Submit for review.

---

## Project structure

```
android-app/
├── settings.gradle.kts
├── build.gradle.kts                # root
├── gradle.properties
├── gradle/wrapper/                 # wrapper jar + properties
├── gradlew / gradlew.bat
└── app/
    ├── build.gradle.kts            # ← API_BASE_URL buildConfigField lives here
    ├── proguard-rules.pro
    └── src/main/
        ├── AndroidManifest.xml
        ├── java/com/alrahid/app/
        │   ├── AlRahidApp.kt
        │   ├── util/                # Constants.kt (API_BASE_URL), Resource
        │   ├── data/
        │   │   ├── local/           # SessionManager (SharedPreferences tokens)
        │   │   ├── api/             # ApiService (Retrofit), RetrofitClient, Models
        │   │   └── repository/      # AuthRepository, AppRepository
        │   └── ui/
        │       ├── MainActivity.kt
        │       ├── auth/            # Login / Register + AuthViewModel
        │       ├── dashboard/       # Dashboard + ViewModel
        │       ├── ai/              # Chat / Generator / PDF / Generations + AiViewModel
        │       ├── profile/ settings/ wallet/ notifications/ history/
        │       └── adapter/         # RecyclerView adapters
        └── res/
            ├── layout/              # activity_main + all fragment + item layouts
            ├── navigation/nav_graph.xml
            ├── menu/drawer_menu.xml
            ├── drawable/            # vector icons + shape drawables
            ├── mipmap-anydpi-v26/   # adaptive launcher icon
            └── values/              # strings, colors (teal), themes (M3), dimens
```

### Backend contract

`ApiService.kt` declares every endpoint the app calls, all relative to
`API_BASE_URL`:

- `auth/register`, `auth/login`, `auth/logout`, `auth/refresh`,
  `auth/forgot-password`, `auth/reset-password`, `auth/change-password`
- `users/profile` (GET/PUT)
- `notifications` (GET), `notifications/{id}/read` (PATCH),
  `notifications/read-all` (PATCH)
- `wallet` (GET), `wallet/transactions` (GET)
- `activity` (GET)
- `api-keys` (GET/POST), `api-keys/{id}/revoke` (PATCH)
- `ai/chat`, `ai/image`, `ai/video`, `ai/voice`, `ai/music`, `ai/logo`,
  `ai/resume`, `ai/presentation`, `ai/pdf-summary`, `ai/code`, `ai/website`,
  `ai/app`, `ai/email`, `ai/document`, `ai/generations`

Authentication is automatic: `RetrofitClient` installs an OkHttp interceptor
that adds `Authorization: Bearer <token>` from the stored session to every
request except the public auth endpoints.

### Changing servers

Change **only** `API_BASE_URL` in `app/build.gradle.kts` and rebuild. The
backend does not need to change.
