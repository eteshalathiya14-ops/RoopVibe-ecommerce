import React, { useState, useEffect, useCallback } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import {
  FiMapPin, FiPhone, FiUser, FiCreditCard, FiTruck,
  FiChevronRight, FiCheck, FiLock, FiTag, FiChevronDown,
  FiShield, FiSmartphone, FiDollarSign, FiHome, FiBriefcase,
  FiAlertTriangle, FiCheckCircle, FiPlus,
  FiX, FiPackage,
} from "react-icons/fi";
import {
  fetchAddresses, createAddress, updateAddress,
  deleteAddress, setDefaultAddress,
} from "../Api/Addressapi";
import { placeOrder } from "../Api/Orderapi";

// ── Color Tokens (RoopVibe Gold theme) ───────────────────────
const GOLD       = "#C9A96E";
const GOLD_DARK  = "#A07840";
const GOLD_LIGHT = "#F5EDD9";
const CHARCOAL   = "#1A1A1A";
const SURFACE    = "#FAF7F2";
const BORDER     = "#EDE8E0";
const GREEN      = "#2E7D32";
const GREEN_BG   = "#E8F5E9";
const RED        = "#e53935";
const WHITE      = "#ffffff";

// ── Hooks ─────────────────────────────────────────────────────
function useIsMobile(bp = 768) {
  const [v, setV] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= bp : false
  );
  useEffect(() => {
    const h = () => setV(window.innerWidth <= bp);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, [bp]);
  return v;
}

function useCheckoutFlow() {
  const location = useLocation();
  const params   = new URLSearchParams(location.search);
  const source     = params.get("source");
  const identifier = params.get("identifier");
  if (source === "cart-icon") return "cart";
  if (identifier === "buy_now") return "buynow";
  return location.pathname.includes("address") ? "cart" : "buynow";
}

// ── Step Bars ─────────────────────────────────────────────────
function StepBarCart({ current }) {
  const steps = ["Cart", "Address", "Payment", "Summary"];
  return (
    <div style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, padding: "0 24px", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1000, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <span style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 22, fontWeight: 800, color: CHARCOAL, letterSpacing: -0.5 }}>
          Roop<span style={{ color: GOLD_DARK }}>Vibe</span>
        </span>
        <div style={{ display: "flex", alignItems: "center" }}>
          {steps.map((s, i) => {
            const done   = i < current - 1;
            const active = i === current - 1;
            return (
              <React.Fragment key={s}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, border: `2px solid ${active ? GOLD_DARK : done ? GOLD_DARK : "#ccc"}`, background: done ? GOLD_DARK : WHITE, color: active ? GOLD_DARK : done ? WHITE : "#bbb", transition: "all 0.2s" }}>
                    {done ? <FiCheck size={14} color={WHITE} /> : i + 1}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: active ? 700 : 500, color: active ? CHARCOAL : "#bbb", whiteSpace: "nowrap" }}>{s}</span>
                </div>
                {i < steps.length - 1 && (
                  <div style={{ width: 60, height: 2, background: i < current - 1 ? GOLD_DARK : "#E0E0E0", margin: "0 4px", marginBottom: 16 }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
        <div style={{ width: 80 }} />
      </div>
    </div>
  );
}

function StepBarBuyNow({ current }) {
  const steps = ["Review", "Payment"];
  return (
    <div style={{ background: WHITE, borderBottom: `1px solid ${BORDER}`, padding: "0 24px", position: "sticky", top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 960, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
        <span style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 22, fontWeight: 800, color: CHARCOAL, letterSpacing: -0.5 }}>
          Roop<span style={{ color: GOLD_DARK }}>Vibe</span>
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
          {steps.map((s, i) => {
            const done   = i < current - 1;
            const active = i === current - 1;
            return (
              <React.Fragment key={s}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, border: `2px solid ${active ? GOLD_DARK : done ? GOLD_DARK : BORDER}`, background: active ? GOLD_DARK : done ? GOLD_DARK : WHITE, color: active || done ? WHITE : "#aaa", transition: "all 0.2s" }}>
                    {done ? <FiCheck size={14} /> : i + 1}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: active ? 700 : 500, color: active ? CHARCOAL : "#aaa", whiteSpace: "nowrap" }}>{s}</span>
                </div>
                {i < steps.length - 1 && (
                  <div style={{ width: 80, height: 2, background: i < current - 1 ? GOLD_DARK : BORDER, margin: "0 8px", marginBottom: 16 }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, color: "#888" }}>
          <FiLock size={13} color={GREEN} /> 100% Secure
        </div>
      </div>
    </div>
  );
}

// ── Toast ─────────────────────────────────────────────────────
function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{ position: "fixed", bottom: 28, left: "50%", transform: "translateX(-50%)", zIndex: 9999, background: type === "error" ? RED : CHARCOAL, color: WHITE, padding: "12px 24px", borderRadius: 10, fontSize: 13, fontWeight: 700, boxShadow: "0 6px 24px rgba(0,0,0,0.18)", display: "flex", alignItems: "center", gap: 8, whiteSpace: "nowrap" }}>
      {type === "error" ? <FiX size={14} /> : <FiCheck size={14} />} {msg}
    </div>
  );
}

// ── Address Form Modal ────────────────────────────────────────
function AddressFormModal({ initial, onSave, onClose, saving }) {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const STATES = ["Andhra Pradesh","Assam","Bihar","Delhi","Gujarat","Haryana","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Odisha","Punjab","Rajasthan","Tamil Nadu","Telangana","Uttar Pradesh","Uttarakhand","West Bengal"];

  const [form, setForm] = useState(initial ? {
    name:      initial.name      || "",
    phone:     initial.phone     || "",
    pincode:   initial.pincode   || "",
    address:   initial.address   || "",
    city:      initial.city      || "",
    state:     initial.state     || "",
    type:      initial.type      || "home",
    isDefault: initial.isDefault || false,
  } : {
    name: user?.name || "", phone: "", pincode: "",
    address: "", city: "", state: "", type: "home", isDefault: false,
  });
  const [focused, setFocused] = useState(null);
  const [errs, setErrs] = useState({});

  const set = (k, v) => { setForm(p => ({ ...p, [k]: v })); setErrs(p => ({ ...p, [k]: "" })); };

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = "Name required";
    if (!form.phone.trim() || form.phone.replace(/\D/g,"").length < 10) e.phone = "Valid 10-digit number required";
    if (!form.pincode.trim() || form.pincode.replace(/\D/g,"").length < 6) e.pincode = "Valid 6-digit pincode required";
    if (!form.address.trim()) e.address = "Address required";
    if (!form.city.trim())    e.city    = "City required";
    if (!form.state.trim())   e.state   = "State required";
    setErrs(e);
    return Object.keys(e).length === 0;
  };

  const inputStyle = (name) => ({
    width: "100%", height: 46, padding: "0 12px",
    borderRadius: 8, border: `1.5px solid ${errs[name] ? RED : focused === name ? GOLD : BORDER}`,
    outline: "none", fontSize: 14, color: CHARCOAL, fontFamily: "inherit",
    background: WHITE, boxSizing: "border-box", transition: "border 0.15s",
  });
  const iconInp = (name) => ({ ...inputStyle(name), paddingLeft: 38 });

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center", padding: isMobile ? 0 : 20 }}>
      <div style={{ background: WHITE, width: "100%", maxWidth: isMobile ? "100%" : 520, borderRadius: isMobile ? "18px 18px 0 0" : 14, maxHeight: "90vh", display: "flex", flexDirection: "column", boxShadow: "0 -4px 30px rgba(0,0,0,0.15)" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: CHARCOAL }}>{initial ? "Edit Address" : "Add New Address"}</h3>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", background: "#F5F5F5", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><FiX size={16} /></button>
        </div>
        <div style={{ padding: 20, overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
          {/* Address Type */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.8px", marginBottom: 8 }}>ADDRESS TYPE</p>
            <div style={{ display: "flex", gap: 10 }}>
              {["home","work","other"].map(t => (
                <button key={t} onClick={() => set("type", t)} style={{ padding: "7px 16px", borderRadius: 20, border: `1.5px solid ${form.type === t ? GOLD : BORDER}`, background: form.type === t ? GOLD_LIGHT : WHITE, color: form.type === t ? GOLD_DARK : "#666", fontWeight: form.type === t ? 700 : 500, fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontFamily: "inherit" }}>
                  {t === "home" ? <FiHome size={13}/> : t === "work" ? <FiBriefcase size={13}/> : <FiMapPin size={13}/>}
                  {t.charAt(0).toUpperCase()+t.slice(1)}
                </button>
              ))}
            </div>
          </div>
          {/* Full Name */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.8px", display: "block", marginBottom: 6 }}>FULL NAME *</label>
            <div style={{ position: "relative" }}>
              <FiUser style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: focused === "name" ? GOLD : "#ccc", fontSize: 15 }} />
              <input value={form.name} onChange={e => set("name", e.target.value)} onFocus={() => setFocused("name")} onBlur={() => setFocused(null)} style={iconInp("name")} placeholder="Full name" />
            </div>
            {errs.name && <p style={{ fontSize: 11, color: RED, marginTop: 3 }}>{errs.name}</p>}
          </div>
          {/* Phone + Pincode */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.8px", display: "block", marginBottom: 6 }}>PHONE *</label>
              <div style={{ position: "relative" }}>
                <FiPhone style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: focused === "phone" ? GOLD : "#ccc", fontSize: 14 }} />
                <input value={form.phone} onChange={e => set("phone", e.target.value.replace(/\D/g,"").slice(0,10))} onFocus={() => setFocused("phone")} onBlur={() => setFocused(null)} style={iconInp("phone")} placeholder="10-digit" maxLength={10} />
              </div>
              {errs.phone && <p style={{ fontSize: 11, color: RED, marginTop: 3 }}>{errs.phone}</p>}
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.8px", display: "block", marginBottom: 6 }}>PINCODE *</label>
              <div style={{ position: "relative" }}>
                <FiMapPin style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: focused === "pincode" ? GOLD : "#ccc", fontSize: 14 }} />
                <input value={form.pincode} onChange={e => set("pincode", e.target.value.replace(/\D/g,"").slice(0,6))} onFocus={() => setFocused("pincode")} onBlur={() => setFocused(null)} style={iconInp("pincode")} placeholder="6-digit" maxLength={6} />
              </div>
              {errs.pincode && <p style={{ fontSize: 11, color: RED, marginTop: 3 }}>{errs.pincode}</p>}
            </div>
          </div>
          {/* Address */}
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.8px", display: "block", marginBottom: 6 }}>FULL ADDRESS *</label>
            <textarea value={form.address} onChange={e => set("address", e.target.value)} onFocus={() => setFocused("address")} onBlur={() => setFocused(null)}
              style={{ width: "100%", padding: 12, borderRadius: 8, border: `1.5px solid ${errs.address ? RED : focused === "address" ? GOLD : BORDER}`, outline: "none", minHeight: 76, resize: "none", fontSize: 14, color: CHARCOAL, fontFamily: "inherit", background: WHITE, boxSizing: "border-box" }}
              placeholder="House no., Building, Street, Area, Landmark" />
            {errs.address && <p style={{ fontSize: 11, color: RED, marginTop: 3 }}>{errs.address}</p>}
          </div>
          {/* City + State */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.8px", display: "block", marginBottom: 6 }}>CITY *</label>
              <input value={form.city} onChange={e => set("city", e.target.value)} onFocus={() => setFocused("city")} onBlur={() => setFocused(null)} style={inputStyle("city")} placeholder="City" />
              {errs.city && <p style={{ fontSize: 11, color: RED, marginTop: 3 }}>{errs.city}</p>}
            </div>
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.8px", display: "block", marginBottom: 6 }}>STATE *</label>
              <div style={{ position: "relative" }}>
                <select value={form.state} onChange={e => set("state", e.target.value)} onFocus={() => setFocused("state")} onBlur={() => setFocused(null)}
                  style={{ ...inputStyle("state"), appearance: "none", paddingRight: 30, cursor: "pointer" }}>
                  <option value="">Select</option>
                  {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <FiChevronDown style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#aaa", pointerEvents: "none" }} />
              </div>
              {errs.state && <p style={{ fontSize: 11, color: RED, marginTop: 3 }}>{errs.state}</p>}
            </div>
          </div>
          {/* Default toggle */}
          <label onClick={() => set("isDefault", !form.isDefault)} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "11px 14px", background: form.isDefault ? GOLD_LIGHT : "#F8F8F8", borderRadius: 8, border: `1.5px solid ${form.isDefault ? GOLD : BORDER}`, transition: "all 0.15s" }}>
            <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${form.isDefault ? GOLD : "#ccc"}`, display: "flex", alignItems: "center", justifyContent: "center", background: form.isDefault ? GOLD : WHITE, transition: "all 0.15s", flexShrink: 0 }}>
              {form.isDefault && <FiCheck size={11} color={WHITE} />}
            </div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700, color: CHARCOAL }}>Set as default address</p>
              <p style={{ fontSize: 11, color: "#888" }}>Pre-selected at every checkout</p>
            </div>
          </label>
        </div>
        {/* Footer Buttons */}
        <div style={{ padding: "14px 20px", borderTop: `1px solid ${BORDER}`, display: "flex", gap: 10, flexShrink: 0 }}>
          <button onClick={onClose} style={{ flex: 1, height: 46, borderRadius: 8, border: `1.5px solid ${BORDER}`, background: WHITE, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", color: CHARCOAL }}>Cancel</button>
          <button onClick={() => { if (validate()) onSave(form); }} disabled={saving}
            style={{ flex: 2, height: 46, borderRadius: 8, border: "none", background: saving ? "#ccc" : `linear-gradient(to right,${GOLD_DARK},${GOLD})`, color: WHITE, fontWeight: 800, fontSize: 14, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
            {saving ? "Saving…" : initial ? "Update Address" : "Save Address"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Address Selector Modal ────────────────────────────────────
function AddressSelectorModal({ addresses, selectedAddr, onSelect, onAddNew, onClose }) {
  const isMobile = useIsMobile();
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: isMobile ? "flex-end" : "center", justifyContent: "center", padding: isMobile ? 0 : 20 }}>
      <div style={{ background: WHITE, width: "100%", maxWidth: isMobile ? "100%" : 500, borderRadius: isMobile ? "18px 18px 0 0" : 14, maxHeight: "80vh", display: "flex", flexDirection: "column", boxShadow: "0 -4px 30px rgba(0,0,0,0.15)" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, color: CHARCOAL }}>Select Delivery Address</h3>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: "50%", background: "#F5F5F5", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><FiX size={16} /></button>
        </div>
        <div style={{ padding: 16, overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 10 }}>
          {addresses.map(addr => {
            const isSelected = selectedAddr?._id === addr._id;
            return (
              <div key={addr._id} onClick={() => { onSelect(addr); onClose(); }}
                style={{ padding: "14px 16px", borderRadius: 10, border: `2px solid ${isSelected ? GOLD : BORDER}`, background: isSelected ? GOLD_LIGHT : WHITE, cursor: "pointer", transition: "all 0.15s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${isSelected ? GOLD_DARK : "#ccc"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, background: isSelected ? GOLD_DARK : WHITE }}>
                    {isSelected && <div style={{ width: 8, height: 8, borderRadius: "50%", background: WHITE }} />}
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 700, color: CHARCOAL }}>{addr.name}</span>
                  {addr.isDefault && <span style={{ fontSize: 10, fontWeight: 800, background: GREEN_BG, color: GREEN, padding: "2px 8px", borderRadius: 20 }}>DEFAULT</span>}
                </div>
                <p style={{ fontSize: 13, color: "#555", lineHeight: 1.5, paddingLeft: 28, marginBottom: 2 }}>{addr.address}, {addr.city}, {addr.state} - {addr.pincode}</p>
                <p style={{ fontSize: 12, color: "#888", paddingLeft: 28 }}>{addr.phone}</p>
              </div>
            );
          })}
          <button onClick={onAddNew}
            style={{ width: "100%", padding: "12px", background: "none", border: `1.5px dashed ${GOLD}`, borderRadius: 10, color: GOLD_DARK, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
            <FiPlus size={14} /> Add New Address
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Price Sidebar ─────────────────────────────────────────────
function PriceSidebar({ cartItems, cartTotal, coupon, setCoupon, couponApplied, setCouponApplied, couponError, setCouponError, discount, paymentMethod, finalTotal, step, onContinue, flow, placingOrder }) {
  const applyCoupon = () => {
    if (coupon.toUpperCase() === "ROOP10") { setCouponApplied(true); setCouponError(""); }
    else { setCouponError("Invalid coupon code"); setCouponApplied(false); }
  };
  const codFee = paymentMethod === "cod" ? 40 : 0;
  const total  = finalTotal + codFee;
  const saved  = couponApplied ? Math.round(cartTotal * 0.1) : Math.round(cartTotal * 0.01);

  if (flow === "cart") {
    return (
      <div style={{ background: WHITE, borderRadius: 8, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
        <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}` }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, color: "#555" }}>Price Details ({cartItems.length} {cartItems.length === 1 ? "Item" : "Items"})</h3>
        </div>
        <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#444" }}>
            <span>Product Price</span><span style={{ fontWeight: 600 }}>+ ₹{cartTotal}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: GREEN }}>
            <span>Total Discounts</span>
            <span style={{ fontWeight: 700 }}>- ₹{discount || Math.round(cartTotal * 0.01)}</span>
          </div>
          {paymentMethod === "cod" && (
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: RED }}>
              <span>COD Fee</span><span style={{ fontWeight: 600 }}>+ ₹40</span>
            </div>
          )}
          <div style={{ height: 1, background: BORDER }} />
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: CHARCOAL }}>Order Total</span>
            <span style={{ fontSize: 16, fontWeight: 800, color: CHARCOAL }}>₹{total}</span>
          </div>
        </div>
        {saved > 0 && (
          <div style={{ margin: "0 16px 16px", padding: "10px 14px", background: GREEN_BG, borderRadius: 8, display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: GREEN }}>
            <FiCheckCircle size={16} color={GREEN} /> Yay! Your total discount is ₹{saved}
          </div>
        )}
        {step === 2 && (
          <div style={{ padding: "0 16px 16px" }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <div style={{ position: "relative", flex: 1 }}>
                <FiTag style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#ccc", fontSize: 14 }} />
                <input value={coupon} onChange={e => { setCoupon(e.target.value.toUpperCase()); setCouponError(""); }}
                  style={{ width: "100%", height: 40, paddingLeft: 32, paddingRight: 10, borderRadius: 8, border: `1.5px solid ${couponApplied ? GREEN : couponError ? RED : BORDER}`, outline: "none", fontSize: 13, fontWeight: 600, letterSpacing: 1, fontFamily: "inherit", color: CHARCOAL, boxSizing: "border-box" }}
                  placeholder="Coupon code (ROOP10)" />
              </div>
              <button onClick={applyCoupon} style={{ height: 40, padding: "0 14px", background: couponApplied ? GREEN_BG : GOLD_LIGHT, border: `1.5px solid ${couponApplied ? GREEN : GOLD}`, borderRadius: 8, fontWeight: 800, fontSize: 12, color: couponApplied ? GREEN : GOLD_DARK, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                {couponApplied ? "✓ Applied" : "Apply"}
              </button>
            </div>
            {couponError && <p style={{ fontSize: 11, color: RED, marginTop: -8, marginBottom: 8 }}>{couponError}</p>}
            <button onClick={onContinue} disabled={placingOrder}
              style={{ width: "100%", height: 50, background: placingOrder ? "#bbb" : `linear-gradient(to right,${GOLD_DARK},${GOLD})`, color: WHITE, border: "none", borderRadius: 4, fontWeight: 700, fontSize: 15, cursor: placingOrder ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.2s" }}>
              {placingOrder
                ? <><div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: WHITE, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Processing…</>
                : <><FiLock size={14} /> Place Order · ₹{total}</>
              }
            </button>
            <p style={{ textAlign: "center", fontSize: 11, color: "#aaa", marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
              <FiShield size={11} color={GREEN} /> Safe & Secure Payment
            </p>
          </div>
        )}
        <div style={{ margin: "0 16px 16px", padding: "12px 14px", background: "#F0F7FF", borderRadius: 8, border: "1px solid #BBDEFB", display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#1565C0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <FiShield size={18} color={WHITE} />
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 800, color: "#1565C0" }}>Your Safety, Our Priority</p>
            <p style={{ fontSize: 11, color: "#555", lineHeight: 1.4 }}>We make sure your package is safe at every point of contact.</p>
          </div>
        </div>
      </div>
    );
  }

  // buynow flow sidebar
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0, background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
      <div style={{ padding: "16px 20px", borderBottom: `1px solid ${BORDER}` }}>
        <h3 style={{ fontSize: 14, fontWeight: 800, color: CHARCOAL }}>Price Details ({cartItems.length} {cartItems.length === 1 ? "Item" : "Items"})</h3>
      </div>
      <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#444" }}>
          <span>Product Price</span><span style={{ fontWeight: 600 }}>+ ₹{cartTotal}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: GREEN }}>
          <span>Total Discounts</span><span style={{ fontWeight: 700 }}>- ₹{discount}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#444" }}>
          <span>Delivery Charges</span><span style={{ fontWeight: 600, color: GREEN }}>FREE</span>
        </div>
        {paymentMethod === "cod" && (
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: RED }}>
            <span>COD Fee</span><span style={{ fontWeight: 600 }}>+ ₹40</span>
          </div>
        )}
        <div style={{ height: 1, background: BORDER }} />
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: CHARCOAL }}>Order Total</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: CHARCOAL }}>₹{total}</span>
        </div>
      </div>
      {saved > 0 && (
        <div style={{ margin: "0 16px 12px", padding: "10px 14px", background: GREEN_BG, borderRadius: 8, display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: GREEN }}>
          <FiCheckCircle size={16} color={GREEN} /> Yay! Your total discount is ₹{saved}
        </div>
      )}
      {step === 2 && (
        <div style={{ padding: "0 16px 14px" }}>
          <div style={{ display: "flex", gap: 8, marginBottom: couponError ? 4 : 12 }}>
            <div style={{ position: "relative", flex: 1 }}>
              <FiTag style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#ccc", fontSize: 14 }} />
              <input value={coupon} onChange={e => { setCoupon(e.target.value.toUpperCase()); setCouponError(""); }}
                style={{ width: "100%", height: 40, paddingLeft: 32, paddingRight: 10, borderRadius: 8, border: `1.5px solid ${couponApplied ? GREEN : couponError ? RED : BORDER}`, outline: "none", fontSize: 13, fontWeight: 600, letterSpacing: 1, fontFamily: "inherit", color: CHARCOAL, boxSizing: "border-box" }}
                placeholder="Coupon code (ROOP10)" />
            </div>
            <button onClick={applyCoupon} style={{ height: 40, padding: "0 14px", background: couponApplied ? GREEN_BG : GOLD_LIGHT, border: `1.5px solid ${couponApplied ? GREEN : GOLD}`, borderRadius: 8, fontWeight: 800, fontSize: 12, color: couponApplied ? GREEN : GOLD_DARK, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
              {couponApplied ? "✓ Applied" : "Apply"}
            </button>
          </div>
          {couponError && <p style={{ fontSize: 11, color: RED, marginBottom: 8 }}>{couponError}</p>}
          <button onClick={onContinue} disabled={placingOrder}
            style={{ width: "100%", height: 50, background: placingOrder ? "#bbb" : `linear-gradient(to right,${GOLD_DARK},${GOLD})`, color: WHITE, border: "none", borderRadius: 4, fontWeight: 700, fontSize: 15, cursor: placingOrder ? "not-allowed" : "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "background 0.2s" }}>
            {placingOrder
              ? <><div style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: WHITE, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} /> Processing…</>
              : <><FiLock size={15} /> Place Order · ₹{total}</>
            }
          </button>
          <p style={{ textAlign: "center", fontSize: 11, color: "#aaa", marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
            <FiShield size={11} color={GREEN} /> Safe & Secure Payment
          </p>
        </div>
      )}
      {step === 1 && (
        <div style={{ padding: "0 16px 14px" }}>
          <button onClick={onContinue}
            style={{ width: "100%", height: 50, background: `linear-gradient(to right,${GOLD_DARK},${GOLD})`, color: WHITE, border: "none", borderRadius: 8, fontWeight: 800, fontSize: 15, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 14px rgba(160,120,64,0.3)" }}>
            <FiChevronRight size={16} /> Select Delivery Address
          </button>
          <p style={{ textAlign: "center", fontSize: 11, color: "#aaa", marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
            <FiShield size={11} color={GREEN} /> Clicking will not deduct any money
          </p>
        </div>
      )}
      <div style={{ margin: "0 16px 16px", padding: "12px 14px", background: "#F0F7FF", borderRadius: 8, border: "1px solid #BBDEFB", display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#1565C0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <FiShield size={18} color={WHITE} />
        </div>
        <div>
          <p style={{ fontSize: 12, fontWeight: 800, color: "#1565C0" }}>Your Safety, Our Priority</p>
          <p style={{ fontSize: 11, color: "#555", lineHeight: 1.4 }}>We make sure your package is safe at every point of contact.</p>
        </div>
      </div>
    </div>
  );
}

// ── Payment Panel ─────────────────────────────────────────────
function PaymentPanel({ paymentMethod, cardData, setCardData, upiId, setUpiId, finalTotal }) {
  const [focused, setFocused] = useState(null);
  const inp = (n) => ({ width: "100%", height: 46, padding: "0 12px", borderRadius: 8, border: `1.5px solid ${focused === n ? GOLD : BORDER}`, outline: "none", fontSize: 14, color: CHARCOAL, fontFamily: "inherit", background: WHITE, boxSizing: "border-box", transition: "border 0.15s" });
  const banks = ["SBI","HDFC Bank","ICICI Bank","Axis Bank","Kotak Bank","PNB","Bank of Baroda","Yes Bank"];

  if (paymentMethod === "card") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.8px", display: "block", marginBottom: 6 }}>CARD NUMBER</label>
        <input value={cardData.number} onChange={e => setCardData(p => ({ ...p, number: e.target.value.replace(/\D/g,"").slice(0,16).replace(/(.{4})/g,"$1 ").trim() }))} onFocus={() => setFocused("cn")} onBlur={() => setFocused(null)} style={{ ...inp("cn"), letterSpacing: 2 }} placeholder="0000 0000 0000 0000" />
      </div>
      <div>
        <label style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.8px", display: "block", marginBottom: 6 }}>NAME ON CARD</label>
        <input value={cardData.name} onChange={e => setCardData(p => ({ ...p, name: e.target.value }))} onFocus={() => setFocused("cname")} onBlur={() => setFocused(null)} style={inp("cname")} placeholder="As printed on card" />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.8px", display: "block", marginBottom: 6 }}>EXPIRY</label>
          <input value={cardData.expiry} onChange={e => setCardData(p => ({ ...p, expiry: e.target.value }))} onFocus={() => setFocused("exp")} onBlur={() => setFocused(null)} style={inp("exp")} placeholder="MM / YY" maxLength={7} />
        </div>
        <div>
          <label style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.8px", display: "block", marginBottom: 6 }}>CVV</label>
          <input value={cardData.cvv} onChange={e => setCardData(p => ({ ...p, cvv: e.target.value.replace(/\D/g,"").slice(0,3) }))} type="password" onFocus={() => setFocused("cvv")} onBlur={() => setFocused(null)} style={inp("cvv")} placeholder="•••" maxLength={3} />
        </div>
      </div>
    </div>
  );

  if (paymentMethod === "upi") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {["GPay","PhonePe","Paytm","BHIM"].map(a => (
          <button key={a} style={{ height: 46, border: `1.5px solid ${BORDER}`, borderRadius: 8, background: WHITE, cursor: "pointer", fontSize: 13, fontWeight: 600, color: CHARCOAL, fontFamily: "inherit" }}>{a}</button>
        ))}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ flex: 1, height: 1, background: BORDER }} /><span style={{ fontSize: 11, color: "#aaa", fontWeight: 600 }}>OR UPI ID</span><div style={{ flex: 1, height: 1, background: BORDER }} />
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <input value={upiId} onChange={e => setUpiId(e.target.value)} style={{ flex: 1, height: 46, padding: "0 12px", borderRadius: 8, border: `1.5px solid ${BORDER}`, outline: "none", fontSize: 14, fontFamily: "inherit" }} placeholder="yourname@upi" />
        <button style={{ height: 46, padding: "0 16px", background: GOLD, color: WHITE, border: "none", borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>Verify</button>
      </div>
    </div>
  );

  if (paymentMethod === "netbanking") return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
      {banks.map(b => (
        <label key={b} style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", border: `1.5px solid ${BORDER}`, borderRadius: 8, cursor: "pointer", fontSize: 13, color: CHARCOAL }}>
          <input type="radio" name="bank" style={{ accentColor: GOLD }} /> {b}
        </label>
      ))}
    </div>
  );

  if (paymentMethod === "cod") return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14, padding: "20px 0", textAlign: "center" }}>
      <div style={{ width: 68, height: 68, borderRadius: "50%", background: GREEN_BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <FiTruck size={30} color={GREEN} />
      </div>
      <div>
        <p style={{ fontSize: 16, fontWeight: 700, color: CHARCOAL, marginBottom: 5 }}>Cash on Delivery</p>
        <p style={{ fontSize: 13, color: "#777" }}>Pay ₹{finalTotal} in cash at delivery.</p>
      </div>
      <div style={{ padding: "10px 16px", background: "#FFF8E1", border: "1px solid #FFE082", borderRadius: 8, fontSize: 12, color: "#856404", display: "flex", alignItems: "center", gap: 8 }}>
        <FiAlertTriangle size={13} /> Extra ₹40 COD convenience fee applies
      </div>
    </div>
  );

  if (paymentMethod === "emi") return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <p style={{ fontSize: 11, fontWeight: 700, color: "#888", letterSpacing: "0.8px" }}>SELECT EMI PLAN</p>
      {[
        { months: 3,  emi: Math.round(finalTotal/3),       tag: "No Cost",    banks: "HDFC / ICICI / Axis" },
        { months: 6,  emi: Math.round(finalTotal/6),       tag: "No Cost",    banks: "All major cards" },
        { months: 9,  emi: Math.round(finalTotal/9*1.02),  tag: "2% interest",banks: "All major cards" },
        { months: 12, emi: Math.round(finalTotal/12*1.04), tag: "4% interest",banks: "All major cards" },
      ].map(p => (
        <label key={p.months} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 14px", border: `1.5px solid ${BORDER}`, borderRadius: 8, cursor: "pointer" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input type="radio" name="emi" style={{ accentColor: GOLD }} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: CHARCOAL }}>{p.months} months</p>
              <p style={{ fontSize: 11, color: "#aaa" }}>{p.banks}</p>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 14, fontWeight: 800, color: GOLD_DARK }}>₹{p.emi}/mo</p>
            <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, background: p.tag === "No Cost" ? GREEN_BG : "#FFF8E1", color: p.tag === "No Cost" ? GREEN : "#856404" }}>{p.tag}</span>
          </div>
        </label>
      ))}
    </div>
  );

  return null;
}

// ═══════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════
export default function AddressPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const isMobile  = useIsMobile();
  const flow      = useCheckoutFlow();

  // ── Buy Now product: location.state se aata hai ─────────────
  // ProductDetails se: navigate("/checkout", { state: { buyNowItem: {...} } })
  const buyNowItem = location.state?.buyNowItem || null;

  // Checkout items: buy now = sirf woh 1 item, cart = sab items
  const checkoutItems = buyNowItem ? [buyNowItem] : cartItems;

  // Total calculate karo correct items se
  const checkoutTotal = buyNowItem
    ? buyNowItem.price * (buyNowItem.quantity || 1)
    : cartTotal;

  const [step, setStep]                   = useState(1);
  const [addresses, setAddresses]         = useState([]);
  const [addrLoading, setAddrLoading]     = useState(true);
  const [selectedAddr, setSelectedAddr]   = useState(null);
  const [showModal, setShowModal]         = useState(false);
  const [showSelector, setShowSelector]   = useState(false);
  const [editingAddr, setEditingAddr]     = useState(null);
  const [saving, setSaving]               = useState(false);
  const [deleting, setDeleting]           = useState(null);
  const [toast, setToast]                 = useState(null);
  const [placingOrder, setPlacingOrder]   = useState(false);

  const [coupon, setCoupon]               = useState("");
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError]     = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [cardData, setCardData]           = useState({ number:"", name:"", expiry:"", cvv:"" });
  const [upiId, setUpiId]                 = useState("");
  const [orderPlaced, setOrderPlaced]     = useState(false);
  const [orderId, setOrderId]             = useState(null);

const discount = couponApplied
  ? Math.round(checkoutTotal * 0.1)
  : checkoutItems.reduce((sum, item) => {
      const mrp   = Number(item.mrp)   || Number(item.price) || 0;
      const price = Number(item.price) || 0;
      const qty   = Number(item.quantity) || 1;
      return sum + Math.max(0, (mrp - price) * qty);
    }, 0);  const finalTotal = checkoutTotal - (couponApplied ? Math.round(checkoutTotal * 0.1) : 0);
  const codFee     = paymentMethod === "cod" ? 40 : 0;
  const orderTotal = finalTotal + codFee;

  const payMethods = [
    { id: "card",       icon: <FiCreditCard size={16}/>,  label: "Credit / Debit Card", sub: "Visa, Mastercard, Rupay" },
    { id: "upi",        icon: <FiSmartphone size={16}/>,  label: "UPI",                 sub: "GPay, PhonePe, Paytm" },
    { id: "netbanking", icon: <FiDollarSign size={16}/>,  label: "Net Banking",          sub: "All major banks" },
    { id: "cod",        icon: <FiTruck size={16}/>,       label: "Cash on Delivery",    sub: "Pay on arrival (+₹40)" },
    { id: "emi",        icon: <FiTag size={16}/>,         label: "EMI",                 sub: "No cost EMI available" },
  ];

  // ── Load Addresses ─────────────────────────────────────────
  const loadAddresses = useCallback(async () => {
    try {
      setAddrLoading(true);
      const data = await fetchAddresses();
      setAddresses(data);
      const def = data.find(a => a.isDefault) || data[0];
      if (def) setSelectedAddr(def);
    } catch {
      setToast({ msg: "Could not load addresses", type: "error" });
    } finally {
      setAddrLoading(false);
    }
  }, []);

  useEffect(() => { loadAddresses(); }, [loadAddresses]);

  // ── Address CRUD ───────────────────────────────────────────
  const handleSave = async (form) => {
    setSaving(true);
    try {
      if (editingAddr) {
        await updateAddress(editingAddr._id, form);
        setToast({ msg: "Address updated!", type: "success" });
      } else {
        await createAddress(form);
        setToast({ msg: "Address saved!", type: "success" });
      }
      await loadAddresses();
      setShowModal(false);
      setEditingAddr(null);
    } catch (e) {
      setToast({ msg: e.message || "Something went wrong", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await deleteAddress(id);
      if (selectedAddr?._id === id) setSelectedAddr(null);
      await loadAddresses();
      setToast({ msg: "Address removed", type: "success" });
    } catch (e) {
      setToast({ msg: e.message || "Delete failed", type: "error" });
    } finally {
      setDeleting(null);
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const updated = await setDefaultAddress(id);
      setAddresses(updated);
      setToast({ msg: "Default address updated", type: "success" });
    } catch (e) {
      setToast({ msg: e.message || "Update failed", type: "error" });
    }
  };

  // ── Place Order ────────────────────────────────────────────
  const handlePlaceOrder = async () => {
    if (!selectedAddr) {
      setToast({ msg: "Please select a delivery address", type: "error" });
      return;
    }

    setPlacingOrder(true);
    try {
      const paymentLabels = {
        card:       "Prepaid · Card",
        upi:        "Prepaid · UPI",
        netbanking: "Prepaid · NetBanking",
        cod:        "COD",
        emi:        "Prepaid · EMI",
      };

      const orderData = {
        items: checkoutItems.map(item => ({
          productId: item._id || item.id || null,
          name:      item.title || item.name || "Product",
          img:       item.img   || item.images?.[0] || "",
          price:     Number(item.price)    || 0,
          mrp:       Number(item.mrp)      || Number(item.price) || 0,
          size:      item.selectedSize || item.size || "",
          color:     item.selectedColor || item.color || "",
          quantity:  Number(item.quantity) || 1,
        })),
        deliveryAddress: {
          name:    selectedAddr.name,
          phone:   selectedAddr.phone,
          address: selectedAddr.address,
          city:    selectedAddr.city,
          state:   selectedAddr.state,
          pincode: selectedAddr.pincode,
          type:    selectedAddr.type || "home",
        },
        paymentMethod: paymentMethod,
        paymentLabel:  paymentLabels[paymentMethod] || paymentMethod,
        coupon:        couponApplied ? coupon : "",
        pricing: {
          subtotal:       checkoutTotal,
          discount:       discount,
          couponDiscount: couponApplied ? Math.round(checkoutTotal * 0.1) : 0,
          deliveryFee:    0,
          codFee:         codFee,
          total:          orderTotal,
        },
      };

      const savedOrder = await placeOrder(orderData);

      // Sirf cart flow mein cart clear karo, buy now mein nahi
      if (!buyNowItem && typeof clearCart === "function") clearCart();

      setOrderId(savedOrder.orderId);
      setOrderPlaced(true);

    } catch (e) {
      setToast({ msg: e.message || "Order failed. Please try again.", type: "error" });
    } finally {
      setPlacingOrder(false);
    }
  };

  // ── Step progression ───────────────────────────────────────
  const handleContinue = () => {
    if (step === 1) {
      if (!selectedAddr) { setToast({ msg: "Please select a delivery address", type: "error" }); return; }
      setStep(2);
    } else {
      handlePlaceOrder();
    }
  };

  const sidebarProps = {
    cartItems: checkoutItems,
    cartTotal: checkoutTotal,
    coupon, setCoupon, couponApplied, setCouponApplied,
    couponError, setCouponError, discount, paymentMethod, finalTotal,
    step, onContinue: handleContinue, flow, placingOrder,
  };

  const globalStyles = `
    @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; }
    @keyframes fadeIn  { from{opacity:0;transform:translateY(6px)} to{opacity:1;transform:none} }
    @keyframes spin    { to { transform: rotate(360deg); } }
    @keyframes popIn   { 0%{transform:scale(0.4);opacity:0} 70%{transform:scale(1.1)} 100%{transform:scale(1);opacity:1} }
    @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
    .rv-section { animation: fadeIn 0.25s ease; }
    .pay-tab::-webkit-scrollbar { display: none; }
  `;

  // ── Payment panel renderer ─────────────────────────────────
  const renderPaymentPanel = () => (
    <div style={{ background: WHITE, borderRadius: 8, border: `1px solid ${BORDER}`, overflow: "hidden" }}>
      <div style={{ padding: "14px 20px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 8 }}>
        <FiLock size={15} color={GOLD_DARK} />
        <h2 style={{ fontSize: 15, fontWeight: 800, color: CHARCOAL }}>Payment Method</h2>
        <span style={{ fontSize: 11, color: "#888" }}>Secure & encrypted</span>
      </div>
      {isMobile ? (
        <div>
          <div className="pay-tab" style={{ display: "flex", overflowX: "auto", borderBottom: `1px solid ${BORDER}`, scrollbarWidth: "none" }}>
            {payMethods.map(pm => (
              <button key={pm.id} onClick={() => setPaymentMethod(pm.id)}
                style={{ flexShrink: 0, padding: "10px 12px", border: "none", borderBottom: `3px solid ${paymentMethod === pm.id ? GOLD_DARK : "transparent"}`, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, fontFamily: "inherit", cursor: "pointer", minWidth: 76, background: paymentMethod === pm.id ? GOLD_LIGHT : WHITE, transition: "all 0.15s" }}>
                <span style={{ color: paymentMethod === pm.id ? GOLD_DARK : "#888" }}>{pm.icon}</span>
                <span style={{ fontSize: 10, fontWeight: paymentMethod === pm.id ? 700 : 500, color: paymentMethod === pm.id ? CHARCOAL : "#888", whiteSpace: "nowrap" }}>{pm.label.split(" ")[0]}</span>
              </button>
            ))}
          </div>
          <div style={{ padding: "16px" }}>
            <PaymentPanel paymentMethod={paymentMethod} cardData={cardData} setCardData={setCardData} upiId={upiId} setUpiId={setUpiId} finalTotal={finalTotal} />
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", minHeight: 340 }}>
          <div style={{ width: 200, borderRight: `1px solid ${BORDER}`, flexShrink: 0 }}>
            {payMethods.map(pm => (
              <div key={pm.id} onClick={() => setPaymentMethod(pm.id)}
                style={{ padding: "13px 16px", cursor: "pointer", borderLeft: `3px solid ${paymentMethod === pm.id ? GOLD_DARK : "transparent"}`, background: paymentMethod === pm.id ? GOLD_LIGHT : WHITE, borderBottom: `1px solid ${BORDER}`, transition: "all 0.15s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ color: paymentMethod === pm.id ? GOLD_DARK : "#888" }}>{pm.icon}</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: paymentMethod === pm.id ? 700 : 500, color: paymentMethod === pm.id ? CHARCOAL : "#555" }}>{pm.label}</p>
                    <p style={{ fontSize: 10, color: "#aaa", marginTop: 1 }}>{pm.sub}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, padding: "20px 22px" }}>
            <PaymentPanel paymentMethod={paymentMethod} cardData={cardData} setCardData={setCardData} upiId={upiId} setUpiId={setUpiId} finalTotal={finalTotal} />
          </div>
        </div>
      )}
    </div>
  );

  // ── Order Placed Screen ────────────────────────────────────
  if (orderPlaced) return (
    <>
      <style>{globalStyles}</style>
      {flow === "cart" ? <StepBarCart current={4} /> : <StepBarBuyNow current={3} />}
      <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", background: SURFACE, fontFamily: "'DM Sans',sans-serif", padding: 24 }}>
        <div style={{ textAlign: "center", animation: "fadeUp 0.5s ease" }}>
          <div style={{ width: 88, height: 88, borderRadius: "50%", background: GREEN_BG, border: `3px solid ${GREEN}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", animation: "popIn 0.5s ease" }}>
            <FiCheck size={38} color={GREEN} strokeWidth={3} />
          </div>
          <h2 style={{ fontFamily: "'Playfair Display',serif", fontSize: 28, fontWeight: 800, color: CHARCOAL, marginBottom: 8 }}>Order Placed!</h2>
          <p style={{ fontSize: 15, color: "#777", marginBottom: 6 }}>Thank you for shopping with RoopVibe</p>
          <p style={{ fontSize: 13, color: "#aaa", marginBottom: 32 }}>Confirmation sent to your email</p>
          <div style={{ background: WHITE, padding: "16px 36px", borderRadius: 12, border: `1px solid ${BORDER}`, display: "inline-block", marginBottom: 32 }}>
            <p style={{ fontSize: 11, color: "#aaa", marginBottom: 4 }}>ORDER ID</p>
            <p style={{ fontSize: 20, fontWeight: 800, color: CHARCOAL }}>{orderId || "—"}</p>
          </div>
          <br />
          <button onClick={() => navigate("/")}
            style={{ padding: "14px 40px", background: `linear-gradient(to right,${GOLD_DARK},${GOLD})`, color: WHITE, border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(160,120,64,0.3)" }}>
            Continue Shopping
          </button>
        </div>
      </div>
    </>
  );

  // ══════════════════════════════════════════════════════════
  // CART FLOW
  // ══════════════════════════════════════════════════════════
  if (flow === "cart") {
    return (
      <>
        <style>{globalStyles}</style>
        <StepBarCart current={step === 1 ? 2 : 3} />
        <div style={{ background: "#F5F5F5", minHeight: "calc(100vh - 64px)", fontFamily: "'DM Sans',sans-serif" }}>

          {step === 1 && (
            <div style={{ maxWidth: 1000, margin: "0 auto", padding: isMobile ? "16px 12px 80px" : "24px 20px", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 320px", gap: 24, alignItems: "start" }}>
              <div className="rv-section">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: CHARCOAL }}>Select Delivery Address</h2>
                  <button onClick={() => { setEditingAddr(null); setShowModal(true); }}
                    style={{ background: "none", border: "none", color: GOLD_DARK, fontWeight: 700, fontSize: 13, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: 4 }}>
                    <FiPlus size={13}/> ADD NEW ADDRESS
                  </button>
                </div>

                {addrLoading && (
                  <div style={{ padding: "40px 0", textAlign: "center" }}>
                    <div style={{ width: 32, height: 32, border: "3px solid #eee", borderTopColor: GOLD, borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 10px" }} />
                    <p style={{ color: "#aaa", fontSize: 13 }}>Loading addresses…</p>
                  </div>
                )}

                {!addrLoading && addresses.length === 0 && (
                  <div style={{ background: WHITE, borderRadius: 8, border: `1px solid ${BORDER}`, padding: "40px 20px", textAlign: "center" }}>
                    <div style={{ fontSize: 44, marginBottom: 12 }}>📍</div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: CHARCOAL, marginBottom: 6 }}>No saved addresses</p>
                    <p style={{ fontSize: 13, color: "#aaa", marginBottom: 18 }}>Add your first delivery address</p>
                    <button onClick={() => { setEditingAddr(null); setShowModal(true); }}
                      style={{ background: `linear-gradient(to right,${GOLD_DARK},${GOLD})`, color: WHITE, border: "none", borderRadius: 4, padding: "11px 28px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                      + Add Address
                    </button>
                  </div>
                )}

                {!addrLoading && addresses.map(addr => {
                  const isSelected = selectedAddr?._id === addr._id;
                  return (
                    <div key={addr._id} onClick={() => setSelectedAddr(addr)}
                      style={{ background: isSelected ? GOLD_LIGHT : WHITE, borderRadius: 8, border: `1px solid ${isSelected ? GOLD : BORDER}`, padding: "16px 18px", marginBottom: 10, cursor: "pointer", transition: "all 0.15s" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                        <div style={{ width: 20, height: 20, borderRadius: "50%", border: `2px solid ${isSelected ? GOLD_DARK : "#bbb"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 2 }}>
                          {isSelected && <div style={{ width: 10, height: 10, borderRadius: "50%", background: GOLD_DARK }} />}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                            <span style={{ fontSize: 15, fontWeight: 700, color: CHARCOAL }}>{addr.name}</span>
                            <span style={{ fontSize: 10, fontWeight: 700, background: GOLD_LIGHT, color: GOLD_DARK, padding: "2px 8px", borderRadius: 20, textTransform: "uppercase" }}>{addr.type || "home"}</span>
                            {addr.isDefault && <span style={{ fontSize: 10, fontWeight: 800, background: GREEN_BG, color: GREEN, padding: "2px 8px", borderRadius: 20 }}>DEFAULT</span>}
                          </div>
                          <p style={{ fontSize: 14, color: "#444", lineHeight: 1.6, marginBottom: 2 }}>{addr.address}, {addr.city}, {addr.state}, {addr.pincode}</p>
                          <p style={{ fontSize: 14, color: "#444", marginBottom: isSelected ? 14 : 0 }}>Mobile: {addr.phone}</p>
                          {isSelected && (
                            <>
                              <button onClick={e => { e.stopPropagation(); setStep(2); }}
                                style={{ width: "100%", height: 46, background: `linear-gradient(to right,${GOLD_DARK},${GOLD})`, color: WHITE, border: "none", borderRadius: 4, fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit", marginBottom: 10 }}>
                                Deliver to this Address
                              </button>
                              <div style={{ display: "flex", gap: 20 }}>
                                <button onClick={e => { e.stopPropagation(); setEditingAddr(addr); setShowModal(true); }}
                                  style={{ background: "none", border: "none", color: GOLD_DARK, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>EDIT</button>
                                <button onClick={e => { e.stopPropagation(); handleDelete(addr._id); }} disabled={deleting === addr._id}
                                  style={{ background: "none", border: "none", color: "#888", fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>
                                  {deleting === addr._id ? "REMOVING…" : "REMOVE"}
                                </button>
                                {!addr.isDefault && (
                                  <button onClick={e => { e.stopPropagation(); handleSetDefault(addr._id); }}
                                    style={{ background: "none", border: "none", color: GREEN, fontWeight: 700, fontSize: 12, cursor: "pointer", fontFamily: "inherit" }}>SET DEFAULT</button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {!isMobile && (
                <div style={{ position: "sticky", top: 84 }}>
                  <PriceSidebar {...sidebarProps} />
                </div>
              )}
            </div>
          )}

          {step === 2 && (
            <div style={{ maxWidth: 1000, margin: "0 auto", padding: isMobile ? "16px 12px 100px" : "24px 20px", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 320px", gap: 24, alignItems: "start" }}>
              <div className="rv-section">
                <div style={{ background: WHITE, borderRadius: 8, border: `1px solid ${BORDER}`, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: GREEN_BG, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <FiCheck size={14} color={GREEN} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: CHARCOAL }}>{selectedAddr?.name}</p>
                      <p style={{ fontSize: 11, color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{selectedAddr?.address}, {selectedAddr?.city} — {selectedAddr?.pincode}</p>
                    </div>
                  </div>
                  <button onClick={() => setStep(1)} style={{ fontSize: 12, fontWeight: 800, color: GOLD_DARK, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", marginLeft: 10 }}>CHANGE</button>
                </div>
                {renderPaymentPanel()}
              </div>

              {!isMobile && (
                <div style={{ position: "sticky", top: 84 }}>
                  <PriceSidebar {...sidebarProps} />
                </div>
              )}
              {isMobile && <PriceSidebar {...sidebarProps} />}
            </div>
          )}
        </div>

        {showModal && <AddressFormModal initial={editingAddr} onSave={handleSave} onClose={() => { setShowModal(false); setEditingAddr(null); }} saving={saving} />}
        {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
      </>
    );
  }

  // ══════════════════════════════════════════════════════════
  // BUY-NOW FLOW
  // ══════════════════════════════════════════════════════════
  return (
    <>
      <style>{globalStyles}</style>
      <StepBarBuyNow current={step} />

      <div style={{ background: SURFACE, minHeight: "calc(100vh - 64px)", padding: isMobile ? "14px 12px 100px" : "24px 20px", fontFamily: "'DM Sans',sans-serif" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 380px", gap: isMobile ? 14 : 24, alignItems: "start" }}>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

            {step === 1 && (
              <div className="rv-section">
                {/* Product Details */}
                <div style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: "hidden", marginBottom: 14, boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                  <div style={{ padding: "14px 20px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <h2 style={{ fontSize: 15, fontWeight: 700, color: CHARCOAL }}>Product Details</h2>
                    <span style={{ fontSize: 12, color: GREEN, fontWeight: 600, display: "flex", alignItems: "center", gap: 5 }}>
                      <FiTruck size={13}/> Est. delivery in 5–7 days
                    </span>
                  </div>
                  {checkoutItems.length === 0 ? (
                    <div style={{ padding: "32px 20px", textAlign: "center", color: "#aaa", fontSize: 13 }}>No items found</div>
                  ) : (
                    <>
                      {checkoutItems.map((item, idx) => (
                        <div key={item.id || item._id || idx} style={{ padding: "14px 20px", borderBottom: `1px solid ${BORDER}`, display: "flex", gap: 14, alignItems: "flex-start" }}>
                          <img src={item.img || item.images?.[0]} alt={item.title || item.name}
                            style={{ width: 70, height: 86, objectFit: "cover", borderRadius: 6, border: `1px solid ${BORDER}`, flexShrink: 0 }}
                            onError={e => { e.target.style.background = SURFACE; e.target.src = ""; }} />
                          <div style={{ flex: 1 }}>
                            <p style={{ fontSize: 14, fontWeight: 600, color: CHARCOAL, marginBottom: 5, lineHeight: 1.4 }}>{item.title || item.name}</p>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                              <span style={{ fontSize: 16, fontWeight: 800, color: CHARCOAL }}>₹{item.price}</span>
                              {item.mrp && item.mrp > item.price && (
                                <>
                                  <span style={{ fontSize: 12, color: "#aaa", textDecoration: "line-through" }}>₹{item.mrp}</span>
                                  <span style={{ fontSize: 11, fontWeight: 700, color: "#388E3C", background: "#F1F8E9", padding: "1px 6px", borderRadius: 4 }}>
                                    {Math.round((item.mrp - item.price) / item.mrp * 100)}% Off
                                  </span>
                                </>
                              )}
                            </div>
                            <p style={{ fontSize: 12, color: "#888" }}>
                              {[item.selectedSize && `Size: ${item.selectedSize}`, item.selectedColor && `Color: ${item.selectedColor}`, item.quantity && `Qty: ${item.quantity}`].filter(Boolean).join("  •  ")}
                            </p>
                          </div>
                        </div>
                      ))}
                      <div style={{ padding: "10px 20px", fontSize: 12, color: "#999" }}>
                        All issue easy returns · Sold by: RoopVibe Official Store
                      </div>
                    </>
                  )}
                </div>

                {/* Delivery Address */}
                <div style={{ background: WHITE, borderRadius: 12, border: `1px solid ${BORDER}`, overflow: "hidden", boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                  <div style={{ padding: "14px 20px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 8 }}>
                    <FiMapPin size={15} color={GOLD_DARK} />
                    <h2 style={{ fontSize: 15, fontWeight: 700, color: CHARCOAL }}>Delivery Address</h2>
                  </div>
                  <div style={{ padding: "14px 20px" }}>
                    {addrLoading && (
                      <div style={{ padding: "20px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                        <div style={{ width: 20, height: 20, border: `3px solid ${BORDER}`, borderTopColor: GOLD, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                        <span style={{ fontSize: 13, color: "#aaa" }}>Loading…</span>
                      </div>
                    )}
                    {!addrLoading && selectedAddr && (
                      <div style={{ background: GOLD_LIGHT, borderRadius: 8, padding: "14px 16px", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, border: `1px solid ${GOLD}44` }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                            <p style={{ fontSize: 15, fontWeight: 700, color: CHARCOAL }}>{selectedAddr.name}</p>
                            <span style={{ fontSize: 10, fontWeight: 700, background: WHITE, color: GOLD_DARK, padding: "2px 8px", borderRadius: 20, textTransform: "uppercase", border: `1px solid ${GOLD}` }}>{selectedAddr.type || "home"}</span>
                            {selectedAddr.isDefault && (
                              <span style={{ fontSize: 10, fontWeight: 800, background: GREEN_BG, color: GREEN, padding: "2px 8px", borderRadius: 20 }}>DEFAULT</span>
                            )}
                          </div>
                          <p style={{ fontSize: 13, color: "#555", lineHeight: 1.6, marginBottom: 3 }}>{selectedAddr.address}, {selectedAddr.city}, {selectedAddr.state} - {selectedAddr.pincode}</p>
                          <p style={{ fontSize: 13, color: "#666" }}>Mobile: {selectedAddr.phone}</p>
                        </div>
                        <button onClick={() => setShowSelector(true)}
                          style={{ fontSize: 13, fontWeight: 800, color: GOLD_DARK, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
                          CHANGE
                        </button>
                      </div>
                    )}
                    {!addrLoading && !selectedAddr && (
                      <div style={{ textAlign: "center", padding: "20px 0" }}>
                        <p style={{ fontSize: 14, color: "#aaa", marginBottom: 12 }}>No address found</p>
                        <button onClick={() => { setEditingAddr(null); setShowModal(true); }}
                          style={{ background: `linear-gradient(to right,${GOLD_DARK},${GOLD})`, color: WHITE, border: "none", borderRadius: 6, padding: "10px 24px", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                          + Add Address
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="rv-section">
                <div style={{ background: WHITE, borderRadius: 10, border: `1px solid ${BORDER}`, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, boxShadow: "0 1px 6px rgba(0,0,0,0.04)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1, minWidth: 0 }}>
                    <div style={{ width: 30, height: 30, borderRadius: "50%", background: GREEN_BG, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <FiCheck size={14} color={GREEN} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, color: CHARCOAL }}>
                        {selectedAddr?.name} — <span style={{ textTransform: "uppercase", fontSize: 11 }}>{selectedAddr?.type}</span>
                      </p>
                      <p style={{ fontSize: 11, color: "#888", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {selectedAddr?.address}, {selectedAddr?.city} — {selectedAddr?.pincode}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setStep(1)}
                    style={{ fontSize: 12, fontWeight: 800, color: GOLD_DARK, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", flexShrink: 0, marginLeft: 10 }}>
                    CHANGE
                  </button>
                </div>
                {renderPaymentPanel()}
              </div>
            )}

            {isMobile && <PriceSidebar {...sidebarProps} />}
          </div>

          {!isMobile && (
            <div style={{ position: "sticky", top: 84 }}>
              <PriceSidebar {...sidebarProps} />
            </div>
          )}
        </div>
      </div>

      {showSelector && (
        <AddressSelectorModal
          addresses={addresses}
          selectedAddr={selectedAddr}
          onSelect={(addr) => setSelectedAddr(addr)}
          onAddNew={() => { setShowSelector(false); setEditingAddr(null); setShowModal(true); }}
          onClose={() => setShowSelector(false)}
        />
      )}
      {showModal && (
        <AddressFormModal
          initial={editingAddr}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditingAddr(null); }}
          saving={saving}
        />
      )}
      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </>
  );
}