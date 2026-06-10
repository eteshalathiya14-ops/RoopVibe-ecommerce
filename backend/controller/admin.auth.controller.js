// backend/controller/admin.auth.controller.js
const jwt = require("jsonwebtoken");

const getAdminSecret = () =>
  process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || "roopvibe_admin_secret_change_in_prod";

const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || "admin@roopvibe.app";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Roopvibe@admin123";

exports.adminLogin = (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    if (email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase() || password !== ADMIN_PASSWORD) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials",
      });
    }

    const token = jwt.sign(
      { adminId: "admin_1", email: ADMIN_EMAIL, role: "admin" },
      getAdminSecret(),
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      message: "Admin login successful",
      token,
      admin: { email: ADMIN_EMAIL },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.adminMe = (req, res) => {
  res.json({
    success: true,
    admin: req.admin,
  });
};