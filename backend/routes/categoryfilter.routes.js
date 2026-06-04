// backend/routes/categoryFilter.routes.js
// FIXED: Route order matters — specific routes before param routes

const express = require("express");
const router = express.Router();
const ctrl = require("../controller/categoryFilter.controller");

// ── SPECIFIC routes FIRST (before /:navName catches everything) ──

// GET /api/category-filters/products/search?navName=WOMEN&colTitle=...
// Must be BEFORE /:navName route or Express will treat "products" as navName
router.get("/products/search", ctrl.getCategoryProducts);

// ── ADMIN routes ──────────────────────────────────────────────

// GET  /api/category-filters/admin/:navName  — all groups (including hidden)
router.get("/admin/:navName", ctrl.getFiltersAdmin);

// POST /api/category-filters/admin/:navName/save — save entire config
router.post("/admin/:navName/save", ctrl.saveFilters);

// POST /api/category-filters/admin/:navName/group — add a group
router.post("/admin/:navName/group", ctrl.addFilterGroup);

// PUT  /api/category-filters/admin/:navName/group/:groupId
router.put("/admin/:navName/group/:groupId", ctrl.updateFilterGroup);

// DELETE /api/category-filters/admin/:navName/group/:groupId
router.delete("/admin/:navName/group/:groupId", ctrl.deleteFilterGroup);

// POST /api/category-filters/admin/:navName/reset
router.post("/admin/:navName/reset", ctrl.resetFilters);

// ── PUBLIC route LAST ─────────────────────────────────────────

// GET /api/category-filters/:navName — active filters for frontend
router.get("/:navName", ctrl.getFilters);

module.exports = router;