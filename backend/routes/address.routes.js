const express = require("express");
const router  = express.Router();
const ctrl    = require("../controller/address.controller");
const auth    = require("../middleware/auth.middleware");

router.use(auth);

router.get   ("/",            ctrl.getAddresses);
router.get   ("/:id",         ctrl.getAddress);
router.post  ("/",            ctrl.createAddress);
router.put   ("/:id",         ctrl.updateAddress);
router.delete("/:id",         ctrl.deleteAddress);
router.patch ("/:id/default", ctrl.setDefault);

module.exports = router;