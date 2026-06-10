const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  productId: { type: String, required: true, index: true },
  name:      { type: String, required: true },
  rating:    { type: Number, required: true, min: 1, max: 5 },
  text:      { type: String, required: true },
  date:      { type: String },
  verified:  { type: Boolean, default: false },
  images:    [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Review', reviewSchema);