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

    // Remove from active tokens
    slot.activeTokens = slot.activeTokens.filter(
      (id) => id.toString() !== token._id.toString(),
    );

    token.status = "CANCELLED";

    await token.save();
    await slot.save();

    // Promote waiting token if any
    const promotedToken = await promoteWaitingToken(slot._id);

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

    if (token.status !== "ACTIVE") {
      return res
        .status(400)
        .json({ message: "Only active tokens can be marked no-show" });
    }

    const slot = await Slot.findById(token.slotId);

    slot.activeTokens = slot.activeTokens.filter(
      (id) => id.toString() !== token._id.toString(),
    );

    token.status = "NO_SHOW";

    await token.save();
    await slot.save();

    const promotedToken = await promoteWaitingToken(slot._id);

    res.json({
      message: "Token marked as no-show",
      promotedToken: promotedToken ? promotedToken._id : null,
    });
  } catch (error) {
    next(error);
  }
};
