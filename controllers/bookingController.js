const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Doctor = require("../models/Doctor");
const { sendNotification } = require("../services/fcm.service");

exports.createBooking = async (req, res) => {
  try {
    const userId = req.userId;
    const { doctorId, visitType, treatment, location } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    if (!doctorId || !visitType || !treatment || !treatment.type || !treatment.date || !treatment.time) {
      return res.status(400).json({
        message: "doctorId, visitType, treatment (type, date, time) are required",
      });
    }

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: "Invalid doctorId" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const booking = await Booking.create({
      userId,
      doctorId,
      visitType,
      treatment: {
        type: treatment.type,
        reason: treatment.reason,
        details: treatment.details || "",
        date: new Date(treatment.date),
        time: treatment.time,
      },
      location: location || {},
      status: "PENDING",
    });

    if (doctor.fcmToken) {
      await sendNotification(
        doctor.fcmToken,
        "New Appointment",
        "You have a new booking request",
        {
          bookingId: booking._id,
          type: "NEW_BOOKING",
        }
      );
    }

    return res.status(201).json({
      bookingId: booking._id,
      status: booking.status,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

    // Fetch bookings for the user and populate doctor details
    const bookings = await Booking.find({ userId })
      .populate("doctorId", "name specialization email")
      .sort({ createdAt: -1 });

    return res.status(200).json({ bookings });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
