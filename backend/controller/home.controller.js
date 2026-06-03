const HomeBanner = require("../model/HomeBanner");
const HomeCategory = require("../model/HomeCategory");
const HomeProduct = require("../model/HomeProduct");

// ─────────────────────────────────────────────────────────────
// Home BANNERS
// ─────────────────────────────────────────────────────────────
exports.getActiveBanners = async (req, res) => {
  try {
    const items = await HomeBanner.find({ active: true }).sort({ order: 1 });
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllBanners = async (req, res) => {
  try {
    const items = await HomeBanner.find({}).sort({ order: 1 });
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addBanner = async (req, res) => {
  try {
    const item = await HomeBanner.create(req.body);
    res.status(201).json({ success: true, message: "Banner created", item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateBanner = async (req, res) => {
  try {
    const item = await HomeBanner.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ success: false, message: "Banner not found" });
    res.json({ success: true, message: "Banner updated", item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteBanner = async (req, res) => {
  try {
    await HomeBanner.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Banner deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// Home CATEGORIES
// categories are stored row-wise per gender, to match Admin UI
// collection: HomeCategory { gender, item: {label,img,link,active,isMy,order} }
// ─────────────────────────────────────────────────────────────
exports.getActiveCategoriesGrouped = async (req, res) => {
  try {
    const rows = await HomeCategory.find({ "item.active": true });
    const grouped = {};
    for (const r of rows) {
      const g = r.gender;
      if (!grouped[g]) grouped[g] = [];
      grouped[g].push({
        id: r.item._id,
        label: r.item.label,
        img: r.item.img,
        link: r.item.link,
        active: r.item.active,
        isMy: r.item.isMy,
        order: r.item.order,
      });
    }

    for (const g of Object.keys(grouped)) {
      grouped[g].sort((a, b) => a.order - b.order);
    }

    res.json({ success: true, categories: grouped });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllCategoriesGrouped = async (req, res) => {
  try {
    const rows = await HomeCategory.find({});
    const grouped = {};
    for (const r of rows) {
      const g = r.gender;
      if (!grouped[g]) grouped[g] = [];
      grouped[g].push({
        id: r.item._id,
        label: r.item.label,
        img: r.item.img,
        link: r.item.link,
        active: r.item.active,
        isMy: r.item.isMy,
        order: r.item.order,
      });
    }

    for (const g of Object.keys(grouped)) {
      grouped[g].sort((a, b) => a.order - b.order);
    }

    res.json({ success: true, categories: grouped });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addCategory = async (req, res) => {
  try {
    const { gender, item } = req.body;
    if (!gender || !item || !item.label) {
      return res.status(400).json({ success: false, message: "gender and item.label required" });
    }

    const created = await HomeCategory.create({ gender: gender.toUpperCase(), item });
    res.status(201).json({ success: true, message: "Category created", row: created });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const { id, gender, item } = req.body;
    if (!id) return res.status(400).json({ success: false, message: "id required" });

    const q = { "item._id": id };
    if (gender) q.gender = String(gender).toUpperCase();

    const existing = await HomeCategory.findOne(q);
    if (!existing) return res.status(404).json({ success: false, message: "Category not found" });

    existing.item = { ...existing.item, ...(item || {}) };
    // ensure nested id stays stable
    existing.item._id = id;

    await existing.save();
    res.json({ success: true, message: "Category updated", row: existing });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


exports.deleteCategory = async (req, res) => {
  try {
    const { gender, id } = req.body;
    if (!id) return res.status(400).json({ success: false, message: "id required" });

    const q = { "item._id": id };
    if (gender) q.gender = String(gender).toUpperCase();

    await HomeCategory.deleteMany(q);
    res.json({ success: true, message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────
// Home PRODUCTS
// ─────────────────────────────────────────────────────────────
exports.getHomeProducts = async (req, res) => {
  try {
    const items = await HomeProduct.find({ active: true, showOnHome: true });
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const items = await HomeProduct.find({}).sort({ createdAt: -1 });
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.addProduct = async (req, res) => {
  try {
    const item = await HomeProduct.create(req.body);
    res.status(201).json({ success: true, message: "Product created", item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const item = await HomeProduct.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, message: "Product updated", item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await HomeProduct.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


