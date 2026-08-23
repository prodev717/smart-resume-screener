import express from "express";
import cors from "cors";
import resumeRoutes from "./routes/resume.routes.js";
import jobDescriptionRoutes from "./routes/job_description.routes.js";
import screeningRoutes from "./routes/screening.routes.js";
import db from "./config/db.js";
import { GoogleGenAI } from "@google/genai";
import 'dotenv/config';

const app = express();
const ai = new GoogleGenAI();

app.use(cors());
app.use(express.json());

app.get("/health", async (req, res) => {
  const checks = {
    server: { status: "ok" },
    database: { status: "error" },
    gemini: { status: "error" },
  };

  const [databaseCheck, geminiCheck] = await Promise.allSettled([
    db.query("SELECT 1"),
    ai.models.get({ model: "gemini-2.5-flash" }),
  ]);

  if (databaseCheck.status === "fulfilled") {
    checks.database = { status: "ok" };
  }

  if (geminiCheck.status === "fulfilled") {
    checks.gemini = { status: "ok" };
  }

  const healthy = Object.values(checks).every(
    (check) => check.status === "ok"
  );

  return res.status(healthy ? 200 : 503).json({
    status: healthy ? "ok" : "error",
    checks,
  });
});

app.use("/api/resumes", resumeRoutes);
app.use("/api/job-descriptions", jobDescriptionRoutes);
app.use("/api/screenings", screeningRoutes);

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port " + (process.env.PORT || 3000));
});