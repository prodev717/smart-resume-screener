import express from "express";

import {
    createJobDescription,
    getJobDescriptions,
    getJobDescription,
    updateJobDescription,
    deleteJobDescription
} from "../controllers/job_description.controller.js";

const jobDescriptionRoutes = express.Router();

jobDescriptionRoutes.post("/", createJobDescription);

jobDescriptionRoutes.get("/", getJobDescriptions);

jobDescriptionRoutes.get("/:id", getJobDescription);

jobDescriptionRoutes.put("/:id", updateJobDescription);

jobDescriptionRoutes.delete("/:id", deleteJobDescription);

export default jobDescriptionRoutes;