// backend/routes/support.routes.js
const express   = require("express");
const router    = express.Router();
const ctrl      = require("../controller/support.controller");
const auth      = require("../middleware/auth.middleware");
const adminAuth = require("../middleware/admin.middleware");

// User route — optional auth (logged in users auto-attach name/email)
router.post("/", (req, res, next) => {
  // Try to attach user if token present, but don't block if not
  const header = req.headers.authorization || "";
  const token  = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (token) {
    try {
      const jwt     = require("jsonwebtoken");
      const secret  = process.env.JWT_SECRET || "roopvibe_dev_secret_change_in_production";
      const payload = jwt.verify(token, secret);
      req.user = { _id: payload.userId };
    } catch {}
  }
  next();
}, ctrl.submitMessage);

// Admin routes
router.get   ("/admin/all",        adminAuth, ctrl.adminGetAll);
router.get   ("/admin/metrics",    adminAuth, ctrl.adminMetrics);
router.patch ("/admin/:id",        adminAuth, ctrl.adminUpdate);
router.delete("/admin/:id",        adminAuth, ctrl.adminDelete);

module.exports = router;