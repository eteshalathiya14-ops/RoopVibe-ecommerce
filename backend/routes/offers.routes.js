const express = require("express");
const router  = express.Router();
const ctrl    = require("../controller/Offers.controller");

// ── GET all active offers (user-facing — one fast call) ───────
router.get("/", ctrl.getAllOffers);

// ── Banners ───────────────────────────────────────────────────
router.get   ("/banners",             ctrl.getBanners);
router.post  ("/banners",             ctrl.createBanner);
router.put   ("/banners/:id",         ctrl.updateBanner);
router.delete("/banners/:id",         ctrl.deleteBanner);
router.patch ("/banners/:id/toggle",  ctrl.toggleBanner);

// ── Coupons ───────────────────────────────────────────────────
// IMPORTANT: /validate MUST come before /:id  — Express matches top-down
// If /:id is first, "validate" is treated as an id → findById("validate") → null → 404
router.get   ("/coupons",             ctrl.getCoupons);
router.get   ("/coupons/validate",    ctrl.validateCoupon);   // ?code=X&orderAmount=Y
router.post  ("/coupons",             ctrl.createCoupon);
router.post  ("/coupons/apply",       ctrl.applyCoupon);      // increments usedCount
router.put   ("/coupons/:id",         ctrl.updateCoupon);
router.delete("/coupons/:id",         ctrl.deleteCoupon);
router.patch ("/coupons/:id/toggle",  ctrl.toggleCoupon);

// ── Category Deals ────────────────────────────────────────────
router.get   ("/categories",              ctrl.getCategories);
router.post  ("/categories",              ctrl.createCategory);
router.put   ("/categories/:id",          ctrl.updateCategory);
router.delete("/categories/:id",          ctrl.deleteCategory);
router.patch ("/categories/:id/toggle",   ctrl.toggleCategory);

// ── Seed (admin — run once to populate defaults) ──────────────
router.post("/seed", ctrl.seedOffers);

module.exports = router;