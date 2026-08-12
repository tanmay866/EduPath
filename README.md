# EduPath

EduPath turns a skills assessment into a dated, week-by-week learning plan for a
specific job role, then follows the learner through to the artefacts they need
to apply: a resume that has been scored against a real job description, and a
published portfolio.

The idea is that a roadmap is only useful if it tells you what to do on Monday.
Everything here works backwards from that: assessments produce scores, scores
produce a gap against a role, the gap produces a schedule, and the schedule
reshuffles itself as work gets finished or missed.

Built at CHARUSAT University.

- Live app: https://my-edupath.vercel.app
- API: https://edupath-backend-h8h1.onrender.com
- Analysis service: https://edupath-ai-service-yea1.onrender.com

## What it does

**Assessment.** Four instruments: a skills quiz at a level you pick, an aptitude
test, CS fundamentals, and a spoken mock interview scored by an LLM. The skills
quiz is the one a plan is built from; the others are practice. Questions come
from QuizAPI for CS fundamentals and are generated per topic for the rest.

**Roadmap.** A role plus a set of scores produces a plan of skills sorted by
dependency, spread over calendar weeks against the hours per week the learner
actually has. Nothing is scheduled before its prerequisite. Six tracks ship
with the product: MERN Developer, AI/ML Engineer, Data Science Engineer, DevOps
Engineer, Mobile Developer, Cybersecurity Engineer.

**Scheduling.** Weeks carry dates, not just numbers. A plan knows
whether the learner is ahead, on track or behind, and a finished plan closes
itself rather than sitting active forever. Questions answered wrongly come back
on a spaced-review queue.

**Resume and ATS.** Upload a resume and it is parsed (OCR for scanned PDFs).
Paste a job description and it is scored against it, with the missing keywords
named. The report downloads as a PDF laid out to match the site.

**Portfolio.** Built from resume data and published to a URL that can be sent
to someone, either on this domain or deployed to Vercel.

**Job fit.** Paste any job description and it is matched to the closest track,
with the skills you are missing and an estimate of the weeks to close them.

**Admin.** User management with blocking and deletion, quiz and roadmap
oversight, curriculum settings, and the learner feedback queue.

## How it fits together

Three services:

```
frontend            backend                  ai_service
React + Vite   →    Express + MongoDB   →    FastAPI
:5173               :4000                    :8000
```

The backend owns all persistence and authentication. The Python service is
stateless and does the work that wants Python: resume OCR and parsing, skill
matching, roadmap generation, and job-description analysis. The frontend never
talks to it directly.

MongoDB Atlas holds sixteen collections. Everything a user owns is enumerated
in one place (`backend/utils/purgeUserData.js`) so that account deletion and
admin deletion cannot drift apart.

Versions that matter: React 19 with React Router 7, Vite (rolldown) 7, Express
5, Mongoose 9, FastAPI 0.115. The frontend styles itself with a small in-repo
design system rather than a component library; Tailwind 4 is present for
utilities and Lucide for icons.

## Running it locally

You need Node 18 or newer, Python 3.10 or newer, and a MongoDB connection
string. The app runs without most of the third-party keys — features that need
a key it does not have will say so rather than break.

### Backend

```bash
cd backend
npm install
cp .env.example .env   # then fill it in, see below
npm run dev            # localhost:4000
```

### Analysis service

```bash
cd ai_service
python -m venv .venv
source .venv/bin/activate      # .venv\Scripts\activate on Windows
pip install -r requirements.txt
python main.py                 # localhost:8000, docs at /docs
```

First run downloads OCR and NLP models, which takes a while and a few GB.

### Frontend

```bash
cd frontend
npm install
npm run dev            # localhost:5173
```

The frontend needs `VITE_API_URL` set at build time. Without it, it falls back
to the current host on port 4000 and logs an error — which is right for local
development and wrong in production, so set it there.

## Configuration

`backend/.env`. Only the first four are required to start.

| Variable | Purpose |
|---|---|
| `MONGODB_URI` | Atlas connection string |
| `JWT_SECRET` | Signing secret for session tokens |
| `PORT` | Defaults to 4000 |
| `FRONTEND_URL` | The one origin CORS accepts, besides localhost |
| `JWT_EXPIRE` | Token lifetime, defaults to `7d` |
| `AI_SERVICE_URL` | Analysis service base URL. Also enables the keep-warm ping |
| `GROQ_API_KEY` | Resume parsing (llama-3.3-70b) |
| `HF_TOKEN` | Question generation and interview scoring |
| `QUIZ_API_KEY` | CS fundamentals questions from QuizAPI |
| `BREVO_API_KEY` | Transactional email over HTTPS. Preferred |
| `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASSWORD` | SMTP fallback when Brevo is not configured |
| `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | Uploaded file storage |
| `VERCEL_TOKEN` | One-click portfolio deployment |
| `FREECONVERT_API_KEY` | DOCX to PDF conversion |
| `WEEKLY_EMAIL_ENABLED` | Set `false` to stop the Monday digest |

`ai_service` reads `MONGODB_URI`, `HUGGINGFACE_API_TOKEN`, `AI_SERVICE_HOST`
and `AI_SERVICE_PORT`, plus the LLM and cache tuning in `config/settings.py`.

## Tests

```bash
cd backend    && npm test              # 151 tests, node:test
cd frontend   && npm test              # 58 tests, vitest
cd frontend   && npm run lint
cd ai_service && python -m pytest      # 42 tests
```

The backend suite covers the parts where a silent wrong answer is worse than a
crash: schedule arithmetic, curriculum coverage, the skill-to-topic map,
roadmap deletion rules, review intervals, and the feedback context sanitiser.
It is deliberately not a suite of mocked-controller tests.

## Deployment

The frontend deploys to Vercel from `main`. Both Node and Python services
deploy to Render from `main`.

One operational note worth knowing. On Render's free tier a service stops after
roughly fifteen minutes of no traffic, and a cold start of the Python service
was measured at 162 seconds. Any timeout shorter than that turns a sleeping
dependency into an error message claiming the service is unreachable. Two
things guard against it: the backend pings the analysis service every ten
minutes while it is awake (`backend/services/aiWarmup.js`), and the calls into
it allow enough time to survive a cold start anyway.

If you deploy this yourself, use separate databases for development and
production. One Atlas cluster serving both means local test data lands in the
data your live site reads.

## API

Everything is under `/api`, and everything except authentication, the public
portfolio view and the contact form requires a bearer token.

| Prefix | Handles |
|---|---|
| `/api/auth` | Signup, login, OTP verification, password reset |
| `/api/profile` | Profile, activity summary, account deletion |
| `/api/quiz` | Topics, sessions, submission, review queue |
| `/api/cs`, `/api/practice` | CS fundamentals and practice results |
| `/api/mock-interview` | Question generation and answer scoring |
| `/api/roadmap` | Generate, read, tick off, rebuild, analyse a job |
| `/api/progress` | Progress log and weekly rollups |
| `/api/resume`, `/api/resume-generator` | Parsing and generation |
| `/api/ats` | Scoring, history, PDF report |
| `/api/portfolio` | Build, publish, deploy |
| `/api/feedback` | Learner problem reports |
| `/api/admin` | Users, content, settings, feedback queue |

The analysis service exposes `/ai/parse-resume`, `/ai/match-skills`,
`/api/roadmap/generate` and `/api/jobs/analyse`, with OpenAPI docs at `/docs`.
Rebuilding a plan is the backend's `/api/roadmap/adapt`, which calls
`/api/roadmap/generate` and merges the existing progress onto the result.

## Security

Passwords are bcrypt hashed at 10 rounds. Sessions are JWTs, seven days by
default.

Rate limits, per 15 minutes unless stated: 300 requests across the API, 10
failed logins, 10 OTP attempts, and 5 per hour on signup, password reset, OTP
resend and the contact form. Separately, five failed logins lock an account for
fifteen minutes.

CORS accepts one configured origin plus localhost and private network ranges in
development; anything else is refused with a 403. Helmet sets the response
headers. Request bodies are validated with express-validator, and the feedback
endpoint allow-lists the context it accepts rather than storing what it is
given.

## Layout

```
frontend/
  src/design/           design system: primitives, forms, shell
  src/component/        shared components and feature screens
  src/Pages/            routed pages, including admin and legal
  src/hooks/            reveal animation, shared behaviour
backend/
  controllers/          request handling
  models/               sixteen Mongoose schemas
  services/             email, LLM, PDF, scheduler, AI warm-up
  utils/                schedule maths, skill maps, deletion cascade
  tests/                node:test suites
ai_service/
  main.py               FastAPI app
  resume_parser.py      OCR and extraction
  agents/               roadmap generation, skill assessment
  utils/                dependency resolver, job matcher, time allocator
  data/                 role templates
  tests/                pytest suites
```

## Known limitations

The scores are estimates. A quiz result is evidence about a moment, the ATS
score approximates what a real applicant tracking system might do, and the week
counts assume the hours per week that were entered. The product says so on the
terms page rather than implying more precision than it has.

Two React Router advisories have no forward fix available at the pinned major
version and are documented in the commit history rather than silently carried.

## License

ISC
