// backend/model/CategoryFilter.js
// Admin-managed filters per navName (WOMEN, MEN, KIDS, HOME, etc.)
// Each filter group has a label, key, type, and options list
// Admin can add/edit/delete filter groups and their options

const mongoose = require("mongoose");

const filterOptionSchema = new mongoose.Schema(
  {
    label: { type: String, default: "" },  // Display text
    value: { type: String, default: "" },  // Actual value to match
    min:   { type: Number },               // For price/discount range
    max:   { type: Number },               // For price range
  },
  { _id: false }
);

const filterGroupSchema = new mongoose.Schema(
  {
    label:   { type: String, required: true },  // e.g. "PRICE RANGE"
    key:     { type: String, required: true },  // e.g. "price", "fabric"
    type:    {
      type: String,
      enum: ["radio", "checkbox", "color", "range"],
      default: "checkbox"
    },
    order:   { type: Number, default: 0 },
    active:  { type: Boolean, default: true },
    options: { type: [filterOptionSchema], default: [] },
  },
  { _id: true }
);

const categoryFilterSchema = new mongoose.Schema(
  {
    // Which navbar section these filters belong to
    navName: {
      type: String,
      required: true,
      uppercase: true,
      // e.g. "WOMEN", "MEN", "KIDS", "HOME" — or "ALL" for global
    },
    filterGroups: { type: [filterGroupSchema], default: [] },
  },
  { timestamps: true }
);

// One document per navName
categoryFilterSchema.index({ navName: 1 }, { unique: true });

module.exports = mongoose.model("CategoryFilter", categoryFilterSchema);