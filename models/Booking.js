const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },
    visitType: {
      type: String,
      enum: ["Clinic Visit", "Home Visit"],
      required: true,
    },
    treatment: {
      type: { type: String, required: true },
      reason: { type: String, required: true },
      details: { type: String, default: "" },
      date: { type: Date, required: true },
      time: { type: String, required: true },
    },
    location: {
      lat: { type: Number },
      lng: { type: Number },
      addressText: { type: String },
    },
    status: {
      type: String,
      enum: ["PENDING", "ACCEPTED", "REJECTED", "RESCHEDULED"],
      default: "PENDING",
    },
    newTime: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
