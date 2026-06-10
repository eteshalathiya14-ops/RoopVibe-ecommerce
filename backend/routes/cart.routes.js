const router = require('express').Router();
const auth   = require('../middleware/auth.middleware');
const { getCart, saveCart, clearCart } = require('../controller/cart.controller');

router.get('/',      auth, getCart);
router.post('/save', auth, saveCart);
router.post('/clear',auth, clearCart);

module.exports = router;