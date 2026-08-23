import db from "../config/db.js";

db.query('CREATE TABLE resumes (id SERIAL PRIMARY KEY, resume JSONB NOT NULL);');
console.log("Resumes table created");

db.query('CREATE TABLE job_descriptions (id SERIAL PRIMARY KEY, job_description JSONB NOT NULL);');
console.log("Job descriptions table created");