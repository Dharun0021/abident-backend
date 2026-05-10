const express = require("express");
const { auth, doctorAuth } = require("../middleware/auth");
const {
  createBooking,
  getUserBookings,
  getDoctorBookings,
  getDoctorBookingById,
  getDoctorPatients,
  getDoctorPatientDetails,
} = require("../controllers/bookingController");

const router = express.Router();

router.post("/create", auth, createBooking);
router.get("/user", auth, getUserBookings);
router.get("/doctor", doctorAuth, getDoctorBookings);
router.get("/doctor/patients", doctorAuth, getDoctorPatients);
router.get("/doctor/patient/:patientId", doctorAuth, getDoctorPatientDetails);
router.get("/doctor/:bookingId", doctorAuth, getDoctorBookingById);

module.exports = router;
