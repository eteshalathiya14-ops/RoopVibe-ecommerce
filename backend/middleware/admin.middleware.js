// backend/middleware/admin.middleware.js
const jwt = require("jsonwebtoken");

const getAdminSecret = () =>
  process.env.ADMIN_JWT_SECRET || process.env.JWT_SECRET || "roopvibe_admin_secret_change_in_prod";

module.exports = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(token, getAdminSecret());

    // Must be admin role
    if (payload.role !== "admin") {
      return res.status(403).json({ success: false, message: "Forbidden: Admin access only" });
    }

    req.admin = { id: payload.adminId, username: payload.username };
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Invalid or expired admin token" });
  }
};