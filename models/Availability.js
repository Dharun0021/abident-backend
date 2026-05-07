const mongoose = require("mongoose");

const slotSchema = new mongoose.Schema(
  {
    startTime: { type: String, required: true }, // "HH:MM"
    endTime: { type: String, required: true },   // "HH:MM"
  },
  { _id: false }
);

const availabilitySchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    // slots stored as { slot1: {startTime, endTime}, slot2: {...}, ... }
    slots: {
      type: Map,
      of: slotSchema,
      required: true,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// One document per doctor per date
availabilitySchema.index({ doctorId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Availability", availabilitySchema);
