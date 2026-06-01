/**
 * Orderadmin.jsx
 * Admin Orders Management — RoopVibe
 * Features:
 *  - All orders list with filters (All / Pending / Processing / In Transit / Delivered / Return/Replacement)
 *  - Order detail modal with user info, items, address
 *  - Status update (admin can change order status)
 *  - Return / Replacement request handling
 *  - Search by order ID or user name
 *
 * Integration: Import & add to AdminPanel.jsx NAV and render section.
 * Uses same design tokens as Adminshared.jsx
 */

import { useState, useMemo } from "react";
import {
  FiPackage, FiSearch, FiEye, FiTruck, FiCheck, FiX,
  FiRefreshCw, FiAlertTriangle,
  FiMapPin, FiPhone, FiClock,
} from "react-icons/fi";

// ── Design tokens (mirrors Adminshared.jsx) ─────────────────────
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
  "Pending":      { color:"#E65100", bg:"#FFF3E0", icon:<FiClock size={11}/> },
  "Processing":   { color:"#1565C0", bg:"#E3F2FD", icon:<FiPackage size={11}/> },
  "In Transit":   { color:"#6A1B9A", bg:"#F3E5F5", icon:<FiTruck size={11}/> },
  "Delivered":    { color:"#2E7D32", bg:"#E8F5E9", icon:<FiCheck size={11}/> },
  "Cancelled":    { color:DANGER,    bg:"#FDECEA", icon:<FiX size={11}/> },
  "Return Requested":     { color:"#BF360C", bg:"#FBE9E7", icon:<FiRefreshCw size={11}/> },
  "Replacement Requested":{ color:"#4A148C", bg:"#EDE7F6", icon:<FiRefreshCw size={11}/> },
  "Return Approved":      { color:SUCCESS,   bg:"#E8F5E9", icon:<FiCheck size={11}/> },
  "Refunded":             { color:SUCCESS,   bg:"#E8F5E9", icon:<FiCheck size={11}/> },
};

const ALL_STATUSES = Object.keys(STATUS_CONFIG);

// ── Mock orders data ────────────────────────────────────────────
const MOCK_ORDERS = [
  {
    id: "RV-20248810",
    date: "24 May 2025",
    user: { name: "Priya Sharma",   email: "priya.sharma@gmail.com", phone: "+91 98765 43210" },
    address: { line1: "B-204, Sunrise Apartments", city: "Mumbai", state: "Maharashtra", pin: "400001" },
    items: [
      { name: "Silk Anarkali Set",  color: "Ivory",       size: "M",    qty: 1, price: 3499 },
      { name: "Zari Dupatta",       color: "Gold",        size: "Free", qty: 1, price: 899  },
    ],
    status: "Delivered",
    payment: "Prepaid · UPI",
    total: 4398,
    returnRequest: null,
  },
  {
    id: "RV-20249021",
    date: "18 May 2025",
    user: { name: "Ananya Patel",   email: "ananya.p@outlook.com",  phone: "+91 91234 56789" },
    address: { line1: "12, Green Park Colony", city: "Ahmedabad", state: "Gujarat", pin: "380015" },
    items: [
      { name: "Chanderi Kurta",     color: "Blush Pink",  size: "L",    qty: 1, price: 1899 },
    ],
    status: "In Transit",
    payment: "Prepaid · Debit Card",
    total: 1899,
    returnRequest: null,
  },
  {
    id: "RV-20247563",
    date: "5 May 2025",
    user: { name: "Meera Nair",     email: "meera.n@yahoo.com",     phone: "+91 97654 32109" },
    address: { line1: "45, MG Road, Kochi", city: "Kochi", state: "Kerala", pin: "682001" },
    items: [
      { name: "Embroidered Lehenga",color: "Royal Blue",  size: "S",    qty: 1, price: 8499 },
    ],
    status: "Processing",
    payment: "COD",
    total: 8499,
    returnRequest: null,
  },
  {
    id: "RV-20246110",
    date: "29 Apr 2025",
    user: { name: "Divya Reddy",    email: "divya.r@gmail.com",      phone: "+91 90000 11223" },
    address: { line1: "78, Jubilee Hills", city: "Hyderabad", state: "Telangana", pin: "500033" },
    items: [
      { name: "Banarasi Saree",     color: "Crimson",     size: "Free", qty: 1, price: 5999 },
    ],
    status: "Delivered",
    payment: "Prepaid · Credit Card",
    total: 5999,
    returnRequest: { type: "Return", reason: "Colour mismatch from photos", date: "2 May 2025" },
  },
  {
    id: "RV-20245991",
    date: "22 Apr 2025",
    user: { name: "Kavya Iyer",     email: "kavya.i@gmail.com",      phone: "+91 88888 77665" },
    address: { line1: "3, Lake View Drive", city: "Bengaluru", state: "Karnataka", pin: "560001" },
    items: [
      { name: "Palazzo Set",        color: "Mustard",     size: "XL",   qty: 2, price: 1299 },
    ],
    status: "Replacement Requested",
    payment: "Prepaid · NetBanking",
    total: 2598,
    returnRequest: { type: "Replacement", reason: "Wrong size delivered (XL sent as L)", date: "25 Apr 2025" },
  },
  {
    id: "RV-20244823",
    date: "15 Apr 2025",
    user: { name: "Sunita Joshi",   email: "sunita.j@gmail.com",     phone: "+91 77777 44556" },
    address: { line1: "Plot 9, Sector 12", city: "Noida", state: "Uttar Pradesh", pin: "201301" },
    items: [
      { name: "Cotton Kurti",       color: "Sky Blue",    size: "M",    qty: 1, price: 799  },
    ],
    status: "Cancelled",
    payment: "Prepaid · UPI",
    total: 799,
    returnRequest: null,
  },
  {
    id: "RV-20244001",
    date: "10 Apr 2025",
    user: { name: "Ritu Kapoor",    email: "ritu.k@hotmail.com",     phone: "+91 99001 22334" },
    address: { line1: "22, Civil Lines", city: "Jaipur", state: "Rajasthan", pin: "302006" },
    items: [
      { name: "Mirror Work Skirt",  color: "Red",         size: "S",    qty: 1, price: 2199 },
      { name: "Printed Blouse",     color: "White",       size: "S",    qty: 1, price: 699  },
    ],
    status: "Return Requested",
    payment: "COD",
    total: 2898,
    returnRequest: { type: "Return", reason: "Quality not as expected", date: "13 Apr 2025" },
  },
  {
    id: "RV-20243211",
    date: "5 Apr 2025",
    user: { name: "Pooja Mehta",    email: "pooja.m@gmail.com",      phone: "+91 87654 32100" },
    address: { line1: "8-A, Shivaji Nagar", city: "Pune", state: "Maharashtra", pin: "411005" },
    items: [
      { name: "Georgette Saree",    color: "Peach",       size: "Free", qty: 1, price: 3200 },
    ],
    status: "Pending",
    payment: "Prepaid · UPI",
    total: 3200,
    returnRequest: null,
  },
];

// ── Tab config ──────────────────────────────────────────────────
const TABS = [
  { id: "all",         label: "All",          filter: () => true },
  { id: "pending",     label: "Pending",      filter: o => o.status === "Pending" },
  { id: "processing",  label: "Processing",   filter: o => o.status === "Processing" },
  { id: "transit",     label: "In Transit",   filter: o => o.status === "In Transit" },
  { id: "delivered",   label: "Delivered",    filter: o => o.status === "Delivered" },
  { id: "returns",     label: "Returns / Replacement", filter: o => ["Return Requested","Replacement Requested","Return Approved","Refunded"].includes(o.status) },
  { id: "cancelled",   label: "Cancelled",    filter: o => o.status === "Cancelled" },
];

// ── Status badge ─────────────────────────────────────────────────
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

// ── Status select dropdown ────────────────────────────────────────
function StatusSelect({ value, onChange }) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      style={{ padding:"6px 10px", borderRadius:8, border:`1px solid ${BORDER}`,
        fontSize:12, color:CHARCOAL, fontFamily:"inherit", background:WHITE, cursor:"pointer",
        outline:"none" }}>
      {ALL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
    </select>
  );
}

// ── Order Detail Modal ────────────────────────────────────────────
function OrderModal({ order, onClose, onStatusChange }) {
  const [newStatus, setNewStatus] = useState(order.status);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onStatusChange(order.id, newStatus);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
      onClick={e => e.target===e.currentTarget && onClose()}>
      <div style={{ background:WHITE, borderRadius:14, width:560, maxWidth:"100%",
        border:`1px solid ${BORDER}`, maxHeight:"90vh", display:"flex", flexDirection:"column",
        boxShadow:"0 20px 60px rgba(0,0,0,0.12)" }}>

        {/* Modal Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"16px 20px", borderBottom:`1px solid ${BORDER}`, flexShrink:0 }}>
          <div>
            <h3 style={{ fontSize:15, fontWeight:700, color:CHARCOAL, margin:0 }}>
              Order {order.id}
            </h3>
            <p style={{ fontSize:11, color:MUTED, marginTop:2 }}>{order.date} · {order.payment}</p>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:MUTED, padding:4 }}>
            <FiX size={18}/>
          </button>
        </div>

        <div style={{ overflowY:"auto", flex:1 }}>

          {/* Customer Info */}
          <div style={{ padding:"16px 20px", borderBottom:`1px solid ${BORDER}` }}>
            <p style={{ fontSize:11, fontWeight:700, color:MUTED, letterSpacing:0.8, marginBottom:10, textTransform:"uppercase" }}>Customer</p>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
              <div style={{ width:36, height:36, borderRadius:"50%", background:GOLD_LIGHT,
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:700, color:GOLD_DARK }}>
                {order.user.name.charAt(0)}
              </div>
              <div>
                <p style={{ fontSize:13, fontWeight:700, color:CHARCOAL, margin:0 }}>{order.user.name}</p>
                <p style={{ fontSize:11, color:MUTED, margin:0 }}>{order.user.email}</p>
              </div>
            </div>
            <div style={{ display:"flex", gap:16, fontSize:12, color:MUTED }}>
              <span style={{ display:"flex", alignItems:"center", gap:4 }}><FiPhone size={11}/>{order.user.phone}</span>
            </div>
          </div>

          {/* Delivery Address */}
          <div style={{ padding:"16px 20px", borderBottom:`1px solid ${BORDER}` }}>
            <p style={{ fontSize:11, fontWeight:700, color:MUTED, letterSpacing:0.8, marginBottom:8, textTransform:"uppercase" }}>Delivery Address</p>
            <div style={{ display:"flex", gap:8, fontSize:12, color:CHARCOAL }}>
              <FiMapPin size={13} style={{ marginTop:1, color:GOLD_DARK, flexShrink:0 }}/>
              <span>{order.address.line1}, {order.address.city}, {order.address.state} — {order.address.pin}</span>
            </div>
          </div>

          {/* Items */}
          <div style={{ padding:"16px 20px", borderBottom:`1px solid ${BORDER}` }}>
            <p style={{ fontSize:11, fontWeight:700, color:MUTED, letterSpacing:0.8, marginBottom:10, textTransform:"uppercase" }}>Items Ordered</p>
            {order.items.map((item, i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center",
                padding:"8px 0", borderBottom: i<order.items.length-1 ? `1px solid ${BORDER}` : "none" }}>
                <div>
                  <p style={{ fontSize:13, fontWeight:600, color:CHARCOAL, margin:0 }}>{item.name}</p>
                  <p style={{ fontSize:11, color:MUTED, margin:0 }}>{item.color} · Size {item.size} · Qty {item.qty}</p>
                </div>
                <p style={{ fontSize:13, fontWeight:700, color:GOLD_DARK, margin:0 }}>₹{(item.price * item.qty).toLocaleString()}</p>
              </div>
            ))}
            <div style={{ display:"flex", justifyContent:"space-between", marginTop:10, paddingTop:10,
              borderTop:`2px solid ${BORDER}` }}>
              <span style={{ fontSize:13, fontWeight:700, color:CHARCOAL }}>Order Total</span>
              <span style={{ fontSize:15, fontWeight:800, color:CHARCOAL }}>₹{order.total.toLocaleString()}</span>
            </div>
          </div>

          {/* Return / Replacement Request */}
          {order.returnRequest && (
            <div style={{ padding:"16px 20px", borderBottom:`1px solid ${BORDER}`,
              background:"#FFF8F3" }}>
              <p style={{ fontSize:11, fontWeight:700, color:MUTED, letterSpacing:0.8, marginBottom:8, textTransform:"uppercase" }}>
                {order.returnRequest.type} Request
              </p>
              <div style={{ display:"flex", alignItems:"flex-start", gap:8, padding:"10px 12px",
                background:"#FFF3E0", borderRadius:8, border:"1px solid #FFE0B2" }}>
                <FiAlertTriangle size={13} style={{ color:"#E65100", marginTop:1, flexShrink:0 }}/>
                <div>
                  <p style={{ fontSize:12, fontWeight:600, color:"#BF360C", margin:0 }}>{order.returnRequest.reason}</p>
                  <p style={{ fontSize:11, color:MUTED, margin:"2px 0 0" }}>Requested on {order.returnRequest.date}</p>
                </div>
              </div>
            </div>
          )}

          {/* Update Status */}
          <div style={{ padding:"16px 20px" }}>
            <p style={{ fontSize:11, fontWeight:700, color:MUTED, letterSpacing:0.8, marginBottom:10, textTransform:"uppercase" }}>Update Status</p>
            <div style={{ display:"flex", gap:10, alignItems:"center" }}>
              <StatusSelect value={newStatus} onChange={setNewStatus}/>
              <button onClick={handleSave}
                style={{ padding:"7px 20px", borderRadius:8, border:"none",
                  background: saved ? SUCCESS : `linear-gradient(to right,${GOLD_DARK},${GOLD})`,
                  color:WHITE, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit",
                  display:"flex", alignItems:"center", gap:6, transition:"background 0.2s" }}>
                {saved ? <><FiCheck size={13}/> Saved!</> : "Update"}
              </button>
            </div>
            <p style={{ fontSize:11, color:MUTED, marginTop:6 }}>
              Changing status will reflect in the customer's order tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Main Admin Orders Page ────────────────────────────────────────
export default function OrderAdminPage() {
  const [orders, setOrders]       = useState(MOCK_ORDERS);
  const [activeTab, setActiveTab] = useState("all");
  const [search, setSearch]       = useState("");
  const [selectedOrder, setSelected] = useState(null);

  const handleStatusChange = (orderId, newStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    if (selectedOrder?.id === orderId) {
      setSelected(prev => ({ ...prev, status: newStatus }));
    }
  };

  const tabFilter  = TABS.find(t => t.id === activeTab)?.filter || (() => true);
  const filtered   = useMemo(() => {
    return orders
      .filter(tabFilter)
      .filter(o => {
        const q = search.toLowerCase();
        return !q || o.id.toLowerCase().includes(q) || o.user.name.toLowerCase().includes(q);
      });
  }, [orders, activeTab, search]);

  // Summary metrics
  const metrics = useMemo(() => ({
    total:     orders.length,
    delivered: orders.filter(o => o.status === "Delivered").length,
    active:    orders.filter(o => ["Pending","Processing","In Transit"].includes(o.status)).length,
    returns:   orders.filter(o => ["Return Requested","Replacement Requested"].includes(o.status)).length,
  }), [orders]);

  return (
    <>
      <style>{`
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; }
      `}</style>

      <div style={{ animation:"fadeUp 0.25s ease" }}>

        {/* Page header */}
        <div style={{ marginBottom:24 }}>
          <h2 style={{ fontSize:20, fontWeight:700, color:CHARCOAL, margin:0 }}>Orders</h2>
          <p style={{ fontSize:13, color:MUTED, marginTop:4 }}>Manage all customer orders, track delivery, handle returns & replacements</p>
        </div>

        {/* Metric Cards */}
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12, marginBottom:24 }}>
          {[
            { label:"Total Orders",    value: metrics.total,     color: CHARCOAL },
            { label:"Active Orders",   value: metrics.active,    color: "#1565C0" },
            { label:"Delivered",       value: metrics.delivered, color: SUCCESS  },
            { label:"Return/Replace",  value: metrics.returns,   color: DANGER   },
          ].map(m => (
            <div key={m.label} style={{ background:WHITE, border:`1px solid ${BORDER}`, borderRadius:10, padding:"14px 18px" }}>
              <p style={{ fontSize:12, color:MUTED, margin:0, marginBottom:6 }}>{m.label}</p>
              <p style={{ fontSize:26, fontWeight:800, color:m.color, margin:0 }}>{m.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs + Search */}
        <div style={{ background:WHITE, border:`1px solid ${BORDER}`, borderRadius:12, overflow:"hidden", marginBottom:16 }}>

          {/* Tabs row */}
          <div style={{ display:"flex", borderBottom:`1px solid ${BORDER}`, overflowX:"auto", scrollbarWidth:"none" }}>
            {TABS.map(tab => {
              const count = orders.filter(tab.filter).length;
              const active = activeTab === tab.id;
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  style={{ padding:"12px 16px", background:"none", border:"none", cursor:"pointer",
                    fontFamily:"inherit", fontSize:12, fontWeight: active ? 700 : 500,
                    color: active ? GOLD_DARK : MUTED, whiteSpace:"nowrap",
                    borderBottom:`2.5px solid ${active ? GOLD : "transparent"}`,
                    marginBottom:-1, transition:"all 0.15s", display:"flex", alignItems:"center", gap:6 }}>
                  {tab.label}
                  <span style={{ fontSize:10, padding:"1px 7px", borderRadius:10, fontWeight:700,
                    background: active ? GOLD_LIGHT : SURFACE, color: active ? GOLD_DARK : MUTED }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search bar */}
          <div style={{ padding:"12px 16px", borderBottom:`1px solid ${BORDER}`, display:"flex", gap:10, alignItems:"center" }}>
            <FiSearch size={14} style={{ color:MUTED, flexShrink:0 }}/>
            <input
              placeholder="Search by order ID or customer name…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ flex:1, border:"none", outline:"none", fontSize:13, color:CHARCOAL,
                background:"transparent", fontFamily:"inherit" }}
            />
          </div>

          {/* Orders Table */}
          {filtered.length === 0 ? (
            <div style={{ padding:48, textAlign:"center", color:MUTED, fontSize:13 }}>
              <FiPackage size={36} style={{ marginBottom:10, opacity:0.3, display:"block", margin:"0 auto 10px" }}/>
              No orders found
            </div>
          ) : (
            <div>
              {/* Table Header */}
              <div style={{ display:"grid", gridTemplateColumns:"160px 1fr 130px 100px 100px 80px",
                padding:"8px 16px", background:SURFACE, fontSize:10, fontWeight:700, color:MUTED,
                letterSpacing:0.8, textTransform:"uppercase", gap:8 }}>
                <span>Order ID / Date</span>
                <span>Customer</span>
                <span>Items</span>
                <span>Total</span>
                <span>Status</span>
                <span style={{ textAlign:"right" }}>Action</span>
              </div>

              {filtered.map((order, idx) => (
                <div key={order.id}
                  style={{ display:"grid", gridTemplateColumns:"160px 1fr 130px 100px 100px 80px",
                    padding:"12px 16px", gap:8, alignItems:"center",
                    borderBottom: idx < filtered.length-1 ? `1px solid ${BORDER}` : "none",
                    background: order.returnRequest ? "#FFFDF5" : WHITE,
                    transition:"background 0.15s" }}>

                  {/* Order ID */}
                  <div>
                    <p style={{ fontSize:13, fontWeight:700, color:CHARCOAL, margin:0, fontFamily:"monospace" }}>{order.id}</p>
                    <p style={{ fontSize:11, color:MUTED, margin:0, marginTop:2 }}>{order.date}</p>
                  </div>

                  {/* Customer */}
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <div style={{ width:30, height:30, borderRadius:"50%", background:GOLD_LIGHT,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      fontSize:12, fontWeight:700, color:GOLD_DARK, flexShrink:0 }}>
                      {order.user.name.charAt(0)}
                    </div>
                    <div>
                      <p style={{ fontSize:13, fontWeight:600, color:CHARCOAL, margin:0 }}>{order.user.name}</p>
                      <p style={{ fontSize:10, color:MUTED, margin:0 }}>{order.payment}</p>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div>
                    <p style={{ fontSize:12, color:CHARCOAL, margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                      {order.items[0].name}
                    </p>
                    {order.items.length > 1 && (
                      <p style={{ fontSize:10, color:MUTED, margin:0 }}>+{order.items.length-1} more</p>
                    )}
                  </div>

                  {/* Total */}
                  <p style={{ fontSize:13, fontWeight:700, color:CHARCOAL, margin:0 }}>
                    ₹{order.total.toLocaleString()}
                  </p>

                  {/* Status */}
                  <div>
                    <StatusBadge status={order.status}/>
                    {order.returnRequest && (
                      <div style={{ marginTop:4, display:"flex", alignItems:"center", gap:3,
                        fontSize:9, color:"#E65100", fontWeight:700 }}>
                        <FiAlertTriangle size={9}/> {order.returnRequest.type}
                      </div>
                    )}
                  </div>

                  {/* View Button */}
                  <div style={{ textAlign:"right" }}>
                    <button onClick={() => setSelected(order)}
                      style={{ padding:"6px 12px", borderRadius:8, border:`1px solid ${BORDER}`,
                        background:WHITE, color:CHARCOAL, fontSize:11, fontWeight:600,
                        cursor:"pointer", fontFamily:"inherit", display:"inline-flex",
                        alignItems:"center", gap:4 }}>
                      <FiEye size={11}/> View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Return/Replacement summary section */}
        {orders.some(o => o.returnRequest) && (
          <div style={{ background:WHITE, border:`1.5px solid #FFE0B2`, borderRadius:12, overflow:"hidden" }}>
            <div style={{ padding:"12px 16px", borderBottom:`1px solid ${BORDER}`,
              display:"flex", alignItems:"center", gap:8 }}>
              <FiRefreshCw size={14} style={{ color:"#E65100" }}/>
              <h3 style={{ fontSize:13, fontWeight:700, color:CHARCOAL, margin:0 }}>
                Pending Return / Replacement Requests
              </h3>
              <span style={{ fontSize:10, padding:"2px 8px", borderRadius:10, background:"#FFF3E0",
                color:"#E65100", fontWeight:700, marginLeft:"auto" }}>
                {orders.filter(o => o.returnRequest && ["Return Requested","Replacement Requested"].includes(o.status)).length} pending
              </span>
            </div>

            {orders.filter(o => o.returnRequest && ["Return Requested","Replacement Requested"].includes(o.status)).map((order, idx, arr) => (
              <div key={order.id} style={{ padding:"14px 16px",
                borderBottom: idx < arr.length-1 ? `1px solid ${BORDER}` : "none",
                display:"flex", alignItems:"center", gap:12 }}>
                <div style={{ flex:1 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                    <span style={{ fontSize:12, fontWeight:700, color:CHARCOAL, fontFamily:"monospace" }}>{order.id}</span>
                    <span style={{ fontSize:10, fontWeight:600, color:MUTED }}>·</span>
                    <span style={{ fontSize:12, color:CHARCOAL }}>{order.user.name}</span>
                    <StatusBadge status={order.status}/>
                  </div>
                  <p style={{ fontSize:11, color:MUTED, margin:0 }}>
                    <FiAlertTriangle size={10} style={{ verticalAlign:"middle", marginRight:4 }}/>
                    {order.returnRequest.reason} · Requested {order.returnRequest.date}
                  </p>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <button onClick={() => handleStatusChange(order.id, "Return Approved")}
                    style={{ padding:"6px 14px", borderRadius:8, border:`1px solid #A5D6A7`,
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

      {/* Order Detail Modal */}
      {selectedOrder && (
        <OrderModal
          order={selectedOrder}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </>
  );
}