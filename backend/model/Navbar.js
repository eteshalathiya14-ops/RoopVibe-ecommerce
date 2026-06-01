const mongoose = require("mongoose");

const extraSchema = new mongoose.Schema({
  title: String,
  badge: String,
  items: [String],
}, { _id: false });

const columnSchema = new mongoose.Schema({
  title: { type: String, required: true },
  badge: String,
  items: [String],
  extra: [extraSchema],
}, { _id: true });

const navbarSchema = new mongoose.Schema({
  name:    { type: String, required: true, unique: true, uppercase: true },
  order:   { type: Number, default: 0 },
  special: { type: Boolean, default: false },
  active:  { type: Boolean, default: true },
  link:    { type: String, default: "" },
  columns: [columnSchema],
}, { timestamps: true });

module.exports = mongoose.model("Navbar", navbarSchema);