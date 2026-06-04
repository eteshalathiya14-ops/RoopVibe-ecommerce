// src/pages/CategoryPage.jsx
// ─────────────────────────────────────────────────────────────
// FULLY REWRITTEN:
// 1. Products ab DB se aate hain (navName + colTitle + subItem match)
// 2. Filters bhi DB se aate hain (admin-managed)
// 3. Meesho-style layout maintained
// 4. Mobile bottom sheets maintained
// ─────────────────────────────────────────────────────────────

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchCategoryProducts, fetchFilters } from "../Api/Categoryfilterapi";
import { getCategoryByParams } from "../utils/categoryIndex";
import { FiHeart, FiX, FiChevronDown, FiChevronUp, FiFilter, FiSliders, FiShoppingBag } from "react-icons/fi";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";

// ── THEME ──────────────────────────────────────────────────────
const GOLD       = "#C9A96E";
const GOLD_LIGHT = "#F5EDD9";
const GOLD_DARK  = "#A07840";
const CHARCOAL   = "#1A1A1A";
const MUTED      = "#6B6560";
const BORDER     = "#EDE8E0";
const SURFACE    = "#F5F3EE";
const GREEN      = "#2E7D32";

// ── FALLBACK sort options ──────────────────────────────────────
const SORT_OPTIONS = [
  "Relevance",
  "What's New",
  "Popularity",
  "Price: Low to High",
  "Price: High to Low",
  "Better Discount",
  "Customer Rating",
];

// ── FALLBACK filters (used if API fails) ──────────────────────
const FALLBACK_FILTERS = [
  {
    _id: "f1", label: "PRICE RANGE", key: "price", type: "radio",
    options: [
      { label: "Under ₹500",      value: "Under ₹500",      min: 0,    max: 499   },
      { label: "₹500 – ₹1,000",   value: "₹500 – ₹1,000",   min: 500,  max: 1000  },
      { label: "₹1,000 – ₹2,000", value: "₹1,000 – ₹2,000", min: 1000, max: 2000  },
      { label: "₹2,000 – ₹5,000", value: "₹2,000 – ₹5,000", min: 2000, max: 5000  },
      { label: "Above ₹5,000",    value: "Above ₹5,000",    min: 5000, max: 99999 },
    ],
  },
  {
    _id: "f2", label: "DISCOUNT", key: "disc", type: "radio",
    options: [
      { label: "10% and above", value: "10% and above", min: 10 },
      { label: "20% and above", value: "20% and above", min: 20 },
      { label: "40% and above", value: "40% and above", min: 40 },
      { label: "60% and above", value: "60% and above", min: 60 },
    ],
  },
  {
    _id: "f3", label: "SIZE", key: "sizes", type: "checkbox",
    options: ["XS","S","M","L","XL","XXL"].map(s => ({ label: s, value: s })),
  },
];

// ── Helpers ────────────────────────────────────────────────────
function useIsMobile() {
  const [m, setM] = useState(() => window.innerWidth <= 768);
  useEffect(() => {
    const fn = () => setM(window.innerWidth <= 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return m;
}

function resolveImg(img) {
  if (!img) return "";
  if (typeof img === "string") return img;
  if (typeof img === "object") return img.src || img.url || "";
  return "";
}

function getDiscount(p) {
  if (!p.mrp || !p.price) return 0;
  return Math.round((1 - p.price / p.mrp) * 100);
}

function Stars({ rating }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      {[1,2,3,4,5].map(s => (
        <svg key={s} width="10" height="10" viewBox="0 0 24 24"
          fill={s <= Math.round(rating || 0) ? GOLD : "#e0d8cc"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
      {rating > 0 && <span style={{ fontSize: 10, color: MUTED, marginLeft: 2 }}>{rating}</span>}
    </div>
  );
}

// ── PRODUCT CARD ───────────────────────────────────────────────
function ProductCard({ p, isMobile }) {
  const { toggleWishlist, isLiked } = useWishlist();
  const { addToCart } = useCart();
  const [hov, setHov]   = useState(false);
  const [added, setAdded] = useState(false);

  const pid   = String(p._id || p.id || "");
  const liked = isLiked?.(pid);
  const thumb = resolveImg(p.colorVariants?.[0]?.images?.[0]);
  const disc  = getDiscount(p);
  const imgH  = isMobile ? 200 : 260;

  const handleCart = (e) => {
    e.stopPropagation();
    addToCart({ id: pid, title: p.title, brand: p.brand, price: p.price, mrp: p.mrp, img: thumb, quantity: 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleWish = (e) => {
    e.stopPropagation();
    toggleWishlist({ ...p, id: pid, img: thumb });
  };

  return (
    <Link to={`/product/${pid}`} style={{ textDecoration: "none" }}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: "#fff", borderRadius: 8, overflow: "hidden", cursor: "pointer",
          transition: "all 0.2s", border: `1px solid ${hov ? GOLD : BORDER}`,
          transform: hov ? "translateY(-2px)" : "none",
          boxShadow: hov ? "0 8px 24px rgba(201,169,110,0.14)" : "none",
        }}
      >
        {/* Image */}
        <div style={{ position: "relative" }}>
          {thumb
            ? <img src={thumb} alt={p.title}
                style={{ width: "100%", height: imgH, objectFit: "cover", objectPosition: "top", display: "block" }}
                onError={e => e.target.style.opacity = "0"}/>
            : <div style={{ width: "100%", height: imgH, background: SURFACE, display: "flex",
                alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 6 }}>
                <FiShoppingBag size={24} color={BORDER}/>
                <span style={{ fontSize: 11, color: MUTED }}>No Image</span>
              </div>
          }
          {/* Discount badge */}
          {disc > 0 && (
            <div style={{ position: "absolute", top: 8, left: 8, background: GOLD,
              color: "#fff", fontSize: 9, fontWeight: 800, padding: "2px 6px", borderRadius: 3 }}>
              {disc}% OFF
            </div>
          )}
          {/* Wishlist */}
          <button onClick={handleWish} style={{
            position: "absolute", top: 6, right: 6, width: 28, height: 28,
            borderRadius: "50%", background: "rgba(255,255,255,0.92)",
            border: "none", cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center",
            color: liked ? "#ff4d4f" : "#bbb",
          }}>
            <FiHeart fill={liked ? "currentColor" : "none"} size={13}/>
          </button>
          {/* Seller tag */}
          {p.brand && (
            <div style={{ position: "absolute", bottom: 6, left: 6,
              display: "flex", alignItems: "center", gap: 4 }}>
              <div style={{ width: 18, height: 18, borderRadius: "50%",
                background: GOLD_LIGHT, border: `1px solid ${GOLD}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 7, fontWeight: 800, color: GOLD_DARK }}>
                {p.brand.charAt(0)}
              </div>
              <span style={{ fontSize: 9, color: "#fff", fontWeight: 600,
                textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>
                By {p.brand}
              </span>
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: isMobile ? "8px 10px 10px" : "10px 12px 12px" }}>
          <p style={{
            fontSize: isMobile ? 11 : 12, color: CHARCOAL, fontWeight: 500,
            marginBottom: 4, lineHeight: 1.3,
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {p.title}
          </p>
          <Stars rating={p.rating}/>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4, marginBottom: 8 }}>
            <span style={{ fontSize: isMobile ? 13 : 14, fontWeight: 800, color: CHARCOAL }}>₹{p.price}</span>
            {p.mrp > p.price && (
              <span style={{ fontSize: 10, color: MUTED, textDecoration: "line-through" }}>₹{p.mrp}</span>
            )}
            {disc > 0 && <span style={{ fontSize: 10, color: GREEN, fontWeight: 700 }}>{disc}%</span>}
          </div>
          {/* Add to cart */}
          <button
            onClick={handleCart}
            style={{
              width: "100%", padding: isMobile ? "7px" : "8px",
              background: added ? GREEN : "transparent",
              color: added ? "#fff" : GOLD_DARK,
              border: `1.5px solid ${added ? GREEN : GOLD}`,
              borderRadius: 6, fontSize: isMobile ? 10 : 11,
              fontWeight: 700, cursor: "pointer",
              transition: "all 0.2s", fontFamily: "inherit",
            }}
          >
            {added ? "✓ Added!" : "+ Add to Cart"}
          </button>
        </div>
      </div>
    </Link>
  );
}

// ── FILTER SECTION (desktop sidebar) ──────────────────────────
function FilterSection({ group, filters, onToggle }) {
  const [open, setOpen] = useState(true);

  return (
    <div style={{ paddingBottom: 16, marginBottom: 16, borderBottom: `1px solid ${BORDER}` }}>
      <button
        onClick={() => setOpen(!open)}
        style={{ width: "100%", display: "flex", justifyContent: "space-between",
          alignItems: "center", background: "transparent", border: "none", cursor: "pointer", padding: "4px 0" }}
      >
        <span style={{ fontSize: 12, fontWeight: 700, color: CHARCOAL, letterSpacing: "0.5px" }}>
          {group.label}
        </span>
        {open ? <FiChevronUp size={14} color={MUTED}/> : <FiChevronDown size={14} color={MUTED}/>}
      </button>

      {open && (
        <div style={{ marginTop: 10 }}>
          {/* COLOR type */}
          {group.type === "color" && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {group.options.map(opt => {
                const sel = (filters[group.key] || []).includes(opt.value);
                return (
                  <div key={opt.value} onClick={() => onToggle(group.key, opt.value)}
                    style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, cursor: "pointer" }}>
                    <div style={{
                      width: 24, height: 24, borderRadius: "50%", background: opt.hex || opt.value,
                      border: sel ? `3px solid ${GOLD}` : `2px solid ${opt.border ? "#ccc" : "transparent"}`,
                      boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                    }}/>
                    <span style={{ fontSize: 8, color: MUTED, maxWidth: 30, textAlign: "center" }}>{opt.label}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* RADIO type */}
          {group.type === "radio" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {group.options.map(opt => {
                const sel = filters[group.key] === opt.value;
                return (
                  <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <div onClick={() => onToggle(group.key, opt.value)}
                      style={{ width: 15, height: 15, borderRadius: "50%", flexShrink: 0, cursor: "pointer",
                        border: `2px solid ${sel ? GOLD : "#bbb"}`, background: sel ? GOLD : "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {sel && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff" }}/>}
                    </div>
                    <span style={{ fontSize: 12, color: MUTED }}>{opt.label}</span>
                  </label>
                );
              })}
            </div>
          )}

          {/* CHECKBOX type */}
          {group.type === "checkbox" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {group.options.map(opt => {
                const sel = (filters[group.key] || []).includes(opt.value);
                return (
                  <label key={opt.value} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <div onClick={() => onToggle(group.key, opt.value)}
                      style={{ width: 15, height: 15, borderRadius: 3, flexShrink: 0, cursor: "pointer",
                        border: `1.5px solid ${sel ? GOLD : "#bbb"}`, background: sel ? GOLD : "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {sel && <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                        <polyline points="1.5,6 4.5,9 10.5,3" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                      </svg>}
                    </div>
                    <span style={{ fontSize: 12, color: MUTED }}>{opt.label}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── MOBILE FILTER BOTTOM SHEET ─────────────────────────────────
function MobileFilterSheet({ open, onClose, filterGroups, filters, onToggle, onClear, activeCount }) {
  const [activeGroupIdx, setActiveGroupIdx] = useState(0);
  if (!open || !filterGroups.length) return null;

  const group = filterGroups[activeGroupIdx] || filterGroups[0];

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", zIndex: 1200 }}/>
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, height: "85vh",
        backgroundColor: "#fff", borderRadius: "16px 16px 0 0", zIndex: 1300,
        display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 16px 12px", borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: CHARCOAL }}>
            Filters {activeCount > 0 && (
              <span style={{ fontSize: 11, color: "#fff", backgroundColor: GOLD,
                padding: "1px 7px", borderRadius: 20, marginLeft: 6 }}>{activeCount}</span>
            )}
          </span>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            <FiX size={22} color={MUTED}/>
          </button>
        </div>

        {/* Two-panel */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Left — filter category list */}
          <div style={{ width: 120, backgroundColor: SURFACE, overflowY: "auto", flexShrink: 0, scrollbarWidth: "none" }}>
            {filterGroups.map((g, idx) => {
              const hasActive = filters[g.key] &&
                (Array.isArray(filters[g.key]) ? filters[g.key].length > 0 : true);
              return (
                <button key={g._id || g.key} onClick={() => setActiveGroupIdx(idx)}
                  style={{
                    width: "100%", padding: "13px 10px", background: activeGroupIdx === idx ? "#fff" : "transparent",
                    border: "none", borderLeft: `3px solid ${activeGroupIdx === idx ? GOLD : "transparent"}`,
                    cursor: "pointer", textAlign: "left",
                    fontSize: 11, fontWeight: activeGroupIdx === idx ? 700 : 500,
                    color: activeGroupIdx === idx ? GOLD_DARK : MUTED, lineHeight: 1.3,
                  }}>
                  {g.label}
                  {hasActive && (
                    <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%",
                      backgroundColor: GOLD, marginLeft: 4, verticalAlign: "middle" }}/>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right — options */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", scrollbarWidth: "none" }}>
            <p style={{ fontSize: 10, fontWeight: 800, color: GOLD_DARK, letterSpacing: "0.8px", marginBottom: 14 }}>
              {group.label}
            </p>

            {group.type === "color" && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {group.options.map(opt => {
                  const sel = (filters[group.key] || []).includes(opt.value);
                  return (
                    <div key={opt.value} onClick={() => onToggle(group.key, opt.value)}
                      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer" }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: "50%", background: opt.hex || opt.value,
                        border: sel ? `3px solid ${GOLD}` : `2px solid ${opt.border ? "#ccc" : "transparent"}`,
                        boxShadow: sel ? `0 0 0 2px ${GOLD_LIGHT}` : "0 1px 4px rgba(0,0,0,0.15)",
                      }}/>
                      <span style={{ fontSize: 9, color: sel ? GOLD_DARK : MUTED,
                        fontWeight: sel ? 700 : 400, textAlign: "center", maxWidth: 36 }}>{opt.label}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {group.type === "radio" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {group.options.map(opt => {
                  const sel = filters[group.key] === opt.value;
                  return (
                    <button key={opt.value} onClick={() => onToggle(group.key, opt.value)}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "12px 4px", background: "none", border: "none",
                        borderBottom: `1px solid ${BORDER}44`, cursor: "pointer" }}>
                      <span style={{ fontSize: 13, color: sel ? CHARCOAL : MUTED, fontWeight: sel ? 700 : 400 }}>
                        {opt.label}
                      </span>
                      <div style={{ width: 18, height: 18, borderRadius: "50%",
                        border: `2px solid ${sel ? GOLD : "#ccc"}`, background: sel ? GOLD : "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {sel && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }}/>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {group.type === "checkbox" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {group.options.map(opt => {
                  const sel = (filters[group.key] || []).includes(opt.value);
                  return (
                    <button key={opt.value} onClick={() => onToggle(group.key, opt.value)}
                      style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "12px 4px", background: "none", border: "none",
                        borderBottom: `1px solid ${BORDER}44`, cursor: "pointer" }}>
                      <span style={{ fontSize: 13, color: sel ? CHARCOAL : MUTED, fontWeight: sel ? 700 : 400 }}>
                        {opt.label}
                      </span>
                      <div style={{ width: 18, height: 18, borderRadius: 4,
                        border: `1.5px solid ${sel ? GOLD : "#ccc"}`, background: sel ? GOLD : "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {sel && <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <polyline points="1.5,6 4.5,9 10.5,3" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
                        </svg>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", gap: 12, padding: "12px 16px", borderTop: `1px solid ${BORDER}`,
          flexShrink: 0, paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}>
          <button onClick={onClear}
            style={{ flex: 1, padding: "13px", background: "#fff", border: `1.5px solid ${BORDER}`,
              borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: "pointer", color: MUTED }}>
            Clear All
          </button>
          <button onClick={onClose}
            style={{ flex: 1, padding: "13px",
              background: `linear-gradient(to right,${GOLD_DARK},${GOLD})`,
              border: "none", borderRadius: 10, fontWeight: 800, fontSize: 13,
              cursor: "pointer", color: "#fff" }}>
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}

// ── MOBILE SORT SHEET ──────────────────────────────────────────
function MobileSortSheet({ open, onClose, sort, onSort }) {
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", zIndex: 1200 }}/>
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, backgroundColor: "#fff",
        borderRadius: "16px 16px 0 0", zIndex: 1300, overflow: "hidden" }}>
        <div style={{ padding: "16px 16px 12px", borderBottom: `1px solid ${BORDER}` }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: CHARCOAL }}>Sort By</span>
        </div>
        {SORT_OPTIONS.map(s => (
          <button key={s} onClick={() => { onSort(s); onClose(); }}
            style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "14px 16px", background: s === sort ? GOLD_LIGHT : "#fff",
              border: "none", borderBottom: `1px solid ${BORDER}44`, cursor: "pointer" }}>
            <span style={{ fontSize: 13, fontWeight: s === sort ? 700 : 400,
              color: s === sort ? GOLD_DARK : CHARCOAL }}>{s}</span>
            {s === sort && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
          </button>
        ))}
        <div style={{ height: "max(8px, env(safe-area-inset-bottom))" }}/>
      </div>
    </>
  );
}

// ── SKELETON LOADER ────────────────────────────────────────────
function SkeletonCard({ isMobile }) {
  const imgH = isMobile ? 200 : 260;
  return (
    <div style={{ background: "#fff", borderRadius: 8, overflow: "hidden", border: `1px solid ${BORDER}` }}>
      <div style={{ width: "100%", height: imgH, background: "#f0ece6", animation: "pulse 1.5s infinite" }}/>
      <div style={{ padding: "10px 12px" }}>
        <div style={{ height: 12, background: "#f0ece6", borderRadius: 4, marginBottom: 8, animation: "pulse 1.5s infinite" }}/>
        <div style={{ height: 10, background: "#f0ece6", borderRadius: 4, width: "60%", animation: "pulse 1.5s infinite" }}/>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
    </div>
  );
}

// ── MAIN CATEGORY PAGE ─────────────────────────────────────────
export default function CategoryPage() {
  const isMobile = useIsMobile();
  const { gender, subcategory } = useParams();

  // Resolve category from URL params
  const resolved = getCategoryByParams(gender || "", subcategory || "");
  const navName   = resolved?.gender   || (gender || "").toUpperCase();
  const colTitle  = resolved?.colTitle || "";
  const subItem   = resolved?.subcategory || "";
  const displayCategory = subItem || colTitle || subcategory || "All Products";

  // ── State ──────────────────────────────────────────────────
  const [products,     setProducts]     = useState([]);
  const [filterGroups, setFilterGroups] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [sort,         setSort]         = useState("Relevance");
  const [showSort,     setShowSort]     = useState(false);
  const [filters,      setFilters]      = useState({});
  const [showMobFilter, setShowMobFilter] = useState(false);
  const [showMobSort,   setShowMobSort]   = useState(false);
  const [page,         setPage]         = useState(1);
  const PER_PAGE = 16;

  // ── Load products from DB ──────────────────────────────────
  useEffect(() => {
    setLoading(true);
    setProducts([]);
    setPage(1);
    setFilters({});

    fetchCategoryProducts(navName, colTitle, subItem)
      .then(prods => setProducts(prods))
      .catch(err => {
        console.error("Category products fetch failed:", err);
        setProducts([]);
      })
      .finally(() => setLoading(false));
  }, [navName, colTitle, subItem]);

  // ── Load filters from DB ──────────────────────────────────
  useEffect(() => {
    setFiltersLoading(true);
    fetchFilters(navName)
      .then(groups => setFilterGroups(groups.length ? groups : FALLBACK_FILTERS))
      .catch(() => setFilterGroups(FALLBACK_FILTERS))
      .finally(() => setFiltersLoading(false));
  }, [navName]);

  // ── Filter toggle handler ──────────────────────────────────
  const handleToggle = useCallback((key, value) => {
    setFilters(prev => {
      const group = filterGroups.find(g => g.key === key);
      if (!group) return prev;

      if (group.type === "radio") {
        // Toggle radio: clicking same value clears it
        return { ...prev, [key]: prev[key] === value ? undefined : value };
      }
      // Checkbox / color: toggle in array
      const arr = prev[key] || [];
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value],
      };
    });
    setPage(1);
  }, [filterGroups]);

  const clearAll = () => { setFilters({}); setPage(1); };

  const activeFilterCount = Object.values(filters).filter(v =>
    v !== undefined && (Array.isArray(v) ? v.length > 0 : true)
  ).length;

  // ── Apply filters + sort ───────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...products];

    filterGroups.forEach(group => {
      const val = filters[group.key];
      if (!val || (Array.isArray(val) && !val.length)) return;

      if (group.type === "radio") {
        const opt = group.options.find(o => o.value === val);
        if (!opt) return;

        if (group.key === "price") {
          list = list.filter(p => p.price >= (opt.min || 0) && p.price <= (opt.max || 99999));
        } else if (group.key === "disc") {
          const minDisc = opt.min || 0;
          list = list.filter(p => getDiscount(p) >= minDisc);
        }
      }

      if (group.type === "checkbox" || group.type === "color") {
        const values = Array.isArray(val) ? val : [val];
        if (!values.length) return;

        if (group.key === "sizes") {
          list = list.filter(p => values.some(s => (p.sizes || []).includes(s)));
        } else if (group.key === "colors") {
          list = list.filter(p => {
            const productColors = (p.colorVariants || []).map(v => v.colorName);
            return values.some(c => productColors.includes(c));
          });
        } else {
          // Generic: match against product top-level field or details
          list = list.filter(p => {
            const fieldVal = p[group.key] || p.details?.[group.key] || "";
            const fieldArr = Array.isArray(fieldVal) ? fieldVal : [fieldVal];
            return values.some(v => fieldArr.some(f => String(f).toLowerCase().includes(v.toLowerCase())));
          });
        }
      }
    });

    // Sort
    switch (sort) {
      case "Price: Low to High":  list.sort((a,b) => a.price - b.price); break;
      case "Price: High to Low":  list.sort((a,b) => b.price - a.price); break;
      case "Better Discount":     list.sort((a,b) => getDiscount(b) - getDiscount(a)); break;
      case "Customer Rating":     list.sort((a,b) => (b.rating || 0) - (a.rating || 0)); break;
      case "What's New":          list.sort((a,b) => new Date(b.createdAt||0) - new Date(a.createdAt||0)); break;
      default: break;
    }

    return list;
  }, [products, filters, sort, filterGroups]);

  const displayed = filtered.slice(0, page * PER_PAGE);
  const cols = isMobile ? 2 : 4;

  return (
    <div style={{ backgroundColor: SURFACE, minHeight: "100vh" }}>

      {/* Breadcrumb */}
      <div style={{
        background: "#fff", borderBottom: `1px solid ${BORDER}`,
        padding: isMobile ? "8px 12px" : "10px 32px",
        display: "flex", alignItems: "center", gap: 6,
        overflowX: "auto", scrollbarWidth: "none", whiteSpace: "nowrap",
      }}>
        <Link to="/" style={{ color: MUTED, fontSize: 12, textDecoration: "none",
          display: "flex", alignItems: "center", gap: 4 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Home
        </Link>
        <span style={{ color: "#ccc" }}>/</span>
        <span style={{ color: MUTED, fontSize: 12 }}>{navName}</span>
        {colTitle && <>
          <span style={{ color: "#ccc" }}>/</span>
          <span style={{ color: MUTED, fontSize: 12 }}>{colTitle}</span>
        </>}
        {subItem && <>
          <span style={{ color: "#ccc" }}>/</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: GOLD_DARK }}>{subItem}</span>
        </>}
      </div>

      <div style={{ display: "flex", maxWidth: 1400, margin: "0 auto" }}>

        {/* Desktop sidebar */}
        {!isMobile && (
          <aside style={{
            width: 230, flexShrink: 0, backgroundColor: "#fff",
            borderRight: `1px solid ${BORDER}`, padding: "20px 16px",
            position: "sticky", top: 68, alignSelf: "flex-start",
            maxHeight: "calc(100vh - 68px)", overflowY: "auto",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: CHARCOAL, letterSpacing: "0.5px" }}>
                FILTERS
                {activeFilterCount > 0 && (
                  <span style={{ marginLeft: 8, fontSize: 10, color: "#fff", backgroundColor: GOLD,
                    padding: "1px 6px", borderRadius: 20 }}>{activeFilterCount}</span>
                )}
              </span>
              {activeFilterCount > 0 && (
                <button onClick={clearAll}
                  style={{ background: "transparent", border: "none", cursor: "pointer",
                    fontSize: 11, color: GOLD_DARK, fontWeight: 700, textDecoration: "underline" }}>
                  CLEAR ALL
                </button>
              )}
            </div>

            {filtersLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} style={{ height: 80, background: "#f5f0eb", borderRadius: 8,
                    marginBottom: 16, animation: "pulse 1.5s infinite" }}/>
                ))
              : filterGroups.map(g => (
                  <FilterSection key={g._id || g.key} group={g} filters={filters} onToggle={handleToggle}/>
                ))
            }
          </aside>
        )}

        {/* Products area */}
        <div style={{ flex: 1, padding: isMobile ? "0 0 80px" : "20px 24px" }}>

          {/* Mobile: sticky filter+sort bar */}
          {isMobile && (
            <div style={{
              position: "sticky", top: 52, zIndex: 50, backgroundColor: "#fff",
              borderBottom: `1px solid ${BORDER}`, display: "flex",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}>
              <button onClick={() => setShowMobFilter(true)}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "11px 0", background: "none", border: "none",
                  borderRight: `1px solid ${BORDER}`, cursor: "pointer",
                  fontSize: 12, fontWeight: 700,
                  color: activeFilterCount > 0 ? GOLD_DARK : CHARCOAL }}>
                <FiSliders size={14}/>
                FILTER
                {activeFilterCount > 0 && (
                  <span style={{ backgroundColor: GOLD, color: "#fff", fontSize: 9,
                    fontWeight: 800, padding: "1px 5px", borderRadius: 10 }}>
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <button onClick={() => setShowMobSort(true)}
                style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                  padding: "11px 0", background: "none", border: "none",
                  cursor: "pointer", fontSize: 12, fontWeight: 700, color: CHARCOAL }}>
                <FiFilter size={14}/>
                SORT
                {sort !== "Relevance" && (
                  <span style={{ fontSize: 10, color: GOLD_DARK, fontWeight: 700 }}>•</span>
                )}
              </button>
            </div>
          )}

          {/* Desktop: top bar */}
          {!isMobile && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 700, color: CHARCOAL, fontFamily: "Georgia,serif" }}>
                  {displayCategory}
                </h2>
                <p style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>
                  {loading ? "Loading…" : `${filtered.length} Products Found`}
                </p>
              </div>
              <div style={{ position: "relative" }}>
                <button onClick={() => setShowSort(!showSort)}
                  style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px",
                    border: `1px solid ${BORDER}`, background: "#fff", fontSize: 12,
                    fontWeight: 600, color: CHARCOAL, cursor: "pointer", borderRadius: 6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2">
                    <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/>
                    <line x1="4" y1="18" x2="10" y2="18"/>
                  </svg>
                  Sort: <span style={{ color: GOLD_DARK }}>{sort}</span>
                  <FiChevronDown size={12} color={MUTED}/>
                </button>
                {showSort && (
                  <div style={{ position: "absolute", right: 0, top: "calc(100% + 4px)",
                    backgroundColor: "#fff", border: `1px solid ${BORDER}`,
                    boxShadow: "0 8px 28px rgba(0,0,0,0.10)", zIndex: 50,
                    minWidth: 210, borderRadius: 8, overflow: "hidden" }}>
                    {SORT_OPTIONS.map(s => (
                      <button key={s} onClick={() => { setSort(s); setShowSort(false); }}
                        style={{ display: "block", width: "100%", textAlign: "left",
                          padding: "10px 18px", fontSize: 13,
                          background: s === sort ? GOLD_LIGHT : "#fff",
                          color: s === sort ? GOLD_DARK : MUTED,
                          fontWeight: s === sort ? 700 : 400, border: "none", cursor: "pointer" }}>
                        {s === sort && "✓ "}{s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mobile: count + active chips */}
          {isMobile && (
            <div style={{ padding: "10px 12px 8px", backgroundColor: SURFACE }}>
              <p style={{ fontSize: 11, color: MUTED, marginBottom: activeFilterCount > 0 ? 8 : 0 }}>
                <span style={{ fontWeight: 700, color: CHARCOAL }}>{displayCategory}</span>
                {" — "}{loading ? "Loading…" : `${filtered.length} products`}
              </p>
              {activeFilterCount > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {Object.entries(filters).map(([key, val]) => {
                    if (!val || (Array.isArray(val) && !val.length)) return null;
                    const vals = Array.isArray(val) ? val : [val];
                    return vals.map(v => (
                      <span key={`${key}-${v}`} onClick={() => handleToggle(key, v)}
                        style={{ display: "flex", alignItems: "center", gap: 4,
                          padding: "4px 10px", borderRadius: 20, fontSize: 10, fontWeight: 700,
                          backgroundColor: GOLD_LIGHT, color: GOLD_DARK,
                          border: `1px solid ${GOLD}`, cursor: "pointer" }}>
                        {v} <FiX size={9}/>
                      </span>
                    ));
                  })}
                  <span onClick={clearAll}
                    style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 10px",
                      borderRadius: 20, fontSize: 10, fontWeight: 700, backgroundColor: "#fff",
                      color: MUTED, border: `1px solid ${BORDER}`, cursor: "pointer" }}>
                    Clear all
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Products grid */}
          <div style={{ padding: isMobile ? "12px 10px 0" : "0" }}>
            {loading ? (
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols},1fr)`,
                gap: isMobile ? 10 : 18 }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} isMobile={isMobile}/>
                ))}
              </div>
            ) : displayed.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
                justifyContent: "center", padding: "60px 20px", color: MUTED }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={BORDER} strokeWidth="1.5">
                  <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9M9 21a1 1 0 100-2 1 1 0 000 2zm10 0a1 1 0 100-2 1 1 0 000 2z"/>
                </svg>
                <p style={{ marginTop: 16, fontWeight: 700, fontSize: 15, textAlign: "center" }}>
                  {products.length === 0 ? "No products in this category yet" : "No products match your filters"}
                </p>
                <p style={{ marginTop: 4, fontSize: 12, textAlign: "center", color: MUTED }}>
                  {products.length === 0
                    ? "Admin panel se is category mein products add karein"
                    : "Try removing some filters"
                  }
                </p>
                {activeFilterCount > 0 && (
                  <button onClick={clearAll}
                    style={{ marginTop: 16, padding: "10px 24px",
                      border: `1.5px solid ${GOLD}`, background: "transparent",
                      color: GOLD_DARK, fontWeight: 700, fontSize: 12, borderRadius: 8, cursor: "pointer" }}>
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols},1fr)`,
                gap: isMobile ? 10 : 18 }}>
                {displayed.map(p => (
                  <ProductCard key={String(p._id || p.id)} p={p} isMobile={isMobile}/>
                ))}
              </div>
            )}
          </div>

          {/* Load more */}
          {displayed.length < filtered.length && (
            <div style={{ textAlign: "center", padding: "32px 0 16px" }}>
              <button onClick={() => setPage(p => p + 1)}
                style={{ padding: "12px 40px", border: `1.5px solid ${GOLD}`,
                  background: "transparent", color: GOLD_DARK, fontWeight: 700,
                  fontSize: 13, letterSpacing: "1px", borderRadius: 8, cursor: "pointer" }}>
                LOAD MORE ({filtered.length - displayed.length} more)
              </button>
            </div>
          )}
          {!loading && displayed.length >= filtered.length && displayed.length > 0 && (
            <p style={{ textAlign: "center", padding: "24px 0 16px", fontSize: 12, color: MUTED }}>
              — All {filtered.length} products shown —
            </p>
          )}
        </div>
      </div>

      {/* Mobile bottom sheets */}
      <MobileFilterSheet
        open={showMobFilter}
        onClose={() => setShowMobFilter(false)}
        filterGroups={filterGroups}
        filters={filters}
        onToggle={handleToggle}
        onClear={() => { clearAll(); setShowMobFilter(false); }}
        activeCount={activeFilterCount}
      />
      <MobileSortSheet
        open={showMobSort}
        onClose={() => setShowMobSort(false)}
        sort={sort}
        onSort={setSort}
      />
    </div>
  );
}