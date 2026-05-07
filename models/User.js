const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    text: { type: String },
    lat: { type: Number },
    lng: { type: Number },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema({
  uid: String, // optional (for Firebase later)
  name: String,
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  fcmToken: {
    type: String,
    default: null,
  },
  address: addressSchema,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);