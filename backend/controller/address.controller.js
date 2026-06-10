// backend/controller/address.controller.js
const Address = require("../model/address.model");
const mongoose = require("mongoose"); 

const ok  = (res, data, msg = "Success")            => res.status(200).json({ success: true,  message: msg,  data });
const err = (res, msg = "Server error", code = 500) => res.status(code).json({ success: false, message: msg });

// ── GET all addresses of logged-in user ────────────────────────
// GET /api/address
exports.getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    ok(res, addresses);
  } catch (e) { err(res, e.message); }
};

// ── GET single address ─────────────────────────────────────────
// GET /api/address/:id
exports.getAddress = async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!address) return err(res, "Address not found", 404);
    ok(res, address);
  } catch (e) { err(res, e.message); }
};

// ── CREATE address ─────────────────────────────────────────────
// POST /api/address
exports.createAddress = async (req, res) => {
  try { 
    const { name, phone, pincode, address, city, state, type, isDefault } = req.body;

    if (!name?.trim())    return err(res, "Name is required", 400);
    if (!phone?.trim())   return err(res, "Phone is required", 400);
    if (!pincode?.trim()) return err(res, "Pincode is required", 400);
    if (!address?.trim()) return err(res, "Address is required", 400);
    if (!city?.trim())    return err(res, "City is required", 400);
    if (!state?.trim())   return err(res, "State is required", 400);

    const userId = new mongoose.Types.ObjectId(req.user._id);  // ✅ string → ObjectId
    
    const count = await Address.countDocuments({ user: userId });
    const shouldBeDefault = isDefault || count === 0;

    const newAddress = await Address.create({
      user: userId, 
      name, phone, pincode, address, city, state,
      type: type || "home",
      isDefault: shouldBeDefault,
    });

    ok(res, newAddress, "Address saved successfully");
  } catch (e) { 
    console.log(" createAddress error:", e.message);
    err(res, e.message); 
  }
};

// ── UPDATE address ─────────────────────────────────────────────
// PUT /api/address/:id
exports.updateAddress = async (req, res) => {
  try {
    const existing = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!existing) return err(res, "Address not found", 404);

    const { name, phone, pincode, address, city, state, type, isDefault } = req.body;

    if (name)    existing.name    = name.trim();
    if (phone)   existing.phone   = phone.trim();
    if (pincode) existing.pincode = pincode.trim();
    if (address) existing.address = address.trim();
    if (city)    existing.city    = city.trim();
    if (state)   existing.state   = state.trim();
    if (type)    existing.type    = type;
    if (isDefault !== undefined) existing.isDefault = isDefault;

    await existing.save(); // pre-save hook handles default logic

    ok(res, existing, "Address updated successfully");
  } catch (e) { err(res, e.message); }
};

// ── DELETE address ─────────────────────────────────────────────
// DELETE /api/address/:id
exports.deleteAddress = async (req, res) => {
  try {
    const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    if (!address) return err(res, "Address not found", 404);

    // If deleted address was default, make the most recent one default
    if (address.isDefault) {
      const next = await Address.findOne({ user: req.user._id }).sort({ createdAt: -1 });
      if (next) { next.isDefault = true; await next.save(); }
    }

    ok(res, null, "Address deleted");
  } catch (e) { err(res, e.message); }
};

// ── SET DEFAULT ────────────────────────────────────────────────
// PATCH /api/address/:id/default
exports.setDefault = async (req, res) => {
  try {
    const address = await Address.findOne({ _id: req.params.id, user: req.user._id });
    if (!address) return err(res, "Address not found", 404);
    address.isDefault = true;
    await address.save(); // pre-save unsets others
    const all = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
    ok(res, all, "Default address updated");
  } catch (e) { err(res, e.message); }
};