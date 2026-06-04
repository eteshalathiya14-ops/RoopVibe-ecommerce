// backend/controller/categoryFilter.controller.js

const CategoryFilter = require("../model/CategoryFilter");

// ── DEFAULT filter groups (used when no DB entry exists) ──────
const DEFAULT_FILTER_GROUPS = [
  {
    label: "PRICE RANGE",
    key: "price",
    type: "radio",
    order: 0,
    active: true,
    options: [
      { label: "Under ₹500",      value: "Under ₹500",      min: 0,    max: 499   },
      { label: "₹500 – ₹1,000",   value: "₹500 – ₹1,000",   min: 500,  max: 1000  },
      { label: "₹1,000 – ₹2,000", value: "₹1,000 – ₹2,000", min: 1000, max: 2000  },
      { label: "₹2,000 – ₹5,000", value: "₹2,000 – ₹5,000", min: 2000, max: 5000  },
      { label: "Above ₹5,000",    value: "Above ₹5,000",    min: 5000, max: 99999 },
    ],
  },
  {
    label: "DISCOUNT",
    key: "disc",
    type: "radio",
    order: 1,
    active: true,
    options: [
      { label: "10% and above", value: "10% and above", min: 10 },
      { label: "20% and above", value: "20% and above", min: 20 },
      { label: "40% and above", value: "40% and above", min: 40 },
      { label: "50% and above", value: "50% and above", min: 50 },
      { label: "60% and above", value: "60% and above", min: 60 },
    ],
  },
  {
    label: "SIZE",
    key: "sizes",
    type: "checkbox",
    order: 2,
    active: true,
    options: ["XS","S","M","L","XL","XXL","XXXL","Free Size"].map(s => ({ label: s, value: s })),
  },
  {
    label: "COLOR",
    key: "colors",
    type: "color",
    order: 3,
    active: true,
    options: [
      { label: "Red",    value: "Red",    hex: "#E53935" },
      { label: "Blue",   value: "Blue",   hex: "#1E88E5" },
      { label: "Green",  value: "Green",  hex: "#43A047" },
      { label: "Yellow", value: "Yellow", hex: "#FDD835" },
      { label: "Pink",   value: "Pink",   hex: "#E91E8C" },
      { label: "Orange", value: "Orange", hex: "#FB8C00" },
      { label: "White",  value: "White",  hex: "#F5F5F5", border: true },
      { label: "Black",  value: "Black",  hex: "#212121" },
      { label: "Purple", value: "Purple", hex: "#8E24AA" },
      { label: "Gold",   value: "Gold",   hex: "#C9A96E" },
    ],
  },
  {
    label: "PATTERN",
    key: "pattern",
    type: "checkbox",
    order: 4,
    active: true,
    options: ["Printed","Solid","Embroidered","Woven","Bandhani","Chikankari","Block Print"].map(p => ({ label: p, value: p })),
  },
  {
    label: "FABRIC",
    key: "fabric",
    type: "checkbox",
    order: 5,
    active: true,
    options: ["Cotton","Silk","Georgette","Chiffon","Rayon","Linen","Polyester"].map(f => ({ label: f, value: f })),
  },
  {
    label: "OCCASION",
    key: "occasion",
    type: "checkbox",
    order: 6,
    active: true,
    options: ["Casual","Festive","Party","Wedding","Office","Daily Wear"].map(o => ({ label: o, value: o })),
  },
];

// ── PUBLIC: Get filters for a navName (used by CategoryPage) ──
exports.getFilters = async (req, res) => {
  try {
    const { navName } = req.params;
    const upper = (navName || "WOMEN").toUpperCase();

    let doc = await CategoryFilter.findOne({ navName: upper });

    // If no custom filters saved, return defaults
    if (!doc) {
      return res.json({
        success: true,
        navName: upper,
        filterGroups: DEFAULT_FILTER_GROUPS,
        isDefault: true,
      });
    }

    // Only return active groups, sorted by order
    const active = [...doc.filterGroups]
      .filter(g => g.active)
      .sort((a, b) => a.order - b.order);

    res.json({ success: true, navName: upper, filterGroups: active, isDefault: false });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── ADMIN: Get all filters for a navName (including hidden) ───
exports.getFiltersAdmin = async (req, res) => {
  try {
    const { navName } = req.params;
    const upper = (navName || "WOMEN").toUpperCase();

    let doc = await CategoryFilter.findOne({ navName: upper });

    if (!doc) {
      // Return defaults but not saved yet
      return res.json({
        success: true,
        navName: upper,
        filterGroups: DEFAULT_FILTER_GROUPS,
        isDefault: true,
      });
    }

    const sorted = [...doc.filterGroups].sort((a, b) => a.order - b.order);
    res.json({ success: true, navName: upper, filterGroups: sorted, isDefault: false });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── ADMIN: Save full filterGroups for a navName ───────────────
// This replaces the entire filter config for that navName
exports.saveFilters = async (req, res) => {
  try {
    const { navName } = req.params;
    const upper = (navName || "WOMEN").toUpperCase();
    const { filterGroups } = req.body;

    if (!Array.isArray(filterGroups)) {
      return res.status(400).json({ success: false, message: "filterGroups must be an array" });
    }

    const doc = await CategoryFilter.findOneAndUpdate(
      { navName: upper },
      { navName: upper, filterGroups },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: "Filters saved", doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── ADMIN: Add a filter group ─────────────────────────────────
exports.addFilterGroup = async (req, res) => {
  try {
    const { navName } = req.params;
    const upper = (navName || "WOMEN").toUpperCase();
    const { label, key, type, options, order } = req.body;

    if (!label || !key) {
      return res.status(400).json({ success: false, message: "label and key are required" });
    }

    let doc = await CategoryFilter.findOne({ navName: upper });

    if (!doc) {
      // Create with defaults first, then add new group
      doc = await CategoryFilter.create({
        navName: upper,
        filterGroups: DEFAULT_FILTER_GROUPS,
      });
    }

    doc.filterGroups.push({
      label,
      key,
      type: type || "checkbox",
      options: options || [],
      order: order ?? doc.filterGroups.length,
      active: true,
    });

    await doc.save();
    res.json({ success: true, message: "Filter group added", doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── ADMIN: Update a filter group ──────────────────────────────
exports.updateFilterGroup = async (req, res) => {
  try {
    const { navName, groupId } = req.params;
    const upper = navName.toUpperCase();

    const doc = await CategoryFilter.findOne({ navName: upper });
    if (!doc) return res.status(404).json({ success: false, message: "No filters found for this section" });

    const group = doc.filterGroups.id(groupId);
    if (!group) return res.status(404).json({ success: false, message: "Filter group not found" });

    Object.assign(group, req.body);
    await doc.save();

    res.json({ success: true, message: "Updated", doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── ADMIN: Delete a filter group ──────────────────────────────
exports.deleteFilterGroup = async (req, res) => {
  try {
    const { navName, groupId } = req.params;
    const upper = navName.toUpperCase();

    const doc = await CategoryFilter.findOne({ navName: upper });
    if (!doc) return res.status(404).json({ success: false, message: "Not found" });

    doc.filterGroups = doc.filterGroups.filter(g => g._id.toString() !== groupId);
    await doc.save();

    res.json({ success: true, message: "Deleted", doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── ADMIN: Reset to defaults ──────────────────────────────────
exports.resetFilters = async (req, res) => {
  try {
    const { navName } = req.params;
    const upper = navName.toUpperCase();

    const doc = await CategoryFilter.findOneAndUpdate(
      { navName: upper },
      { navName: upper, filterGroups: DEFAULT_FILTER_GROUPS },
      { upsert: true, new: true }
    );

    res.json({ success: true, message: "Reset to defaults", doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUBLIC: Get products for a category ──────────────────────
// This is the KEY endpoint — filters by navName + colTitle + subItem
exports.getCategoryProducts = async (req, res) => {
  try {
    const HomeProduct = require("../model/HomeProduct");
    const { navName, colTitle, subItem } = req.query;

    const query = { active: true };

    if (navName)  query.navName  = { $regex: new RegExp(`^${navName}$`, "i") };
    if (colTitle) query.colTitle = { $regex: new RegExp(`^${colTitle}$`, "i") };
    if (subItem)  query.subItem  = { $regex: new RegExp(`^${subItem}$`, "i") };

    const products = await HomeProduct.find(query).sort({ createdAt: -1 });

    res.json({ success: true, products, total: products.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};