import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiPackage, FiChevronLeft, FiTruck, FiCheck, FiX,
  FiClock, FiMapPin, FiPhone, FiAlertTriangle,
  FiShoppingBag, FiCheckCircle, FiChevronDown, FiChevronUp,
  FiFileText,
} from "react-icons/fi";
import { getMyOrders, cancelOrder, requestReturn } from "../Api/Orderapi";
import InvoiceModal from "./Invoicepage";

const GOLD       = "#C9A96E";
const GOLD_DARK  = "#A07840";
const GOLD_LIGHT = "#F5EDD9";
const CHARCOAL   = "#1A1A1A";
const MUTED      = "#6B6560";
const SURFACE    = "#FAF7F2";
const BORDER     = "#EDE8E0";
const WHITE      = "#FFFFFF";
const GREEN      = "#2E7D32";
const GREEN_BG   = "#E8F5E9";
const RED        = "#C0392B";
const RED_BG     = "#FDECEA";

const STATUS_CFG = {
  "Pending":               { color: "#E65100", bg: "#FFF3E0", step: 1 },
  "Processing":            { color: "#1565C0", bg: "#E3F2FD", step: 2 },
  "In Transit":            { color: "#6A1B9A", bg: "#F3E5F5", step: 3 },
  "Delivered":             { color: GREEN,     bg: GREEN_BG,  step: 4 },
  "Cancelled":             { color: RED,       bg: RED_BG,    step: -1 },
  "Return Requested":      { color: "#BF360C", bg: "#FBE9E7", step: -1 },
  "Replacement Requested": { color: "#4A148C", bg: "#EDE7F6", step: -1 },
  "Return Approved":       { color: GREEN,     bg: GREEN_BG,  step: -1 },
  "Refunded":              { color: GREEN,     bg: GREEN_BG,  step: -1 },
};

const TRACK_STEPS = [
  { key: "Pending",    label: "Order Placed",  sub: "Your order has been received"   },
  { key: "Processing", label: "Processing",    sub: "We're preparing your package"   },
  { key: "In Transit", label: "In Transit",    sub: "Your package is on the way"     },
  { key: "Delivered",  label: "Delivered",     sub: "Package delivered successfully" },
];

const fmtDate  = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : "—";
const fmtMoney = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

function StatusBadge({ status }) {
  const c = STATUS_CFG[status] || { color: MUTED, bg: SURFACE };
  return (
    <span style={{ padding: "4px 12px", borderRadius: 20, fontSize: 11, fontWeight: 700, color: c.color, background: c.bg, whiteSpace: "nowrap", display: "inline-block" }}>
      {status}
    </span>
  );
}

function Spinner({ size = 24, color = GOLD_DARK }) {
  return <div style={{ width: size, height: size, border: `2.5px solid ${color}30`, borderTopColor: color, borderRadius: "50%", animation: "spin 0.8s linear infinite", flexShrink: 0 }} />;
}

function TrackTimeline({ order }) {
  const step = STATUS_CFG[order.status]?.step ?? 0;
  const isCancelled = step === -1;

  if (isCancelled) return (
    <div style={{ padding: 20, background: RED_BG, borderRadius: 10, border: `1px solid #FFCDD2`, textAlign: "center" }}>
      <FiX size={28} color={RED} style={{ marginBottom: 8 }} />
      <p style={{ fontSize: 14, fontWeight: 700, color: RED, margin: "0 0 6px" }}>{order.status}</p>
      {order.cancelReason && (
        <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>Reason: {order.cancelReason}</p>
      )}
      {order.returnRequest?.reason && (
        <p style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>Reason: {order.returnRequest.reason}</p>
      )}
    </div>
  );

  return (
    <div>
      {order.status === "Delivered" ? (
        <div style={{ marginBottom: 20, padding: "12px 16px", background: GREEN_BG, borderRadius: 10, border: `1px solid #A5D6A7`, display: "flex", alignItems: "center", gap: 10 }}>
          <FiCheckCircle size={18} color={GREEN} />
          <div>
            <p style={{ fontSize: 12, color: GREEN, margin: 0 }}>Delivered on</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: CHARCOAL, margin: 0 }}>
              {fmtDate(order.statusHistory?.find(h => h.status === "Delivered")?.updatedAt || order.updatedAt)}
            </p>
          </div>
        </div>
      ) : order.estimatedDelivery ? (
        <div style={{ marginBottom: 20, padding: "12px 16px", background: GOLD_LIGHT, borderRadius: 10, border: `1px solid ${GOLD}`, display: "flex", alignItems: "center", gap: 10 }}>
          <FiTruck size={18} color={GOLD_DARK} />
          <div>
            <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>Estimated Delivery</p>
            <p style={{ fontSize: 15, fontWeight: 700, color: CHARCOAL, margin: 0 }}>{fmtDate(order.estimatedDelivery)}</p>
          </div>
        </div>
      ) : null}

      {TRACK_STEPS.map((s, i) => {
        const done    = step > i + 1;
        const active  = step === i + 1;
        const pending = step < i + 1;
        const isLast  = i === TRACK_STEPS.length - 1;
        const hist    = order.statusHistory?.find(h => h.status === s.key);
        return (
          <div key={s.key} style={{ display: "flex", gap: 14 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 36 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: done ? GREEN : active ? GOLD_DARK : "#F0F0F0", color: done || active ? WHITE : "#ccc", boxShadow: active ? `0 0 0 4px ${GOLD_DARK}22` : "none", transition: "all 0.3s" }}>
                {done ? <FiCheck size={16} /> : active ? <FiTruck size={15} /> : <FiClock size={15} />}
              </div>
              {!isLast && <div style={{ width: 2, flex: 1, minHeight: 24, background: done ? GREEN : "#E8E8E8", margin: "4px 0", transition: "background 0.3s" }} />}
            </div>
            <div style={{ paddingBottom: isLast ? 0 : 18, flex: 1, paddingTop: 7 }}>
              <p style={{ fontSize: 14, fontWeight: active ? 700 : done ? 600 : 400, color: pending ? "#bbb" : CHARCOAL, margin: 0 }}>
                {s.label}
                {active && <span style={{ fontSize: 10, marginLeft: 8, padding: "2px 8px", background: GOLD_LIGHT, color: GOLD_DARK, borderRadius: 20, fontWeight: 700 }}>CURRENT</span>}
              </p>
              <p style={{ fontSize: 12, color: pending ? "#ccc" : MUTED, margin: "2px 0 0" }}>{s.sub}</p>
              {(done || active) && hist && <p style={{ fontSize: 11, color: "#aaa", margin: "2px 0 0" }}>{fmtDate(hist.updatedAt)}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Cancel Confirmation Modal ──────────────────────────────────
function CancelModal({ onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const CANCEL_REASONS = [
    "Changed my mind",
    "Found better price elsewhere",
    "Ordered by mistake",
    "Delivery taking too long",
    "Want to change delivery address",
    "Duplicate order placed",
  ];

  const handleConfirm = async () => {
    if (!reason) return;
    setLoading(true);
    try { await onConfirm(reason); }
    catch { }
    finally { setLoading(false); }
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", zIndex: 3000, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div style={{ background: WHITE, width: "100%", maxWidth: 500, borderRadius: "20px 20px 0 0", padding: "20px 20px 32px", maxHeight: "85vh", overflowY: "auto" }}>
        {/* Handle bar */}
        <div style={{ width: 36, height: 4, background: BORDER, borderRadius: 2, margin: "0 auto 20px" }} />

        {/* Warning header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, padding: "14px 16px", background: RED_BG, borderRadius: 12, border: `1px solid #FFCDD2` }}>
          <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#FFCDD2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <FiAlertTriangle size={20} color={RED} />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 700, color: RED, margin: 0 }}>Cancel Order?</p>
            <p style={{ fontSize: 12, color: MUTED, margin: "3px 0 0" }}>This action cannot be undone. Please select a reason.</p>
          </div>
        </div>

        {/* Reasons */}
        <p style={{ fontSize: 12, fontWeight: 700, color: MUTED, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 12 }}>
          Why are you cancelling?
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {CANCEL_REASONS.map(r => (
            <div
              key={r}
              onClick={() => setReason(r)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, border: `1.5px solid ${reason === r ? RED : BORDER}`, background: reason === r ? RED_BG : WHITE, cursor: "pointer", transition: "all 0.15s" }}
            >
              <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${reason === r ? RED : "#ccc"}`, background: reason === r ? RED : WHITE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {reason === r && <div style={{ width: 7, height: 7, borderRadius: "50%", background: WHITE }} />}
              </div>
              <span style={{ fontSize: 13, color: reason === r ? RED : CHARCOAL, fontWeight: reason === r ? 600 : 400 }}>{r}</span>
            </div>
          ))}
        </div>

        {/* Buttons */}
        <div style={{ display: "flex", gap: 10 }}>
          <button
            onClick={onClose}
            style={{ flex: 1, height: 48, borderRadius: 12, border: `1.5px solid ${BORDER}`, background: WHITE, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit", color: CHARCOAL }}
          >
            Keep Order
          </button>
          <button
            onClick={handleConfirm}
            disabled={!reason || loading}
            style={{ flex: 2, height: 48, borderRadius: 12, border: "none", background: reason && !loading ? RED : "#D0C4B0", color: WHITE, fontWeight: 700, fontSize: 14, cursor: reason ? "pointer" : "not-allowed", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
          >
            {loading ? <><Spinner size={16} color={WHITE} /> Cancelling…</> : <><FiX size={14} /> Yes, Cancel Order</>}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReturnModal({ type, onClose, onSubmit }) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const reasons = type === "Return"
    ? ["Wrong item received", "Item damaged / defective", "Size doesn't fit", "Quality not as expected", "Other"]
    : ["Wrong item received", "Item damaged / defective", "Size doesn't fit", "Quality not as expected", "Other"];

  const handle = async () => {
    if (!reason) return;
    setLoading(true);
    try { await onSubmit(reason); } catch { }
    finally { setLoading(false); }
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 2000, display: "flex", alignItems: "flex-end", justifyContent: "center" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: WHITE, width: "100%", maxWidth: 500, borderRadius: "18px 18px 0 0", padding: 20, maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ width: 36, height: 4, background: BORDER, borderRadius: 2, margin: "0 auto 16px" }} />
        <h3 style={{ fontSize: 16, fontWeight: 700, color: CHARCOAL, marginBottom: 16 }}>
          {type === "Return" ? "Why do you want to return?" : "Why do you want a replacement?"}
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
          {reasons.map(r => (
            <div key={r} onClick={() => setReason(r)}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 10, border: `1.5px solid ${reason === r ? GOLD : BORDER}`, background: reason === r ? GOLD_LIGHT : WHITE, cursor: "pointer", transition: "all 0.15s" }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${reason === r ? GOLD_DARK : "#ccc"}`, background: reason === r ? GOLD_DARK : WHITE, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {reason === r && <div style={{ width: 7, height: 7, borderRadius: "50%", background: WHITE }} />}
              </div>
              <span style={{ fontSize: 13, color: CHARCOAL }}>{r}</span>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, height: 46, borderRadius: 10, border: `1px solid ${BORDER}`, background: WHITE, fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit", color: CHARCOAL }}>Go Back</button>
          <button onClick={handle} disabled={!reason || loading}
            style={{ flex: 2, height: 46, borderRadius: 10, border: "none", background: reason && !loading ? GOLD_DARK : "#D0C4B0", color: WHITE, fontWeight: 700, fontSize: 14, cursor: reason ? "pointer" : "not-allowed", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
            {loading ? <><Spinner size={16} color={WHITE} /> Submitting…</> : "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Order Detail Modal ─────────────────────────────────────────
function OrderModal({ order, onClose, onUpdate }) {
  const [tab,          setTab]        = useState("details");
  const [returnType,   setRT]         = useState(null);
  const [toast,        setToast]      = useState(null);
  const [showCancel,   setShowCancel] = useState(false);
  const [showInvoice,  setInvoice]    = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 2800);
  };

  // Cancel with reason
  const handleCancel = async (reason) => {
    try {
      await cancelOrder(order._id, { reason });
      setShowCancel(false);
      showToast("Order cancelled successfully");
      setTimeout(() => { onUpdate?.(); onClose(); }, 1500);
    } catch (e) {
      showToast(e.message || "Failed to cancel order", "error");
    }
  };

  const handleReturnSubmit = async (reason) => {
    await requestReturn(order._id, { type: returnType, reason });
    showToast(`${returnType} request submitted!`);
    setRT(null);
    onUpdate?.();
    setTimeout(onClose, 1500);
  };

  const addr      = order.deliveryAddress || {};
  const canCancel = ["Pending", "Processing"].includes(order.status);
  const canReturn = order.status === "Delivered";

  return (
    <>
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}
        onClick={e => e.target === e.currentTarget && onClose()}>
        <div style={{ background: WHITE, borderRadius: 16, width: 560, maxWidth: "100%", maxHeight: "92vh", display: "flex", flexDirection: "column", boxShadow: "0 24px 64px rgba(0,0,0,0.18)", border: `1px solid ${BORDER}`, overflow: "hidden" }}>

          {/* Header */}
          <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <p style={{ fontSize: 16, fontWeight: 800, color: CHARCOAL, fontFamily: "'Playfair Display', serif", margin: 0 }}>{order.orderId}</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <StatusBadge status={order.status} />
                <button onClick={() => setInvoice(true)}
                  style={{ display: "flex", alignItems: "center", gap: 5, padding: "5px 12px", borderRadius: 8, border: `1px solid ${GOLD}`, background: GOLD_LIGHT, color: GOLD_DARK, fontSize: 11, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                  <FiFileText size={12} /> Invoice
                </button>
                <button onClick={onClose} style={{ width: 30, height: 30, borderRadius: "50%", background: SURFACE, border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FiX size={15} />
                </button>
              </div>
            </div>
            <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>{fmtDate(order.createdAt)} · {order.paymentLabel || order.paymentMethod}</p>
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
            {[["details", "Order Details"], ["track", "Track Order"]].map(([id, label]) => (
              <button key={id} onClick={() => setTab(id)}
                style={{ flex: 1, padding: "12px", background: "none", border: "none", borderBottom: `2.5px solid ${tab === id ? GOLD_DARK : "transparent"}`, cursor: "pointer", fontFamily: "inherit", fontSize: 13, fontWeight: tab === id ? 700 : 500, color: tab === id ? GOLD_DARK : MUTED, transition: "all 0.15s" }}>
                {label}
              </button>
            ))}
          </div>

          <div style={{ overflowY: "auto", flex: 1 }}>
            {tab === "track" && (
              <div style={{ padding: 20 }}><TrackTimeline order={order} /></div>
            )}
            {tab === "details" && (
              <>
                {/* Items */}
                <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}` }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 12 }}>Items Ordered</p>
                  {(order.items || []).map((item, i) => (
                    <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: i < order.items.length - 1 ? `1px solid ${BORDER}` : "none", alignItems: "flex-start" }}>
                      {item.img
                        ? <img src={item.img} alt={item.name} style={{ width: 64, height: 78, objectFit: "cover", borderRadius: 8, border: `1px solid ${BORDER}`, flexShrink: 0 }} onError={e => e.target.style.display = "none"} />
                        : <div style={{ width: 64, height: 78, background: GOLD_LIGHT, borderRadius: 8, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><FiPackage size={22} color={GOLD_DARK} /></div>
                      }
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: 14, fontWeight: 600, color: CHARCOAL, margin: "0 0 4px", lineHeight: 1.4 }}>{item.name}</p>
                        <p style={{ fontSize: 12, color: MUTED, margin: "0 0 6px" }}>
                          {[item.color, item.size && `Size: ${item.size}`, `Qty: ${item.quantity}`].filter(Boolean).join("  ·  ")}
                        </p>
                        <p style={{ fontSize: 14, fontWeight: 700, color: GOLD_DARK, margin: 0 }}>{fmtMoney(item.price * item.quantity)}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cancel reason display */}
                {order.cancelReason && (
                  <div style={{ padding: "12px 20px", borderBottom: `1px solid ${BORDER}`, background: RED_BG }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: RED, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 4 }}>Cancellation Reason</p>
                    <p style={{ fontSize: 13, color: MUTED, margin: 0 }}>{order.cancelReason}</p>
                  </div>
                )}

                {/* Address */}
                <div style={{ padding: "14px 20px", borderBottom: `1px solid ${BORDER}` }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 10 }}>Delivery Address</p>
                  <div style={{ display: "flex", gap: 10 }}>
                    <FiMapPin size={14} color={GOLD_DARK} style={{ marginTop: 3, flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, color: CHARCOAL, margin: "0 0 3px" }}>{addr.name}</p>
                      <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6, margin: 0 }}>{addr.address}, {addr.city}, {addr.state} — {addr.pincode}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 5, fontSize: 12, color: MUTED }}>
                        <FiPhone size={12} /> {addr.phone}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div style={{ padding: "14px 20px", borderBottom: canCancel || canReturn ? `1px solid ${BORDER}` : "none" }}>
                  <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 10 }}>Price Details</p>
                  <div style={{ background: SURFACE, borderRadius: 10, padding: "12px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#555" }}><span>Subtotal</span><span>{fmtMoney(order.pricing?.subtotal)}</span></div>
                    {order.pricing?.discount > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: GREEN }}><span>Discount</span><span>- {fmtMoney(order.pricing.discount)}</span></div>}
                    {order.pricing?.couponDiscount > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: GREEN }}><span>Coupon ({order.pricing?.coupon})</span><span>- {fmtMoney(order.pricing.couponDiscount)}</span></div>}
                    {order.pricing?.codFee > 0 && <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: RED }}><span>COD Fee</span><span>+ {fmtMoney(order.pricing.codFee)}</span></div>}
                    <div style={{ height: 1, background: BORDER }} />
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 800, color: CHARCOAL }}><span>Total Paid</span><span style={{ color: GOLD_DARK }}>{fmtMoney(order.pricing?.total)}</span></div>
                  </div>
                </div>

                {/* Actions */}
                {(canCancel || canReturn) && (
                  <div style={{ padding: "14px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                    {canCancel && (
                      <button
                        onClick={() => setShowCancel(true)}
                        style={{ width: "100%", height: 46, borderRadius: 10, border: `1.5px solid ${RED}`, background: WHITE, color: RED, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
                      >
                        <FiX size={14} /> Cancel Order
                      </button>
                    )}
                    {canReturn && (
                      <div style={{ display: "flex", gap: 10 }}>
                        <button onClick={() => setRT("Return")}
                          style={{ flex: 1, height: 46, borderRadius: 10, border: `1.5px solid ${GOLD}`, background: GOLD_LIGHT, color: GOLD_DARK, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                          Return Item
                        </button>
                        <button onClick={() => setRT("Replacement")}
                          style={{ flex: 1, height: 46, borderRadius: 10, border: "none", background: `linear-gradient(to right,${GOLD_DARK},${GOLD})`, color: WHITE, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
                          Replacement
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {returnType && <ReturnModal type={returnType} onClose={() => setRT(null)} onSubmit={handleReturnSubmit} />}

        {toast && (
          <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", zIndex: 9999, background: toast.type === "error" ? RED : "#1A1A1A", color: WHITE, padding: "12px 24px", borderRadius: 12, fontSize: 13, fontWeight: 700, boxShadow: "0 6px 24px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
            {toast.type === "error" ? <FiX size={14} /> : <FiCheck size={14} color="#4CAF50" />} {toast.msg}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancel && (
        <CancelModal
          onClose={() => setShowCancel(false)}
          onConfirm={handleCancel}
        />
      )}

      {/* Invoice Modal */}
      {showInvoice && <InvoiceModal order={order} onClose={() => setInvoice(false)} />}
    </>
  );
}

// ── Order Card ─────────────────────────────────────────────────
function OrderCard({ order, onView, onTrack, onInvoice }) {
  const [expanded, setExpanded] = useState(false);
  const isActive  = ["Pending", "Processing", "In Transit"].includes(order.status);
  const firstItem = order.items?.[0];
  const extra     = (order.items?.length || 1) - 1;
  const progressPct = order.status === "Pending" ? 14 : order.status === "Processing" ? 42 : order.status === "In Transit" ? 72 : order.status === "Delivered" ? 100 : 0;

  return (
    <div style={{ background: WHITE, borderRadius: 14, border: `1px solid ${isActive ? GOLD + "80" : BORDER}`, marginBottom: 14, overflow: "hidden", boxShadow: isActive ? `0 3px 14px ${GOLD}25` : "0 1px 6px rgba(0,0,0,0.04)" }}>
      <div style={{ padding: "12px 16px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: CHARCOAL, fontFamily: "'Playfair Display', serif" }}>{order.orderId}</span>
          <span style={{ fontSize: 11, color: MUTED, marginLeft: 8 }}>{fmtDate(order.createdAt)}</span>
        </div>
        <StatusBadge status={order.status} />
      </div>

      <div style={{ padding: "12px 16px" }}>
        {(expanded ? order.items || [] : [firstItem]).filter(Boolean).map((item, i) => (
          <div key={i} style={{ display: "flex", gap: 12, alignItems: "center", padding: "8px 0", borderBottom: expanded && i < order.items.length - 1 ? `1px solid ${BORDER}` : "none" }}>
            {item.img
              ? <img src={item.img} alt={item.name} style={{ width: 54, height: 66, objectFit: "cover", borderRadius: 8, border: `1px solid ${BORDER}`, flexShrink: 0 }} onError={e => e.target.style.display = "none"} />
              : <div style={{ width: 54, height: 66, background: GOLD_LIGHT, borderRadius: 8, border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><FiPackage size={20} color={GOLD_DARK} /></div>
            }
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: CHARCOAL, margin: "0 0 3px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.name}</p>
              <p style={{ fontSize: 12, color: MUTED, margin: "0 0 5px" }}>{[item.color, item.size && `Size ${item.size}`, `Qty ${item.quantity}`].filter(Boolean).join(" · ")}</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: GOLD_DARK, margin: 0 }}>{fmtMoney(item.price)}</p>
            </div>
          </div>
        ))}
        {extra > 0 && (
          <button onClick={() => setExpanded(p => !p)}
            style={{ background: "none", border: "none", color: GOLD_DARK, fontSize: 12, fontWeight: 700, cursor: "pointer", padding: "6px 0 0", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}>
            {expanded ? <><FiChevronUp size={13} /> Show less</> : <><FiChevronDown size={13} /> +{extra} more item{extra > 1 ? "s" : ""}</>}
          </button>
        )}
      </div>

      {/* Cancel reason on card */}
      {order.cancelReason && (
        <div style={{ padding: "8px 16px", background: RED_BG, borderTop: `1px solid #FFCDD2` }}>
          <p style={{ fontSize: 11, color: RED, margin: 0, fontWeight: 600 }}>
            Cancelled: {order.cancelReason}
          </p>
        </div>
      )}

      {isActive && (
        <div style={{ padding: "0 16px 12px" }}>
          <div style={{ background: "#F0F0F0", borderRadius: 4, height: 5, overflow: "hidden", marginBottom: 5 }}>
            <div style={{ height: "100%", borderRadius: 4, background: `linear-gradient(to right, ${GOLD_DARK}, ${GOLD})`, width: `${progressPct}%`, transition: "width 0.6s ease" }} />
          </div>
          <p style={{ fontSize: 11, color: GOLD_DARK, fontWeight: 600 }}>
            {order.status === "In Transit" && order.estimatedDelivery ? `🚚 Arriving by ${fmtDate(order.estimatedDelivery)}` : order.status === "Processing" ? "📦 Being prepared for dispatch" : "✅ Order confirmed, processing soon"}
          </p>
        </div>
      )}

      <div style={{ background: SURFACE, borderTop: `1px solid ${BORDER}`, padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <p style={{ fontSize: 11, color: MUTED, margin: "0 0 2px" }}>Total Paid</p>
          <p style={{ fontSize: 16, fontWeight: 800, color: CHARCOAL, margin: 0 }}>{fmtMoney(order.pricing?.total)}</p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => onInvoice(order)}
            style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${GOLD}`, background: GOLD_LIGHT, color: GOLD_DARK, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}>
            <FiFileText size={12} /> Invoice
          </button>
          <button onClick={() => onView(order)}
            style={{ padding: "8px 14px", borderRadius: 8, border: `1.5px solid ${BORDER}`, background: WHITE, color: CHARCOAL, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            Details
          </button>
          <button onClick={() => onTrack(order)}
            style={{ padding: "8px 16px", borderRadius: 8, border: "none", background: `linear-gradient(to right,${GOLD_DARK},${GOLD})`, color: WHITE, fontSize: 12, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 5 }}>
            <FiTruck size={12} /> Track
          </button>
        </div>
      </div>
    </div>
  );
}

function NewOrderBanner({ orderId, onDismiss }) {
  useEffect(() => { const t = setTimeout(onDismiss, 6000); return () => clearTimeout(t); }, [onDismiss]);
  return (
    <div style={{ background: `linear-gradient(135deg, ${GOLD_DARK}, ${GOLD})`, borderRadius: 14, padding: "16px 18px", marginBottom: 18, display: "flex", alignItems: "center", gap: 14, boxShadow: `0 6px 20px ${GOLD}50`, animation: "slideDown 0.4s ease" }}>
      <div style={{ width: 42, height: 42, borderRadius: "50%", background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <FiCheckCircle size={22} color={WHITE} />
      </div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: 15, fontWeight: 800, color: WHITE, margin: 0 }}>Order Placed Successfully! 🎉</p>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", margin: "3px 0 0" }}>{orderId} · You'll receive a confirmation shortly</p>
      </div>
      <button onClick={onDismiss} style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.2)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: WHITE, flexShrink: 0 }}>
        <FiX size={13} />
      </button>
    </div>
  );
}

export default function MyOrdersPage() {
  const [orders,       setOrders]      = useState([]);
  const [loading,      setLoading]     = useState(true);
  const [error,        setError]       = useState("");
  const [modal,        setModal]       = useState(null);
  const [activeTab,    setActiveTab]   = useState("all");
  const [invoiceOrder, setInvoiceOrder]= useState(null);

  const [newOrderId] = useState(() => {
    try { const id = sessionStorage.getItem("rv_new_order"); if (id) sessionStorage.removeItem("rv_new_order"); return id || null; }
    catch { return null; }
  });
  const [showBanner, setShowBanner] = useState(!!newOrderId);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const data = await getMyOrders(); setOrders(data || []); }
    catch (e) { setError(e.message || "Could not load orders"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const TABS = [
    { id: "all",       label: "All Orders" },
    { id: "active",    label: "Active"     },
    { id: "Delivered", label: "Delivered"  },
    { id: "Cancelled", label: "Cancelled"  },
  ];

  const filtered = orders.filter(o => {
    if (activeTab === "all")    return true;
    if (activeTab === "active") return ["Pending","Processing","In Transit"].includes(o.status);
    return o.status === activeTab;
  });

  const counts = {
    all:       orders.length,
    active:    orders.filter(o => ["Pending","Processing","In Transit"].includes(o.status)).length,
    Delivered: orders.filter(o => o.status === "Delivered").length,
    Cancelled: orders.filter(o => o.status === "Cancelled").length,
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
        @keyframes slideDown { from{opacity:0;transform:translateY(-14px)} to{opacity:1;transform:none} }
        @keyframes spin      { to{transform:rotate(360deg)} }
      `}</style>

      <div style={{ background: SURFACE, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
        <div style={{ background: `linear-gradient(145deg,${CHARCOAL} 0%,#2C2416 60%,#3D2E10 100%)`, padding: "28px 20px 38px", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", border: "1px solid rgba(201,169,110,0.12)", pointerEvents: "none" }} />
          <Link to="/profile" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.5)", fontSize: 12, textDecoration: "none", marginBottom: 18 }}>
            <FiChevronLeft size={14} /> Back to Profile
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: "rgba(201,169,110,0.15)", border: "1px solid rgba(201,169,110,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <FiPackage size={22} color={GOLD} />
            </div>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: WHITE, fontFamily: "'Playfair Display', serif", margin: 0 }}>My Orders</h1>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "3px 0 0" }}>
                {loading ? "Loading…" : `${orders.length} order${orders.length !== 1 ? "s" : ""} placed`}
              </p>
            </div>
          </div>
        </div>

        <div style={{ padding: "20px 16px 80px", animation: "fadeUp 0.3s ease" }}>
          {showBanner && newOrderId && <NewOrderBanner orderId={newOrderId} onDismiss={() => setShowBanner(false)} />}

          <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
            {TABS.map(t => {
              const active = activeTab === t.id;
              return (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  style={{ flex: 1, padding: "10px 6px", borderRadius: 10, border: `1.5px solid ${active ? GOLD : BORDER}`, background: active ? GOLD_LIGHT : WHITE, color: active ? GOLD_DARK : MUTED, fontWeight: active ? 700 : 500, fontSize: 12, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", position: "relative" }}>
                  {t.label}
                  {counts[t.id] > 0 && (
                    <span style={{ position: "absolute", top: -6, right: -4, width: 18, height: 18, borderRadius: "50%", background: active ? GOLD_DARK : "#D0C4B0", color: WHITE, fontSize: 9, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {counts[t.id] > 9 ? "9+" : counts[t.id]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {loading && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "60px 0" }}>
              <Spinner size={36} /><p style={{ fontSize: 13, color: MUTED }}>Loading your orders…</p>
            </div>
          )}

          {!loading && error && (
            <div style={{ background: RED_BG, border: `1px solid #FFCDD2`, borderRadius: 12, padding: "16px 18px", display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: RED, marginBottom: 16 }}>
              <FiAlertTriangle size={16} /> {error}
              <button onClick={load} style={{ marginLeft: "auto", background: "none", border: "none", color: GOLD_DARK, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>Retry</button>
            </div>
          )}

          {!loading && !error && filtered.length === 0 && (
            <div style={{ background: WHITE, borderRadius: 14, border: `1px solid ${BORDER}`, padding: "52px 20px", textAlign: "center" }}>
              <div style={{ width: 68, height: 68, borderRadius: "50%", background: GOLD_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                <FiShoppingBag size={30} color={GOLD_DARK} />
              </div>
              <p style={{ fontSize: 16, fontWeight: 700, color: CHARCOAL, marginBottom: 6 }}>
                {activeTab === "all" ? "No orders yet" : `No ${activeTab.toLowerCase()} orders`}
              </p>
              <p style={{ fontSize: 13, color: MUTED }}>
                {activeTab === "all" ? "Explore our collection and place your first order!" : "Nothing here right now"}
              </p>
            </div>
          )}

          {!loading && !error && filtered.map(order => (
            <OrderCard
              key={order._id}
              order={order}
              onView={(o)    => setModal({ order: o, tab: "details" })}
              onTrack={(o)   => setModal({ order: o, tab: "track" })}
              onInvoice={(o) => setInvoiceOrder(o)}
            />
          ))}
        </div>
      </div>

      {modal && (
        <OrderModal
          order={modal.order}
          initialTab={modal.tab}
          onClose={() => setModal(null)}
          onUpdate={load}
        />
      )}

      {invoiceOrder && <InvoiceModal order={invoiceOrder} onClose={() => setInvoiceOrder(null)} />}
    </>
  );
}