import Token from "../models/Token.js";
import Slot from "../models/Slot.js";
import { PRIORITY_MAP } from "../utils/priorityMap.js";
import { allocateTokenToSlot } from "../services/allocation.service.js";
import { promoteWaitingToken } from "../services/allocation.service.js";

export const createToken = async (req, res, next) => {
  try {
    const { patientId, doctorId, slotId, source } = req.body;

    // Basic validation
    if (!patientId || !doctorId || !slotId || !source) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const slot = await Slot.findById(slotId);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    const priority = PRIORITY_MAP[source];

    if (!priority) {
      return res.status(400).json({ message: "Invalid token source" });
    }

    // Create token (initially WAITING)
    const token = await Token.create({
      patientId,
      doctorId,
      slotId,
      source,
      priority,
    });

    // Allocate token using service
    const allocationResult = await allocateTokenToSlot(slotId, token._id);

    return res.status(201).json({
      tokenId: token._id,
      status: allocationResult.result,
      message: allocationResult.message,
    });
  } catch (error) {
    next(error);
  }
};

export const cancelToken = async (req, res, next) => {
  try {
    const { tokenId } = req.params;

    const token = await Token.findById(tokenId);
    if (!token) {
      return res.status(404).json({ message: "Token not found" });
    }

    if (token.status === "CANCELLED") {
      return res.status(400).json({ message: "Token already cancelled" });
    }

    const slot = await Slot.findById(token.slotId);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    let promotedToken = null;

    // ✅ ONLY if token was ACTIVE
    if (token.status === "ACTIVE") {
      slot.activeTokens = slot.activeTokens.filter(
        (id) => id.toString() !== token._id.toString(),
      );

      await slot.save();

      promotedToken = await promoteWaitingToken(slot._id);
    }

    // If token was WAITING → just remove from waiting list
    if (token.status === "WAITING") {
      slot.waitingTokens = slot.waitingTokens.filter(
        (id) => id.toString() !== token._id.toString(),
      );
      await slot.save();
    }

    token.status = "CANCELLED";
    await token.save();

    res.json({
      message: "Token cancelled successfully",
      promotedToken: promotedToken ? promotedToken._id : null,
    });
  } catch (error) {
    next(error);
  }
};

export const markNoShow = async (req, res, next) => {
  try {
    const { tokenId } = req.params;

    const token = await Token.findById(tokenId);
    if (!token) {
      return res.status(404).json({ message: "Token not found" });
    }

    if (token.status === "NO_SHOW") {
      return res
        .status(400)
        .json({ message: "Token already marked as no-show" });
    }

    const slot = await Slot.findById(token.slotId);
    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    let promotedToken = null;

    // ✅ ONLY if token was ACTIVE
    if (token.status === "ACTIVE") {
      slot.activeTokens = slot.activeTokens.filter(
        (id) => id.toString() !== token._id.toString(),
      );

      await slot.save();

      promotedToken = await promoteWaitingToken(slot._id);
    }

    // If token was WAITING → just remove from waiting list
    if (token.status === "WAITING") {
      slot.waitingTokens = slot.waitingTokens.filter(
        (id) => id.toString() !== token._id.toString(),
      );
      await slot.save();
    }

    token.status = "NO_SHOW";
    await token.save();

    res.json({
      message: "Token marked as no-show",
      promotedToken: promotedToken ? promotedToken._id : null,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllTokens = async (req, res, next) => {
  try {
    const tokens = await Token.find()
      .populate("doctorId", "name specialization")
      .populate("slotId", "startTime endTime capacity");

    res.json(tokens);
  } catch (error) {
    next(error);
  }
};
