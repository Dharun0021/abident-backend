const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const { 
  saveAddress, 
  getAddressByUser,
  updateAddress,
  deleteAddress 
} = require("../controllers/addressController");

// POST /api/address/save  → save a new address
router.post("/save", auth, saveAddress);

// GET /api/address/:userId → get all addresses for a user
router.get("/:userId", auth, getAddressByUser);

// PUT /api/address/:id → update an address
router.put("/:id", auth, updateAddress);

// DELETE /api/address/:id → delete an address
router.delete("/:id", auth, deleteAddress);

module.exports = router;
