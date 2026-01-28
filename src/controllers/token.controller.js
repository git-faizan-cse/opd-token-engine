import Token from "../models/Token.js";
import Slot from "../models/Slot.js";
import { PRIORITY_MAP } from "../utils/priorityMap.js";
import { allocateTokenToSlot } from "../services/allocation.service.js";

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
