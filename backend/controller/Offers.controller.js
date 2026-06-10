const { Banner, Coupon, CategoryDeal } = require("../model/offers.model");

// ── Response helpers ───────────────────────────────────────────
const ok  = (res, data, msg = "Success")            => res.status(200).json({ success: true,  message: msg,  data });
const created = (res, data, msg = "Created")        => res.status(201).json({ success: true,  message: msg,  data });
const err = (res, msg = "Server error", code = 500) => res.status(code).json({ success: false, message: msg });

// ══════════════════════════════════════════════════════════════
//  GET ALL  — single call for user-facing /offers page
//  GET /api/offers
// ══════════════════════════════════════════════════════════════
exports.getAllOffers = async (req, res) => {
  try {
    const [banners, coupons, categories] = await Promise.all([
      Banner      .find({ active: true }).sort({ sortOrder: 1, createdAt: 1 }),
      Coupon      .find({ active: true }).sort({ createdAt: 1 }),
      CategoryDeal.find({ active: true }).sort({ sortOrder: 1, createdAt: 1 }),
    ]);
    ok(res, { banners, coupons, categories });
  } catch (e) {
    console.error("getAllOffers:", e);
    err(res, e.message);
  }
};

// ══════════════════════════════════════════════════════════════
//  BANNERS
// ══════════════════════════════════════════════════════════════

exports.getBanners = async (req, res) => {
  try {
    // Admin sees ALL banners (active + inactive)
    const banners = await Banner.find().sort({ sortOrder: 1, createdAt: 1 });
    ok(res, banners);
  } catch (e) { err(res, e.message); }
};

exports.createBanner = async (req, res) => {
  try {
    const { tag, title, subtitle, cta, ctaLink, image, gradient, productId, active, sortOrder } = req.body;
    if (!title?.trim()) return err(res, "Title is required", 400);
    const banner = await Banner.create({ tag, title: title.trim(), subtitle, cta, ctaLink, image, gradient, productId, active, sortOrder });
    created(res, banner, "Banner created");
  } catch (e) { err(res, e.message); }
};

exports.updateBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!banner) return err(res, "Banner not found", 404);
    ok(res, banner, "Banner updated");
  } catch (e) { err(res, e.message); }
};

exports.deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return err(res, "Banner not found", 404);
    ok(res, null, "Banner deleted");
  } catch (e) { err(res, e.message); }
};

// FIX: was returning full Mongoose document — now returns plain object
exports.toggleBanner = async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return err(res, "Banner not found", 404);
    banner.active = !banner.active;
    await banner.save();
    ok(res, banner.toObject(), `Banner ${banner.active ? "activated" : "deactivated"}`);
  } catch (e) { err(res, e.message); }
};

// ══════════════════════════════════════════════════════════════
//  COUPONS
// ══════════════════════════════════════════════════════════════

exports.getCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    ok(res, coupons);
  } catch (e) { err(res, e.message); }
};

// GET /api/offers/coupons/validate?code=SAVE200&orderAmount=1000
// NOTE: This route MUST be defined BEFORE /coupons/:id in the router
exports.validateCoupon = async (req, res) => {
  try {
    const { code, orderAmount = 0 } = req.query;
    if (!code) return err(res, "Coupon code is required", 400);

    const coupon = await Coupon.findOne({ code: code.trim().toUpperCase(), active: true });
    if (!coupon) return err(res, "Invalid or expired coupon", 400);

    if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit)
      return err(res, "Coupon usage limit reached", 400);

    const amount = Number(orderAmount);
    if (amount < coupon.minOrder)
      return err(res, `Minimum order ₹${coupon.minOrder} required`, 400);

    let discount = 0;
    if (coupon.type === "flat") {
      discount = coupon.value;
    } else {
      discount = (amount * coupon.value) / 100;
      if (coupon.maxDiscount > 0) discount = Math.min(discount, coupon.maxDiscount);
    }

    ok(res, { coupon, discount: Math.round(discount) }, "Coupon applied");
  } catch (e) { err(res, e.message); }
};

exports.createCoupon = async (req, res) => {
  try {
    const { code, type, value, title, description, minOrder, maxDiscount, expiry, color, active, usageLimit } = req.body;
    if (!code?.trim()) return err(res, "Coupon code is required", 400);
    if (value === undefined || value === null || value === "") return err(res, "Value is required", 400);

    const exists = await Coupon.findOne({ code: code.trim().toUpperCase() });
    if (exists) return err(res, "Coupon code already exists", 400);

    const coupon = await Coupon.create({
      code: code.trim().toUpperCase(),
      type, value: Number(value), title, description,
      minOrder: Number(minOrder || 0),
      maxDiscount: Number(maxDiscount || 0),
      expiry, color, active,
      usageLimit: Number(usageLimit || 0),
    });
    created(res, coupon, "Coupon created");
  } catch (e) {
    if (e.code === 11000) return err(res, "Coupon code already exists", 400);
    err(res, e.message);
  }
};

exports.updateCoupon = async (req, res) => {
  try {
    if (req.body.code) {
      const conflict = await Coupon.findOne({
        code: req.body.code.trim().toUpperCase(),
        _id: { $ne: req.params.id },
      });
      if (conflict) return err(res, "Coupon code already exists", 400);
      req.body.code = req.body.code.trim().toUpperCase();
    }
    const coupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!coupon) return err(res, "Coupon not found", 404);
    ok(res, coupon, "Coupon updated");
  } catch (e) { err(res, e.message); }
};

exports.deleteCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return err(res, "Coupon not found", 404);
    ok(res, null, "Coupon deleted");
  } catch (e) { err(res, e.message); }
};

// FIX: returns plain object via toObject()
exports.toggleCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) return err(res, "Coupon not found", 404);
    coupon.active = !coupon.active;
    await coupon.save();
    ok(res, coupon.toObject(), `Coupon ${coupon.active ? "activated" : "deactivated"}`);
  } catch (e) { err(res, e.message); }
};

// ── Increment usedCount when coupon is applied at checkout ────
exports.applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return err(res, "Code required", 400);
    const coupon = await Coupon.findOneAndUpdate(
      { code: code.toUpperCase(), active: true },
      { $inc: { usedCount: 1 } },
      { new: true }
    );
    if (!coupon) return err(res, "Coupon not found", 404);
    ok(res, coupon, "Usage recorded");
  } catch (e) { err(res, e.message); }
};

// ══════════════════════════════════════════════════════════════
//  CATEGORY DEALS
// ══════════════════════════════════════════════════════════════

exports.getCategories = async (req, res) => {
  try {
    const categories = await CategoryDeal.find().sort({ sortOrder: 1, createdAt: 1 });
    ok(res, categories);
  } catch (e) { err(res, e.message); }
};

exports.createCategory = async (req, res) => {
  try {
    const { label, link, discount, image, active, sortOrder } = req.body;
    if (!label?.trim()) return err(res, "Label is required", 400);
    const cat = await CategoryDeal.create({ label: label.trim(), link, discount, image, active, sortOrder });
    created(res, cat, "Category created");
  } catch (e) { err(res, e.message); }
};

exports.updateCategory = async (req, res) => {
  try {
    const cat = await CategoryDeal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!cat) return err(res, "Category not found", 404);
    ok(res, cat, "Category updated");
  } catch (e) { err(res, e.message); }
};

exports.deleteCategory = async (req, res) => {
  try {
    const cat = await CategoryDeal.findByIdAndDelete(req.params.id);
    if (!cat) return err(res, "Category not found", 404);
    ok(res, null, "Category deleted");
  } catch (e) { err(res, e.message); }
};

// FIX: returns plain object via toObject()
exports.toggleCategory = async (req, res) => {
  try {
    const cat = await CategoryDeal.findById(req.params.id);
    if (!cat) return err(res, "Category not found", 404);
    cat.active = !cat.active;
    await cat.save();
    ok(res, cat.toObject(), `Category ${cat.active ? "activated" : "deactivated"}`);
  } catch (e) { err(res, e.message); }
};

// ══════════════════════════════════════════════════════════════
//  SEED  — POST /api/offers/seed  (run once)
// ══════════════════════════════════════════════════════════════
exports.seedOffers = async (req, res) => {
  try {
    const [bc, cc, dc] = await Promise.all([
      Banner.countDocuments(),
      Coupon.countDocuments(),
      CategoryDeal.countDocuments(),
    ]);

    if (bc || cc || dc)
      return ok(res, { banners: bc, coupons: cc, categories: dc }, "Data already exists — seed skipped");

    await Banner.insertMany([
      { tag: "LIMITED TIME",   title: "MEGA SALE",    subtitle: "Up to 85% Off",    cta: "Shop Now",  ctaLink: "/sale",        gradient: "linear-gradient(135deg,#F01C6A,#C9A96E)", active: true, sortOrder: 1 },
      { tag: "TODAY ONLY",     title: "FLASH DEALS",  subtitle: "Starting ₹199",    cta: "Grab Now",  ctaLink: "/offers",      gradient: "linear-gradient(135deg,#C62828,#FF6F00)", active: true, sortOrder: 2 },
      { tag: "USE CODE: NEW10",title: "NEW ARRIVALS", subtitle: "Extra 10% Off",    cta: "Explore",   ctaLink: "/new-arrivals", gradient: "linear-gradient(135deg,#1565C0,#00BCD4)", active: true, sortOrder: 3 },
    ]);

    await Coupon.insertMany([
      { code: "FIRST50",  type: "percent", value: 50,  title: "First Order Discount", description: "50% off on your first order above ₹499",     minOrder: 499,  expiry: "31 Dec 2025", color: "#F01C6A", active: true  },
      { code: "SAVE200",  type: "flat",    value: 200, title: "Flat ₹200 Off",        description: "On orders above ₹999. Valid today only",      minOrder: 999,  expiry: "Today only",  color: "#C9A96E", active: true  },
      { code: "UPIOFF",   type: "percent", value: 5,   title: "UPI Extra 5% Off",     description: "Pay via UPI and get 5% cashback",             minOrder: 0,    expiry: "30 Jun 2025", color: "#1565C0", active: true  },
      { code: "SUMMER30", type: "percent", value: 30,  title: "Summer Special",       description: "30% off on all ethnic wear collections",      minOrder: 1499, expiry: "15 Jun 2025", color: "#E65100", active: false },
    ]);

    await CategoryDeal.insertMany([
      { label: "Ethnic Wear",  link: "/category/women/ethnic",  discount: "Up to 80%", image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=200&h=200&fit=crop&crop=top", active: true, sortOrder: 1 },
      { label: "Western Wear", link: "/category/women/western", discount: "Up to 70%", image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=200&h=200&fit=crop&crop=top", active: true, sortOrder: 2 },
      { label: "Men Fashion",  link: "/category/men",           discount: "Up to 75%", image: "https://images.unsplash.com/photo-1617137968427-85924c800a22?w=200&h=200&fit=crop&crop=top", active: true, sortOrder: 3 },
      { label: "Footwear",     link: "/category/footwear",      discount: "Up to 65%", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=200&h=200&fit=crop",             active: true, sortOrder: 4 },
      { label: "Jewellery",    link: "/category/jewellery",     discount: "Up to 85%", image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&h=200&fit=crop",            active: true, sortOrder: 5 },
      { label: "Kids",         link: "/category/kids",          discount: "Up to 60%", image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=200&h=200&fit=crop&crop=top",  active: true, sortOrder: 6 },
    ]);

    ok(res, null, "Seed data inserted successfully");
  } catch (e) { err(res, e.message); }
};