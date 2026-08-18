# Task Manager

An offline-first cross-platform task manager built with React Native CLI. Tasks
are created, edited and completed against a local SQLite database and replicate
to Cloud Firestore whenever the device has connectivity. Authentication, storage
and push messaging all run on Firebase; there is no custom backend.

---

## Architecture

### The central decision: SQLite is the source of truth

Every mutation writes to SQLite first and returns immediately. The UI never
awaits the network. A separate sync engine later reconciles local state with
Firestore.

```
WRITE PATH (always local, always instant)

  TaskFormScreen
        │ dispatch(addTask)
        ▼
  taskSlice thunk ──▶ taskRepository ──▶ SQLite
        │                                (syncStatus = 'pending_create')
        ├──▶ notificationService.scheduleTaskReminder()
        └──▶ reducer inserts into Redux


SYNC PATH (asynchronous, never blocks the UI)

  NetInfo online ─┐
  AppState active ├──▶ syncController ──▶ syncEngine.runSync()
  debounced edit ─┘                            │
                                               ├─ PUSH: pending_* ──▶ Firestore
                                               │        (writeBatch, merge)
                                               └─ PULL: updatedAt > watermark
                                                        ──▶ SQLite ──▶ reload
```

Firestore's own offline persistence was the alternative. It was rejected because
it would make the local database decorative: the brief requires a real local DB
doing real work, and an explicit queue makes sync state observable — the app can
show "3 pending" and a per-task indicator, which a transparent cache cannot.

### Layering rule

**Screens never import a service. Services never import Redux.**

| Layer | May import | Purpose |
|---|---|---|
| `screens/` | components, features, theme | Render and dispatch |
| `features/` | services, utils | State and orchestration |
| `services/` | utils only | SQLite, Firebase, Notifee, NetInfo |

`syncEngine` takes its ten dependencies as an injected object rather than
importing them. That is what allows its push/pull/conflict logic to be tested
against an in-memory fake with no device, no emulator and no Firestore.

### Conflict resolution

Last-write-wins on ISO-8601 `updatedAt`. Exact ties resolve to **remote** — an
arbitrary but fixed rule, so two devices reaching the same tie agree on the
outcome.

Deletes are **soft on the server** (`deleted: true`). A hard `deleteDoc` would be
invisible to an `updatedAt >` pull query, so another device would never learn the
task was removed. The local row is hard-deleted once its tombstone is confirmed.

---

## Project structure

```
src/
  app/            Redux store and typed hooks
  config/         env.ts — validated, typed environment access
  theme/          tokens, light/dark palettes, ThemeProvider
  components/     Presentational primitives (no business logic)
  features/
    auth/         authSlice
    tasks/        taskSlice, selectors
    sync/         syncEngine, syncController, conflict, syncSlice
  navigation/     Root/Auth/App navigators, typed param lists
  screens/
    auth/         Login, Signup
    app/          TaskList, TaskForm, Settings
  services/
    database/     connection, migrations, taskRepository, syncMetaRepository
    firebase/     authService, authErrors, taskFirestoreService, messagingService
    notifications/ notificationService
    connectivity/ connectivityService
  utils/          id, datetime, validation, logger
  types/          task, user
```

---

## Libraries used

| Library | Why |
|---|---|
| `@reduxjs/toolkit` + `react-redux` | Required state manager; thunks model the async local-write path cleanly |
| `@react-navigation/native` + `native-stack` | Auth/App stack split; native stack for platform-correct transitions |
| `react-native-nitro-sqlite` | Local database. JSI-based, so reads do not cross the bridge |
| `@react-native-firebase/app` `auth` `firestore` `messaging` | Auth, remote replica, push. Modular v26 API throughout |
| `@notifee/react-native` | Local scheduled reminders with exact-alarm support and channel control |
| `@react-native-community/netinfo` | Connectivity signal that triggers sync |
| `react-native-config` | Binds `.env` files to build flavors |
| `@react-native-async-storage/async-storage` | Persists the theme preference |
| `@react-native-community/datetimepicker` | Native date/time selection for reminders |

---

## Running the app

### Prerequisites

- Node **>= 22.11.0**
- JDK **17**
- Android SDK with an emulator or a connected device

### Install

```sh
npm install
```

### Run per environment

```sh
npm run android:dev        # development
npm run android:staging    # staging
npm run android:prod       # production (release build)
```

| Script | Variant | applicationId | Env file |
|---|---|---|---|
| `android:dev` | `devDebug` | `com.taskmanager` | `.env.development` |
| `android:staging` | `stagingDebug` | `com.taskmanager` | `.env.staging` |
| `android:prod` | `prodRelease` | `com.taskmanager` | `.env.production` |

The active environment is shown in-app under **Settings → About**.

All three flavors share one `applicationId` by default so the single
`google-services.json` works with no console setup. To install them side by side
instead, uncomment the two `applicationIdSuffix` lines in
`android/app/build.gradle` and complete step 2 of Firebase setup below.

### Environment variables

| Key | Meaning |
|---|---|
| `APP_ENV` | `development` \| `staging` \| `production` |
| `APP_NAME` | Display name shown in Settings |
| `ENABLE_LOGGING` | `true` enables debug/info logs; errors always log |
| `SYNC_DEBOUNCE_MS` | Delay before a burst of local edits triggers one sync |

`src/config/env.ts` validates these at startup and throws naming the missing key,
rather than letting `undefined` surface three screens later.

The `.env.*` files are committed deliberately — they contain no secrets. Real
secrets belong in `.env.local`, which is gitignored.

---

## Firebase setup

1. **Enable sign-in:** Firebase console → Authentication → Sign-in method →
   enable **Email/Password**.
2. *(Optional — only for side-by-side installs.)* Register the extra package
   names in the same Firebase project, then re-download `google-services.json`
   into `android/app/`:
   - `com.taskmanager.dev`
   - `com.taskmanager.staging`
3. **Deploy security rules** from `firestore.rules`, which restrict every
   document to its owner:

   ```
   match /users/{userId}/tasks/{taskId} {
     allow read, write: if request.auth != null && request.auth.uid == userId;
   }
   ```

> **If you enable `applicationIdSuffix` without doing step 2**, `devDebug` and
> `stagingDebug` fail at `:app:processDevDebugGoogleServices` with
> `No matching client found for package name 'com.taskmanager.dev'`. The default
> configuration avoids this entirely.

`google-services.json` is committed for reviewer convenience. In a real product
it would be injected by CI per environment.

---

## Performance

- `TaskRow` is wrapped in `React.memo` with an explicit comparator covering only
  the fields the row paints, and `renderItem` is a `useCallback` — so toggling
  one task does not re-render the rest of the list.
- Every row is a fixed `TASK_ROW_HEIGHT` (88px including margin), which enables
  `getItemLayout`. That is the change that actually makes long lists cheap: the
  list can jump to any offset without measuring intermediate rows.
- `keyExtractor`, `removeClippedSubviews`, and tuned `initialNumToRender` /
  `maxToRenderPerBatch` / `windowSize` / `updateCellsBatchingPeriod`.
- Screens are lazy-loaded via React Navigation's `getComponent`, so a screen's
  module is required the first time it is navigated to rather than at navigator
  construction. `React.lazy` was tried first and removed: it routes through
  Metro's async bundle splitting, which fails to parse the generated chunk in
  bare React Native 0.87 and crashes the app with a render error.

---

## Testing

```sh
npm test              # 47 tests
npx tsc --noEmit      # type check
npm run lint          # eslint
```

Covered:

- **Sync engine** (9 tests) — push/pull cycle, tombstone handling, watermark
  advancement, the in-flight guard, and the rule that a failed push must not
  mark rows synced.
- **Conflict resolution** — last-write-wins in both directions plus tie-breaking.
- **Reducers and selectors** — auth and task state transitions, pending counts.
- **Validation and config** — field rules and environment parsing.

Deliberately not covered: screen render/snapshot tests. They are expensive to
maintain and catch little here; the logic worth protecting lives below the UI and
is tested directly.

---

## Known limitations

- **Last-write-wins loses concurrent field edits.** If two devices edit different
  fields of one task while offline, the later write replaces the whole document.
  Correct resolution needs per-field versioning or CRDTs, which is out of scope.
- **Android clears scheduled alarms on reboot.** Reminders are re-armed the next
  time the app opens and tasks load, not at boot.
- **Pull is watermark polling, not a realtime listener.** Changes from another
  device appear on the next sync (connectivity change, app foreground, or local
  edit) rather than instantly. `syncEngine.pull` is isolated, so swapping in an
  `onSnapshot` listener is a change to one function.
- **iOS is code-complete but not configured.** All code is cross-platform and
  avoids Android-only APIs, but `GoogleService-Info.plist`, the Podfile Firebase
  setup and notification entitlements are not done. Android only for now.
- **Exact alarms may be downgraded.** If `SCHEDULE_EXACT_ALARM` is unavailable,
  reminders fall back to inexact timing and can fire a few minutes late.
- **No token refresh handling for FCM.** The token is read at login;
  `onTokenRefresh` is not wired, so a rotated token is picked up at next sign-in.
