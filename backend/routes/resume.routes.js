import express from "express";

import {
  upload,
  createResumes,
  getResumes,
  getResume,
  updateResume,
  deleteResume,
} from "../controllers/resume.controller.js";

const resumeRoutes = express.Router();

resumeRoutes.post(
  "/",
  upload.array("files", 20),
  createResumes
);

resumeRoutes.get("/", getResumes);

resumeRoutes.get("/:id", getResume);

resumeRoutes.put("/:id", updateResume);

resumeRoutes.delete("/:id", deleteResume);

export default resumeRoutes;