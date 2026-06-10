// backend/model/Order.model.js
const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  // ✅ FIX: productId string bhi accept karo (UUID products ke liye)
  productId: { type: mongoose.Schema.Types.Mixed, default: null },
  name:      { type: String, required: true },
  img:       { type: String, default: "" },
  price:     { type: Number, required: true },
  mrp:       { type: Number, default: 0 },
  size:      { type: String, default: "" },
  color:     { type: String, default: "" },
  quantity:  { type: Number, required: true, min: 1 },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },

  orderId: {
    type: String,
    unique: true,
  },

  items: [orderItemSchema],

  deliveryAddress: {
    name:    { type: String, required: true },
    phone:   { type: String, required: true },
    address: { type: String, required: true },
    city:    { type: String, required: true },
    state:   { type: String, required: true },
    pincode: { type: String, required: true },
    type:    { type: String, default: "home" },
  },

  paymentMethod: {
    type: String,
    enum: ["card", "upi", "netbanking", "cod", "emi"],
    required: true,
  },

  paymentLabel: { type: String, default: "" },

  pricing: {
    subtotal:       { type: Number, required: true },
    discount:       { type: Number, default: 0 },
    coupon:         { type: String, default: "" },
    couponDiscount: { type: Number, default: 0 },
    deliveryFee:    { type: Number, default: 0 },
    codFee:         { type: Number, default: 0 },
    total:          { type: Number, required: true },
  },

  status: {
    type: String,
    enum: [
      "Pending", "Processing", "In Transit", "Delivered",
      "Cancelled", "Return Requested", "Replacement Requested",
      "Return Approved", "Refunded",
    ],
    default: "Pending",
  },

  returnRequest: {
    type:   { type: String, enum: ["Return", "Replacement"] },
    reason: { type: String },
    date:   { type: Date },
  },

  statusHistory: [{
    status:    { type: String },
    updatedAt: { type: Date, default: Date.now },
    note:      { type: String },
  }],

  estimatedDelivery: { type: Date },

}, { timestamps: true });

// ── Auto-generate orderId + push status history ───────────────
orderSchema.pre("save", async function () {
  if (!this.orderId) {
    const rand = Math.floor(100000 + Math.random() * 900000);
    this.orderId = `RV-${rand}`;
  }

  if (this.isModified("status")) {
    this.statusHistory.push({ status: this.status, updatedAt: new Date() });
  }

  if (this.isNew && !this.estimatedDelivery) {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    this.estimatedDelivery = d;
  }
});

module.exports = mongoose.model("Order", orderSchema);