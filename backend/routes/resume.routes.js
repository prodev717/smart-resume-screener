import express from "express";

import {
  upload,
  createResumes,
  getResumes,
  getResume,
  updateResume,
  deleteResume,
} from "../controllers/resume.controller.js";

const router = express.Router();

router.post(
  "/",
  upload.array("files", 20),
  createResumes
);

router.get("/", getResumes);

router.get("/:id", getResume);

router.put("/:id", updateResume);

router.delete("/:id", deleteResume);

export default router;