const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  title:     { type: String },
  price:     { type: Number },
  mrp:       { type: Number },
  img:       { type: String },
  brand:     { type: String },
  by:        { type: String },
  size:      { type: String },
  color:     { type: String },
  quantity:  { type: Number, default: 1 },
}, { _id: false });

const cartSchema = new mongoose.Schema({
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  items:     [cartItemSchema],
}, { timestamps: true });

module.exports = mongoose.model('Cart', cartSchema);