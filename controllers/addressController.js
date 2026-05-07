const Address = require("../models/Address");

// POST /api/address/save
// Body: { userId, latitude, longitude, addressText }
exports.saveAddress = async (req, res) => {
  try {
    const { userId, latitude, longitude, addressText } = req.body;

    // Validation
    if (!userId || latitude === undefined || longitude === undefined || !addressText) {
      return res.status(400).json({
        message: "userId, latitude, longitude, and addressText are all required",
      });
    }

    const address = new Address({
      userId,
      latitude,
      longitude,
      addressText,
    });

    await address.save();

    return res.status(201).json({
      message: "Address saved successfully",
      address,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// GET /api/address/:userId
exports.getAddressByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const addresses = await Address.find({ userId }).sort({ createdAt: -1 });

    return res.status(200).json({ addresses });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// PUT /api/address/:id
exports.updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    const { latitude, longitude, addressText } = req.body;

    const address = await Address.findByIdAndUpdate(
      id,
      { latitude, longitude, addressText },
      { new: true }
    );

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    return res.status(200).json({
      message: "Address updated successfully",
      address,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// DELETE /api/address/:id
exports.deleteAddress = async (req, res) => {
  try {
    const { id } = req.params;

    const address = await Address.findByIdAndDelete(id);

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    return res.status(200).json({ message: "Address deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
