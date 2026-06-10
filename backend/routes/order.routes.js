// backend/routes/order.routes.js
const express  = require("express");
const router   = express.Router();
const ctrl     = require("../controller/order.controller");
const auth     = require("../middleware/auth.middleware");       // user JWT
const adminAuth = require("../middleware/admin.middleware");     // admin JWT

// ── User routes (require user JWT) ───────────────────────────
router.post  ("/",               auth, ctrl.placeOrder);
router.get   ("/my",             auth, ctrl.getMyOrders);
router.get   ("/my/:id",         auth, ctrl.getMyOrderById);
router.post  ("/my/:id/return",  auth, ctrl.requestReturn);
router.post  ("/my/:id/cancel",  auth, ctrl.cancelOrder);

// ── Admin routes (require admin JWT) ─────────────────────────
router.get   ("/admin/all",               adminAuth, ctrl.adminGetAllOrders);
router.get   ("/admin/metrics",           adminAuth, ctrl.adminMetrics);
router.get   ("/admin/:id",               adminAuth, ctrl.adminGetOrder);
router.patch ("/admin/:id/status",        adminAuth, ctrl.adminUpdateStatus);
router.patch ("/admin/:id/return-action", adminAuth, ctrl.adminReturnAction);

module.exports = router;