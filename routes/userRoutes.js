const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");

const {
  registerUser,
  loginUser,
  addAddress,
  getAddress,
  getUserByEmail,
  getUserProfile,
  updateUser,
  deleteUser,
  selectDoctor,
  updateFcmToken,
} = require("../controllers/userController");

router.post("/register", registerUser);
router.post("/login", loginUser);

// FCM Token update route
router.post("/fcm-token", auth, updateFcmToken);

// Address routes
router.post("/address", auth, addAddress);
router.get("/:userId/address", auth, getAddress);

// Doctor selection route
router.post("/select-doctor", auth, selectDoctor);

// Lookup route
router.get("/lookup/by-email", auth, getUserByEmail);

// Protected profile route
router.get("/profile", auth, getUserProfile);

// User management routes
router.put("/:id", auth, updateUser);
router.delete("/:id", auth, deleteUser);

module.exports = router;