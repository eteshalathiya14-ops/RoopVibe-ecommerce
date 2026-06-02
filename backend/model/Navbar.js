const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const extraSchema = new mongoose.Schema({
  title: String,
  badge: String,
  items: [String],
}, { _id: false });

const columnSchema = new mongoose.Schema({
  _id:   { type: String, default: uuidv4 },
  title: { type: String, required: true },
  badge: String,
  items: [String],
  extra: [extraSchema],
});

const navbarSchema = new mongoose.Schema({
  _id:     { type: String, default: uuidv4 },
  name:    { type: String, required: true, unique: true, uppercase: true },
  order:   { type: Number, default: 0 },
  special: { type: Boolean, default: false },
  active:  { type: Boolean, default: true },
  link:    { type: String, default: "" },
  columns: [columnSchema],
}, { timestamps: true, _id: false });

module.exports = mongoose.model("Navbar", navbarSchema);