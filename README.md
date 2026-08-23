# HireLens

HireLens is an AI-assisted hiring workspace for turning resumes and job descriptions into structured, searchable hiring signals. It extracts normalized resume and role data with Google Gemini, stores those objects in PostgreSQL JSONB columns, and evaluates candidate-to-role matches with an explainable score from 1 to 10.

The application is designed for a small recruiting workflow: upload a batch of resumes, create one or more job descriptions, run individual or sequential batch screenings, and review the highest-scoring candidates in a responsive dashboard.

## Live deployment

- Frontend: [https://hirelens-v1.vercel.app](https://hirelens-v1.vercel.app)
- Backend API: [https://hire-lens-api.vercel.app](https://hire-lens-api.vercel.app)

The deployed frontend should use the backend URL above as its `VITE_BACKEND_URL` environment variable. The backend health check is available at [https://hire-lens-api.vercel.app/health](https://hire-lens-api.vercel.app/health).

## Contents

- [Project overview](#project-overview)
- [Core capabilities](#core-capabilities)
- [Architecture](#architecture)
- [Repository structure](#repository-structure)
- [Technology stack](#technology-stack)
- [Live deployment](#live-deployment)
- [Local setup](#local-setup)
- [Configuration](#configuration)
- [Application workflows](#application-workflows)
- [API overview](#api-overview)
- [Data model](#data-model)
- [LLM prompts](#llm-prompts)
- [Health checks](#health-checks)
- [Error handling and limitations](#error-handling-and-limitations)
- [Development commands](#development-commands)

## Project overview

HireLens separates document understanding from candidate evaluation:

1. A recruiter uploads a PDF or plain-text resume.
2. The backend extracts text and asks Gemini to determine whether the document is a resume and, if so, normalize it into the resume schema.
3. A recruiter submits raw job-description text.
4. Gemini determines whether it is a job description and normalizes it into the role schema.
5. A screening request loads both JSONB objects, sends them to Gemini for comparison, validates the returned score and reason, and stores the result.
6. The frontend displays counts, health, structured records, and screenings sorted by score.

The frontend also supports sequential batch screening without a new backend endpoint. When a job is selected, it compares the complete local screening dataset against the resume list and sends one screening request at a time for every missing resume/job pair.

## Core capabilities

- Responsive HireLens dashboard with sidebar navigation.
- Resume upload for PDF and plain-text files, with up to 20 files per request.
- AI extraction into a consistent resume structure.
- Job-description extraction into a consistent role structure.
- Structured display and editing for resume and job JSONB data.
- Individual resume-to-job screening with a 1-to-10 score and reason.
- Frontend-only sequential batch screening for all unscreened resumes for a selected job.
- Local screening filters by resume and job description.
- Screening results sorted highest score first.
- Health endpoint covering application server, PostgreSQL, and Gemini availability.

## Architecture

```mermaid
flowchart LR
	Browser[React + Vite frontend] -->|HTTP / JSON / multipart| API[Express API]
	API --> ResumeRoutes[Resume routes]
	API --> JobRoutes[Job-description routes]
	API --> ScreeningRoutes[Screening routes]
	ResumeRoutes --> Gemini[Google Gemini]
	JobRoutes --> Gemini
	ScreeningRoutes --> Gemini
	ResumeRoutes --> DB[(PostgreSQL JSONB)]
	JobRoutes --> DB
	ScreeningRoutes --> DB
	Health[GET /health] --> DB
	Health --> Gemini
```

### Backend request flow

- `backend/index.js` creates the Express application, enables CORS and JSON parsing, exposes `/health`, mounts resource routers, and starts the HTTP server.
- Controllers validate requests, orchestrate Gemini calls, call model methods, and shape HTTP responses.
- Models use the shared `pg.Pool` from `backend/config/db.js` and issue parameterized SQL queries.
- Gemini is accessed through `@google/genai` using the `gemini-2.5-flash` model and response schemas from `backend/models/gemini.schemas.js`.
- Uploaded files are held in memory by Multer, converted to text, sent for extraction, and not persisted as files.

### Frontend request flow

- `frontend/src/App.jsx` defines routes for the overview, resume library, role library, and screening workspace.
- `frontend/src/components/AppShell.jsx` provides the shared HireLens brand, responsive sidebar, mobile navigation drawer, and page frame.
- Pages fetch their resource collections directly and retain the existing backend API contract.
- `Home.jsx` loads all four dashboard sources in parallel: resumes, job descriptions, screenings, and health.
- `Screening.jsx` loads all screenings once, filters and sorts them locally, and performs batch screening sequentially.

## Repository structure

```text
.
├── backend/
│   ├── config/db.js                  PostgreSQL connection pool
│   ├── controllers/                  Request validation and orchestration
│   ├── models/                       SQL-backed models and Gemini schemas
│   ├── routes/                       Express route definitions
│   ├── index.js                      API entrypoint and health endpoint
│   ├── package.json                  Backend dependencies and scripts
│   └── README.md                     Backend-specific API reference
├── frontend/
│   ├── src/components/AppShell.jsx  Shared HireLens navigation shell
│   ├── src/components/StructuredEditors.jsx
│   │                                  Resume and role schema editors
│   ├── src/pages/                    Dashboard and workflow pages
│   ├── src/App.jsx                   Client-side routes
│   ├── src/index.css                 Tailwind import and global styles
│   ├── package.json                  Frontend dependencies and scripts
│   └── vite.config.js                Vite and Tailwind configuration
├── startup.bat                       Windows startup helper
└── README.md                         This project overview
```

## Technology stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, React Router, Vite 8 |
| Styling | Tailwind CSS 4 with `@tailwindcss/vite` |
| Backend | Node.js, Express 5 |
| Database | PostgreSQL through `pg` |
| AI | Google Gemini through `@google/genai` |
| File handling | Multer memory storage and `pdf-parse` |

## Local setup

### Prerequisites

- Node.js and npm
- PostgreSQL-compatible database
- Google Gemini API key with access to `gemini-2.5-flash`

### Install dependencies

```powershell
cd backend
npm install

cd ..\frontend
npm install
```

### Configure the backend

Create `backend/.env` from `backend/.env.example`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
GEMINI_API_KEY=your_actual_api_key
PORT=3000
```

Initialize the database tables once:

```powershell
cd backend
node models/init.js
```

The initializer creates `resumes`, `job_descriptions`, and `screenings`. It uses plain `CREATE TABLE` statements, so do not run it again against a database where those tables already exist.

### Start the applications

Start the backend in one terminal:

```powershell
cd backend
npm run dev
```

Start the frontend in another:

```powershell
cd frontend
npm run dev
```

Vite prints the local frontend URL, normally `http://localhost:5173`. The frontend uses `VITE_BACKEND_URL` when provided and otherwise falls back to `http://localhost:3000`.

## Configuration

### Backend variables

- `DATABASE_URL`: PostgreSQL connection string. Required by the pool and health check.
- `GEMINI_API_KEY`: Gemini credential used for extraction, screening, and the health check.
- `PORT`: API port, defaulting to `3000`.

### Frontend variables

- `VITE_BACKEND_URL`: Optional backend origin, for example `http://localhost:3000`.

Do not commit real `.env` files or API keys. Use `.env.example` files for shareable configuration templates.

## Application workflows

### Resume library

The resume page accepts up to 20 `.pdf` or `.txt` files. Each document is processed independently. Unsupported files, empty documents, non-resumes, and failed files are reported per item so one bad upload does not hide the rest of the batch. Selected resumes can be viewed and edited through schema-aware fields instead of raw JSON.

### Role library

Recruiters paste raw job-description text. Gemini extracts the role into scalar fields such as title, company, location, work mode, experience, salary, and application details, plus categorized arrays for responsibilities, skills, qualifications, benefits, and keywords. The structured result can be edited and saved.

### Screening workspace

The workspace supports an individual screening and a frontend batch action:

- **Individual:** select one resume and one role, then send one screening request.
- **Batch:** select a role and choose **Screen all unscreened**. The frontend identifies resume IDs that do not already have a screening for that role, then awaits each `POST /api/screenings` before sending the next one.
- **Results:** all screening records are fetched from the API once, filtered locally by resume or job, and sorted by descending numeric score.

## API overview

The complete endpoint reference and JSON examples are in [backend/README.md](backend/README.md).

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Check server, database, and Gemini readiness |
| `POST` | `/api/resumes` | Upload and extract up to 20 resumes |
| `GET` | `/api/resumes` | List resumes |
| `GET` | `/api/resumes/:id` | Get one resume |
| `PUT` | `/api/resumes/:id` | Replace one structured resume |
| `DELETE` | `/api/resumes/:id` | Delete one resume |
| `POST` | `/api/job-descriptions` | Extract and save a job description |
| `GET` | `/api/job-descriptions` | List job descriptions |
| `GET` | `/api/job-descriptions/:id` | Get one job description |
| `PUT` | `/api/job-descriptions/:id` | Replace one structured job |
| `DELETE` | `/api/job-descriptions/:id` | Delete one job description |
| `GET` | `/api/screenings` | List screenings, optionally server-filtered |
| `GET` | `/api/screenings/:id` | Get one screening |
| `POST` | `/api/screenings` | Evaluate and save one resume/job pair |
| `PUT` | `/api/screenings/:id` | Update score and reason |
| `DELETE` | `/api/screenings/:id` | Delete one screening |

Successful collection responses include a `count` and resource array. Errors use `{ "error": "..." }`.

## Data model

The database stores extracted objects as JSONB while keeping relational IDs for references:

```text
resumes
	id          serial primary key
	resume      jsonb not null

job_descriptions
	id          serial primary key
	job_description jsonb not null

screenings
	id          serial primary key
	resume_id   integer references resumes(id)
	jd_id       integer references job_descriptions(id)
	score       integer
	reason      text
```

Resume JSON contains profile fields, `skills`, `education`, `experience`, `projects`, `certifications`, `achievements`, and `links`. Job JSON contains role metadata, `summary`, categorized requirements and skills, `benefits`, `keywords`, and application details. The canonical schemas are in `backend/models/gemini.schemas.js` and are documented with examples in [backend/README.md](backend/README.md#stored-data-shapes).

## LLM prompts

All three Gemini operations use `gemini-2.5-flash`, request JSON output, and provide a response schema. The following summaries reflect the prompt strings implemented in the controllers.

### Resume extraction

Implemented in `backend/controllers/resume.controller.js`.

```text
You are a resume extraction system.

Determine whether the following document is actually a resume.

If it is NOT a resume:
- Set "is_resume" to false
- Set "candidate" to null

If it IS a resume:
- Set "is_resume" to true
- Extract the candidate information into the provided schema.
- Do not invent information.
- If information is missing, use an empty string or empty array.
- Preserve the meaning of the original resume.

DOCUMENT:
<uploaded document text>
```

The backend only persists the `candidate` object when `is_resume` is true.

### Job-description extraction

Implemented in `backend/controllers/job_description.controller.js`.

```text
You are a job description extraction system.

Analyze the following document and determine whether it is actually a job description.

If it is NOT a job description:
- Set "is_job_description" to false
- Set "job" to null

If it IS a job description:
- Set "is_job_description" to true
- Extract the job information into the provided schema.
- Do not invent or infer information that is not explicitly present.
- If information is missing, use an empty string or empty array.
- Preserve the meaning of the original job description.
- Separate required skills/qualifications from preferred skills/qualifications whenever the document makes that distinction.
- Extract technical skills, soft skills, qualifications, responsibilities, experience requirements, and other relevant information accurately.
- Keep the extracted information concise and normalized.

DOCUMENT:
<submitted job-description text>
```

Only the normalized `job` object is stored after validation.

### Resume screening

Implemented in `backend/controllers/screening.controller.js`.

```text
You are an AI resume screening system.

Evaluate how well the candidate matches the given job description.

Consider:
- Required technical skills
- Preferred technical skills
- Work experience
- Required qualifications
- Education
- Certifications
- Responsibilities
- Relevant projects
- Overall suitability

Scoring:
- 1-2: Very poor match
- 3-4: Poor match
- 5-6: Moderate match
- 7-8: Good match
- 9: Very strong match
- 10: Excellent match

Important:
- Base the evaluation only on the information provided.
- Do not invent candidate experience or skills.
- Give more importance to required skills and qualifications than preferred ones.
- Provide a concise but meaningful reason explaining the score.
- Return only the requested JSON structure.

CANDIDATE RESUME:
<normalized resume JSON>

JOB DESCRIPTION:
<normalized job JSON>
```

The controller performs additional validation: the score must be an integer from 1 through 10, and the reason must contain non-whitespace text before the result is stored.

## Health checks

`GET /health` runs three checks:

- `server`: confirms the Express process is accepting the request.
- `database`: runs `SELECT 1` through the shared PostgreSQL pool.
- `gemini`: calls `ai.models.get({ model: "gemini-2.5-flash" })` to verify Gemini access without generating content.

The endpoint returns `200` when all checks are healthy and `503` when the server is running but a dependency is unavailable:

```json
{
	"status": "ok",
	"checks": {
		"server": { "status": "ok" },
		"database": { "status": "ok" },
		"gemini": { "status": "ok" }
	}
}
```

## Error handling and limitations

- There is currently no authentication or authorization.
- CORS is enabled for all origins.
- Uploaded files are held in memory and are not retained after processing.
- The backend does not prevent duplicate screenings; the frontend batch action avoids duplicates based on the screening data it has loaded.
- Batch screening is sequential by design. This reduces concurrent Gemini load but means a large resume pool takes longer.
- If the browser loses connection during a batch, the current run cannot be resumed automatically; rerunning the action will skip records already returned in the refreshed screening collection.
- The health endpoint exposes availability status but intentionally omits provider error details from the response.

## Development commands

Backend, from `backend/`:

```powershell
npm run dev       # nodemon index.js
node models/init.js
```

Frontend, from `frontend/`:

```powershell
npm run dev       # Vite development server
npm run build     # Production build
npm run lint      # ESLint
npm run preview   # Preview production build
```