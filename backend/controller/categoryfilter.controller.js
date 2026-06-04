
const CategoryFilter = require("../model/Categoryfilter.model");

// PUBLIC: active filters for frontend
exports.getFilters = async (req, res) => {
  try {
    const upper = (req.params.navName || "WOMEN").toUpperCase();
    const doc = await CategoryFilter.findOne({ navName: upper });

    if (!doc) {
      return res.json({ success: true, navName: upper, filterGroups: [], isDefault: true });
    }

    const active = [...doc.filterGroups]
      .filter(g => g.active)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    res.json({ success: true, navName: upper, filterGroups: active, isDefault: false });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ADMIN: all filters including hidden
exports.getFiltersAdmin = async (req, res) => {
  try {
    const upper = (req.params.navName || "WOMEN").toUpperCase();
    const doc = await CategoryFilter.findOne({ navName: upper });

    if (!doc) {
      return res.json({ success: true, navName: upper, filterGroups: [], isDefault: true });
    }

    const sorted = [...doc.filterGroups].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    res.json({ success: true, navName: upper, filterGroups: sorted, isDefault: false });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ADMIN: save entire filterGroups array (upsert)
exports.saveFilters = async (req, res) => {
  try {
    const upper = (req.params.navName || "WOMEN").toUpperCase();
    const { filterGroups } = req.body;

    if (!Array.isArray(filterGroups)) {
      return res.status(400).json({ success: false, message: "filterGroups must be an array" });
    }

    const doc = await CategoryFilter.findOneAndUpdate(
      { navName: upper },
      { $set: { navName: upper, filterGroups } },
      { upsert: true, new: true, runValidators: false }
    );

    res.json({ success: true, message: "Filters saved", doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ADMIN: add a single filter group
exports.addFilterGroup = async (req, res) => {
  try {
    const upper = (req.params.navName || "WOMEN").toUpperCase();
    const { label, key, type, options, order } = req.body;

    if (!label || !key) {
      return res.status(400).json({ success: false, message: "label and key are required" });
    }

    let doc = await CategoryFilter.findOne({ navName: upper });
    if (!doc) {
      doc = await CategoryFilter.create({ navName: upper, filterGroups: [] });
    }

    doc.filterGroups.push({
      label, key,
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

// ADMIN: update a filter group
exports.updateFilterGroup = async (req, res) => {
  try {
    const upper = (req.params.navName || "").toUpperCase();
    const { groupId } = req.params;

    const doc = await CategoryFilter.findOne({ navName: upper });
    if (!doc) return res.status(404).json({ success: false, message: "No filters found" });

    const group = doc.filterGroups.id(groupId);
    if (!group) return res.status(404).json({ success: false, message: "Filter group not found" });

    Object.assign(group, req.body);
    await doc.save();

    res.json({ success: true, message: "Updated", doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ADMIN: delete a filter group
exports.deleteFilterGroup = async (req, res) => {
  try {
    const upper = (req.params.navName || "").toUpperCase();
    const { groupId } = req.params;

    const doc = await CategoryFilter.findOne({ navName: upper });
    if (!doc) return res.status(404).json({ success: false, message: "Not found" });

    doc.filterGroups = doc.filterGroups.filter(g => g._id.toString() !== groupId);
    await doc.save();

    res.json({ success: true, message: "Deleted", doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ADMIN: reset — clears all filters for this section
exports.resetFilters = async (req, res) => {
  try {
    const upper = (req.params.navName || "WOMEN").toUpperCase();

    const doc = await CategoryFilter.findOneAndUpdate(
      { navName: upper },
      { $set: { navName: upper, filterGroups: [] } },
      { upsert: true, new: true, runValidators: false }
    );

    res.json({ success: true, message: "Filters cleared", doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUBLIC: get products for a category path
exports.getCategoryProducts = async (req, res) => {
  try {
    const HomeProduct = require("../model/HomeProduct");
    const { navName, colTitle, subItem } = req.query;

    if (!navName) {
      return res.status(400).json({ success: false, message: "navName is required" });
    }

    const query = { active: true };
    query.navName = { $regex: new RegExp(`^${navName.trim()}$`, "i") };

    if (colTitle && colTitle.trim()) {
      query.colTitle = { $regex: new RegExp(`^${colTitle.trim()}$`, "i") };
    }
    if (subItem && subItem.trim()) {
      query.subItem = { $regex: new RegExp(`^${subItem.trim()}$`, "i") };
    }

    const products = await HomeProduct.find(query).sort({ createdAt: -1 });
    res.json({ success: true, products, total: products.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};