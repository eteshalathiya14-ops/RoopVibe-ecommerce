const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const imageSchema = new mongoose.Schema(
  { src: { type: String, default: "" }, name: { type: String, default: "" } },
  { _id: false }
);

const colorVariantSchema = new mongoose.Schema(
  {
    id:        { type: String, default: () => uuidv4() },
    colorName: { type: String, default: "" },
    hex:       { type: String, default: "#C9A96E" },
    images:    { type: [imageSchema], default: [] },
  },
  { _id: false }
);

const reviewSchema = new mongoose.Schema(
  { name: String, rating: Number, date: String, text: String, verified: Boolean },
  { _id: false }
);

const homeProductSchema = new mongoose.Schema(
  {
    _id:      { type: String, default: () => uuidv4() },

    title:    { type: String, default: "" },
    brand:    { type: String, default: "" },
    price:    { type: Number, default: 0 },
    mrp:      { type: Number, default: 0 },

    // category path
    navName:  { type: String, default: "" },
    colTitle: { type: String, default: "" },
    subItem:  { type: String, default: "" },

    // product details (dynamic per type)
    details: { type: mongoose.Schema.Types.Mixed, default: {} },

    // legacy top-level detail fields (kept for backward compat)
    fabric:      { type: String, default: "" },
    pattern:     { type: String, default: "" },
    occasion:    { type: String, default: "" },
    fit:         { type: String, default: "" },
    washCare:    { type: String, default: "" },
    description: { type: String, default: "" },

    highlights:    { type: [String], default: [] },
    sizes:         { type: [String], default: [] },

    rating:        { type: Number,  default: 0 },
    reviews:       { type: Number,  default: 0 },
    reviews_list:  { type: [reviewSchema], default: [] },

    inStock:       { type: Boolean, default: true },
    active:        { type: Boolean, default: true },
    showOnHome:    { type: Boolean, default: true },

    colorVariants: { type: [colorVariantSchema], default: [] },
  },
  { timestamps: true, _id: false }
);

module.exports = mongoose.model("HomeProduct", homeProductSchema);