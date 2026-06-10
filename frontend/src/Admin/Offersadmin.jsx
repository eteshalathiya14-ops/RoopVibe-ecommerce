// frontend/src/Admin/Offersadmin.jsx
import { useState, useRef, useEffect, useCallback } from "react";
import {
  FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiCopy,
  FiTag, FiImage, FiGrid, FiPercent, FiDollarSign,
  FiCalendar, FiUpload, FiPackage, FiRefreshCw,
  FiChevronDown, FiChevronUp, FiAlertCircle,
} from "react-icons/fi";
import {
  fetchBanners,    createBanner,    updateBanner,    deleteBanner,    toggleBanner,
  fetchCoupons,    createCoupon,    updateCoupon,    deleteCoupon,    toggleCoupon,
  fetchCategories, createCategory,  updateCategory,  deleteCategory,  toggleCategory,
  seedOffers,
} from "../Api/Offersapi";

// ── RoopVibe Design Tokens ────────────────────────────────────
const G = {
  primary:   "#C9A96E",   // RoopVibe Gold
  primaryDk: "#A07840",   // Gold Dark
  primaryLt: "#F5EDD9",   // Gold Light
  gold:      "#C9A96E",   // RoopVibe gold
  goldDk:    "#A07840",
  goldLt:    "#FAF3E7",
  charcoal:  "#1A1A1A",
  muted:     "#6B6560",
  surface:   "#FAF7F2",
  border:    "#EDE8E0",
  white:     "#FFFFFF",
  danger:    "#C0392B",
  dangerLt:  "#FEF0EE",
  success:   "#27AE60",
  successLt: "#EAF7EF",
};

const GRADIENTS = [
  "linear-gradient(135deg,#A07840,#C9A96E)",   // Dark Gold to Gold
  "linear-gradient(135deg,#6B4F1A,#A07840)",   // Brown to Dark Gold
  "linear-gradient(135deg,#C9A96E,#FAF3E7)",   // Gold to Light Gold
  "linear-gradient(135deg,#2C1A0E,#6B4F1A)",   // Very Dark Brown to Brown
  "linear-gradient(135deg,#757575,#BDBDBD)",   // Grey gradient
  "linear-gradient(135deg,#2E7D32,#66BB6A)",   // Green gradient
  "linear-gradient(135deg,#D32F2F,#EF5350)",   // Red gradient
  "linear-gradient(135deg,#1565C0,#42A5F5)",   // Blue gradient
];

const BADGE_COLORS = [
  "#C9A96E","#A07840","#6B4F1A","#757575", // Gold, Dark Gold, Brown, Muted Grey
  "#2E7D32","#D32F2F","#1565C0","#E65100", // Green, Red, Blue, Orange
];

const NAV_CATEGORIES = [
  { id: "nav-women",   label: "Women",              path: "/category/women" },
  { id: "nav-men",     label: "Men",                path: "/category/men" },
  { id: "nav-kids",    label: "Kids",               path: "/category/kids" },
  { id: "nav-home",    label: "Home",               path: "/category/home" },
  { id: "nav-ethnic",  label: "Women — Ethnic Wear", path: "/category/women/ethnic-wear" },
  { id: "nav-western", label: "Women — Western Wear", path: "/category/women/western-wear" },
  { id: "nav-sarees",  label: "Women — Sarees",      path: "/category/women/sarees" },
  { id: "nav-kurtas",  label: "Women — Kurtas",      path: "/category/women/kurtas" },
  { id: "nav-lehenga", label: "Women — Lehenga",     path: "/category/women/lehenga" },
  { id: "nav-topwear", label: "Men — Top Wear",      path: "/category/men/top-wear" },
  { id: "nav-footwear",label: "Footwear",             path: "/category/women/footwear" },
  { id: "nav-jewel",   label: "Jewellery",            path: "/category/women/jewellery" },
  { id: "nav-sale",    label: "Sale",                 path: "/sale" },
  { id: "nav-new",     label: "New Arrivals",         path: "/new-arrivals" },
];

const NAVBAR_STRUCTURE = [
  { name: "WOMEN", columns: [
    { title: "Ethnic Wear",          items: ["Kurta Kurtis","Sarees","Ethnic Sets","Lehengas And Blouse","Ethnic Dresses","Skirts","Shawls & Dupattas"] },
    { title: "Western Wear",         items: ["Dresses","Tops","Tunics","T-Shirts","Jeans & Jeggings","Trousers","Co Ord Set","Shorts"] },
    { title: "Sports & Activewear",  items: ["Swim Wear","Tights","Track Pants","Sports Bra"] },
    { title: "Lingerie & Sleepwear", items: ["Bra","Panties","Lingerie Sets","Sleepwear"] },
    { title: "Jewellery",            items: ["Imitation Jewellery","Earrings","Necklace & Pendants","Rings & Bangles"] },
    { title: "Footwear",             items: ["Heels","Flats","Sandals","Boots","Sports Shoes"] },
  ]},
  { name: "MEN", columns: [
    { title: "Top Wear",    items: ["Casual Shirts","Formal Shirts","T-Shirts","Polo T Shirts","Suits & Blazers"] },
    { title: "Bottom Wear", items: ["Cargos","Jeans","Joggers","Shorts","Formal Trousers"] },
    { title: "Ethnic Wear", items: ["Kurtas","Nehru Jackets","Waist Coat","Ethnic Sets"] },
    { title: "Footwear",    items: ["Casual Shoes","Formal Shoes","Sandals","Sports Shoes","Slippers"] },
  ]},
  { name: "KIDS", columns: [
    { title: "Boys",     items: ["T-Shirts","Shirts","Bottom Wear","Ethnic Wear","Coats & Jackets"] },
    { title: "Girls",    items: ["Dresses & Frocks","Tees & Tops","Ethnic Wear","Party Gowns"] },
    { title: "Footwear", items: ["Sandals","Casual Shoes","Sports Shoes"] },
  ]},
  { name: "HOME", columns: [
    { title: "Bedding", items: ["Bed Sheets","Pillow Covers","Blankets","Comforters"] },
    { title: "Decor",   items: ["Wall Art","Cushions","Candles","Photo Frames"] },
    { title: "Kitchen", items: ["Cookware","Storage","Serveware"] },
  ]},
];

function LinkSelector({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [selNav, setSelNav] = useState(null);
  const [selCol, setSelCol] = useState(null);
  const navItem = NAVBAR_STRUCTURE.find(n => n.name === selNav);
  const colItem = navItem?.columns.find(c => c.title === selCol);
  const toSlug = s => s.toLowerCase().replace(/\s+/g,"-").replace(/[&]/g,"").replace(/--+/g,"-");

  return (
    <div style={{ position: "relative" }}>
      <div onClick={() => setOpen(!open)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${open ? G.primary : G.border}`, background: G.white, cursor: "pointer", fontSize: 13, color: value ? G.charcoal : G.muted }}>
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value || "Select link from navbar…"}</span>
        <FiChevronDown size={14} style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </div>
      {open && (
        <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 999, background: G.white, border: `1px solid ${G.border}`, borderRadius: 10, boxShadow: "0 8px 30px rgba(0,0,0,0.12)", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: selNav ? (selCol ? "1fr 1fr 1fr" : "1fr 1fr") : "1fr" }}>
            <div style={{ borderRight: selNav ? `1px solid ${G.border}` : "none" }}>
              <div style={{ padding: "8px 12px 4px", fontSize: 10, fontWeight: 700, color: G.muted }}>NAVBAR</div>
              {NAVBAR_STRUCTURE.map(n => (
                <div key={n.name} onClick={() => { setSelNav(n.name); setSelCol(null); onChange(`/category/${n.name.toLowerCase()}`); }} style={{ padding: "9px 14px", fontSize: 12, cursor: "pointer", background: selNav === n.name ? G.primaryLt : "transparent", color: selNav === n.name ? G.primaryDk : G.charcoal }}>{n.name}</div>
              ))}
            </div>
            {selNav && navItem && (
              <div style={{ borderRight: selCol ? `1px solid ${G.border}` : "none" }}>
                <div style={{ padding: "8px 12px 4px", fontSize: 10, fontWeight: 700, color: G.muted }}>CATEGORY</div>
                {navItem.columns.map(col => (
                  <div key={col.title} onClick={() => { setSelCol(col.title); onChange(`/category/${selNav.toLowerCase()}/${toSlug(col.title)}`); }} style={{ padding: "9px 14px", fontSize: 12, cursor: "pointer", background: selCol === col.title ? G.primaryLt : "transparent", color: selCol === col.title ? G.primaryDk : G.charcoal }}>{col.title}</div>
                ))}
              </div>
            )}
            {selCol && colItem && (
              <div>
                <div style={{ padding: "8px 12px 4px", fontSize: 10, fontWeight: 700, color: G.muted }}>SUB-CATEGORY</div>
                {colItem.items.map(item => (
                  <div key={item} onClick={() => { onChange(`/category/${selNav.toLowerCase()}/${toSlug(item)}`); setOpen(false); }} style={{ padding: "9px 14px", fontSize: 12, cursor: "pointer", color: value?.includes(toSlug(item)) ? G.primaryDk : G.charcoal, background: value?.includes(toSlug(item)) ? G.primaryLt : "transparent" }}>{item}</div>
                ))}
              </div>
            )}
          </div>
          <div style={{ borderTop: `1px solid ${G.border}`, padding: "8px 12px", display: "flex", gap: 8 }}>
            <input
              value={value}
              onChange={e => onChange(e.target.value)}
              placeholder="Or type manually..."
              style={{ flex: 1, padding: "6px 10px", border: `1px solid ${G.border}`, borderRadius: 6, fontSize: 12, outline: "none" }}
            />
            <Btn onClick={() => setOpen(false)} style={{ padding: "4px 10px" }}>Done</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  REUSABLE COMPONENTS
// ══════════════════════════════════════════════════════════════

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      aria-label={value ? "Deactivate" : "Activate"}
      style={{
        width: 44, height: 24, borderRadius: 12, border: "none",
        cursor: "pointer", flexShrink: 0, position: "relative",
        background: value ? G.primary : G.border,
        transition: "background 0.2s",
      }}>
      <span style={{
        position: "absolute", top: 3, width: 18, height: 18,
        borderRadius: "50%", background: G.white,
        left: value ? 23 : 3,
        transition: "left 0.2s",
        boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
      }} />
    </button>
  );
}

function Btn({ children, onClick, variant = "default", style: sx = {}, disabled = false, title }) {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 6,
    borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer",
    fontFamily: "inherit", fontWeight: 700, fontSize: 12,
    padding: "8px 14px", border: "none",
    transition: "all 0.15s", opacity: disabled ? 0.55 : 1,
  };
  const styles = {
    default: { background: G.white, color: G.charcoal, border: `1px solid ${G.border}` },
    primary: { background: `linear-gradient(135deg,${G.primaryDk},${G.primary})`, color: G.white },
    gold:    { background: `linear-gradient(135deg,${G.goldDk},${G.gold})`, color: G.white },
    danger:  { background: G.dangerLt, color: G.danger, border: `1px solid #FCC` },
    ghost:   { background: "transparent", color: G.muted },
  };
  return (
    <button
      title={title}
      onClick={disabled ? undefined : onClick}
      style={{ ...base, ...styles[variant], ...sx }}>
      {children}
    </button>
  );
}

function Field({ label, children, hint, required }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{
        display: "block", fontSize: 11, color: G.muted,
        marginBottom: 5, fontWeight: 700,
        textTransform: "uppercase", letterSpacing: 0.5,
      }}>
        {label}{required && <span style={{ color: G.primary, marginLeft: 3 }}>*</span>}
      </label>
      {children}
      {hint && <p style={{ fontSize: 10, color: G.muted, marginTop: 3, lineHeight: 1.4 }}>{hint}</p>}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text", style: sx = {}, rows, min }) {
  const base = {
    width: "100%", padding: "9px 12px", borderRadius: 8,
    border: `1.5px solid ${G.border}`, fontSize: 13,
    color: G.charcoal, fontFamily: "inherit", outline: "none",
    background: G.white, boxSizing: "border-box", transition: "border-color 0.15s",
    ...sx,
  };
  if (rows) return (
    <textarea
      value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} rows={rows}
      style={{ ...base, resize: "vertical" }}
      onFocus={e => e.target.style.borderColor = G.primary}
      onBlur={e => e.target.style.borderColor = G.border} />
  );
  return (
    <input
      value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} type={type} min={min}
      style={base}
      onFocus={e => e.target.style.borderColor = G.primary}
      onBlur={e => e.target.style.borderColor = G.border} />
  );
}

function Select({ value, onChange, children, style: sx = {} }) {
  return (
    <select
      value={value} onChange={e => onChange(e.target.value)}
      style={{
        width: "100%", padding: "9px 12px", borderRadius: 8,
        border: `1.5px solid ${G.border}`, fontSize: 13,
        color: G.charcoal, fontFamily: "inherit",
        background: G.white, outline: "none",
        transition: "border-color 0.15s", ...sx,
      }}
      onFocus={e => e.target.style.borderColor = G.primary}
      onBlur={e => e.target.style.borderColor = G.border}>
      {children}
    </select>
  );
}

// Reusable Image Upload Component
function LocalImageUpload({ value, onChange }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", padding: "12px", border: `1.5px dashed ${value ? G.primary : G.border}`, borderRadius: 10, background: G.surface, transition: "all 0.2s" }}>
        <FiUpload size={18} color={G.primary} />
        <span style={{ fontSize: 13, color: G.muted }}>{value ? "Change Image" : "Upload image from device"}</span>
        <input type="file" accept="image/*" style={{ display: "none" }} onChange={e => {
          const file = e.target.files[0];
          if (!file) return;
          const reader = new FileReader();
          reader.onload = (ev) => onChange(ev.target.result);
          reader.readAsDataURL(file);
        }} />
      </label>
      {value && (
        <div style={{ marginTop: 8, borderRadius: 8, overflow: "hidden", height: 80, border: `1px solid ${G.border}`, position: "relative" }}>
          <img src={value} alt="preview"
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={e => { e.target.style.display = "none"; }} />
          <button
            onClick={() => onChange("")}
            style={{ position: "absolute", top: 4, right: 4, width: 22, height: 22, borderRadius: "50%", background: "rgba(0,0,0,0.55)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: G.white }}>
            <FiX size={11} />
          </button>
        </div>
      )}
    </div>
  );
}

function Modal({ title, onClose, children, footer, wide }) {
  return (
    <div
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, backdropFilter: "blur(3px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: G.white, borderRadius: 16,
        width: wide ? 620 : 520, maxWidth: "100%",
        border: `1px solid ${G.border}`,
        boxShadow: "0 24px 60px rgba(0,0,0,0.18)",
        maxHeight: "90vh", display: "flex", flexDirection: "column",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 22px", borderBottom: `1px solid ${G.border}`, flexShrink: 0 }}>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: G.charcoal, margin: 0 }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: G.muted, display: "flex", padding: 4 }}>
            <FiX size={18} />
          </button>
        </div>
        {/* Body */}
        <div style={{ padding: "20px 22px", overflowY: "auto", flex: 1 }}>{children}</div>
        {/* Footer */}
        {footer && (
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", padding: "14px 22px", borderTop: `1px solid ${G.border}`, flexShrink: 0 }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

function SectionCard({ title, icon, badge, children, action, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background: G.white, border: `1px solid ${G.border}`, borderRadius: 14, overflow: "hidden", marginBottom: 20 }}>
      <div
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 22px", borderBottom: open ? `1px solid ${G.border}` : "none", cursor: "pointer", background: open ? G.white : G.surface }}
        onClick={() => setOpen(o => !o)}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ color: G.primary, fontSize: 18 }}>{icon}</span>
          <h3 style={{ fontSize: 15, fontWeight: 800, color: G.charcoal, margin: 0 }}>{title}</h3>
          {badge && (
            <span style={{ fontSize: 10, padding: "3px 10px", borderRadius: 20, background: G.primaryLt, color: G.primary, fontWeight: 700 }}>
              {badge}
            </span>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {action && <div onClick={e => e.stopPropagation()}>{action}</div>}
          {open ? <FiChevronUp size={14} color={G.muted} /> : <FiChevronDown size={14} color={G.muted} />}
        </div>
      </div>
      {open && children}
    </div>
  );
}

function Toast({ msg, type = "success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 3000,
      background: type === "success" ? G.charcoal : G.danger,
      color: G.white, padding: "12px 20px", borderRadius: 10,
      fontSize: 13, fontWeight: 700,
      boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
      display: "flex", alignItems: "center", gap: 10,
      animation: "fadeUp 0.25s ease",
    }}>
      {type === "success"
        ? <FiCheck size={14} color="#4ade80" />
        : <FiAlertCircle size={14} color="#fca5a5" />}
      {msg}
    </div>
  );
}

function Spinner() {
  return (
    <span style={{
      display: "inline-block", width: 14, height: 14,
      border: "2px solid rgba(255,255,255,0.35)",
      borderTopColor: "#fff", borderRadius: "50%",
      animation: "spin 0.7s linear infinite",
    }} />
  );
}

function EmptyState({ text }) {
  return (
    <div style={{ padding: "48px 20px", textAlign: "center", color: G.muted }}>
      <FiPackage size={32} style={{ marginBottom: 10, opacity: 0.4 }} />
      <p style={{ fontSize: 13, margin: 0 }}>{text}</p>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
//  SECTION 1: BANNERS
// ══════════════════════════════════════════════════════════════
function BannersSection({ products }) {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState(null);

  const EMPTY = {
    _id: null, tag: "", title: "", subtitle: "",
    cta: "Shop Now", ctaLink: "", image: "",
    productId: "", active: true, sortOrder: 0,
  };
  const [form, setForm] = useState(EMPTY);
  const f = k => v => setForm(p => ({ ...p, [k]: v }));

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchBanners();
      setBanners(Array.isArray(data) ? data : []);
    } catch (e) {
      setToast({ msg: e.message || "Failed to load banners", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd  = () => { setForm(EMPTY); setModal(true); };
  const openEdit = b  => { setForm({ ...EMPTY, ...b }); setModal(true); };

  const save = async () => {
    if (!form.title.trim()) {
      setToast({ msg: "Title is required", type: "error" });
      return;
    }
    setSaving(true);
    try {
      const { _id, ...data } = form;
      if (_id) {
        await updateBanner(_id, data);
        setToast({ msg: "Banner updated!", type: "success" });
      } else {
        await createBanner(data);
        setToast({ msg: "Banner created!", type: "success" });
      }
      await load();
      setModal(false);
    } catch (e) {
      setToast({ msg: e.message || "Save failed", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async id => {
    if (!window.confirm("Delete this banner?")) return;
    try {
      await deleteBanner(id);
      setBanners(p => p.filter(b => b._id !== id));
      setToast({ msg: "Banner deleted", type: "success" });
    } catch (e) {
      setToast({ msg: e.message, type: "error" });
    }
  };

  const toggle = async id => {
    try {
      const updated = await toggleBanner(id);
      setBanners(p => p.map(b => b._id === id ? { ...b, ...updated } : b));
    } catch (e) {
      setToast({ msg: e.message, type: "error" });
    }
  };

  const navLabel = id => {
    const nav = NAV_CATEGORIES.find(n => n.id === id);
    if (nav) return `📂 ${nav.label}`;
    const prod = products.find(p => (p._id || p.id) === id);
    if (prod) return `📦 ${prod.title || prod.name}`;
    return null;
  };

  return (
    <SectionCard
      title="Promo Banners" icon={<FiImage />}
      badge={`${banners.filter(b => b.active).length} active / ${banners.length} total`}
      action={<Btn variant="primary" onClick={openAdd}><FiPlus size={11} /> Add Banner</Btn>}>

      {loading && (
        <div style={{ padding: 30, textAlign: "center", color: G.muted, fontSize: 13 }}>Loading banners...</div>
      )}

      {!loading && banners.length === 0 && <EmptyState text='No banners yet. Click "+ Add Banner" to create one.' />}

      {!loading && banners.map((b, i) => (
        <div key={b._id} style={{
          display: "flex", alignItems: "center", gap: 14,
          padding: "14px 22px",
          borderBottom: i < banners.length - 1 ? `1px solid ${G.border}` : "none",
          opacity: b.active ? 1 : 0.45, transition: "opacity 0.2s",
        }}>
          {/* Thumbnail */}
          <div style={{
            width: 100, height: 60, borderRadius: 8, overflow: "hidden",
            flexShrink: 0, border: `1px solid ${G.border}`,
            background: G.surface,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {b.image
              ? <img src={b.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
              : <span style={{ color: "#fff", fontSize: 10, fontWeight: 700, textAlign: "center", padding: "0 6px" }}>{b.title}</span>
            }
          </div>

          {/* Info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
              {b.tag && (
                <span style={{ fontSize: 9, fontWeight: 800, color: G.primary, background: G.primaryLt, padding: "2px 7px", borderRadius: 4 }}>
                  {b.tag}
                </span>
              )}
              <span style={{ fontSize: 14, fontWeight: 800, color: G.charcoal }}>{b.title}</span>
            </div>
            {b.subtitle && <p style={{ fontSize: 11, color: G.muted, margin: "0 0 4px" }}>{b.subtitle}</p>}
            <div style={{ display: "flex", gap: 12, fontSize: 10, color: G.muted, flexWrap: "wrap" }}>
              <span>CTA: "{b.cta}"</span>              
              {b.ctaLink && <span>Link: {b.ctaLink}</span>}
              {b.productId && navLabel(b.productId) && <span>{navLabel(b.productId)}</span>}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Toggle value={b.active} onChange={() => toggle(b._id)} />
            <Btn onClick={() => openEdit(b)} style={{ padding: "6px 10px" }} title="Edit"><FiEdit2 size={12} /></Btn>
            <Btn variant="danger" onClick={() => remove(b._id)} style={{ padding: "6px 10px" }} title="Delete"><FiTrash2 size={12} /></Btn>
          </div>
        </div>
      ))}

      {modal && (
        <Modal
          title={form._id ? "Edit Banner" : "New Banner"}
          onClose={() => setModal(false)}
          footer={<>
            <Btn onClick={() => setModal(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={save} disabled={saving}>
              {saving && <Spinner />} {form._id ? "Update" : "Create"} Banner
            </Btn>
          </>}>

          <Field label="Banner Image" hint="Upload from device (1200x400 recommended)">
            <LocalImageUpload value={form.image} onChange={f("image")} />
          </Field>

          <Field label="Destination Link (Shop Now button)">
            <LinkSelector value={form.ctaLink} onChange={f("ctaLink")} />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Tag Line">
              <Input value={form.tag} onChange={f("tag")} placeholder="LIMITED TIME" />
            </Field>
            <Field label="Title" required>
              <Input value={form.title} onChange={f("title")} placeholder="MEGA SALE" />
            </Field>
          </div>

          <Field label="Subtitle">
            <Input value={form.subtitle} onChange={f("subtitle")} placeholder="Up to 80% Off" />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <Field label="CTA Text">
              <Input value={form.cta} onChange={f("cta")} placeholder="Shop Now" />
            </Field>
            <Field label="Sort Order" hint="Lower = first">
              <Input value={form.sortOrder} onChange={f("sortOrder")} type="number" min="0" placeholder="0" />
            </Field>
          </div>

          <Field label="Status">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Toggle value={form.active} onChange={f("active")} />
              <span style={{ fontSize: 12, color: G.muted }}>
                {form.active ? "Active — visible on Offers page" : "Hidden"}
              </span>
            </div>
          </Field>

          {/* Live preview */}
          {(form.image || form.title) && (
            <div style={{ marginTop: 8 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: G.muted, marginBottom: 8, textTransform: "uppercase" }}>Preview</p>
              <div style={{
                borderRadius: 10, overflow: "hidden", height: 70,
                position: "relative", border: `1px solid ${G.border}`,
                background: form.image ? `url(${form.image}) center/cover` : G.surface,
              }}>
                <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.32)", display: "flex", alignItems: "center", padding: "0 18px", gap: 18 }}>
                  <div>
                    {form.tag && <p style={{ fontSize: 8, color: "rgba(255,255,255,0.8)", margin: "0 0 2px", fontWeight: 700 }}>{form.tag}</p>}
                    <p style={{ fontSize: 15, fontWeight: 900, color: "#fff", margin: 0 }}>{form.title || "Title"}</p>
                    {form.subtitle && <p style={{ fontSize: 11, color: "rgba(255,255,255,0.8)", margin: 0 }}>{form.subtitle}</p>}
                  </div>
                  <div style={{ marginLeft: "auto", background: "rgba(255,255,255,0.2)", backdropFilter: "blur(4px)", borderRadius: 5, padding: "4px 14px", fontSize: 10, color: "#fff", fontWeight: 700 }}>
                    {form.cta || "CTA"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </SectionCard>
  );
}

// ══════════════════════════════════════════════════════════════
//  SECTION 2: COUPONS
// ══════════════════════════════════════════════════════════════
function CouponsSection() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [saving, setSaving]   = useState(false);
  const [copied, setCopied]   = useState("");
  const [toast, setToast]     = useState(null);

  const EMPTY = {
    _id: null, code: "", type: "flat", value: "", title: "",
    description: "", minOrder: "", maxDiscount: "",
    expiry: "", color: BADGE_COLORS[0], active: true, usageLimit: "",
  };
  const [form, setForm] = useState(EMPTY);
  const f = k => v => setForm(p => ({ ...p, [k]: v }));

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchCoupons();
      setCoupons(Array.isArray(data) ? data : []);
    } catch (e) {
      setToast({ msg: e.message || "Failed to load coupons", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd  = () => { setForm(EMPTY); setModal(true); };
  const openEdit = c  => {
    setForm({
      ...EMPTY, ...c,
      value:      String(c.value ?? ""),
      minOrder:   String(c.minOrder ?? ""),
      maxDiscount:String(c.maxDiscount ?? ""),
      usageLimit: String(c.usageLimit ?? ""),
    });
    setModal(true);
  };

  const save = async () => {
    if (!form.code.trim()) { setToast({ msg: "Coupon code required", type: "error" }); return; }
    if (form.value === "") { setToast({ msg: "Value required", type: "error" }); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        code:        form.code.trim().toUpperCase(),
        value:       Number(form.value),
        minOrder:    Number(form.minOrder   || 0),
        maxDiscount: Number(form.maxDiscount || 0),
        usageLimit:  Number(form.usageLimit  || 0),
      };
      const { _id, ...data } = payload;
      if (_id) {
        await updateCoupon(_id, data);
        setToast({ msg: "Coupon updated!", type: "success" });
      } else {
        await createCoupon(data);
        setToast({ msg: "Coupon created!", type: "success" });
      }
      await load();
      setModal(false);
    } catch (e) {
      setToast({ msg: e.message || "Save failed", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async id => {
    if (!window.confirm("Delete this coupon?")) return;
    try {
      await deleteCoupon(id);
      setCoupons(p => p.filter(c => c._id !== id));
      setToast({ msg: "Coupon deleted", type: "success" });
    } catch (e) {
      setToast({ msg: e.message, type: "error" });
    }
  };

  const toggle = async id => {
    try {
      const updated = await toggleCoupon(id);
      setCoupons(p => p.map(c => c._id === id ? { ...c, ...updated } : c));
    } catch (e) {
      setToast({ msg: e.message, type: "error" });
    }
  };

  const copy = code => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied(""), 1800);
  };

  return (
    <SectionCard
      title="Coupon Codes" icon={<FiTag />}
      badge={`${coupons.filter(c => c.active).length} active / ${coupons.length} total`}
      action={<Btn variant="primary" onClick={openAdd}><FiPlus size={11} /> Add Coupon</Btn>}>

      {loading && <div style={{ padding: 30, textAlign: "center", color: G.muted, fontSize: 13 }}>Loading coupons...</div>}
      {!loading && coupons.length === 0 && <EmptyState text="No coupons yet." />}

      {!loading && coupons.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
          {coupons.map((c, i) => (
            <div key={c._id} style={{
              padding: "16px 18px",
              borderRight: i % 2 === 0 ? `1px solid ${G.border}` : "none",
              borderBottom: `1px solid ${G.border}`,
              borderLeft: `4px solid ${c.color || G.primary}`,
              opacity: c.active ? 1 : 0.45,
              transition: "opacity 0.2s",
            }}>
              {/* Header row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{
                    border: `1.5px dashed ${c.color || G.primary}`,
                    background: `${c.color || G.primary}18`,
                    borderRadius: 5, padding: "3px 12px",
                    fontSize: 13, fontWeight: 900,
                    color: c.color || G.primary, letterSpacing: 1.2,
                  }}>
                    {c.code}
                  </span>
                  <button onClick={() => copy(c.code)} style={{ background: "none", border: "none", cursor: "pointer", color: copied === c.code ? G.success : G.muted, padding: 4 }} title="Copy code">
                    {copied === c.code ? <FiCheck size={13} /> : <FiCopy size={13} />}
                  </button>
                </div>
                <Toggle value={c.active} onChange={() => toggle(c._id)} />
              </div>

              {/* Title & desc */}
              <p style={{ fontSize: 12, color: G.charcoal, fontWeight: 700, margin: "0 0 3px" }}>{c.title || "—"}</p>
              {c.description && <p style={{ fontSize: 11, color: G.muted, margin: "0 0 10px", lineHeight: 1.4 }}>{c.description}</p>}

              {/* Badges */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, fontSize: 10, marginBottom: 10 }}>
                <span style={{
                  background: c.type === "flat" ? "#E3F2FD" : G.primaryLt,
                  color: c.type === "flat" ? "#1565C0" : G.primary,
                  padding: "2px 8px", borderRadius: 4, fontWeight: 700,
                  display: "flex", alignItems: "center", gap: 3,
                }}>
                  {c.type === "flat" ? <FiDollarSign size={9} /> : <FiPercent size={9} />}
                  {c.type === "flat" ? `₹${c.value} off` : `${c.value}% off`}
                </span>
                {c.minOrder > 0 && <span style={{ color: G.muted, background: G.surface, padding: "2px 8px", borderRadius: 4 }}>Min ₹{c.minOrder}</span>}
                {c.maxDiscount > 0 && <span style={{ color: G.muted, background: G.surface, padding: "2px 8px", borderRadius: 4 }}>Cap ₹{c.maxDiscount}</span>}
                {c.expiry && (
                  <span style={{ color: G.muted, display: "flex", alignItems: "center", gap: 3 }}>
                    <FiCalendar size={9} /> {c.expiry}
                  </span>
                )}
                {c.usageLimit > 0 && (
                  <span style={{ color: G.muted }}>Used {c.usedCount || 0}/{c.usageLimit}</span>
                )}
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 6 }}>
                <Btn onClick={() => openEdit(c)} style={{ fontSize: 11, padding: "5px 10px" }}>
                  <FiEdit2 size={10} /> Edit
                </Btn>
                <Btn variant="danger" onClick={() => remove(c._id)} style={{ fontSize: 11, padding: "5px 10px" }}>
                  <FiTrash2 size={10} /> Delete
                </Btn>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <Modal
          title={form._id ? "Edit Coupon" : "New Coupon"}
          onClose={() => setModal(false)}
          footer={<>
            <Btn onClick={() => setModal(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={save} disabled={saving}>
              {saving && <Spinner />} {form._id ? "Update" : "Create"} Coupon
            </Btn>
          </>}>

          <Field label="Coupon Code" required hint="Will be auto-uppercased">
            <Input value={form.code} onChange={v => f("code")(v.toUpperCase())} placeholder="SUMMER30" />
          </Field>

          <Field label="Title">
            <Input value={form.title} onChange={f("title")} placeholder="Summer Special" />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Discount Type">
              <Select value={form.type} onChange={f("type")}>
                <option value="flat">Flat (₹ amount)</option>
                <option value="percent">Percent (%)</option>
              </Select>
            </Field>
            <Field label={form.type === "flat" ? "Amount (₹)" : "Percent (%)"} required>
              <Input value={form.value} onChange={f("value")} type="number" min="0" placeholder={form.type === "flat" ? "200" : "30"} />
            </Field>
          </div>

          <Field label="Description">
            <Input value={form.description} onChange={f("description")} rows={2} placeholder="Short description for customers..." />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Minimum Order (₹)" hint="0 = no minimum">
              <Input value={form.minOrder} onChange={f("minOrder")} type="number" min="0" placeholder="499" />
            </Field>
            {form.type === "percent" && (
              <Field label="Max Discount Cap (₹)" hint="0 = no cap">
                <Input value={form.maxDiscount} onChange={f("maxDiscount")} type="number" min="0" placeholder="500" />
              </Field>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Expiry (text)" hint="e.g. 31 Dec 2025">
              <Input value={form.expiry} onChange={f("expiry")} placeholder="31 Dec 2025" />
            </Field>
            <Field label="Usage Limit" hint="0 = unlimited">
              <Input value={form.usageLimit} onChange={f("usageLimit")} type="number" min="0" placeholder="100" />
            </Field>
          </div>

          <Field label="Badge Color">
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
              {BADGE_COLORS.map(col => (
                <button key={col} onClick={() => f("color")(col)}
                  style={{ width: 30, height: 30, borderRadius: "50%", background: col, border: `3px solid ${form.color === col ? G.charcoal : "transparent"}`, cursor: "pointer", transition: "transform 0.15s" }}
                  onMouseEnter={e => e.currentTarget.style.transform = "scale(1.15)"}
                  onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"} />
              ))}
            </div>
            {/* Preview */}
            <div style={{ marginTop: 10, display: "inline-flex", alignItems: "center", border: `1.5px dashed ${form.color}`, background: `${form.color}18`, borderRadius: 5, padding: "4px 14px" }}>
              <span style={{ fontSize: 13, fontWeight: 900, color: form.color, letterSpacing: 1 }}>
                {form.code || "CODE"}
              </span>
            </div>
          </Field>

          <Field label="Status">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Toggle value={form.active} onChange={f("active")} />
              <span style={{ fontSize: 12, color: G.muted }}>
                {form.active ? "Active — visible to customers" : "Hidden"}
              </span>
            </div>
          </Field>
        </Modal>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </SectionCard>
  );
}

// ══════════════════════════════════════════════════════════════
//  SECTION 3: CATEGORY DEALS
// ══════════════════════════════════════════════════════════════
function CategoriesSection() {
  const [cats, setCats]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]     = useState(false);
  const [saving, setSaving]   = useState(false);
  const [toast, setToast]     = useState(null);

  const EMPTY = { _id: null, label: "", link: "", discount: "Up to 50%", image: "", active: true, sortOrder: 0 };
  const [form, setForm] = useState(EMPTY);
  const f = k => v => setForm(p => ({ ...p, [k]: v }));

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchCategories();
      setCats(Array.isArray(data) ? data : []);
    } catch (e) {
      setToast({ msg: e.message || "Failed to load categories", type: "error" });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const openAdd  = () => { setForm(EMPTY); setModal(true); };
  const openEdit = c  => { setForm({ ...EMPTY, ...c }); setModal(true); };

  const save = async () => {
    if (!form.label.trim()) { setToast({ msg: "Label is required", type: "error" }); return; }
    setSaving(true);
    try {
      const { _id, ...data } = form;
      if (_id) {
        await updateCategory(_id, data);
        setToast({ msg: "Category updated!", type: "success" });
      } else {
        await createCategory(data);
        setToast({ msg: "Category added!", type: "success" });
      }
      await load();
      setModal(false);
    } catch (e) {
      setToast({ msg: e.message || "Save failed", type: "error" });
    } finally {
      setSaving(false);
    }
  };

  const remove = async id => {
    if (!window.confirm("Remove this category?")) return;
    try {
      await deleteCategory(id);
      setCats(p => p.filter(c => c._id !== id));
      setToast({ msg: "Category removed", type: "success" });
    } catch (e) {
      setToast({ msg: e.message, type: "error" });
    }
  };

  const toggle = async id => {
    try {
      const updated = await toggleCategory(id);
      setCats(p => p.map(c => c._id === id ? { ...c, ...updated } : c));
    } catch (e) {
      setToast({ msg: e.message, type: "error" });
    }
  };

  const activeCats = cats.filter(c => c.active);

  return (
    <SectionCard
      title="Shop by Category" icon={<FiGrid />}
      badge={`${activeCats.length} active / ${cats.length} total`}
      action={<Btn variant="primary" onClick={openAdd}><FiPlus size={11} /> Add Category</Btn>}>

      {loading && <div style={{ padding: 30, textAlign: "center", color: G.muted, fontSize: 13 }}>Loading categories...</div>}
      {!loading && cats.length === 0 && <EmptyState text="No categories yet." />}

      {!loading && cats.length > 0 && (
        <>
          {/* Circle preview strip */}
          {activeCats.length > 0 && (
            <div style={{ padding: "14px 22px", borderBottom: `1px solid ${G.border}`, background: G.surface }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: G.muted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 10 }}>
                Live Preview (active only)
              </p>
              <div style={{ display: "flex", gap: 18, overflowX: "auto", paddingBottom: 4 }}>
                {activeCats.map(c => (
                  <div key={c._id} style={{ textAlign: "center", flexShrink: 0 }}>
                    <div style={{
                      width: 56, height: 56, borderRadius: "50%", overflow: "hidden",
                      background: G.goldLt, border: `2px solid ${G.border}`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      margin: "0 auto 5px",
                    }}>
                      {c.image
                        ? <img src={c.image} alt={c.label} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
                        : <FiImage size={18} color={G.gold} />
                      }
                    </div>
                    <p style={{ fontSize: 9, color: G.charcoal, margin: 0, fontWeight: 700, whiteSpace: "nowrap" }}>{c.label}</p>
                    <p style={{ fontSize: 9, color: G.primary, margin: 0, fontWeight: 800 }}>{c.discount}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* List */}
          {cats.map((c, i) => (
            <div key={c._id} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "12px 22px",
              borderBottom: i < cats.length - 1 ? `1px solid ${G.border}` : "none",
              opacity: c.active ? 1 : 0.45,
              transition: "opacity 0.2s",
            }}>
              <div style={{ width: 42, height: 42, borderRadius: "50%", overflow: "hidden", flexShrink: 0, background: G.goldLt, display: "flex", alignItems: "center", justifyContent: "center", border: `1.5px solid ${G.border}` }}>
                {c.image
                  ? <img src={c.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
                  : <FiImage size={16} color={G.gold} />
                }
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: G.charcoal, margin: 0 }}>{c.label}</p>
                <p style={{ fontSize: 11, color: G.muted, margin: "2px 0 0" }}>
                  {c.link} · <span style={{ color: G.primary, fontWeight: 700 }}>{c.discount}</span>
                  {c.sortOrder !== undefined && <span> · Order: {c.sortOrder}</span>}
                </p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <Toggle value={c.active} onChange={() => toggle(c._id)} />
                <Btn onClick={() => openEdit(c)} style={{ padding: "6px 10px" }} title="Edit"><FiEdit2 size={11} /></Btn>
                <Btn variant="danger" onClick={() => remove(c._id)} style={{ padding: "6px 10px" }} title="Delete"><FiTrash2 size={11} /></Btn>
              </div>
            </div>
          ))}
        </>
      )}

      {modal && (
        <Modal
          title={form._id ? "Edit Category" : "New Category"}
          onClose={() => setModal(false)}
          footer={<>
            <Btn onClick={() => setModal(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={save} disabled={saving}>
              {saving && <Spinner />} {form._id ? "Update" : "Add"} Category
            </Btn>
          </>}>

          <Field label="Category Image" hint="Square image works best">
            <LocalImageUpload value={form.image} onChange={f("image")} />
          </Field>

          <Field label="Category Label" required>
            <Input value={form.label} onChange={f("label")} placeholder="Ethnic Wear" />
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Link / URL">
              <LinkSelector value={form.link} onChange={f("link")} />
            </Field>
            <Field label="Discount Text">
              <Input value={form.discount} onChange={f("discount")} placeholder="Up to 80%" />
            </Field>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Sort Order" hint="Lower = shown first">
              <Input value={form.sortOrder} onChange={f("sortOrder")} type="number" min="0" placeholder="1" />
            </Field>
          </div>

          <Field label="Status">
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Toggle value={form.active} onChange={f("active")} />
              <span style={{ fontSize: 12, color: G.muted }}>
                {form.active ? "Visible on Offers page" : "Hidden"}
              </span>
            </div>
          </Field>
        </Modal>
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </SectionCard>
  );
}

// ══════════════════════════════════════════════════════════════
//  MAIN EXPORT
// ══════════════════════════════════════════════════════════════
export default function OffersAdminPage({ products = [] }) {
  const [seeding, setSeeding] = useState(false);
  const [toast, setToast]     = useState(null);

  const runSeed = async () => {
    if (!window.confirm("This will insert default banners, coupons, and categories if none exist. Continue?")) return;
    setSeeding(true);
    try {
      await seedOffers();
      setToast({ msg: "Seed completed — refresh sections to see data", type: "success" });
      window.location.reload();
    } catch (e) {
      setToast({ msg: e.message || "Seed failed", type: "error" });
    } finally {
      setSeeding(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px) } to { opacity:1; transform:translateY(0) } }
        @keyframes spin    { to { transform:rotate(360deg) } }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        button:focus-visible { outline: 2px solid #F01C6A; outline-offset: 2px; }
      `}</style>

      <div style={{ animation: "fadeUp 0.25s ease" }}>
        {/* Page header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
          <div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: G.charcoal, marginBottom: 4 }}>
              Offers &amp; Deals
            </h2>
            <p style={{ fontSize: 13, color: G.muted }}>
              Manage the{" "}
              <code style={{ background: G.primaryLt, color: G.primary, padding: "1px 7px", borderRadius: 4, fontSize: 11 }}>/offers</code>
              {" "}page — banners, coupons, and category deals
            </p>
          </div>
          <Btn onClick={runSeed} disabled={seeding} style={{ gap: 6 }}>
            {seeding ? <Spinner /> : <FiRefreshCw size={12} />}
            Seed Defaults
          </Btn>
        </div>

        <BannersSection products={products} />
        <CouponsSection />
        <CategoriesSection />
      </div>

      {toast && <Toast msg={toast.msg} type={toast.type} onDone={() => setToast(null)} />}
    </>
  );
}