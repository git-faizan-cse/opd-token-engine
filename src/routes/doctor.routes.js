import express from "express";
import { createDoctor } from "../controllers/doctor.controller.js";
import { getAllDoctors } from "../controllers/doctor.controller.js";

const router = express.Router();

router.post("/", createDoctor);
router.get("/", getAllDoctors);

export default router;
