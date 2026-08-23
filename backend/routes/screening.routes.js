import express from "express";

import {
  getScreenings,
  getScreening,
  createScreening,
  updateScreening,
  deleteScreening,
} from "../controllers/screening.controller.js";

const screeningRoutes = express.Router();

screeningRoutes.get("/", getScreenings);
screeningRoutes.get("/:id", getScreening);
screeningRoutes.post("/", createScreening);
screeningRoutes.put("/:id", updateScreening);
screeningRoutes.delete("/:id", deleteScreening);

export default screeningRoutes;