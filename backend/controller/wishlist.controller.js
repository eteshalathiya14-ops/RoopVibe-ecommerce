const Wishlist = require('../model/Wishlist.model');

exports.getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.user._id });
    res.json({ success: true, productIds: wishlist?.productIds || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.saveWishlist = async (req, res) => {
  try {
    const { productIds } = req.body;
    const wishlist = await Wishlist.findOneAndUpdate(
      { userId: req.user._id },
      { productIds },
      { upsert: true, new: true }
    );
    res.json({ success: true, productIds: wishlist.productIds });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};