import Doctor from "../models/Doctor.js";

export const createDoctor = async (req, res, next) => {
  try {
    const { name, specialization } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Doctor name is required" });
    }

    const doctor = await Doctor.create({
      name,
      specialization,
    });

    res.status(201).json({
      message: "Doctor created successfully",
      doctor,
    });
  } catch (error) {
    next(error);
  }
};
