import { Pool } from "pg";
import 'dotenv/config';

const db = new Pool({
  connectionString: process.env.DATABASE_URL
});

export default db;