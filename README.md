# Learn Urhobo

A mobile language-learning app for the Urhobo language (spoken in Delta State, Nigeria), built with React Native / Expo on the frontend and Django REST Framework on the backend.

The app follows a Duolingo-style flow: register → onboarding → lessons → quizzes → XP & streaks → progress tracking.

---

## Repository layout

```
learn-urhobo/
├── backend/          Django REST API
└── mobile/           Expo (React Native) mobile app
```

Each sub-directory has its own README with setup details:

- [`backend/README.md`](./backend/README.md)
- [`mobile/README.md`](./mobile/README.md)

---

## Tech stack

| Layer    | Technology                                      |
|----------|-------------------------------------------------|
| Mobile   | React Native, Expo SDK, Expo Router, Zustand    |
| Backend  | Django 4, Django REST Framework, Simple JWT     |
| Database | PostgreSQL (dev: SQLite acceptable)             |
| Auth     | JWT access + refresh tokens, token blacklisting |

---

## Data model (high level)

```
User ──── UserProfile          (XP, streak, onboarding answers)
 │
Course ── Unit ── Lesson ──── ContentBlock
                    │   └──── LessonVocabulary ── VocabularyItem
                    │
                    └── Question ── Option
                              └─── MatchItem

LessonAttempt   (one per quiz start; holds score + XP earned)
LessonCompletion (one per user per lesson; idempotent)
```

---

## API base URL

All endpoints live under `/api/v1/`. The mobile app reads the base URL from `EXPO_PUBLIC_API_BASE_URL` in `mobile/.env`.

---

## Current content (seeded)

- **1 course** — Urhobo for Beginners
- **2 units** — Greetings · Common Words
- **4 lessons** — Basic Greetings · Thank You & Goodbye · Family Words · Everyday Words
- **9 quiz questions** covering all 4 types: multiple choice, translation, fill-in-the-blank, matching

Add more via the Django admin at `http://localhost:8000/admin/`.

---

## Quick start (both services)

```bash
# 1. Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py seed_content
python manage.py runserver          # http://localhost:8000

# 2. Mobile (separate terminal)
cd mobile
cp .env.example .env                # edit if using a physical device
npm install
npx expo start
```

See the sub-directory READMEs for full details.
