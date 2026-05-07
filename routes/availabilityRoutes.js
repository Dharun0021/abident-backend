const express = require("express");
const { doctorAuth } = require("../middleware/auth");
const {
  createAvailability,
  createBulkAvailability,
  getDoctorAvailabilities,
  getAvailabilitiesByDoctorId,
  updateAvailability,
  deleteAvailability,
} = require("../controllers/availabilityController");

const router = express.Router();

// Doctor routes (require authentication)
router.post("/create", doctorAuth, createAvailability);
router.post("/bulk-create", doctorAuth, createBulkAvailability);
router.get("/my-availabilities", doctorAuth, getDoctorAvailabilities);
router.put("/:availabilityId", doctorAuth, updateAvailability);
router.delete("/:availabilityId", doctorAuth, deleteAvailability);

// Public routes (for users to view doctor availabilities)
router.get("/doctor/:doctorId", getAvailabilitiesByDoctorId);

module.exports = router;
