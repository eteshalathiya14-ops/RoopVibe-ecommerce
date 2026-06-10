const router = require('express').Router();
const auth   = require('../middleware/auth.middleware');
const { getWishlist, saveWishlist } = require('../controller/wishlist.controller');

router.get('/',      auth, getWishlist);
router.post('/save', auth, saveWishlist);

module.exports = router;