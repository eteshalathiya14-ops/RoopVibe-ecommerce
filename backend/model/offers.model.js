const mongoose = require("mongoose");

// ── Banner ─────────────────────────────────────────────────────
const bannerSchema = new mongoose.Schema(
  {
    tag:       { type: String, default: "" },
    title:     { type: String, required: true, trim: true },
    subtitle:  { type: String, default: "" },
    cta:       { type: String, default: "Shop Now" },
    ctaLink:   { type: String, default: "/" },
    image:     { type: String, default: "" },       // URL (not base64 — use Cloudinary/S3)
    gradient:  { type: String, default: "linear-gradient(135deg,#F01C6A,#C9A96E)" },
    productId: { type: String, default: "" },       // product _id OR nav-category id
    active:    { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ── Coupon ─────────────────────────────────────────────────────
const couponSchema = new mongoose.Schema(
  {
    code:        { type: String, required: true, unique: true, uppercase: true, trim: true },
    type:        { type: String, enum: ["flat", "percent"], default: "flat" },
    value:       { type: Number, required: true, min: 0 },
    title:       { type: String, default: "" },
    description: { type: String, default: "" },
    minOrder:    { type: Number, default: 0 },
    maxDiscount: { type: Number, default: 0 },  // percent coupons — 0 = no cap
    expiry:      { type: String, default: "" }, // free text e.g. "31 Dec 2025"
    color:       { type: String, default: "#F01C6A" },
    active:      { type: Boolean, default: true },
    usageLimit:  { type: Number, default: 0 },  // 0 = unlimited
    usedCount:   { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ── Category Deal ──────────────────────────────────────────────
const categoryDealSchema = new mongoose.Schema(
  {
    label:     { type: String, required: true, trim: true },
    link:      { type: String, default: "/" },
    discount:  { type: String, default: "Up to 50%" },
    image:     { type: String, default: "" },
    active:    { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Banner       = mongoose.model("Banner",       bannerSchema);
const Coupon       = mongoose.model("Coupon",       couponSchema);
const CategoryDeal = mongoose.model("CategoryDeal", categoryDealSchema);

module.exports = { Banner, Coupon, CategoryDeal };