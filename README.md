# ShikshaSarthi

ShikshaSarthi is an offline-first school learning platform built for classrooms with
unreliable internet. Each school runs the full app (frontend, API, and database) on
its own local server; a small cloud service in AWS hands out app updates, keeps
backups, and merges data between schools when they choose to sync. Schools never
depend on the cloud to keep teaching, testing, and grading day to day.

## Who uses it

ShikshaSarthi has four roles, each scoped to what it needs:

| Role | Scope | Typical tasks |
|---|---|---|
| **Super Admin** | Whole platform | Registers new schools (and their first School Admin login), monitors sync/updates across every school |
| **School Admin** | One school | Adds/removes Teacher and Student accounts for that school |
| **Teacher** | Own classes | Creates classes, enrols students, builds quizzes, reviews analytics |
| **Student** | Own learning | Practises questions, takes adaptive tests and quizzes, reviews results |

Accounts are created top-down: Super Admin creates a school + its School Admin,
School Admin creates Teachers and Students, and Teachers enrol existing students
into the classes they create.

## Local school server deployment (recommended)

The school server runs two Docker services — the app (React frontend + Node/Express
API behind nginx) and MongoDB — and needs internet only for the initial image pull,
optional cloud sync, and update checks.

```sh
cp .env.local-school.example .env
docker compose up -d --build
```

Open the app on the server:

```
http://localhost:6050
```

Teachers and students on the same LAN open:

```
http://<server-ip>:6050
```

Gemini AI hints and Cloudinary uploads are disabled by default in local-school mode.
Uploads, MongoDB data, backups, and the audio cache live in Docker volumes, so
restarts never delete school data.

Useful operational scripts:

```sh
./scripts/health-check.sh
./scripts/backup-local-school.sh
./scripts/logs-local-school.sh
./scripts/stop-local-school.sh
```

See [`docs/LOCAL_SCHOOL_DEPLOYMENT.md`](docs/LOCAL_SCHOOL_DEPLOYMENT.md) for the full
school IT setup guide, and [`docs/ShikshaSarthi_Complete_Guide.pdf`](docs/ShikshaSarthi_Complete_Guide.pdf)
for a short illustrated guide covering every role plus how sync and updates work.

## How syncing and updates work

- **Sync** is bidirectional. The local server pushes its new records (students, quiz
  results, classes, etc.) to the AWS cloud and pulls down anything new (e.g. a shared
  question bank update). It runs automatically on an interval and a Super Admin can
  also trigger it manually. If the internet is down, the school keeps working
  normally and syncing simply resumes later.
- **Updates** are cloud-published but never silent. The app checks AWS for a newer
  version; a Super Admin reviews and approves the install. Every downloaded update
  package is checksum-verified before anything is applied, so a broken or partial
  download is rejected automatically. Updates only replace program files — student
  data, quiz history, and uploaded media are never touched.

See [`docs/PHASE_3_UPDATE_AND_SYNC.md`](docs/PHASE_3_UPDATE_AND_SYNC.md) for the API-level detail.

## Local development (without Docker)

### Prerequisites

- Node.js & npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- MongoDB (local instance or an Atlas connection string)
- Gemini API key (optional — only needed for AI-assisted hints)

### Install

```sh
git clone <YOUR_GIT_URL>
cd ShikshaSarthi

npm install            # frontend deps
cd backend && npm install && cd ..   # backend deps
```

Create `backend/.env`:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
GEMINI_API_KEY=your_gemini_api_key   # optional
```

Create `.env` in the repo root:

```env
VITE_API_URL=/.
```

### Run

```sh
# Backend (from backend/)
npm start
# or with auto-reload:
npx nodemon index.js

# Frontend (from repo root)
npm run dev
```

### First login

There is no standalone super-admin bootstrap script. The first Super Admin account
is created either by seeding/importing data (see `backend/scripts/importSchoolSeed.js`)
or directly via the `SuperAdmin` model/route on a fresh database. Once one Super
Admin exists, use it to register schools — each registration creates that school's
first School Admin login in the same step.

## Features

### For Students
- Subject-wise practice (Maths, Science, Social Science, Mental Ability, Vocabulary)
- Adaptive tests that adjust question difficulty to each answer
- Class quizzes with instant scoring and unlimited later review
- Audio, video, puzzle, and Mental Ability Test (MAT) activities
- Hints on quiz questions
- Editable profile (name, phone, email, photo) and self-service password change

### For Teachers
- Class management: create classes, enrol/remove students
- Quiz creation: MCQ, audio, video, and puzzle questions from a shared question bank, or custom questions
- Class-scoped announcements and document sharing
- Quiz analytics: score distributions, per-question breakdowns, student rankings
- Per-student history and insight charts (quizzes, adaptive tests, rating trend)

### For School Admins
- Register and remove teachers and students for their own school
- View school-level rosters and statistics
- Manage their own profile

### For Super Admins
- Register schools and their first School Admin login
- Create or remove any account directly across any school, if needed
- Platform-wide statistics across every school
- Trigger and monitor cloud sync
- Review, verify, and install app updates

## Technology stack

- **Frontend**: React + TypeScript + Vite, Shadcn/ui, Tailwind CSS, React Router, Axios, Recharts
- **Backend**: Express.js + Node.js, Mongoose ODM
- **Database**: MongoDB (local per school; AWS-mediated sync between schools)
- **Cloud**: AWS Lambda + API Gateway + S3 + DynamoDB (updates, backups, sync relay — not a live application server)
- **AI**: Google Gemini API (optional, for question hints)

## Project structure

```
ShikshaSarthi/
├── backend/
│   ├── models/        # Mongoose schemas (Student, Teacher, SchoolAdmin, SuperAdmin, School, Class, Question, Quiz, ...)
│   ├── routes/         # Express routes (superadmin, schooladmin, teacher, student, class, question, quiz, sync, aws, update, ...)
│   ├── sync/            # Local <-> remote sync engine
│   ├── aws/              # AWS control-plane client (updates, backups, cloud sync)
│   ├── scripts/           # Seeding, backup/restore, and question-bank import utilities
│   └── index.js             # Backend entry point
├── src/
│   ├── components/    # Shared UI (Header, Footer, shadcn primitives)
│   ├── pages/
│   │   ├── superadmin/  # Super Admin dashboard and tools
│   │   ├── schooladmin/  # School Admin dashboard
│   │   ├── teacher/       # Teacher dashboard, class/quiz management, analytics
│   │   └── student/         # Student dashboard, practice, tests, classes
│   └── contexts/       # React contexts (auth, quiz state)
├── question_bank/     # Static bilingual question banks used by practice/adaptive tests
├── docs/                # Deployment guides, release checklists, and the illustrated user guide
└── scripts/               # Docker/local-school operational scripts
```

## Key API routes

### Authentication
- `POST /superadmin/login`
- `POST /schooladmin/login`
- `POST /teachers/login`
- `POST /students/login`

### Account provisioning
- `POST /superadmin/register/school` — creates a school and its first School Admin
- `POST /schooladmin/register/teacher`
- `POST /schooladmin/register/student`
- `POST /classes` — teacher creates a class
- `POST /classes/:classId/students` — teacher enrols a student

### Questions & quizzes
- `GET /questions` — browse the question bank
- `POST /questions` — add a question
- `POST /quizzes` — create a quiz
- `GET /quizzes/:id` — fetch a quiz

### Sync & updates
- `GET /sync/status`, `POST /sync/run`
- `GET /api/updates/manifest`
- superadmin-only routes under `/api/aws/*` and `/api/update/*`

## Building for production

```sh
npm run build
```

The Docker image (`Dockerfile`) builds this frontend and serves it via nginx
alongside the Node/Express backend — see the [local school server deployment](#local-school-server-deployment-recommended)
section above for the supported way to run it.

## Documentation

- [`docs/LOCAL_SCHOOL_DEPLOYMENT.md`](docs/LOCAL_SCHOOL_DEPLOYMENT.md) — school IT setup guide
- [`docs/PHASE_3_UPDATE_AND_SYNC.md`](docs/PHASE_3_UPDATE_AND_SYNC.md) — update/sync API reference
- [`docs/ShikshaSarthi_Complete_Guide.pdf`](docs/ShikshaSarthi_Complete_Guide.pdf) — short illustrated guide for every role
- [`docs/PHASE_1_RELEASE_CHECKLIST.md`](docs/PHASE_1_RELEASE_CHECKLIST.md), [`docs/PHASE_2_AWS_SETUP.md`](docs/PHASE_2_AWS_SETUP.md), [`docs/PHASE_2_WINDOWS_INSTALLER.md`](docs/PHASE_2_WINDOWS_INSTALLER.md) — release and setup notes

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Built for schools with unreliable internet.**
