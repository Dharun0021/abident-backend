const express = require("express");
const { doctorAuth } = require("../middleware/auth");
const {
  registerDoctor,
  loginDoctor,
  respondToBooking,
  updateDoctorProfile,
  updateFcmToken,
  getAllDoctors,
} = require("../controllers/doctorController");

const router = express.Router();

router.post("/register", registerDoctor);
router.post("/login", loginDoctor);
router.get("/all", getAllDoctors);
router.post("/respond", doctorAuth, respondToBooking);
router.put("/profile", doctorAuth, updateDoctorProfile);
router.post("/update-fcm-token", doctorAuth, updateFcmToken);

module.exports = router;
