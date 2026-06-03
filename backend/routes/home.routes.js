const express = require("express");
const router  = express.Router();
const ctrl    = require("../controller/home.controller");

// ── Public (storefront) ──────────────────────────────────────
router.get("/banners",    ctrl.getActiveBanners);
router.get("/categories", ctrl.getActiveCategoriesGrouped);
router.get("/products",   ctrl.getHomeProducts);

// ── Admin ────────────────────────────────────────────────────
router.get   ("/admin/banners",          ctrl.getAllBanners);
router.post  ("/admin/banners",          ctrl.addBanner);
router.put   ("/admin/banners/:id",      ctrl.updateBanner);
router.delete("/admin/banners/:id",      ctrl.deleteBanner);

router.get   ("/admin/categories",       ctrl.getAllCategoriesGrouped);
router.post  ("/admin/categories",       ctrl.addCategory);
router.put   ("/admin/categories",       ctrl.updateCategory);
router.delete("/admin/categories",       ctrl.deleteCategory);

router.get   ("/admin/products",         ctrl.getAllProducts);
router.post  ("/admin/products",         ctrl.addProduct);
router.put   ("/admin/products/:id",     ctrl.updateProduct);
router.delete("/admin/products/:id",     ctrl.deleteProduct);

module.exports = router;