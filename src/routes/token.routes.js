import express from "express";
import { createToken } from "../controllers/token.controller.js";
import { cancelToken } from "../controllers/token.controller.js";
import { markNoShow } from "../controllers/token.controller.js";

const router = express.Router();

router.post("/", createToken);
router.post("/:tokenId/cancel", cancelToken);

router.post("/:tokenId/no-show", markNoShow);

export default router;
