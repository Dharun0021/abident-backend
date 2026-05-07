const mongoose = require("mongoose");
const Availability = require("../models/Availability");
const Doctor = require("../models/Doctor");

// ─── Create / upsert all slots for a date in ONE document ────────────────────
// Body: { date: "YYYY-MM-DD", slots: { slot1: { startTime, endTime }, ... } }
exports.createBulkAvailability = async (req, res) => {
  try {
    const { date, slots } = req.body;
    const doctorId = req.user.userId;

    if (!date || !slots || typeof slots !== "object") {
      return res.status(400).json({ message: "date and slots are required" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Upsert: if a document for this doctor+date already exists, replace its slots
    const availability = await Availability.findOneAndUpdate(
      { doctorId, date: new Date(date) },
      { $set: { slots, isAvailable: true } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json({
      message: "Availability saved successfully",
      availability,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ─── Old single-slot create (kept for backward compat) ───────────────────────
exports.createAvailability = async (req, res) => {
  try {
    const { date, startTime, endTime, duration } = req.body;
    const doctorId = req.user.userId;

    if (!date || !startTime || !endTime || !duration) {
      return res.status(400).json({
        message: "date, startTime, endTime, and duration are required",
      });
    }

    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return res.status(400).json({ message: "Time must be in HH:MM format" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Wrap single slot as slot1 in the new schema
    const availability = await Availability.findOneAndUpdate(
      { doctorId, date: new Date(date) },
      { $set: { "slots.slot1": { startTime, endTime }, isAvailable: true } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(201).json({
      message: "Availability created successfully",
      availability,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ─── Get all availabilities for a doctor ─────────────────────────────────────
exports.getDoctorAvailabilities = async (req, res) => {
  try {
    const doctorId = req.user.userId;

    const availabilities = await Availability.find({
      doctorId,
      isAvailable: true,
    }).sort({ date: 1 });

    return res.status(200).json({
      message: "Availabilities retrieved successfully",
      availabilities,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ─── Get availabilities by doctor ID (public — for patients) ─────────────────
exports.getAvailabilitiesByDoctorId = async (req, res) => {
  try {
    const { doctorId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: "Invalid doctor ID" });
    }

    const availabilities = await Availability.find({
      doctorId,
      isAvailable: true,
    })
      .populate("doctorId", "name specialization email")
      .sort({ date: 1 });

    return res.status(200).json({
      message: "Availabilities retrieved successfully",
      availabilities: availabilities.length ? availabilities : [],
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ─── Update availability (replace slots) ─────────────────────────────────────
exports.updateAvailability = async (req, res) => {
  try {
    const { availabilityId } = req.params;
    const { date, slots, isAvailable } = req.body;
    const doctorId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(availabilityId)) {
      return res.status(400).json({ message: "Invalid availability ID" });
    }

    const availability = await Availability.findById(availabilityId);
    if (!availability) {
      return res.status(404).json({ message: "Availability not found" });
    }

    if (availability.doctorId.toString() !== doctorId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (date) availability.date = new Date(date);
    if (slots) availability.slots = slots;
    if (isAvailable !== undefined) availability.isAvailable = isAvailable;

    await availability.save();

    return res.status(200).json({
      message: "Availability updated successfully",
      availability,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// ─── Delete availability document ─────────────────────────────────────────────
exports.deleteAvailability = async (req, res) => {
  try {
    const { availabilityId } = req.params;
    const doctorId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(availabilityId)) {
      return res.status(400).json({ message: "Invalid availability ID" });
    }

    const availability = await Availability.findById(availabilityId);
    if (!availability) {
      return res.status(404).json({ message: "Availability not found" });
    }

    if (availability.doctorId.toString() !== doctorId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await Availability.findByIdAndDelete(availabilityId);

    return res.status(200).json({ message: "Availability deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
