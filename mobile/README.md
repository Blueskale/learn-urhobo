# Mobile — Learn Urhobo App

React Native mobile app built with Expo and Expo Router. Runs on iOS and Android from a single codebase.

---

## Requirements

- Node.js 18+
- npm or yarn
- Expo Go app (for device testing) OR an iOS/Android simulator

---

## Local development setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
# Edit .env — see Environment variables section below

# 3. Start Expo dev server
npx expo start
```

Then press:
- `i` — open iOS simulator
- `a` — open Android emulator
- Scan the QR code with **Expo Go** on a physical device

---

## Environment variables

Create `mobile/.env` from `mobile/.env.example`.

| Variable                   | Required | Default                           | Description                                  |
|----------------------------|----------|-----------------------------------|----------------------------------------------|
| `EXPO_PUBLIC_API_BASE_URL` | no       | `http://localhost:8000/api/v1`    | Base URL of the Django backend               |

**Physical device testing:** Replace `localhost` with your machine's local IP:

```bash
EXPO_PUBLIC_API_BASE_URL=http://192.168.1.42:8000/api/v1
```

Find your IP with `ipconfig` (Windows) or `ifconfig` / `ip a` (macOS/Linux). The device must be on the same Wi-Fi network as your machine.

**Production:** Point this at your deployed backend:

```bash
EXPO_PUBLIC_API_BASE_URL=https://api.yourapp.com/api/v1
```

All variables prefixed with `EXPO_PUBLIC_` are inlined at build time — they are visible in the app bundle. Do not put secrets here.

---

## App structure

```
app/
├── (auth)/                Auth screens (outside tab navigation)
│   ├── welcome.tsx         Landing / splash screen
│   ├── login.tsx           Login form
│   ├── register.tsx        Registration form
│   └── onboarding.tsx      Post-register goal selection
│
└── (tabs)/                Main tab navigation (authenticated)
    ├── _layout.tsx         Tab bar config
    ├── home.tsx            Dashboard: XP, streak, unit progress
    ├── learn.tsx           Full course/unit browser
    ├── profile.tsx         User stats and settings
    ├── units/[unitId].tsx  Lessons list for a unit
    ├── lessons/[lessonId].tsx  Lesson content + vocabulary
    └── quiz/
        ├── [lessonId].tsx  Quiz flow (all 4 question types)
        └── result.tsx      Score, XP earned, pass/fail

components/
├── lesson/                 ContentBlockCard
├── quiz/                   MultipleChoiceQuestion, FillBlankQuestion,
│                           MatchingQuestion, QuizProgress
└── ui/                     Button, Card, Badge, ProgressBar,
                            LoadingScreen, ErrorScreen

store/
├── authStore.ts            User, tokens, login/register/logout
└── progressStore.ts        XP summary, cached between screens

services/
└── api.ts                  All API calls (axios client + interceptors)

types/
└── index.ts                Shared TypeScript types matching backend serializers

constants/
├── colors.ts
├── layout.ts
└── typography.ts
```

---

## Authentication flow

```
App launch
  └── hydrate() — reads tokens from SecureStore
        ├── tokens found → GET /me/ → route to (tabs)
        ├── tokens expired → auto-refresh → route to (tabs)
        └── no tokens → route to (auth)/welcome
```

Tokens are stored in `expo-secure-store` (Keychain on iOS, Keystore on Android). The axios client attaches the access token on every request and automatically refreshes it on 401.

---

## Quiz question types

| Type              | Backend `question_type` | How it works                                       |
|-------------------|-------------------------|----------------------------------------------------|
| Multiple choice   | `multiple_choice`       | 4 options, tap to select                           |
| Translation       | `translation`           | Same as multiple choice, framed as "say this in X" |
| Fill in the blank | `fill_blank`            | Free-text input, case-insensitive match            |
| Matching          | `matching`              | Tap left item, tap right item to pair              |

---

## State management

Two Zustand stores:

**`authStore`** — persisted to `SecureStore`
- `user` — full user + profile object
- `accessToken`, `refreshToken`
- `login()`, `register()`, `logout()`, `hydrate()`

**`progressStore`** — in-memory, refreshed on focus
- `summary` — `{xp_total, streak_days, lessons_completed, units_completed}`
- `fetchSummary()` — called on Home focus and after quiz pass/lesson complete

---

## Testing

### Run type-check

```bash
npx tsc --noEmit
```

### Run linter

```bash
npx eslint . --ext .ts,.tsx
```

### Recommended screen tests (with Jest + React Native Testing Library)

```bash
npm install --save-dev jest @testing-library/react-native
```

Key flows to test:

```
__tests__/
├── auth/
│   ├── register.test.tsx     Form validation, API call, navigation on success
│   ├── login.test.tsx        Happy path, wrong credentials error display
│   └── onboarding.test.tsx   All 3 steps, submit calls /me/onboarding/
│
├── home.test.tsx             Renders XP/streak from progress store, unit cards
├── units.test.tsx            Locked lessons not pressable, completed show checkmark
├── lesson.test.tsx           Content blocks render, "Start Quiz" visible when quiz exists
│
└── quiz/
    ├── multipleChoice.test.tsx   Select option → Next enabled
    ├── fillBlank.test.tsx        Empty input → Next disabled
    ├── matching.test.tsx         Correct pair count enables Submit
    └── submit.test.tsx           Pass → navigates to result, fail → retry shown
```

### Manual end-to-end test checklist

Run this after every significant change:

```
[ ] Register with a new email
[ ] Complete onboarding (all 3 steps)
[ ] Home screen shows XP=0, Streak=0
[ ] Learn tab shows units with progress bars
[ ] Tap a unit → lessons list with lock/unlock state
[ ] Tap first lesson → content blocks and vocabulary load
[ ] Tap "Start Quiz" → tab bar is hidden during quiz
[ ] Answer all questions (try each type)
[ ] Submit → result screen shows score and XP
[ ] Press Continue → Home refreshes with new XP
[ ] Go to lessons list → lesson 1 shows checkmark, lesson 2 unlocked
[ ] Profile tab shows updated stats
[ ] Tap "Log Out" → back to welcome screen
[ ] Log in again → same XP and progress restored
[ ] Kill app and relaunch → stays logged in
```

---

## Production build

### Expo Application Services (EAS) — recommended

```bash
npm install -g eas-cli
eas login
eas build:configure

# Build for both platforms
eas build --platform all

# Submit to app stores
eas submit --platform ios
eas submit --platform android
```

### Environment configuration for production builds

Create `eas.json` and configure environment variables per profile:

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_API_BASE_URL": "https://api.yourapp.com/api/v1"
      }
    },
    "preview": {
      "env": {
        "EXPO_PUBLIC_API_BASE_URL": "https://staging-api.yourapp.com/api/v1"
      }
    }
  }
}
```

### Over-the-air updates (OTA)

Use Expo Updates to push JavaScript changes without an app store review:

```bash
eas update --branch production --message "Fix quiz submit bug"
```

OTA updates work for JS/asset changes. Native changes (new permissions, new native modules) always require a full store build.

---

## Known MVP limitations

1. **No audio playback** — `audio_url` is returned by the API but not played. Add `expo-av` to play pronunciation audio from content blocks and vocabulary items.
2. **No offline support** — All data is fetched live. If the API is unreachable, screens show an error state with a retry button. Caching with `AsyncStorage` or `react-query` would improve the experience.
3. **No push notifications** — No streak reminders or lesson nudges. Add via Expo Notifications + a backend notification job.
4. **Single course** — `courses[0]` is always loaded. Add a course selection screen when a second course is available.
5. **No avatar upload** — The profile screen shows a placeholder avatar. Add `expo-image-picker` + a file upload endpoint.
6. **No haptic feedback** — Add `expo-haptics` on correct/incorrect answers for a more satisfying quiz feel.
7. **Accessibility** — `accessibilityLabel` props are missing from most interactive elements. Add before publishing to stores.

---

## Suggested Phase 6 roadmap

These are practical next improvements, ordered by founder impact:

### High impact (do first)

1. **Audio pronunciations** — Record native Urhobo speaker audio for every word and phrase. Play on content block tap and option selection. This single feature dramatically improves retention for a spoken language. Use `expo-av`, store files in an S3-compatible bucket, link via `audio_url`.

2. **More content** — The seed has 4 lessons. Add 10–20 more across new units (numbers, colours, verbs, sentences). Content is the product. Do this before adding new features.

3. **Push notifications for streaks** — A daily reminder at the user's preferred time keeps streaks alive and brings users back. Use Expo Notifications + a backend cron job (APScheduler or Celery Beat).

4. **Password reset via email** — Block for real users. Add a `POST /auth/password/reset/` endpoint that sends a time-limited link. Use `django-anymail` with SendGrid or Mailgun (both have generous free tiers).

### Medium impact (do when you have users)

5. **Leaderboard / social** — Show top XP earners this week. Drives competition and sharing. Add a `GET /leaderboard/` endpoint that returns top-N users by `xp_total`.

6. **Offline mode with sync** — Cache lesson content in `AsyncStorage` on first load. Let users study without connectivity. Sync quiz results when they reconnect.

7. **Hearts / lives system** — Limit mistakes per session, regenerate over time. Increases engagement by adding stakes to quizzes.

8. **Course progress certificates** — Award a shareable image on unit/course completion. Users will share on social media, driving organic growth.

### Lower priority (only if needed)

9. **Multiple courses** — "Urhobo Advanced", "Urhobo for Kids". The data model already supports this. Just wire up the course selection screen.

10. **Web app** — Expo Router supports web. Running `npx expo export --platform web` gives you a web build with the same code. Useful for desktop access and SEO landing pages.

11. **Re-introduce API pagination** — Only when a single list response approaches 50 items. See `backend/README.md` for exact instructions on how to do this cleanly.

12. **Admin content authoring tool** — Django admin is sufficient for MVP. A custom CMS becomes worthwhile when a non-technical content team is adding lessons.
