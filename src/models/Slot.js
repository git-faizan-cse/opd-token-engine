import mongoose from "mongoose";

const slotSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    capacity: {
      type: Number,
      required: true,
    },
    activeTokens: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Token",
      },
    ],
    waitingTokens: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Token",
      },
    ],
  },
  { timestamps: true },
);

export default mongoose.model("Slot", slotSchema);
