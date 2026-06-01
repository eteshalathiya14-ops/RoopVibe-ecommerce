const express = require("express");
const router = express.Router();


const navbarController = require("../controller/navbar.controller");

// ── Public: get active navbar items ──────────────────────
router.get("/", navbarController.getNavbar);

// ── Admin: get all navbar items ──────────────────────────
router.get("/all", navbarController.getAllNavbar);

// ── Admin: add navbar item ──────────────────────────────     
router.post("/", navbarController.addNavItem);

// ── Admin: update navbar item ────────────────────────────
router.put("/:id", navbarController.updateNavItem);

// ── Admin: delete navbar item ────────────────────────────
router.delete("/:id", navbarController.deleteNavItem);

module.exports = router;
