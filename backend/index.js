import express from "express";
import cors from "cors";
import resumeRoutes from "./routes/resume.routes.js";
import jobDescriptionRoutes from "./routes/job_description.routes.js";
import screeningRoutes from "./routes/screening.routes.js";
import 'dotenv/config';

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
  });
});

app.use("/api/resumes", resumeRoutes);
app.use("/api/job-descriptions", jobDescriptionRoutes);
app.use("/api/screenings", screeningRoutes);

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port " + (process.env.PORT || 3000));
});