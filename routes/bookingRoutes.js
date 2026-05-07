const express = require("express");
const { auth } = require("../middleware/auth");
const { createBooking, getUserBookings } = require("../controllers/bookingController");

const router = express.Router();

router.post("/create", auth, createBooking);
router.get("/user", auth, getUserBookings);

module.exports = router;
