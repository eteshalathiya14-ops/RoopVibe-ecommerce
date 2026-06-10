/**
 * Orderadmin.jsx — RoopVibe Admin Orders
 * Real API connected — fetches from /api/orders/admin/*
 */

import { useState, useMemo, useEffect, useCallback } from "react";
import {
  FiPackage, FiSearch, FiEye, FiTruck, FiCheck, FiX,
  FiRefreshCw, FiAlertTriangle, FiMapPin, FiPhone, FiClock,
  FiLoader, FiDollarSign,
} from "react-icons/fi";
import {
  adminGetAllOrders, adminGetMetrics,
  adminUpdateStatus, adminReturnAction,
} from "../Api/Orderapi";

// ── Design tokens ───────────────────────────────────────────────
const GOLD       = "#C9A96E";
const GOLD_DARK  = "#A07840";
const GOLD_LIGHT = "#F5EDD9";
const CHARCOAL   = "#1A1A1A";
const MUTED      = "#6B6560";
const SURFACE    = "#FAF7F2";
const BORDER     = "#EDE8E0";
const WHITE      = "#FFFFFF";
const DANGER     = "#C0392B";
const SUCCESS    = "#27AE60";

// ── Status config ───────────────────────────────────────────────
const STATUS_CONFIG = {
  "Pending":                { color:"#E65100", bg:"#FFF3E0", icon:<FiClock size={11}/> },
  "Processing":             { color:"#1565C0", bg:"#E3F2FD", icon:<FiPackage size={11}/> },
  "In Transit":             { color:"#6A1B9A", bg:"#F3E5F5", icon:<FiTruck size={11}/> },
  "Delivered":              { color:"#2E7D32", bg:"#E8F5E9", icon:<FiCheck size={11}/> },
  "Cancelled":              { color:DANGER,    bg:"#FDECEA", icon:<FiX size={11}/> },
  "Return Requested":       { color:"#BF360C", bg:"#FBE9E7", icon:<FiRefreshCw size={11}/> },
  "Replacement Requested":  { color:"#4A148C", bg:"#EDE7F6", icon:<FiRefreshCw size={11}/> },
  "Return Approved":        { color:SUCCESS,   bg:"#E8F5E9", icon:<FiCheck size={11}/> },
  "Refunded":               { color:SUCCESS,   bg:"#E8F5E9", icon:<FiCheck size={11}/> },
};

const ALL_STATUSES = Object.keys(STATUS_CONFIG);

const TABS = [
  { id:"all",        label:"All",                  statusKey: null },
  { id:"Pending",    label:"Pending",               statusKey: "Pending" },
  { id:"Processing", label:"Processing",            statusKey: "Processing" },
  { id:"In Transit", label:"In Transit",            statusKey: "In Transit" },
  { id:"Delivered",  label:"Delivered",             statusKey: "Delivered" },
  { id:"returns",    label:"Returns / Replacement", statusKey: "returns" },
  { id:"Cancelled",  label:"Cancelled",             statusKey: "Cancelled" },
];

// ── Helpers ─────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { color: MUTED, bg: SURFACE, icon: null };
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:4,
      padding:"3px 10px", borderRadius:20, fontSize:10, fontWeight:700,
      color:cfg.color, backgroundColor:cfg.bg, whiteSpace:"nowrap" }}>
      {cfg.icon} {status}
    </span>
  );
}

function StatusSelect({ value, onChange }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ padding:"6px 10px", borderRadius:8, border:`1px solid ${BORDER}`,
        fontSize:12, color:CHARCOAL, fontFamily:"inherit", background:WHITE,
        cursor:"pointer", outline:"none" }}>
      {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
    </select>
  );
}

function Spinner({ size = 20, color = GOLD }) {
  return (
    <div style={{ width:size, height:size, border:`2.5px solid ${color}30`,
      borderTopColor:color, borderRadius:"50%", animation:"spin 0.8s linear infinite",
      flexShrink:0 }} />
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day:"numeric", month:"short", year:"numeric"
  });
}

function formatCurrency(n) {
  return `₹${Number(n || 0).toLocaleString("en-IN")}`;
}

// ── Order Detail Modal ───────────────────────────────────────────
function OrderModal({ order, onClose, onStatusChange, onReturnAction }) {
  const [newStatus, setNewStatus] = useState(order.status);
  const [saving, setSaving]       = useState(false);
  const [saved, setSaved]         = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onStatusChange(order._id, newStatus);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  const handleReturn = async (action) => {
    setSaving(true);
    try {
      await onReturnAction(order._id, action);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  // Customer info — populated or embedded
  const customer = order.user || {};
  const addr     = order.deliveryAddress || {};

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background:WHITE, borderRadius:14, width:580, maxWidth:"100%",
        border:`1px solid ${BORDER}`, maxHeight:"92vh", display:"flex", flexDirection:"column",
        boxShadow:"0 20px 60px rgba(0,0,0,0.14)" }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"16px 20px", borderBottom:`1px solid ${BORDER}`, flexShrink:0 }}>
          <div>
            <h3 style={{ fontSize:15, fontWeight:700, color:CHARCOAL, margin:0 }}>
              Order {order.orderId}
            </h3>
            <p style={{ fontSize:11, color:MUTED, marginTop:2 }}>
              {formatDate(order.createdAt)} · {order.paymentLabel || order.paymentMethod}
            </p>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <StatusBadge status={order.status} />
            <button onClick={onClose}
              style={{ background:"none", border:"none", cursor:"pointer", color:MUTED, padding:4, lineHeight:0 }}>
              <FiX size={18}/>
            </button>
          </div>
        </div>

        <div style={{ overflowY:"auto", flex:1 }}>

          {/* Customer */}
          <div style={{ padding:"14px 20px", borderBottom:`1px solid ${BORDER}` }}>
            <p style={{ fontSize:10, fontWeight:700, color:MUTED, letterSpacing:0.9, marginBottom:10, textTransform:"uppercase" }}>Customer</p>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
              <div style={{ width:36, height:36, borderRadius:"50%", background:GOLD_LIGHT,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize:13, fontWeight:700, color:GOLD_DARK, flexShrink:0 }}>
                {(customer.name || "?").charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize:13, fontWeight:700, color:CHARCOAL, margin:0 }}>{customer.name || addr.name || "—"}</p>
                <p style={{ fontSize:11, color:MUTED, margin:0 }}>{customer.email || "—"}</p>
              </div>
            </div>
            <div style={{ fontSize:12, color:MUTED, display:"flex", alignItems:"center", gap:4 }}>
              <FiPhone size={11}/> {customer.phone || addr.phone || "—"}
            </div>
          </div>

          {/* Delivery Address */}
          <div style={{ padding:"14px 20px", borderBottom:`1px solid ${BORDER}` }}>
            <p style={{ fontSize:10, fontWeight:700, color:MUTED, letterSpacing:0.9, marginBottom:8, textTransform:"uppercase" }}>Delivery Address</p>
            <div style={{ display:"flex", gap:8, fontSize:12, color:CHARCOAL }}>
              <FiMapPin size={13} style={{ marginTop:2, color:GOLD_DARK, flexShrink:0 }}/>
              <span>
                {addr.name && <strong>{addr.name}</strong>}
                {addr.name && <br/>}
                {addr.address}, {addr.city}, {addr.state} — {addr.pincode}
                {addr.phone && <><br/>📞 {addr.phone}</>}
              </span>
            </div>
          </div>

          {/* Items */}
          <div style={{ padding:"14px 20px", borderBottom:`1px solid ${BORDER}` }}>
            <p style={{ fontSize:10, fontWeight:700, color:MUTED, letterSpacing:0.9, marginBottom:10, textTransform:"uppercase" }}>Items Ordered</p>
            {(order.items || []).map((item, i) => (
              <div key={i} style={{ display:"flex", alignItems:"center", gap:12,
                padding:"8px 0", borderBottom: i < order.items.length-1 ? `1px solid ${BORDER}` : "none" }}>
                {item.img && (
                  <img src={item.img} alt={item.name}
                    style={{ width:48, height:58, objectFit:"cover", borderRadius:6, border:`1px solid ${BORDER}`, flexShrink:0 }}
                    onError={e => e.target.style.display = "none"} />
                )}
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:13, fontWeight:600, color:CHARCOAL, margin:0 }}>{item.name}</p>
                  <p style={{ fontSize:11, color:MUTED, margin:"2px 0 0" }}>
                    {[item.color, item.size && `Size ${item.size}`, `Qty ${item.quantity}`].filter(Boolean).join(" · ")}
                  </p>
                </div>
                <p style={{ fontSize:13, fontWeight:700, color:GOLD_DARK, margin:0 }}>
                  {formatCurrency(item.price * item.quantity)}
                </p>
              </div>
            ))}

            {/* Pricing breakdown */}
            <div style={{ marginTop:12, padding:"12px", background:SURFACE, borderRadius:8, fontSize:12 }}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4, color:MUTED }}>
                <span>Subtotal</span><span>{formatCurrency(order.pricing?.subtotal)}</span>
              </div>
              {order.pricing?.discount > 0 && (
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4, color:SUCCESS }}>
                  <span>Discount</span><span>- {formatCurrency(order.pricing.discount)}</span>
                </div>
              )}
              {order.pricing?.couponDiscount > 0 && (
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4, color:SUCCESS }}>
                  <span>Coupon ({order.pricing?.coupon})</span>
                  <span>- {formatCurrency(order.pricing.couponDiscount)}</span>
                </div>
              )}
              {order.pricing?.codFee > 0 && (
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4, color:DANGER }}>
                  <span>COD Fee</span><span>+ {formatCurrency(order.pricing.codFee)}</span>
                </div>
              )}
              <div style={{ display:"flex", justifyContent:"space-between", paddingTop:8,
                borderTop:`1px solid ${BORDER}`, fontWeight:800, color:CHARCOAL, fontSize:14 }}>
                <span>Total Paid</span>
                <span>{formatCurrency(order.pricing?.total)}</span>
              </div>
            </div>
          </div>

          {/* Return / Replacement request */}
          {order.returnRequest?.reason && (
            <div style={{ padding:"14px 20px", borderBottom:`1px solid ${BORDER}`, background:"#FFFDF5" }}>
              <p style={{ fontSize:10, fontWeight:700, color:MUTED, letterSpacing:0.9, marginBottom:8, textTransform:"uppercase" }}>
                {order.returnRequest.type} Request
              </p>
              <div style={{ padding:"10px 12px", background:"#FFF3E0", borderRadius:8,
                border:"1px solid #FFE0B2", display:"flex", gap:8, alignItems:"flex-start" }}>
                <FiAlertTriangle size={13} style={{ color:"#E65100", marginTop:1, flexShrink:0 }}/>
                <div>
                  <p style={{ fontSize:12, fontWeight:600, color:"#BF360C", margin:0 }}>{order.returnRequest.reason}</p>
                  <p style={{ fontSize:11, color:MUTED, marginTop:2 }}>Requested on {formatDate(order.returnRequest.date)}</p>
                </div>
              </div>
              {["Return Requested","Replacement Requested"].includes(order.status) && (
                <div style={{ display:"flex", gap:10, marginTop:12 }}>
                  <button onClick={() => handleReturn("approve")} disabled={saving}
                    style={{ flex:1, padding:"8px", borderRadius:8, border:"1px solid #A5D6A7",
                      background:"#E8F5E9", color:"#1B5E20", fontSize:12, fontWeight:700,
                      cursor:"pointer", fontFamily:"inherit" }}>
                    ✓ Approve {order.returnRequest.type}
                  </button>
                  <button onClick={() => handleReturn("reject")} disabled={saving}
                    style={{ flex:1, padding:"8px", borderRadius:8, border:`1px solid ${BORDER}`,
                      background:WHITE, color:DANGER, fontSize:12, fontWeight:700,
                      cursor:"pointer", fontFamily:"inherit" }}>
                    ✕ Reject
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Status History */}
          {order.statusHistory?.length > 0 && (
            <div style={{ padding:"14px 20px", borderBottom:`1px solid ${BORDER}` }}>
              <p style={{ fontSize:10, fontWeight:700, color:MUTED, letterSpacing:0.9, marginBottom:10, textTransform:"uppercase" }}>Status History</p>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {[...order.statusHistory].reverse().map((h, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:8, fontSize:12 }}>
                    <div style={{ width:6, height:6, borderRadius:"50%", background: i === 0 ? GOLD : BORDER, flexShrink:0 }}/>
                    <span style={{ fontWeight: i === 0 ? 700 : 500, color: i === 0 ? CHARCOAL : MUTED }}>{h.status}</span>
                    <span style={{ color:MUTED, marginLeft:"auto" }}>{formatDate(h.updatedAt)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Update Status */}
          <div style={{ padding:"14px 20px" }}>
            <p style={{ fontSize:10, fontWeight:700, color:MUTED, letterSpacing:0.9, marginBottom:10, textTransform:"uppercase" }}>Update Status</p>
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <StatusSelect value={newStatus} onChange={setNewStatus}/>
              <button onClick={handleSave} disabled={saving}
                style={{ padding:"7px 20px", borderRadius:8, border:"none",
                  background: saved ? SUCCESS : `linear-gradient(to right,${GOLD_DARK},${GOLD})`,
                  color:WHITE, fontSize:12, fontWeight:700, cursor: saving ? "not-allowed" : "pointer",
                  fontFamily:"inherit", display:"flex", alignItems:"center", gap:6,
                  opacity: saving ? 0.7 : 1 }}>
                {saving ? <Spinner size={13} color={WHITE}/> : saved ? <><FiCheck size={13}/> Saved!</> : "Update"}
              </button>
            </div>
            <p style={{ fontSize:11, color:MUTED, marginTop:6 }}>
              Changing status will reflect in customer's order tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Admin Orders Page ───────────────────────────────────────
export default function OrderAdminPage() {
  const [orders, setOrders]         = useState([]);
  const [metrics, setMetrics]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [metricsLoading, setML]     = useState(true);
  const [activeTab, setActiveTab]   = useState("all");
  const [search, setSearch]         = useState("");
  const [selectedOrder, setSelected]= useState(null);
  const [error, setError]           = useState("");

  // ── Fetch orders ────────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {};
      if (activeTab !== "all" && activeTab !== "returns") params.status = activeTab;
      if (activeTab === "returns") params.status = "Return Requested"; // fetch one; filter both below
      if (search.trim()) params.search = search.trim();

      const data = await adminGetAllOrders(params);
      let list = data.orders || data; // handle both shapes
      
      // Client-side filter for returns tab (both Return & Replacement)
      if (activeTab === "returns") {
        list = list.filter(o =>
          ["Return Requested","Replacement Requested","Return Approved","Refunded"].includes(o.status)
        );
      }
      setOrders(list);
    } catch (e) {
      setError(e.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [activeTab, search]);

  // ── Fetch metrics ───────────────────────────────────────────
  const fetchMetrics = useCallback(async () => {
    setML(true);
    try {
      const data = await adminGetMetrics();
      setMetrics(data);
    } catch { /* non-critical */ }
    finally { setML(false); }
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);
  useEffect(() => { fetchMetrics(); }, [fetchMetrics]);

  // Search debounce
  useEffect(() => {
    const t = setTimeout(() => fetchOrders(), 400);
    return () => clearTimeout(t);
  }, [search]); // eslint-disable-line

  // ── Status update ───────────────────────────────────────────
  const handleStatusChange = async (orderId, newStatus) => {
    await adminUpdateStatus(orderId, newStatus);
    setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: newStatus } : o));
    if (selectedOrder?._id === orderId) setSelected(p => ({ ...p, status: newStatus }));
    fetchMetrics();
  };

  // ── Return action ────────────────────────────────────────────
  const handleReturnAction = async (orderId, action) => {
    await adminReturnAction(orderId, action);
    fetchOrders();
    fetchMetrics();
  };

  // ── Tab counts from fetched orders (all-tab gives total) ────
  const tabCounts = useMemo(() => {
    // Use metrics for accurate counts across all pages
    if (metrics) return {
      all:         metrics.total,
      Pending:     orders.filter(o => o.status === "Pending").length,
      Processing:  orders.filter(o => o.status === "Processing").length,
      "In Transit":orders.filter(o => o.status === "In Transit").length,
      Delivered:   metrics.delivered,
      returns:     metrics.returns,
      Cancelled:   metrics.cancelled,
    };
    return {};
  }, [metrics, orders]);

  const pendingReturns = orders.filter(o =>
    ["Return Requested","Replacement Requested"].includes(o.status)
  );

  return (
    <>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to { transform: rotate(360deg); } }
        * { box-sizing: border-box; }
      `}</style>

      <div style={{ animation:"fadeUp 0.25s ease" }}>

        {/* Page Header */}
        <div style={{ marginBottom:24 }}>
          <h2 style={{ fontSize:20, fontWeight:700, color:CHARCOAL, margin:0 }}>Orders</h2>
          <p style={{ fontSize:13, color:MUTED, marginTop:4 }}>
            Manage all customer orders, track delivery, handle returns & replacements
          </p>
        </div>

        {/* Metric Cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(140px, 1fr))", gap:12, marginBottom:24 }}>
          {metricsLoading ? (
            Array(5).fill(0).map((_,i) => (
              <div key={i} style={{ background:WHITE, border:`1px solid ${BORDER}`, borderRadius:10, padding:"14px 18px" }}>
                <div style={{ height:12, background:BORDER, borderRadius:4, marginBottom:10, width:"60%" }}/>
                <div style={{ height:28, background:BORDER, borderRadius:4, width:"40%" }}/>
              </div>
            ))
          ) : [
            { label:"Total Orders",   value: metrics?.total     ?? "—", color: CHARCOAL },
            { label:"Active Orders",  value: metrics?.active    ?? "—", color: "#1565C0" },
            { label:"Delivered",      value: metrics?.delivered ?? "—", color: SUCCESS   },
            { label:"Return/Replace", value: metrics?.returns   ?? "—", color: DANGER    },
            { label:"Revenue",        value: metrics?.revenue != null ? `₹${(metrics.revenue/1000).toFixed(1)}k` : "—", color: GOLD_DARK },
          ].map(m => (
            <div key={m.label} style={{ background:WHITE, border:`1px solid ${BORDER}`, borderRadius:10, padding:"14px 18px" }}>
              <p style={{ fontSize:11, color:MUTED, margin:0, marginBottom:6 }}>{m.label}</p>
              <p style={{ fontSize:24, fontWeight:800, color:m.color, margin:0 }}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* Table Card */}
        <div style={{ background:WHITE, border:`1px solid ${BORDER}`, borderRadius:12, overflow:"hidden", marginBottom:20 }}>

          {/* Tabs */}
          <div style={{ display:"flex", borderBottom:`1px solid ${BORDER}`, overflowX:"auto", scrollbarWidth:"none" }}>
            {TABS.map(tab => {
              const count  = tabCounts[tab.id] ?? "";
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  style={{ padding:"11px 16px", background:"none", border:"none", cursor:"pointer",
                    fontFamily:"inherit", fontSize:12, fontWeight: active ? 700 : 500,
                    color: active ? GOLD_DARK : MUTED, whiteSpace:"nowrap",
                    borderBottom:`2.5px solid ${active ? GOLD : "transparent"}`,
                    marginBottom:-1, transition:"all 0.15s", display:"flex", alignItems:"center", gap:6 }}>
                  {tab.label}
                  {count !== "" && (
                    <span style={{ fontSize:10, padding:"1px 7px", borderRadius:10, fontWeight:700,
                      background: active ? GOLD_LIGHT : SURFACE, color: active ? GOLD_DARK : MUTED }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Search */}
          <div style={{ padding:"10px 16px", borderBottom:`1px solid ${BORDER}`,
            display:"flex", gap:8, alignItems:"center", background:SURFACE }}>
            <FiSearch size={14} style={{ color:MUTED, flexShrink:0 }}/>
            <input
              placeholder="Search by order ID (e.g. RV-123456)…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex:1, border:"none", outline:"none", fontSize:13,
                color:CHARCOAL, background:"transparent", fontFamily:"inherit" }}
            />
            {search && (
              <button onClick={() => setSearch("")}
                style={{ background:"none", border:"none", cursor:"pointer", color:MUTED, lineHeight:0 }}>
                <FiX size={14}/>
              </button>
            )}
          </div>

          {/* Error */}
          {error && (
            <div style={{ padding:"14px 20px", background:"#FFF3F3", color:DANGER,
              fontSize:13, display:"flex", alignItems:"center", gap:8 }}>
              <FiAlertTriangle size={14}/> {error}
              <button onClick={fetchOrders}
                style={{ marginLeft:"auto", fontSize:12, color:GOLD_DARK, background:"none",
                  border:"none", cursor:"pointer", fontFamily:"inherit", fontWeight:700 }}>
                Retry
              </button>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div style={{ padding:"48px 0", display:"flex", flexDirection:"column",
              alignItems:"center", gap:12, color:MUTED }}>
              <Spinner size={28}/>
              <span style={{ fontSize:13 }}>Loading orders…</span>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && orders.length === 0 && (
            <div style={{ padding:52, textAlign:"center", color:MUTED, fontSize:13 }}>
              <FiPackage size={36} style={{ marginBottom:10, opacity:0.25, display:"block", margin:"0 auto 12px" }}/>
              No orders found
              {activeTab !== "all" && (
                <button onClick={() => setActiveTab("all")}
                  style={{ display:"block", margin:"12px auto 0", background:"none", border:"none",
                    color:GOLD_DARK, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}>
                  View all orders →
                </button>
              )}
            </div>
          )}

          {/* Orders Table */}
          {!loading && orders.length > 0 && (
            <div>
              {/* Table Header */}
              <div style={{ display:"grid", gridTemplateColumns:"160px 1fr 140px 100px 130px 80px",
                padding:"8px 16px", background:SURFACE, fontSize:10, fontWeight:700,
                color:MUTED, letterSpacing:0.8, textTransform:"uppercase", gap:8 }}>
                <span>Order ID / Date</span>
                <span>Customer</span>
                <span>Items</span>
                <span>Total</span>
                <span>Status</span>
                <span style={{ textAlign:"right" }}>Action</span>
              </div>

              {orders.map((order, idx) => (
                <div key={order._id || order.id}
                  style={{ display:"grid", gridTemplateColumns:"160px 1fr 140px 100px 130px 80px",
                    padding:"12px 16px", gap:8, alignItems:"center",
                    borderBottom: idx < orders.length-1 ? `1px solid ${BORDER}` : "none",
                    background: order.returnRequest?.reason ? "#FFFDF5" : WHITE,
                    transition:"background 0.15s",
                    cursor:"default" }}>

                  {/* Order ID + date */}
                  <div>
                    <p style={{ fontSize:12, fontWeight:700, color:CHARCOAL, margin:0, fontFamily:"monospace" }}>
                      {order.orderId}
                    </p>
                    <p style={{ fontSize:10, color:MUTED, margin:"2px 0 0" }}>
                      {formatDate(order.createdAt)}
                    </p>
                  </div>

                  {/* Customer */}
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:30, height:30, borderRadius:"50%", background:GOLD_LIGHT,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:11, fontWeight:700, color:GOLD_DARK, flexShrink:0 }}>
                      {(order.user?.name || order.deliveryAddress?.name || "?").charAt(0).toUpperCase()}
                    </div>
                    <div style={{ minWidth:0 }}>
                      <p style={{ fontSize:12, fontWeight:600, color:CHARCOAL, margin:0,
                        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                        {order.user?.name || order.deliveryAddress?.name || "—"}
                      </p>
                      <p style={{ fontSize:10, color:MUTED, margin:0 }}>
                        {order.paymentLabel || order.paymentMethod}
                      </p>
                    </div>
                  </div>

                  {/* Items */}
                  <div style={{ minWidth:0 }}>
                    <p style={{ fontSize:12, color:CHARCOAL, margin:0, overflow:"hidden",
                      textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {order.items?.[0]?.name || "—"}
                    </p>
                    {order.items?.length > 1 && (
                      <p style={{ fontSize:10, color:MUTED, margin:0 }}>+{order.items.length-1} more</p>
                    )}
                  </div>

                  {/* Total */}
                  <p style={{ fontSize:13, fontWeight:700, color:CHARCOAL, margin:0 }}>
                    {formatCurrency(order.pricing?.total)}
                  </p>

                  {/* Status */}
                  <div>
                    <StatusBadge status={order.status}/>
                    {order.returnRequest?.reason && (
                      <div style={{ marginTop:3, display:"flex", alignItems:"center", gap:3,
                        fontSize:9, color:"#E65100", fontWeight:700 }}>
                        <FiAlertTriangle size={9}/> {order.returnRequest.type}
                      </div>
                    )}
                  </div>

                  {/* View button */}
                  <div style={{ textAlign:"right" }}>
                    <button onClick={() => setSelected(order)}
                      style={{ padding:"5px 12px", borderRadius:8, border:`1px solid ${BORDER}`,
                        background:WHITE, color:CHARCOAL, fontSize:11, fontWeight:600,
                        cursor:"pointer", fontFamily:"inherit", display:"inline-flex",
                        alignItems:"center", gap:4, transition:"border 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.border = `1px solid ${GOLD}`}
                      onMouseLeave={e => e.currentTarget.style.border = `1px solid ${BORDER}`}>
                      <FiEye size={11}/> View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Return / Replacement summary */}
        {!loading && pendingReturns.length > 0 && (
          <div style={{ background:WHITE, border:`1.5px solid #FFE0B2`, borderRadius:12, overflow:"hidden" }}>
            <div style={{ padding:"12px 16px", borderBottom:`1px solid ${BORDER}`,
              display:"flex", alignItems:"center", gap:8 }}>
              <FiRefreshCw size={14} style={{ color:"#E65100" }}/>
              <h3 style={{ fontSize:13, fontWeight:700, color:CHARCOAL, margin:0 }}>
                Pending Return / Replacement Requests
              </h3>
              <span style={{ fontSize:10, padding:"2px 8px", borderRadius:10, background:"#FFF3E0",
                color:"#E65100", fontWeight:700, marginLeft:"auto" }}>
                {pendingReturns.length} pending
              </span>
            </div>

            {pendingReturns.map((order, idx) => (
              <div key={order._id} style={{ padding:"14px 16px",
                borderBottom: idx < pendingReturns.length-1 ? `1px solid ${BORDER}` : "none",
                display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4, flexWrap:"wrap" }}>
                    <span style={{ fontSize:12, fontWeight:700, color:CHARCOAL, fontFamily:"monospace" }}>{order.orderId}</span>
                    <span style={{ fontSize:10, color:MUTED }}>·</span>
                    <span style={{ fontSize:12, color:CHARCOAL }}>{order.user?.name || order.deliveryAddress?.name}</span>
                    <StatusBadge status={order.status}/>
                  </div>
                  <p style={{ fontSize:11, color:MUTED, margin:0 }}>
                    <FiAlertTriangle size={10} style={{ verticalAlign:"middle", marginRight:4 }}/>
                    {order.returnRequest?.reason} · Requested {formatDate(order.returnRequest?.date)}
                  </p>
                </div>
                <div style={{ display:"flex", gap:8, flexShrink:0 }}>
                  <button onClick={() => handleReturnAction(order._id, "approve")}
                    style={{ padding:"6px 14px", borderRadius:8, border:"1px solid #A5D6A7",
                      background:"#E8F5E9", color:"#1B5E20", fontSize:11, fontWeight:700,
                      cursor:"pointer", fontFamily:"inherit" }}>
                    ✓ Approve
                  </button>
                  <button onClick={() => setSelected(order)}
                    style={{ padding:"6px 14px", borderRadius:8, border:`1px solid ${BORDER}`,
                      background:WHITE, color:CHARCOAL, fontSize:11, fontWeight:600,
                      cursor:"pointer", fontFamily:"inherit" }}>
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
          onReturnAction={handleReturnAction}
        />
      )}
    </>
  );
}