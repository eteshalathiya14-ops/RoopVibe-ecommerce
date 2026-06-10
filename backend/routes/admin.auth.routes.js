// backend/routes/admin.auth.routes.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controller/admin.auth.controller");
const adminAuth = require("../middleware/admin.middleware");

// POST /api/admin/login  — no auth needed
router.post("/login", ctrl.adminLogin);

// GET /api/admin/me  — verify token & get admin info
router.get("/me", adminAuth, ctrl.adminMe);

module.exports = router;