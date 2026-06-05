const express = require("express");
const router = express.Router();
const ctrl = require("../controller/auth.controller");
const auth = require("../middleware/auth.middleware");

router.post("/register", ctrl.register);
router.post("/login", ctrl.login);
router.get("/verify-email", ctrl.verifyEmail);
router.post("/verify-code", ctrl.verifyEmailCode);
router.post("/resend-verification", ctrl.resendVerification);
router.post("/google", ctrl.googleLogin);
router.post("/phone/send-otp", ctrl.sendPhoneOtp);
router.post("/phone/verify-otp", ctrl.verifyPhoneOtp);
router.get("/me", auth, ctrl.me);

module.exports = router;
