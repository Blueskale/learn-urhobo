# Backend — Learn Urhobo API

Django 4 + Django REST Framework REST API that powers the Learn Urhobo mobile app.

---

## Requirements

- Python 3.11+
- PostgreSQL 14+ (SQLite works for local development)

---

## Local development setup

```bash
# 1. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate          # Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment (copy and edit)
cp .env.example .env

# 4. Run migrations
python manage.py migrate

# 5. Load seed content (1 course, 2 units, 4 lessons, 9 quiz questions)
python manage.py seed_content

# 6. Create a superuser (to access Django admin)
python manage.py createsuperuser

# 7. Start the development server
python manage.py runserver
```

The API is now available at `http://localhost:8000/api/v1/`.
Django admin is at `http://localhost:8000/admin/`.

---

## Environment variables

Create `backend/.env` from `backend/.env.example`.

### Development (`.env`)

| Variable      | Required | Default              | Description                        |
|---------------|----------|----------------------|------------------------------------|
| `SECRET_KEY`  | no       | insecure dev key     | Django secret key — change in prod |
| `DEBUG`       | no       | `True`               | Set to `False` in production       |
| `DATABASE_URL`| no       | SQLite (`db.sqlite3`)| Postgres URL for production        |

### Production (additional)

| Variable               | Required | Description                                             |
|------------------------|----------|---------------------------------------------------------|
| `SECRET_KEY`           | yes      | Long random string                                      |
| `ALLOWED_HOSTS`        | yes      | Comma-separated hostnames, e.g. `api.yourapp.com`       |
| `DB_NAME`              | yes      | PostgreSQL database name                                |
| `DB_USER`              | yes      | PostgreSQL user                                         |
| `DB_PASSWORD`          | yes      | PostgreSQL password                                     |
| `DB_HOST`              | yes      | PostgreSQL host                                         |
| `DB_PORT`              | no       | PostgreSQL port (default `5432`)                        |
| `CORS_ALLOWED_ORIGINS` | yes      | Comma-separated allowed origins for the mobile/web app  |

---

## Settings structure

```
config/settings/
├── base.py          Shared settings (all environments)
├── development.py   DEBUG=True, SQLite, CORS open
└── production.py    DEBUG=False, Postgres, strict CORS
```

Select the settings module with the `DJANGO_SETTINGS_MODULE` environment variable:

```bash
# Development (default)
DJANGO_SETTINGS_MODULE=config.settings.development

# Production
DJANGO_SETTINGS_MODULE=config.settings.production
```

---

## API reference

All endpoints require `Authorization: Bearer <access_token>` except register, login, and token refresh.

### Auth

| Method | Endpoint                        | Description              |
|--------|---------------------------------|--------------------------|
| POST   | `/api/v1/auth/register/`        | Create account           |
| POST   | `/api/v1/auth/login/`           | Obtain JWT token pair    |
| POST   | `/api/v1/auth/logout/`          | Blacklist refresh token  |
| POST   | `/api/v1/auth/token/refresh/`   | Rotate access token      |

### User profile

| Method | Endpoint                  | Description                          |
|--------|---------------------------|--------------------------------------|
| GET    | `/api/v1/me/`             | Current user + profile               |
| PATCH  | `/api/v1/me/`             | Update display name / avatar         |
| POST   | `/api/v1/me/onboarding/`  | Save onboarding answers              |

### Curriculum

| Method | Endpoint                          | Description                        |
|--------|-----------------------------------|------------------------------------|
| GET    | `/api/v1/courses/`                | List courses                       |
| GET    | `/api/v1/courses/<id>/units/`     | List units for a course            |
| GET    | `/api/v1/units/<id>/lessons/`     | List lessons with lock/complete    |
| GET    | `/api/v1/lessons/<id>/`           | Lesson detail with content blocks  |

### Quiz

| Method | Endpoint                            | Description                       |
|--------|-------------------------------------|-----------------------------------|
| GET    | `/api/v1/lessons/<id>/quiz/`        | List questions for a lesson       |
| POST   | `/api/v1/lessons/<id>/quiz/submit/` | Submit answers, receive score     |

### Progress

| Method | Endpoint                          | Description                              |
|--------|-----------------------------------|------------------------------------------|
| POST   | `/api/v1/lessons/<id>/start/`     | Create a lesson attempt (quiz start)     |
| POST   | `/api/v1/lessons/<id>/complete/`  | Mark content-only lesson complete        |
| GET    | `/api/v1/progress/summary/`       | XP, streak, lessons/units completed      |

---

## Django admin

Content is managed entirely through the Django admin. Log in with your superuser credentials and use it to:

- Add / edit courses, units, and lessons
- Create content blocks (word, phrase, audio, tip)
- Add vocabulary items and link them to lessons
- Create quiz questions and answer options
- Monitor lesson attempts and completions

---

## App structure

```
apps/
├── accounts/     User model, UserProfile, auth views, onboarding
├── curriculum/   Course, Unit, Lesson, ContentBlock, VocabularyItem
├── quiz/         Question, Option, MatchItem, quiz submit logic
└── progress/     LessonAttempt, LessonCompletion, XP/streak logic
```

---

## Seeded content

Run `python manage.py seed_content` to load starter content (idempotent — safe to run multiple times):

- **Unit 1 — Greetings**: Basic Greetings · Thank You & Goodbye
- **Unit 2 — Common Words**: Family Words · Everyday Words
- Each lesson has content blocks, vocabulary items, and a quiz with 2–3 questions covering all 4 question types

---

## Testing

### Run existing tests

```bash
python manage.py test
```

### Recommended unit test areas

Write tests in each app's `tests.py`. Focus on:

```
accounts/tests.py
  - RegisterView: happy path, duplicate email, weak password
  - LoginView: valid credentials, wrong password, unknown email
  - OnboardingView: valid choices, invalid choice values
  - MeView: returns correct profile shape

quiz/tests.py
  - QuizSubmitView: correct answers → passed=True, XP awarded
  - QuizSubmitView: wrong answers → passed=False, no XP
  - QuizSubmitView: already-completed lesson → no duplicate XP
  - QuizSubmitView: invalid attempt_id → 400
  - Matching grader: partial matches → not correct
  - Fill-blank grader: case-insensitive match

progress/tests.py
  - LessonCompleteView: first completion awards XP
  - LessonCompleteView: repeat completion → already_completed=True, xp_earned=0
  - ProgressSummaryView: correct counts after multiple completions
  - Streak logic: consecutive days → streak increments
  - Streak logic: gap in days → streak resets to 1

curriculum/tests.py
  - LessonListSerializer: first lesson unlocked, second locked
  - LessonListSerializer: second unlocked after first completed
  - UnitSerializer progress_percent: 0%, 50%, 100%
```

### Recommended API integration tests

Use `rest_framework.test.APITestCase` to test full request/response cycles:

```python
class QuizSubmitIntegrationTest(APITestCase):
    def test_full_quiz_flow(self):
        # 1. Register + get token
        # 2. Start lesson → get attempt_id
        # 3. Fetch questions
        # 4. Submit correct answers
        # 5. Assert score == 100, passed == True, xp_earned > 0
        # 6. Assert LessonCompletion exists
        # 7. Assert UserProfile.xp_total updated
        # 8. Submit again → already_completed, xp_earned == 0
```

---

## Pagination note

Global DRF pagination (`PageNumberPagination`) was intentionally removed for MVP simplicity. All list endpoints return flat JSON arrays. This is appropriate while content is small (< 100 items per list).

**When to reintroduce pagination:**
- When a course has more than ~50 units or lessons per page, OR
- When you add a vocabulary browser or search feature with hundreds of items, OR
- When server response times for list endpoints degrade

**How to reintroduce it cleanly:**
1. Add pagination back to `REST_FRAMEWORK` in `base.py`:
   ```python
   "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
   "PAGE_SIZE": 20,
   ```
2. Update every frontend list call to unpack `.results`:
   ```typescript
   // In api.ts, change:
   client.get<Course[]>("/courses/").then((r) => r.data)
   // To:
   client.get<PaginatedResponse<Course>>("/courses/").then((r) => r.data.results)
   ```
3. Add a `PaginatedResponse<T>` type to `mobile/types/index.ts`:
   ```typescript
   interface PaginatedResponse<T> {
     count: number;
     next: string | null;
     previous: string | null;
     results: T[];
   }
   ```
4. Add "load more" / infinite scroll UI if needed.

Do not reintroduce pagination until you actually need it — premature pagination adds complexity without user benefit.

---

## Production deployment

### Checklist before deploying

- [ ] `DEBUG=False` in production settings
- [ ] `SECRET_KEY` is a long random string (not the dev default)
- [ ] `ALLOWED_HOSTS` is set to your domain(s)
- [ ] `CORS_ALLOWED_ORIGINS` is set to your mobile app's origin or `*` with caution
- [ ] PostgreSQL is used (not SQLite)
- [ ] Static files served via `python manage.py collectstatic` + a CDN or WhiteNoise
- [ ] HTTPS enforced (use a reverse proxy like Nginx or a platform like Railway/Render)
- [ ] JWT `ACCESS_TOKEN_LIFETIME` is appropriate (default: 60 min)

### Recommended platforms (founder-friendly)

| Platform | Notes |
|----------|-------|
| **Railway** | One-click Postgres + Django, generous free tier, automatic deploys from git |
| **Render** | Similar to Railway, good Django support via `render.yaml` |
| **Fly.io** | More control, free tier, good for global edge deployment |
| **DigitalOcean App Platform** | Predictable pricing, managed Postgres add-on |

### Minimal production `Procfile` (for Railway/Render/Heroku)

```
web: gunicorn config.wsgi:application --workers 2 --bind 0.0.0.0:$PORT
release: python manage.py migrate
```

### Static files with WhiteNoise (simplest option)

```bash
pip install whitenoise
```

In `production.py`:
```python
MIDDLEWARE.insert(1, "whitenoise.middleware.WhiteNoiseMiddleware")
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"
```

---

## Known MVP limitations

1. **No audio playback** — `audio_url` fields exist in the model and API but the mobile app does not play audio yet. Add an audio player in Phase 6.
2. **No password reset** — There is no forgot-password / email verification flow. Add via `django-allauth` or a simple custom email view when needed.
3. **Streak resets if app is offline** — Streak is calculated server-side at completion time. A user who completes a lesson while offline will miss the streak update.
4. **No push notifications** — No reminders to keep streaks alive.
5. **Single course** — The data model supports multiple courses but the mobile app always loads `courses[0]`. Wire up course selection when you add a second course.
6. **Fill-blank grading is exact-match only** — Typos or alternate spellings fail. Consider fuzzy matching or hint system later.
7. **No image support** — Content blocks have no image field. Add an `image_url` field to `ContentBlock` when needed.
