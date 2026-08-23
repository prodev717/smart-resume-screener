import db from "../config/db.js";

db.query('CREATE TABLE resumes (id SERIAL PRIMARY KEY, resume JSONB NOT NULL);');
console.log("Resumes table created");