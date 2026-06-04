// backend/routes/categoryFilter.routes.js

const express = require("express");
const router = express.Router();
const ctrl = require("../controller/categoryfilter.controller");

// ── PUBLIC routes (used by frontend CategoryPage) ─────────────

// GET /api/category-filters/:navName
// Returns active filter groups for a navbar section (e.g. WOMEN, MEN)
router.get("/:navName", ctrl.getFilters);

// GET /api/category-filters/products?navName=WOMEN&colTitle=Ethnic Wear&subItem=Sarees
// Returns products matching the category path
router.get("/products/search", ctrl.getCategoryProducts);

// ── ADMIN routes ──────────────────────────────────────────────

// GET /api/category-filters/admin/:navName
// Returns ALL filter groups (including hidden) for admin panel
router.get("/admin/:navName", ctrl.getFiltersAdmin);

// POST /api/category-filters/admin/:navName/save
// Saves entire filterGroups array for a navName (replaces existing)
router.post("/admin/:navName/save", ctrl.saveFilters);

// POST /api/category-filters/admin/:navName/group
// Adds a new filter group
router.post("/admin/:navName/group", ctrl.addFilterGroup);

// PUT /api/category-filters/admin/:navName/group/:groupId
// Updates a filter group
router.put("/admin/:navName/group/:groupId", ctrl.updateFilterGroup);

// DELETE /api/category-filters/admin/:navName/group/:groupId
// Deletes a filter group
router.delete("/admin/:navName/group/:groupId", ctrl.deleteFilterGroup);

// POST /api/category-filters/admin/:navName/reset
// Resets filters to defaults
router.post("/admin/:navName/reset", ctrl.resetFilters);

module.exports = router;