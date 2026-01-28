import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    slotId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Slot",
      required: true,
    },
    source: {
      type: String,
      enum: ["ONLINE", "WALKIN", "FOLLOWUP", "PAID", "EMERGENCY"],
      required: true,
    },
    priority: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["ACTIVE", "WAITING", "CANCELLED", "COMPLETED", "NO_SHOW"],
      default: "WAITING",
    },
  },
  { timestamps: true },
);

export default mongoose.model("Token", tokenSchema);
