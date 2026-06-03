const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const homeBannerSchema = new mongoose.Schema(
  {
    _id:     { type: String, default: uuidv4 },
    tag:     { type: String, default: "" },
    title:   { type: String, default: "" },
    sub:     { type: String, default: "" },
    cta:     { type: String, default: "" },
    ctaLink: { type: String, default: "" },
    bg:      { type: String, default: "" },
    img:     { type: String, default: "" }, // base64 OR url
    imgName: { type: String, default: "" },
    active:  { type: Boolean, default: true },
    order:   { type: Number,  default: 0 },
  },
  { timestamps: true, _id: false }
);

module.exports = mongoose.model("HomeBanner", homeBannerSchema);