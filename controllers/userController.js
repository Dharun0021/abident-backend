const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// 🔥 REGISTER
exports.registerUser = async (req, res) => {
  const { name, email, password, fcmToken } = req.body;

  try {
    // Validation: Check if all fields are provided
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields (name, email, password) are required" });
    }

    // Validation: Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    // Validation: Password length (minimum 6 characters)
    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    // Check user exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user
    user = new User({
      name,
      email,
      password: hashedPassword,
      fcmToken: fcmToken || null,
    });

    await user.save();

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: "USER" },
      process.env.JWT_SECRET || "your_super_secret_jwt_key_12345",
      { expiresIn: "7d" }
    );

    res.json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        doctorId: null,
        doctorName: null,
        doctorSpecialization: null,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔥 LOGIN
exports.loginUser = async (req, res) => {
  const { email, password, fcmToken } = req.body;

  try {
    // Validation: Check if all fields are provided
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Validation: Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    let user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    if (fcmToken && fcmToken !== user.fcmToken) {
      user.fcmToken = fcmToken;
      await user.save();
    }

    // Generate JWT
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: "USER" },
      process.env.JWT_SECRET || "your_super_secret_jwt_key_12345",
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        doctorId: user.doctorId,
        doctorName: user.doctorName,
        doctorSpecialization: user.doctorSpecialization,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const userService = require("../services/user.service");

exports.addAddress = async (req, res) => {
  try {
    const { userId, text, lat, lng } = req.body;
    if (!userId) {
      return res.status(400).json({ message: "userId is required" });
    }

    const address = await userService.addOrUpdateAddress(userId, { text, lat, lng });
    return res.status(200).json({
      message: "Address saved successfully",
      address
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getAddress = async (req, res) => {
  try {
    const { userId } = req.params;
    const address = await userService.getAddressByUserId(userId);
    return res.status(200).json({ address });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

exports.getUserByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: "email is required" });
    }

    const user = await User.findOne({ email }).select("_id name email");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Example protected profile route
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔥 UPDATE USER
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { name, email },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "User updated successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔥 DELETE USER
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔥 SELECT DOCTOR
exports.selectDoctor = async (req, res) => {
  try {
    const { userId, doctorId } = req.body;

    if (!userId || !doctorId) {
      return res.status(400).json({ message: "userId and doctorId are required" });
    }

    // Fetch doctor details
    const Doctor = require("../models/Doctor");
    const doctor = await Doctor.findById(doctorId);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Update user with doctor selection
    const user = await User.findByIdAndUpdate(
      userId,
      {
        doctorId: doctorId,
        doctorName: doctor.name,
        doctorSpecialization: doctor.specialization,
      },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Doctor selected successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        doctorId: user.doctorId,
        doctorName: user.doctorName,
        doctorSpecialization: user.doctorSpecialization,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔥 UPDATE FCM TOKEN
exports.updateFcmToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    const userId = req.userId;

    if (!fcmToken) {
      return res.status(400).json({ message: "fcmToken is required" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { fcmToken },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "FCM token updated successfully",
      fcmToken: user.fcmToken,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
