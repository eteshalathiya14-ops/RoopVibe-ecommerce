const Review = require('../model/Review.model');

exports.getReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const reviews = await Review.find({ productId }).sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const { name, rating, text, date, verified, images } = req.body;
    const review = await Review.create({ productId, name, rating, text, date, verified: verified || false, images: images || [] });
    res.status(201).json({ success: true, review });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};