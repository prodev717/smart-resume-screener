import db from "../config/db.js";

db.query('CREATE TABLE resumes (id SERIAL PRIMARY KEY, resume JSONB NOT NULL);');
console.log("Resumes table created");

db.query('CREATE TABLE job_descriptions (id SERIAL PRIMARY KEY, job_description JSONB NOT NULL);');
console.log("Job descriptions table created");

db.query('CREATE TABLE screenings ( id SERIAL PRIMARY KEY, resume_id INTEGER NOT NULL REFERENCES resumes(id) ON DELETE CASCADE, jd_id INTEGER NOT NULL REFERENCES job_descriptions(id) ON DELETE CASCADE, score INTEGER NOT NULL CHECK (score >= 1 AND score <= 10), reason TEXT NOT NULL );')
console.log("Screenings table created");