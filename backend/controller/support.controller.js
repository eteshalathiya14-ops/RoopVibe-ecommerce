// backend/controller/support.controller.js
const SupportMessage = require("../model/Supportmessage.model");

const ok  = (res, data, msg = "Success")            => res.status(200).json({ success: true,  message: msg,  data });
const err = (res, msg = "Server error", code = 500) => res.status(code).json({ success: false, message: msg });

// ── User: submit a message ─────────────────────────────────────
exports.submitMessage = async (req, res) => {
  try {
    const { topic, message } = req.body;
    if (!message?.trim()) return err(res, "Message is required", 400);

    // req.user may or may not exist (support can be used without login too)
    const user  = req.user?._id  || null;
    const name  = req.user?.name || req.body.name  || "";
    const email = req.user?.email|| req.body.email || "";

    const doc = await SupportMessage.create({
      user, name, email,
      topic:   topic?.trim()   || "",
      message: message.trim(),
    });

    ok(res, doc, "Message submitted successfully");
  } catch (e) {
    err(res, e.message);
  }
};

// ── Admin: get all messages ────────────────────────────────────
exports.adminGetAll = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const query = {};
    if (status && status !== "all") query.status = status;

    const total = await SupportMessage.countDocuments(query);
    const msgs  = await SupportMessage.find(query)
      .populate("user", "name email phone")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    ok(res, { messages: msgs, total, page: Number(page) });
  } catch (e) {
    err(res, e.message);
  }
};

// ── Admin: update status / note ────────────────────────────────
exports.adminUpdate = async (req, res) => {
  try {
    const { status, adminNote } = req.body;
    const msg = await SupportMessage.findById(req.params.id);
    if (!msg) return err(res, "Message not found", 404);

    if (status)    msg.status    = status;
    if (adminNote !== undefined) msg.adminNote = adminNote;
    await msg.save();

    ok(res, msg, "Updated");
  } catch (e) {
    err(res, e.message);
  }
};

// ── Admin: delete message ──────────────────────────────────────
exports.adminDelete = async (req, res) => {
  try {
    await SupportMessage.findByIdAndDelete(req.params.id);
    ok(res, null, "Deleted");
  } catch (e) {
    err(res, e.message);
  }
};

// ── Admin: metrics ─────────────────────────────────────────────
exports.adminMetrics = async (req, res) => {
  try {
    const [total, open, inProgress, resolved] = await Promise.all([
      SupportMessage.countDocuments(),
      SupportMessage.countDocuments({ status: "Open" }),
      SupportMessage.countDocuments({ status: "In Progress" }),
      SupportMessage.countDocuments({ status: "Resolved" }),
    ]);
    ok(res, { total, open, inProgress, resolved });
  } catch (e) {
    err(res, e.message);
  }
};