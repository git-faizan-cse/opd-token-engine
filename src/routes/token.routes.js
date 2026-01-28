import express from "express";
import { createToken } from "../controllers/token.controller.js";

const router = express.Router();

router.post("/", createToken);

export default router;
