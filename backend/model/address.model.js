// backend/model/address.model.js
const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name:     { type: String, required: true, trim: true },
    phone:    { type: String, required: true, trim: true },
    pincode:  { type: String, required: true, trim: true },
    address:  { type: String, required: true, trim: true },
    city:     { type: String, required: true, trim: true },
    state:    { type: String, required: true, trim: true },
    type:     { type: String, enum: ["home", "work", "other"], default: "home" },
    isDefault:{ type: Boolean, default: false },
  },
  { timestamps: true }
);

// ✅ next() hatao — async/await ke saath next ki zaroorat nahi
addressSchema.pre("save", async function () {
  if (this.isModified("isDefault") && this.isDefault) {
    await this.constructor.updateMany(
      { user: this.user, _id: { $ne: this._id } },
      { $set: { isDefault: false } }
    );
  }
});

module.exports = mongoose.model("Address", addressSchema);