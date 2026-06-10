const Cart = require('../model/Cart.model');

exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user._id });
    res.json({ success: true, items: cart?.items || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.saveCart = async (req, res) => {
  try {
    const { items } = req.body;
    const cart = await Cart.findOneAndUpdate(
      { userId: req.user._id },
      { items },
      { upsert: true, new: true }
    );
    res.json({ success: true, items: cart.items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.clearCart = async (req, res) => {
  try {
    await Cart.findOneAndUpdate({ userId: req.user._id }, { items: [] });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};