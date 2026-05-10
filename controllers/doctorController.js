const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Doctor = require("../models/Doctor");
const Booking = require("../models/Booking");
const User = require("../models/User");
const { sendNotification } = require("../services/fcm.service");

exports.registerDoctor = async (req, res) => {
  try {
    const { name, email, password, specialization, fcmToken } = req.body;

    if (!name || !email || !password || !specialization) {
      return res.status(400).json({
        message: "name, email, password and specialization are required",
      });
    }

    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({ message: "Doctor already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const doctor = await Doctor.create({
      name,
      email,
      password: hashedPassword,
      specialization,
      fcmToken: fcmToken || null,
    });

    const token = jwt.sign(
      { userId: doctor._id, email: doctor.email, role: "DOCTOR" },
      process.env.JWT_SECRET || "your_super_secret_jwt_key_12345",
      { expiresIn: "7d" }
    );

    return res.status(201).json({
      message: "Doctor registered successfully",
      token,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.loginDoctor = async (req, res) => {
  try {
    const { email, password, fcmToken } = req.body;

    console.log('=== DOCTOR LOGIN DEBUG ===');
    console.log('Email:', email);
    console.log('Password:', password ? '****' : 'NOT PROVIDED');
    console.log('FCM Token received:', fcmToken);
    console.log('FCM Token is null:', fcmToken === null || fcmToken === undefined);
    console.log('===========================');

    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const doctor = await Doctor.findOne({ email });
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    if (fcmToken && fcmToken !== doctor.fcmToken) {
      console.log('Updating FCM token...');
      doctor.fcmToken = fcmToken;
      await doctor.save();
      console.log('FCM token updated successfully');
    } else if (!fcmToken) {
      console.log('No FCM token provided, skipping update');
    }

    console.log('Doctor after update:', {
      id: doctor._id,
      name: doctor.name,
      email: doctor.email,
      fcmToken: doctor.fcmToken,
    });

    const token = jwt.sign(
      { userId: doctor._id, email: doctor.email, role: "DOCTOR" },
      process.env.JWT_SECRET || "your_super_secret_jwt_key_12345",
      { expiresIn: "7d" }
    );

    console.log('JWT Token generated:', token);
    console.log('===========================');

    return res.status(200).json({
      message: "Doctor login successful",
      token,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
      },
    });
  } catch (error) {
    console.error('Login error:', error.message);
    return res.status(500).json({ message: error.message });
  }
};

exports.respondToBooking = async (req, res) => {
  try {
    const doctorId = req.userId;
    const { bookingId, status, newTime } = req.body;
    const allowedStatuses = ["ACCEPTED", "REJECTED", "RESCHEDULED", "COMPLETED"];

    if (!bookingId || !status) {
      return res
        .status(400)
        .json({ message: "bookingId and status are required" });
    }

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        message: "status must be ACCEPTED, REJECTED, RESCHEDULED or COMPLETED",
      });
    }

    if (status === "RESCHEDULED" && !newTime) {
      return res
        .status(400)
        .json({ message: "newTime is required when status is RESCHEDULED" });
    }

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
      return res.status(400).json({ message: "Invalid bookingId" });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }

    if (String(booking.doctorId) !== String(doctorId)) {
      return res
        .status(403)
        .json({ message: "You can only respond to your own bookings" });
    }

    booking.status = status;
    if (status === "RESCHEDULED") {
      booking.newTime = new Date(newTime);
      if (Number.isNaN(booking.newTime.getTime())) {
        return res.status(400).json({ message: "Invalid newTime format" });
      }
    } else {
      booking.newTime = null;
    }

    await booking.save();

    const user = await User.findById(booking.userId);
    
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║         📱 STATUS UPDATE NOTIFICATION LOG                 ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log('👤 User ID:', booking.userId);
    console.log('👤 User Name:', user?.name || 'Unknown');
    console.log('🔔 New Status:', status);
    console.log('📱 User FCM Token:', user?.fcmToken ? `✅ ${user.fcmToken.substring(0, 30)}...` : '❌ NOT FOUND');
    console.log('════════════════════════════════════════════════════════════');

    if (user?.fcmToken) {
      let message = "";
      switch (status) {
        case "ACCEPTED":
          message = "Your appointment has been accepted. We will update you soon.";
          break;
        case "REJECTED":
          message = "Your appointment has been rejected.";
          break;
        case "RESCHEDULED":
          message = `Your appointment has been rescheduled to ${new Date(newTime).toLocaleString()}.`;
          break;
        case "COMPLETED":
          message = "Your appointment has been completed.";
          break;
        default:
          message = `Your appointment status is now ${status}.`;
      }
      
      console.log('📤 Sending FCM notification to user...');
      const notificationResult = await sendNotification(
        user.fcmToken,
        "Appointment Update",
        message,
        {
          bookingId: booking._id,
          status,
        }
      );
      console.log('✅ Notification Result:', notificationResult);
      console.log('════════════════════════════════════════════════════════════\n');
    } else {
      console.log('❌ NO FCM TOKEN FOUND - NOTIFICATION NOT SENT');
      console.log('════════════════════════════════════════════════════════════\n');
    }

    return res.status(200).json({
      message: "Booking updated successfully",
      bookingId: booking._id,
      status: booking.status,
      newTime: booking.newTime,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateDoctorProfile = async (req, res) => {
  try {
    const doctorId = req.userId;
    const { name, email, specialization, password } = req.body;

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: "Invalid Doctor ID in token" });
    }

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ 
        message: `Doctor not found for ID: ${doctorId}. Please try registering a new account.` 
      });
    }

    if (name) doctor.name = name;
    if (specialization) doctor.specialization = specialization;

    if (email && email !== doctor.email) {
      const existingEmail = await Doctor.findOne({ email });
      if (existingEmail) {
        return res.status(400).json({ message: "Email already in use" });
      }
      doctor.email = email;
    }

    if (password) {
      doctor.password = await bcrypt.hash(password, 10);
    }

    await doctor.save();

    return res.status(200).json({
      message: "Profile updated successfully",
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateFcmToken = async (req, res) => {
  try {
    const doctorId = req.userId;
    const { fcmToken } = req.body;

    if (!fcmToken) {
      return res.status(400).json({ message: "fcmToken is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(doctorId)) {
      return res.status(400).json({ message: "Invalid Doctor ID in token" });
    }

    const doctor = await Doctor.findByIdAndUpdate(
      doctorId,
      { fcmToken },
      { new: true }
    );

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    return res.status(200).json({
      message: "FCM token updated successfully",
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getAllDoctors = async (req, res) => {
  try {
    // Return all doctors, excluding sensitive fields like password and fcmToken
    const doctors = await Doctor.find({}, { password: 0, fcmToken: 0 });
    return res.status(200).json({ doctors });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
