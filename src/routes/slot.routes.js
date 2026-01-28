import express from "express";
import { createSlot, getSlotById } from "../controllers/slot.controller.js";
import { getSlotsByDoctor } from "../controllers/slot.controller.js";

const router = express.Router();

router.post("/", createSlot);
router.get("/doctor/:doctorId", getSlotsByDoctor);
router.get("/slots/:slotId", getSlotById);

export default router;
