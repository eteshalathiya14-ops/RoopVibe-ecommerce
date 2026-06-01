const Navbar = require("../model/Navbar");

// ── Get active navbar items (public) ──────────────────────
exports.getNavbar = async (req, res) => {
  try {
    const items = await Navbar.find({ active: true }).sort({ order: 1 });
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin: get all items ───────────────────────────────────
exports.getAllNavbar = async (req, res) => {
  try {
    const items = await Navbar.find().sort({ order: 1 });
    res.json({ success: true, items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin: add navbar item ─────────────────────────────────
exports.addNavItem = async (req, res) => {
  try {
    const { name, order, special, link, columns } = req.body;
    const item = await Navbar.create({ name, order, special, link, columns: columns || [] });
    res.status(201).json({ success: true, message: "Nav item added", item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin: update navbar item ──────────────────────────────
exports.updateNavItem = async (req, res) => {
  try {
    const item = await Navbar.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    res.json({ success: true, message: "Updated", item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin: delete navbar item ──────────────────────────────
exports.deleteNavItem = async (req, res) => {
  try {
    await Navbar.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin: add column to navbar item ──────────────────────
exports.addColumn = async (req, res) => {
  try {
    const item = await Navbar.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Item not found" });
    item.columns.push({ title: req.body.title, items: [], extra: [] });
    await item.save();
    res.json({ success: true, message: "Column added", item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin: update column ───────────────────────────────────
exports.updateColumn = async (req, res) => {
  try {
    const item = await Navbar.findById(req.params.id);
    const col = item.columns.id(req.params.colId);
    if (!col) return res.status(404).json({ success: false, message: "Column not found" });
    Object.assign(col, req.body);
    await item.save();
    res.json({ success: true, message: "Column updated", item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin: delete column ───────────────────────────────────
exports.deleteColumn = async (req, res) => {
  try {
    const item = await Navbar.findById(req.params.id);
    item.columns = item.columns.filter(c => c._id.toString() !== req.params.colId);
    await item.save();
    res.json({ success: true, message: "Column deleted", item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};