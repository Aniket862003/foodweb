const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Admin Codes
const ADMIN_CODES = {
  "Restaurant Admin": "REST_ADMIN",
  "Super Admin": "SUPER_ADMIN",
};

// User Registration
router.post("/register", async (req, res) => {
  const { name, email, phone, address, password, role, adminCode } = req.body;

  try {
    // Validate Admin Code for Admin roles
    if (role !== "Customer" && ADMIN_CODES[role] !== adminCode) {
      return res.status(400).json({ message: "Invalid Admin Code" });
    }

    // Check if email already exists
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Check if phone already exists
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) {
      return res.status(400).json({ message: "Phone number already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      phone,
      address,
      password: hashedPassword,
      role,
    });

    console.log("✅ User registered:", email);
    res.status(201).json({ message: "User Registered Successfully" });
  } catch (error) {
    console.error("❌ Registration Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// User Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("🔹 Login attempt:", email);

    const user = await User.findOne({ email });
    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(400).json({ message: "Invalid Email or Password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("❌ Password mismatch for:", email);
      return res.status(400).json({ message: "Invalid Email or Password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("✅ Login successful:", email);
    res.json({
      token,
      role: user.role,
      name: user.name,
      email: user.email,
      phone: user.phone,
      address: user.address,
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});

// Update User
router.put("/update", authMiddleware, async (req, res) => {
  const { name, email, phone, address } = req.body;

  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { name, email, phone, address } },
      { new: true, runValidators: true }
    ).select("-password");

    console.log("✅ User updated:", req.user.id);
    res.json(user);
  } catch (err) {
    console.error("❌ Update Error:", err);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
