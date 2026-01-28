import Slot from "../models/Slot.js";
import Doctor from "../models/Doctor.js";

export const createSlot = async (req, res, next) => {
  try {
    const { doctorId, startTime, endTime, capacity } = req.body;

    if (!doctorId || !startTime || !endTime || !capacity) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const slot = await Slot.create({
      doctorId,
      startTime,
      endTime,
      capacity,
    });

    res.status(201).json({
      message: "Slot created successfully",
      slot,
    });
  } catch (error) {
    next(error);
  }
};

export const getSlotsByDoctor = async (req, res, next) => {
  try {
    const slots = await Slot.find({ doctorId: req.params.doctorId })
      .populate("activeTokens")
      .populate("waitingTokens");

    res.json(slots);
  } catch (error) {
    next(error);
  }
};

export const getSlotById = async (req, res, next) => {
  try {
    const slot = await Slot.findById(req.params.slotId)
      .populate("activeTokens")
      .populate("waitingTokens");

    if (!slot) {
      return res.status(404).json({ message: "Slot not found" });
    }

    res.json(slot);
  } catch (error) {
    next(error);
  }
};
