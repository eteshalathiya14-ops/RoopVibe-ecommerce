const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

// ⚠️ _id: true on sub-schema so MongoDB stores item._id reliably
const homeCategoryItemSchema = new mongoose.Schema(
  {
    _id:    { type: String, default: () => uuidv4() },
    label:  { type: String, required: true },
    img:    { type: String, default: "" }, // base64 OR url
    imgName:{ type: String, default: "" },
    link:   { type: String, default: "" },
    active: { type: Boolean, default: true },
    isMy:   { type: Boolean, default: false },
    order:  { type: Number,  default: 0 },
  },
  { _id: true } // keep sub-doc _id
);

const homeCategorySchema = new mongoose.Schema(
  {
    _id:    { type: String, default: () => uuidv4() },
    gender: { type: String, required: true, uppercase: true, index: true },
    item:   { type: homeCategoryItemSchema, required: true },
  },
  { timestamps: true, _id: false }
);

module.exports = mongoose.model("HomeCategory", homeCategorySchema);