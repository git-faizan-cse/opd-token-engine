import express from "express";
import { createToken, getAllTokens } from "../controllers/token.controller.js";
import { cancelToken } from "../controllers/token.controller.js";
import { markNoShow } from "../controllers/token.controller.js";

const router = express.Router();

router.post("/", createToken);
router.post("/:tokenId/cancel", cancelToken);

router.post("/:tokenId/no-show", markNoShow);
router.get("/", getAllTokens);

export default router;
