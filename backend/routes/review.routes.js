const router = require('express').Router();
const { getReviews, addReview } = require('../controller/review.controller');

router.get('/:productId',  getReviews);
router.post('/:productId', addReview);

module.exports = router;