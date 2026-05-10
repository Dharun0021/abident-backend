const mongoose = require("mongoose");
const Booking = require("../models/Booking");
const Doctor = require("../models/Doctor");
const User = require("../models/User");
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

    const user = await User.findById(userId);
    const patientName = user?.name || "A patient";
    const bookingDate = booking.treatment.date
      ? booking.treatment.date.toISOString().split("T")[0]
      : "unknown date";
    const bookingTime = booking.treatment.time || "unknown time";
    const bookingReason = booking.treatment.reason || "treatment";

    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║         📬 BOOKING NOTIFICATION LOG                        ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('🏥 Doctor ID:', doctorId);
    console.log('🏥 Doctor Name:', doctor.name);
    console.log('🏥 Doctor Email:', doctor.email);
    console.log('📱 Doctor FCM Token:', doctor.fcmToken ? `✅ ${doctor.fcmToken.substring(0, 30)}...` : '❌ NOT FOUND');
    console.log('👤 Patient Name:', patientName);
    console.log('📅 Booking Date:', bookingDate);
    console.log('⏰ Booking Time:', bookingTime);
    console.log('📋 Booking Reason:', bookingReason);
    console.log('════════════════════════════════════════════════════════════');

    if (doctor.fcmToken) {
      console.log('📤 Sending FCM notification to doctor...');
      const notificationResult = await sendNotification(
        doctor.fcmToken,
        "New Appointment Request",
        `${patientName} requested ${visitType.toLowerCase()} on ${bookingDate} at ${bookingTime}`,
        {
          bookingId: booking._id,
          type: "NEW_BOOKING",
          patientName,
          visitType,
          bookingDate,
          bookingTime,
          reason: bookingReason,
        }
      );
      console.log('✅ Notification Result:', notificationResult);
      console.log('════════════════════════════════════════════════════════════\n');
    } else {
      console.log('❌ NO FCM TOKEN FOUND - NOTIFICATION NOT SENT');
      console.log('⚠️  Doctor needs to login first to receive notifications');
      console.log('════════════════════════════════════════════════════════════\n');
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

exports.getDoctorBookings = async (req, res) => {
  try {
    const doctorId = req.userId;
    const requestedDoctorId = req.query.doctorId?.toString();

    if (!doctorId) {
      return res.status(401).json({ message: "Unauthorized doctor" });
    }

    if (requestedDoctorId && requestedDoctorId !== doctorId) {
      return res.status(403).json({ message: "Doctor ID mismatch" });
    }

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: "Invalid doctor identifier" });
    }

    const bookings = await Booking.find({ doctorId })
      .populate("userId", "name email phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({ bookings });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getDoctorBookingById = async (req, res) => {
  try {
    const doctorId = req.userId;
    const requestedDoctorId = req.query.doctorId?.toString();
    const { bookingId } = req.params;

    if (!doctorId) {
      return res.status(401).json({ message: "Unauthorized doctor" });
    }

    if (requestedDoctorId && requestedDoctorId !== doctorId) {
      return res.status(403).json({ message: "Doctor ID mismatch" });
    }

    if (!bookingId || !mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: "Invalid booking identifier" });
    }

    const booking = await Booking.findOne({ _id: bookingId, doctorId })
      .populate("userId", "name email phone")
      .populate("doctorId", "name specialization email");

    if (!booking) {
      return res.status(404).json({ message: "Booking not found for this doctor" });
    }

    return res.status(200).json({ booking });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getDoctorPatients = async (req, res) => {
  try {
    const doctorId = req.userId;
    const requestedDoctorId = req.query.doctorId?.toString();

    if (!doctorId) {
      return res.status(401).json({ message: "Unauthorized doctor" });
    }

    if (requestedDoctorId && requestedDoctorId !== doctorId) {
      return res.status(403).json({ message: "Doctor ID mismatch" });
    }

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: "Invalid doctor identifier" });
    }

    const bookings = await Booking.find({ doctorId })
      .populate("userId", "name email phone dob")
      .sort({ createdAt: -1 });

    const patientMap = new Map();

    bookings.forEach((booking) => {
      const user = booking.userId;
      if (!user || !user._id) return;

      const key = user._id.toString();
      const existing = patientMap.get(key);
      const lastBooking = existing?.lastBooking ?? null;
      const bookingDate = booking.treatment?.date ? booking.treatment.date.toISOString() : null;

      if (!existing || (bookingDate && lastBooking && bookingDate > lastBooking.date)) {
        patientMap.set(key, {
          id: key,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          dob: user.dob ? user.dob.toISOString() : null,
          lastBooking: {
            id: booking._id,
            date: booking.treatment?.date ? booking.treatment.date.toISOString() : null,
            type: booking.treatment?.type || '',
            status: booking.status,
          },
        });
      } else if (!existing) {
        patientMap.set(key, {
          id: key,
          name: user.name,
          email: user.email,
          phone: user.phone || '',
          dob: user.dob ? user.dob.toISOString() : null,
          lastBooking: bookingDate
            ? {
                id: booking._id,
                date: bookingDate,
                type: booking.treatment?.type || '',
                status: booking.status,
              }
            : null,
        });
      }
    });

    const patients = Array.from(patientMap.values()).sort((a, b) => {
      if (a.lastBooking?.date == null) return 1;
      if (b.lastBooking?.date == null) return -1;
      return b.lastBooking.date.localeCompare(a.lastBooking.date);
    });

    return res.status(200).json({ patients });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getDoctorPatientDetails = async (req, res) => {
  try {
    const doctorId = req.userId;
    const requestedDoctorId = req.query.doctorId?.toString();
    const { patientId } = req.params;

    if (!doctorId) {
      return res.status(401).json({ message: "Unauthorized doctor" });
    }

    if (requestedDoctorId && requestedDoctorId !== doctorId) {
      return res.status(403).json({ message: "Doctor ID mismatch" });
    }

    if (!patientId || !mongoose.Types.ObjectId.isValid(patientId)) {
      return res.status(400).json({ message: "Invalid patient identifier" });
    }

    const user = await User.findById(patientId).select("name email phone dob");
    if (!user) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const bookings = await Booking.find({ doctorId, userId: patientId })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      patient: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        dob: user.dob || null,
      },
      bookings,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
