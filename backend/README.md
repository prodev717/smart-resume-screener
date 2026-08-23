# Smart Resume Screener Backend

Express and PostgreSQL API for extracting structured resume and job-description data with Google Gemini, storing the results as JSONB, and evaluating resume/job matches.

## Contents

- [Requirements](#requirements)
- [Setup](#setup)
- [Configuration](#configuration)
- [Run the server](#run-the-server)
- [Health check](#health-check)
- [Architecture](#architecture)
- [API conventions](#api-conventions)
- [Resume endpoints](#resume-endpoints)
- [Job-description endpoints](#job-description-endpoints)
- [Screening endpoints](#screening-endpoints)
- [Stored data shapes](#stored-data-shapes)
- [Database](#database)
- [Processing behavior](#processing-behavior)
- [Error handling](#error-handling)

## Requirements

- Node.js with npm
- A PostgreSQL-compatible database
- A Google Gemini API key with access to the `gemini-2.5-flash` model

## Setup

From this directory:

```bash
npm install
```

Create a `.env` file in `backend/`:

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
GEMINI_API_KEY=your_actual_api_key
PORT=3000
```

`DATABASE_URL` is required by the PostgreSQL connection pool. `GEMINI_API_KEY` is required for resume extraction, job-description extraction, and AI screening. `PORT` is optional and defaults to `3000`.

Initialize the tables once:

```bash
node models/init.js
```

The initializer creates `resumes`, `job_descriptions`, and `screenings`. It uses plain `CREATE TABLE` statements, so do not run it again against a database where those tables already exist.

## Run the server

Development mode reloads the server with nodemon:

```bash
npm run dev
```

The API is then available at:

```text
http://localhost:3000
```

The server enables CORS for all origins and parses JSON request bodies with Express.

## Health check

### `GET /health`

Check the server, PostgreSQL database, and Gemini availability.

```bash
curl http://localhost:3000/health
```

Success (`200 OK`):

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

The endpoint returns `503 Service Unavailable` when the server is running but either the database or Gemini check fails. The response keeps the same shape and marks failed checks with `"status": "error"`.

## Architecture

```text
HTTP request
  -> Express routes
  -> controller validation and orchestration
  -> Gemini extraction/evaluation when needed
  -> PostgreSQL model methods
  -> JSON response
```

Route prefixes:

| Resource | Prefix |
| --- | --- |
| Resumes | `/api/resumes` |
| Job descriptions | `/api/job-descriptions` |
| Screenings | `/api/screenings` |

All IDs are PostgreSQL serial integer IDs. Collection responses are ordered newest first by `id`.

## API conventions

- Unless stated otherwise, JSON requests require `Content-Type: application/json`.
- Successful collection responses contain `count` and an array.
- Successful single-resource responses wrap the resource in `resume`, `job`, or `screening`.
- Error responses use the shape `{ "error": "..." }`.
- The API does not provide authentication or authorization.
- The API does not expose uploaded files after processing; supported files are read into memory, converted to text, sent to Gemini, and discarded.

## Resume endpoints

### `POST /api/resumes`

Upload and process up to 20 files in one request. Use `multipart/form-data`; each file must use the field name `files`.

Supported file types:

- `application/pdf`
- `text/plain`

Other file types are returned as ignored results. The endpoint does not require every file in a batch to succeed.

Example:

```bash
curl -X POST http://localhost:3000/api/resumes \
  -F "files=@./candidate.pdf" \
  -F "files=@./candidate.txt"
```

Success (`201 Created`):

```json
{
  "count": 2,
  "resumes": [
    {
      "filename": "candidate.pdf",
      "ignored": false,
      "resume": {
        "id": 1,
        "resume": {
          "name": "Ada Lovelace",
          "email": "ada@example.com",
          "phone": "",
          "location": "London",
          "summary": "...",
          "skills": ["JavaScript"],
          "education": [],
          "experience": [],
          "projects": [],
          "certifications": [],
          "achievements": [],
          "links": []
        }
      }
    },
    {
      "filename": "candidate.txt",
      "ignored": true,
      "reason": "Document is not a resume"
    }
  ]
}
```

Possible per-file `reason` values include `Unsupported file type`, `No text could be extracted`, and `Document is not a resume`. A file-level processing failure is represented by `{ "filename": "...", "error": "Failed to process file" }`.

Responses:

- `201`: batch processed; inspect each item for `ignored` or `error`.
- `400`: no files were uploaded.
- `500`: unexpected request-level failure.

### `GET /api/resumes`

Return all stored resumes.

Success (`200 OK`):

```json
{
  "count": 1,
  "resumes": [
    {
      "id": 1,
      "resume": { "name": "Ada Lovelace", "skills": [] }
    }
  ]
}
```

### `GET /api/resumes/:id`

Return one stored resume.

- `200`: `{ "resume": { ... } }`
- `404`: `{ "error": "Resume not found" }`
- `500`: database failure

### `PUT /api/resumes/:id`

Replace the stored JSONB resume object. The body must contain a truthy `resume` property.

```json
{
  "resume": {
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "phone": "+44 20 0000 0000",
    "location": "London",
    "summary": "Updated summary",
    "skills": ["JavaScript", "SQL"],
    "education": [],
    "experience": [],
    "projects": [],
    "certifications": [],
    "achievements": [],
    "links": []
  }
}
```

- `200`: `{ "resume": { ... } }`
- `400`: `Resume data is required`
- `404`: `Resume not found`
- `500`: database failure

The update endpoint does not re-run Gemini or validate the complete resume schema; the supplied object replaces the existing JSONB value.

### `DELETE /api/resumes/:id`

Delete a resume. Related screenings are deleted by the database foreign-key cascade.

- `200`: `{ "message": "Resume deleted successfully", "resume": { ... } }`
- `404`: `Resume not found`
- `500`: database failure

## Job-description endpoints

### `POST /api/job-descriptions`

Extract and store a structured job description from plain text. The body must contain non-empty `text`.

```json
{
  "text": "Senior Backend Engineer\nWe are looking for ..."
}
```

Gemini first determines whether the text is a job description. Valid descriptions are normalized into the [job data shape](#job-description-shape).

- `201`: `{ "message": "Job description created successfully", "job": { ... } }`
- `400`: `Job description text is required`
- `400`: `The provided text is not a valid job description`
- `500`: extraction, parsing, or database failure

### `GET /api/job-descriptions`

Return all stored job descriptions.

```json
{
  "count": 1,
  "jobs": [
    {
      "id": 1,
      "job_description": { "title": "Senior Backend Engineer" }
    }
  ]
}
```

Returns `200` on success or `500` on database failure.

### `GET /api/job-descriptions/:id`

Return one stored job description.

- `200`: `{ "job": { ... } }`
- `404`: `{ "error": "Job description not found" }`
- `500`: database failure

### `PUT /api/job-descriptions/:id`

Replace the stored JSONB job-description object. The body must contain a truthy `job` property.

```json
{
  "job": {
    "title": "Senior Backend Engineer",
    "company": "Example Inc.",
    "location": "Remote",
    "employment_type": "Full-time",
    "work_mode": "Remote",
    "experience_required": "5+ years",
    "salary": "",
    "summary": "Build backend systems.",
    "responsibilities": ["Design APIs"],
    "required_skills": ["Node.js", "PostgreSQL"],
    "preferred_skills": [],
    "required_qualifications": [],
    "preferred_qualifications": [],
    "education": [],
    "certifications": [],
    "soft_skills": [],
    "benefits": [],
    "keywords": ["backend"],
    "application_deadline": "",
    "application_url": ""
  }
}
```

- `200`: `{ "message": "Job description updated successfully", "job": { ... } }`
- `400`: `Job description data is required`
- `404`: `Job description not found`
- `500`: database failure

Like resume updates, this endpoint replaces JSONB directly and does not invoke Gemini or enforce the complete extraction schema.

### `DELETE /api/job-descriptions/:id`

Delete a job description. Related screenings are deleted by the database foreign-key cascade.

- `200`: `{ "message": "Job description deleted successfully", "job": { ... } }`
- `404`: `Job description not found`
- `500`: database failure

## Screening endpoints

### `POST /api/screenings`

Evaluate a stored resume against a stored job description with Gemini and save the result.

```json
{
  "resume_id": 1,
  "jd_id": 1
}
```

The IDs must refer to existing records. The AI returns an integer score from 1 through 10 and a non-empty reason.

- `201`: `{ "message": "Screening completed successfully", "screening": { ... } }`
- `400`: `resume_id and jd_id are required`
- `404`: `Resume not found` or `Job description not found`
- `500`: AI/database failure, invalid AI score, or invalid AI reason

The API does not prevent duplicate screenings for the same resume/job pair.

### `GET /api/screenings`

Return screenings, optionally filtered by resume and/or job-description ID.

```text
GET /api/screenings
GET /api/screenings?resume_id=1
GET /api/screenings?jd_id=1
GET /api/screenings?resume_id=1&jd_id=1
```

When both filters are provided, only records matching both IDs are returned. Empty or falsy query values are ignored.

Success (`200`):

```json
{
  "count": 1,
  "screenings": [
    {
      "id": 1,
      "resume_id": 1,
      "jd_id": 1,
      "score": 8,
      "reason": "Strong match for the required backend skills."
    }
  ]
}
```

Returns `500` on database failure.

### `GET /api/screenings/:id`

Return one screening.

- `200`: `{ "screening": { ... } }`
- `404`: `{ "error": "Screening not found" }`
- `500`: database failure

### `PUT /api/screenings/:id`

Manually replace a screening score and reason. Both fields are required. `score` may be sent as a numeric string, but it must convert to an integer from 1 through 10.

```json
{
  "score": 8,
  "reason": "Updated reviewer assessment."
}
```

- `200`: `{ "message": "Screening updated successfully", "screening": { ... } }`
- `400`: missing fields or `Score must be an integer between 1 and 10`
- `404`: `Screening not found`
- `500`: database failure

### `DELETE /api/screenings/:id`

Delete a screening.

- `200`: `{ "message": "Screening deleted successfully", "screening": { ... } }`
- `404`: `Screening not found`
- `500`: database failure

## Stored data shapes

The database stores each extracted object inside a JSONB column. Missing source information is represented by empty strings or empty arrays in Gemini output.

### Resume shape

```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "location": "string",
  "summary": "string",
  "skills": ["string"],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "field": "string",
      "start_year": "string",
      "end_year": "string"
    }
  ],
  "experience": [
    {
      "company": "string",
      "role": "string",
      "start_date": "string",
      "end_date": "string",
      "description": "string"
    }
  ],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["string"]
    }
  ],
  "certifications": ["string"],
  "achievements": ["string"],
  "links": ["string"]
}
```

### Job-description shape

```json
{
  "title": "string",
  "company": "string",
  "location": "string",
  "employment_type": "string",
  "work_mode": "string",
  "experience_required": "string",
  "salary": "string",
  "summary": "string",
  "responsibilities": ["string"],
  "required_skills": ["string"],
  "preferred_skills": ["string"],
  "required_qualifications": ["string"],
  "preferred_qualifications": ["string"],
  "education": ["string"],
  "certifications": ["string"],
  "soft_skills": ["string"],
  "benefits": ["string"],
  "keywords": ["string"],
  "application_deadline": "string",
  "application_url": "string"
}
```

### Screening shape

```json
{
  "id": 1,
  "resume_id": 1,
  "jd_id": 1,
  "score": 8,
  "reason": "string"
}
```

## Database

The database initializer creates this schema:

```sql
CREATE TABLE resumes (
  id SERIAL PRIMARY KEY,
  resume JSONB NOT NULL
);

CREATE TABLE job_descriptions (
  id SERIAL PRIMARY KEY,
  job_description JSONB NOT NULL
);

CREATE TABLE screenings (
  id SERIAL PRIMARY KEY,
  resume_id INTEGER NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
  jd_id INTEGER NOT NULL REFERENCES job_descriptions(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score >= 1 AND score <= 10),
  reason TEXT NOT NULL
);
```

The application uses parameterized PostgreSQL queries through the `pg` connection pool. There are currently no migrations, indexes beyond primary keys, pagination parameters, or database-level uniqueness constraints for screening pairs.

## Processing behavior

### Resume upload

1. Multer accepts up to 20 files using memory storage.
2. PDFs are parsed with `pdf-parse`; plain-text files are decoded as UTF-8.
3. Unsupported, empty, and non-resume documents are reported per file and are not stored.
4. Valid resume text is sent to Gemini with a response schema.
5. The normalized candidate object is stored in `resumes.resume`.

### Job-description creation

1. The request text is validated for non-empty content.
2. Gemini classifies and extracts the description using the response schema.
3. Non-job-description text returns `400` and is not stored.
4. Valid normalized data is stored in `job_descriptions.job_description`.

### Screening creation

1. The referenced resume and job description are loaded.
2. Their JSONB payloads are sent to Gemini for a match evaluation.
3. The result must contain an integer score from 1 to 10 and a non-empty reason.
4. The evaluation is stored in `screenings`.

## Error handling

Controllers log detailed failures on the server and return intentionally generic `500` messages to clients. Client applications should use the HTTP status and the returned `error` field rather than relying on exception text.

The API currently has no request authentication, rate limiting, file-size limit, pagination, content-security policy, or request validation middleware beyond the controller checks described above. These are important production-hardening considerations, especially because uploaded text is sent to an external AI service and the JSONB update endpoints accept arbitrary objects.
