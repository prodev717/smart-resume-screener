import express from "express";
import cors from "cors";
import resumeRoutes from "./routes/resume.routes.js";
import 'dotenv/config';

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/resumes", resumeRoutes);

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running on port " + (process.env.PORT || 3000));
});