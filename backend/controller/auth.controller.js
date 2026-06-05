const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../model/User.model");
const PhoneOtp = require("../model/PhoneOtp.model");
const { isStrongPassword, strongPasswordMessage } = require("../utils/password.util");
const { sendVerificationEmail } = require("../utils/email.service");
const { verifyGoogleToken } = require("../utils/googleAuth.util");
const {
  normalizeIndianPhone,
  sendPhoneOtpSms,
} = require("../utils/sms.service");

const getJwtSecret = () =>
  process.env.JWT_SECRET || "roopvibe_dev_secret_change_in_production";

const signToken = (userId) =>
  jwt.sign({ userId }, getJwtSecret(), { expiresIn: "7d" });

const publicUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone || "",
  avatar: user.avatar || "",
  authProvider: user.authProvider || "local",
  emailVerified: Boolean(user.emailVerified),
});

const phoneToEmail = (phone10) => `91${phone10}@phone.roopvibe.app`;

const createVerification = () => ({
  token: crypto.randomBytes(32).toString("hex"),
  otp: String(crypto.randomInt(100000, 999999)),
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
});

const clearVerification = (user) => {
  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationOtp = undefined;
  user.emailVerificationExpires = undefined;
};

const attachVerificationPayload = (payload, emailResult, otp) => {
  payload.verifyUrl = emailResult.verifyUrl;
  payload.emailVerificationSent = Boolean(emailResult.realDelivery);
  if (!emailResult.realDelivery) {
    payload.verificationCode = otp;
  }
  return payload;
};

const handleDuplicateKey = (err, res) => {
  if (err.code !== 11000) return false;
  const field = Object.keys(err.keyPattern || {})[0];
  if (field === "email") {
    res.status(409).json({
      success: false,
      message: "An account with this email already exists",
    });
    return true;
  }
  if (field === "phone") {
    res.status(409).json({
      success: false,
      message: "This phone number is already registered",
    });
    return true;
  }
  res.status(409).json({ success: false, message: "Account already exists" });
  return true;
};

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required",
      });
    }

    if (!isStrongPassword(password)) {
      return res.status(400).json({
        success: false,
        message: strongPasswordMessage(),
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists",
      });
    }

    const { token, otp, expires } = createVerification();

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password,
      authProvider: "local",
      emailVerified: false,
      emailVerificationToken: token,
      emailVerificationOtp: otp,
      emailVerificationExpires: expires,
    });

    const emailResult = await sendVerificationEmail({
      to: user.email,
      name: user.name,
      token,
      otp,
    });

    const payload = attachVerificationPayload(
      {
        success: true,
        message: emailResult.realDelivery
          ? "Account created! Check your email for the verification code."
          : "Account created! Enter the verification code below.",
        user: publicUser(user),
      },
      emailResult,
      otp
    );

    res.status(201).json(payload);
  } catch (err) {
    if (handleDuplicateKey(err, res)) return;
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.query;
    if (!token) {
      return res.status(400).json({ success: false, message: "Verification token is required" });
    }

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() },
    }).select("+emailVerificationToken +emailVerificationExpires +emailVerificationOtp");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired verification link. Request a new code from login.",
      });
    }

    clearVerification(user);
    await user.save();

    const authToken = signToken(user._id);

    res.json({
      success: true,
      message: "Email verified successfully!",
      token: authToken,
      user: publicUser(user),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.verifyEmailCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email?.trim() || !code?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email and verification code are required",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
      emailVerificationExpires: { $gt: new Date() },
    }).select("+emailVerificationOtp +emailVerificationExpires");

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired code. Resend a new code.",
      });
    }

    if (user.emailVerified) {
      const authToken = signToken(user._id);
      return res.json({
        success: true,
        message: "Email already verified.",
        token: authToken,
        user: publicUser(user),
      });
    }

    if (user.emailVerificationOtp !== code.trim()) {
      return res.status(400).json({
        success: false,
        message: "Incorrect verification code. Please try again.",
      });
    }

    clearVerification(user);
    await user.save();

    const authToken = signToken(user._id);

    res.json({
      success: true,
      message: "Email verified successfully!",
      token: authToken,
      user: publicUser(user),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email?.trim()) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+emailVerificationToken +emailVerificationOtp +emailVerificationExpires");

    if (!user) {
      return res.json({
        success: true,
        message: "If an account exists, a verification email has been sent.",
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: "This email is already verified. You can log in.",
      });
    }

    const { token, otp, expires } = createVerification();
    user.emailVerificationToken = token;
    user.emailVerificationOtp = otp;
    user.emailVerificationExpires = expires;
    await user.save();

    const emailResult = await sendVerificationEmail({
      to: user.email,
      name: user.name,
      token,
      otp,
    });

    const payload = attachVerificationPayload(
      {
        success: true,
        message: emailResult.realDelivery
          ? "Verification email sent. Check your inbox."
          : "New verification code generated. Enter it below.",
      },
      emailResult,
      otp
    );

    res.json(payload);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    }).select("+password +emailVerificationOtp");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const match = await user.comparePassword(password);
    if (!match) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.emailVerified) {
      return res.status(200).json({
        success: false,
        message: "Verify your email with the code we sent, then log in again.",
        emailVerified: false,
        needsVerification: true,
        verificationCode: user.emailVerificationOtp || null,
      });
    }

    const token = signToken(user._id);

    res.json({
      success: true,
      message: "Login successful",
      token,
      user: publicUser(user),
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, user: publicUser(user) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) {
      return res.status(400).json({
        success: false,
        message: "Google sign-in token is required",
      });
    }

    const profile = await verifyGoogleToken(credential);

    let user = await User.findOne({
      $or: [{ googleId: profile.googleId }, { email: profile.email }],
    });

    if (user) {
      if (!user.googleId) {
        user.googleId = profile.googleId;
        user.authProvider = user.authProvider === "local" ? "google" : user.authProvider;
      }
      if (profile.picture) user.avatar = profile.picture;
      user.emailVerified = true;
      if (!user.name && profile.name) user.name = profile.name;
      await user.save();
    } else {
      user = await User.create({
        name: profile.name,
        email: profile.email,
        googleId: profile.googleId,
        avatar: profile.picture,
        authProvider: "google",
        emailVerified: true,
      });
    }

    const token = signToken(user._id);

    res.json({
      success: true,
      message: "Signed in with Google",
      token,
      user: publicUser(user),
    });
  } catch (err) {
    res.status(401).json({
      success: false,
      message: err.message || "Google sign-in failed",
    });
  }
};

exports.sendPhoneOtp = async (req, res) => {
  try {
    const phone10 = normalizeIndianPhone(req.body.phone);
    if (!phone10) {
      return res.status(400).json({
        success: false,
        message: "Enter a valid 10-digit Indian mobile number",
      });
    }

    const otp = String(crypto.randomInt(100000, 999999));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await PhoneOtp.findOneAndUpdate(
      { phone: phone10 },
      { otp, expiresAt },
      { upsert: true, new: true }
    );

    try {
      await sendPhoneOtpSms(phone10, otp);
    } catch (smsErr) {
      await PhoneOtp.deleteOne({ phone: phone10 });
      return res.status(503).json({
        success: false,
        message: smsErr.message || "Failed to send SMS. Try again later.",
      });
    }

    res.json({
      success: true,
      message: `OTP sent via SMS to +91 ${phone10}`,
      phone: phone10,
      smsSent: true,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.verifyPhoneOtp = async (req, res) => {
  try {
    const phone10 = normalizeIndianPhone(req.body.phone);
    const code = String(req.body.code || "").trim();

    if (!phone10 || code.length !== 6) {
      return res.status(400).json({
        success: false,
        message: "Valid phone number and 6-digit OTP are required",
      });
    }

    const record = await PhoneOtp.findOne({
      phone: phone10,
      otp: code,
      expiresAt: { $gt: new Date() },
    });

    if (!record) {
      return res.status(400).json({
        success: false,
        message: "Wrong OTP. Please check the code and try again.",
      });
    }

    await PhoneOtp.deleteOne({ _id: record._id });

    const syntheticEmail = phoneToEmail(phone10);
    let user = await User.findOne({
      $or: [{ phone: phone10 }, { email: syntheticEmail }],
    });

    if (user) {
      user.phone = phone10;
      user.emailVerified = true;
      if (user.authProvider === "local" && !user.password) {
        user.authProvider = "phone";
      } else if (!user.googleId) {
        user.authProvider = "phone";
      }
      await user.save();
    } else {
      user = await User.create({
        name: `User ${phone10.slice(-4)}`,
        email: syntheticEmail,
        phone: phone10,
        authProvider: "phone",
        emailVerified: true,
      });
    }

    const token = signToken(user._id);

    res.json({
      success: true,
      message: "Logged in successfully",
      token,
      user: publicUser(user),
    });
  } catch (err) {
    if (handleDuplicateKey(err, res)) return;
    res.status(500).json({ success: false, message: err.message });
  }
};
