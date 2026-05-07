const User = require("../models/User");

/**
 * Add or update the address for a given userId.
 * @param {string} userId
 * @param {{ text: string, lat: number, lng: number }} addressData
 * @returns {Promise<object>} - the saved address object
 */
exports.addOrUpdateAddress = async (userId, addressData) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  user.address = {
    text: addressData.text,
    lat: addressData.lat,
    lng: addressData.lng,
  };

  await user.save();
  return user.address;
};

/**
 * Get the address for a given userId.
 * @param {string} userId
 * @returns {Promise<object>} - the address object
 */
exports.getAddressByUserId = async (userId) => {
  const user = await User.findById(userId).select("address");
  if (!user) {
    throw new Error("User not found");
  }
  return user.address;
};
