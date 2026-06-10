// backend/controller/order.controller.js
const Order = require("../model/Order.model");
const mongoose = require("mongoose");

const ok  = (res, data, msg = "Success")            => res.status(200).json({ success: true,  message: msg,  data });
const err = (res, msg = "Server error", code = 500) => res.status(code).json({ success: false, message: msg });

// ─────────────────────────────────────────────────────────────
// USER CONTROLLERS
// ─────────────────────────────────────────────────────────────

// POST /api/orders  — place a new order
exports.placeOrder = async (req, res) => {
  try {
    const {
      items, deliveryAddress, paymentMethod,
      paymentLabel, pricing, coupon,
    } = req.body;

    if (!items || items.length === 0)
      return err(res, "No items in order", 400);
    if (!deliveryAddress)
      return err(res, "Delivery address required", 400);
    if (!paymentMethod)
      return err(res, "Payment method required", 400);

    const order = await Order.create({
      user:            new mongoose.Types.ObjectId(req.user._id),
      items,
      deliveryAddress,
      paymentMethod,
      paymentLabel:    paymentLabel || paymentMethod,
      pricing: {
        subtotal:       pricing?.subtotal       || 0,
        discount:       pricing?.discount       || 0,
        coupon:         coupon                  || "",
        couponDiscount: pricing?.couponDiscount || 0,
        deliveryFee:    pricing?.deliveryFee    || 0,
        codFee:         paymentMethod === "cod" ? 40 : 0,
        total:          pricing?.total          || 0,
      },
      status: "Pending",
    });

    ok(res, order, "Order placed successfully");
  } catch (e) {
    console.error("placeOrder error:", e.message);
    err(res, e.message);
  }
};

// GET /api/orders/my  — logged-in user's orders
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    ok(res, orders);
  } catch (e) { err(res, e.message); }
};

// GET /api/orders/my/:id  — single order detail for user
exports.getMyOrderById = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return err(res, "Order not found", 404);
    ok(res, order);
  } catch (e) { err(res, e.message); }
};

// POST /api/orders/my/:id/return  — raise return/replacement request
exports.requestReturn = async (req, res) => {
  try {
    const { type, reason } = req.body;
    if (!["Return", "Replacement"].includes(type))
      return err(res, "Invalid return type", 400);

    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return err(res, "Order not found", 404);
    if (order.status !== "Delivered")
      return err(res, "Return can only be requested for delivered orders", 400);

    order.returnRequest = { type, reason, date: new Date() };
    order.status = type === "Return" ? "Return Requested" : "Replacement Requested";
    await order.save();

    ok(res, order, `${type} request submitted`);
  } catch (e) { err(res, e.message); }
};

exports.cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body; // ← yeh add karo
    const order = await Order.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { 
        status: "Cancelled",
        cancelReason: reason || "No reason provided", // ← yeh add karo
        $push: { statusHistory: { status: "Cancelled", updatedAt: new Date() } }
      },
      { new: true }
    );
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// ─────────────────────────────────────────────────────────────
// ADMIN CONTROLLERS
// ─────────────────────────────────────────────────────────────

// GET /api/orders/admin/all  — all orders with filters & search
exports.adminGetAllOrders = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;
    const query = {};

    if (status && status !== "all") query.status = status;

    if (search) {
      query.$or = [
        { orderId: { $regex: search, $options: "i" } },
      ];
    }

    const total  = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .populate("user", "name email phone")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    ok(res, { orders, total, page: Number(page), limit: Number(limit) });
  } catch (e) { err(res, e.message); }
};

// GET /api/orders/admin/:id  — single order detail (admin)
exports.adminGetOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email phone");
    if (!order) return err(res, "Order not found", 404);
    ok(res, order);
  } catch (e) { err(res, e.message); }
};

// PATCH /api/orders/admin/:id/status  — update order status
exports.adminUpdateStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    if (!status) return err(res, "Status required", 400);

    const order = await Order.findById(req.params.id);
    if (!order) return err(res, "Order not found", 404);

    order.status = status;
    if (note) order.statusHistory[order.statusHistory.length - 1].note = note;
    await order.save();

    ok(res, order, "Status updated");
  } catch (e) { err(res, e.message); }
};

// PATCH /api/orders/admin/:id/return-action  — approve/reject return
exports.adminReturnAction = async (req, res) => {
  try {
    const { action } = req.body; // "approve" | "reject"
    const order = await Order.findById(req.params.id);
    if (!order) return err(res, "Order not found", 404);

    if (action === "approve") {
      order.status = "Return Approved";
    } else if (action === "reject") {
      order.status = "Delivered"; // revert
      order.returnRequest = undefined;
    } else {
      return err(res, "Invalid action", 400);
    }
    await order.save();
    ok(res, order, `Return ${action}d`);
  } catch (e) { err(res, e.message); }
};

// GET /api/orders/admin/metrics  — dashboard summary numbers
exports.adminMetrics = async (req, res) => {
  try {
    const [total, delivered, active, returns, cancelled, revenue] = await Promise.all([
      Order.countDocuments(),
      Order.countDocuments({ status: "Delivered" }),
      Order.countDocuments({ status: { $in: ["Pending","Processing","In Transit"] } }),
      Order.countDocuments({ status: { $in: ["Return Requested","Replacement Requested"] } }),
      Order.countDocuments({ status: "Cancelled" }),
      Order.aggregate([
        { $match: { status: "Delivered" } },
        { $group: { _id: null, total: { $sum: "$pricing.total" } } },
      ]),
    ]);
    ok(res, {
      total, delivered, active, returns, cancelled,
      revenue: revenue[0]?.total || 0,
    });
  } catch (e) { err(res, e.message); }
};