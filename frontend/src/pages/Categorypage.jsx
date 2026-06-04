// src/pages/CategoryPage.jsx
// ─────────────────────────────────────────────────────────────
// FIXED:
// 1. Products correctly filtered by navName + colTitle + subItem
// 2. Works with both /category/women and /category/women/sarees routes
// 3. Filters from DB (admin-managed)
// 4. All content in English
// ─────────────────────────────────────────────────────────────

import { useState, useMemo, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate, useLocation } from "react-router-dom";
import { fetchCategoryProducts, fetchFilters } from "../Api/Categoryfilterapi";
import { getCategoryByParams } from "../utils/categoryIndex";
import {
  FiHeart, FiX, FiChevronDown, FiChevronUp,
  FiFilter, FiSliders, FiShoppingBag, FiCheck,
} from "react-icons/fi";
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

const SORT_OPTIONS = [
  "Relevance",
  "What's New",
  "Price: Low to High",
  "Price: High to Low",
  "Better Discount",
  "Customer Rating",
];

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
  if (!p.mrp || !p.price || p.mrp <= p.price) return 0;
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
      {rating > 0 && (
        <span style={{ fontSize: 10, color: MUTED, marginLeft: 2 }}>{rating}</span>
      )}
    </div>
  );
}

// ── Product Card ───────────────────────────────────────────────
function ProductCard({ p, isMobile }) {
  const { toggleWishlist, isLiked } = useWishlist();
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [hov,   setHov]   = useState(false);

  const pid   = String(p._id || p.id || "");
  const liked = isLiked?.(pid);
  const thumb = resolveImg(p.colorVariants?.[0]?.images?.[0]);
  const disc  = getDiscount(p);
  const imgH  = isMobile ? 200 : 260;

  const handleCart = (e) => {
    e.preventDefault(); e.stopPropagation();
    addToCart({ id: pid, title: p.title, brand: p.brand,
      price: p.price, mrp: p.mrp, img: thumb, quantity: 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleWish = (e) => {
    e.preventDefault(); e.stopPropagation();
    toggleWishlist({ ...p, id: pid, img: thumb });
  };

  return (
    <Link to={`/product/${pid}`} style={{ textDecoration: "none" }}>
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: "#fff", borderRadius: 10, overflow: "hidden",
          cursor: "pointer", transition: "all 0.22s",
          border: `1.5px solid ${hov ? GOLD : BORDER}`,
          transform: hov ? "translateY(-3px)" : "none",
          boxShadow: hov ? "0 10px 28px rgba(201,169,110,0.18)" : "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        {/* Image area */}
        <div style={{ position: "relative", overflow: "hidden" }}>
          {thumb
            ? <img src={thumb} alt={p.title}
                style={{
                  width: "100%", height: imgH, objectFit: "cover",
                  objectPosition: "top", display: "block",
                  transition: "transform 0.3s ease",
                  transform: hov ? "scale(1.04)" : "scale(1)",
                }}
                onError={e => e.target.style.opacity = "0"}/>
            : <div style={{ width: "100%", height: imgH, background: SURFACE,
                display: "flex", alignItems: "center", justifyContent: "center",
                flexDirection: "column", gap: 6 }}>
                <FiShoppingBag size={24} color={BORDER}/>
                <span style={{ fontSize: 11, color: MUTED }}>No Image</span>
              </div>
          }

          {/* Discount badge */}
          {disc > 0 && (
            <div style={{
              position: "absolute", top: 8, left: 8,
              background: `linear-gradient(135deg,${GOLD_DARK},${GOLD})`,
              color: "#fff", fontSize: 9, fontWeight: 800,
              padding: "2px 8px", borderRadius: 4,
            }}>
              {disc}% OFF
            </div>
          )}

          {/* Wishlist button */}
          <button onClick={handleWish}
            style={{
              position: "absolute", top: 8, right: 8, width: 30, height: 30,
              borderRadius: "50%", background: "rgba(255,255,255,0.92)",
              border: `1px solid ${BORDER}`, cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              color: liked ? "#ff4d4f" : "#aaa", transition: "color 0.18s",
            }}>
            <FiHeart size={13} fill={liked ? "currentColor" : "none"}/>
          </button>

          {/* Brand tag on image */}
          {p.brand && (
            <div style={{
              position: "absolute", bottom: 8, left: 8,
              display: "flex", alignItems: "center", gap: 4,
            }}>
              <div style={{
                background: "rgba(0,0,0,0.55)", padding: "2px 8px",
                borderRadius: 10, display: "flex", alignItems: "center", gap: 4,
              }}>
                <span style={{ fontSize: 9, color: "#fff", fontWeight: 600 }}>
                  {p.brand}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div style={{ padding: isMobile ? "8px 10px 10px" : "10px 12px 12px" }}>
          <p style={{
            fontSize: isMobile ? 11 : 12, color: CHARCOAL, fontWeight: 500,
            marginBottom: 5, lineHeight: 1.4,
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {p.title}
          </p>
          <Stars rating={p.rating}/>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 5, marginBottom: 8, flexWrap: "wrap" }}>
            <span style={{ fontSize: isMobile ? 13 : 14, fontWeight: 800, color: CHARCOAL }}>
              ₹{p.price}
            </span>
            {p.mrp > p.price && (
              <span style={{ fontSize: 10, color: MUTED, textDecoration: "line-through" }}>
                ₹{p.mrp}
              </span>
            )}
            {disc > 0 && (
              <span style={{ fontSize: 10, color: GREEN, fontWeight: 700 }}>
                {disc}% off
              </span>
            )}
          </div>
          <p style={{ fontSize: 10, color: GREEN, fontWeight: 600, marginBottom: 8 }}>
            Free Delivery
          </p>
          <button onClick={handleCart}
            style={{
              width: "100%", padding: isMobile ? "7px" : "9px",
              background: added ? GREEN : "transparent",
              color: added ? "#fff" : GOLD_DARK,
              border: `1.5px solid ${added ? GREEN : GOLD}`,
              borderRadius: 7, fontSize: isMobile ? 10 : 11,
              fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
              fontFamily: "inherit", display: "flex", alignItems: "center",
              justifyContent: "center", gap: 5,
            }}>
            {added ? <><FiCheck size={11}/> Added!</> : <><FiShoppingBag size={11}/> Add to Cart</>}
          </button>
        </div>
      </div>
    </Link>
  );
}

// ── Desktop Filter Section ─────────────────────────────────────
function FilterSection({ group, filters, onToggle }) {
  const [open, setOpen] = useState(true);

  return (
    <div style={{ paddingBottom: 16, marginBottom: 16, borderBottom: `1px solid ${BORDER}` }}>
      <button onClick={() => setOpen(!open)}
        style={{ width: "100%", display: "flex", justifyContent: "space-between",
          alignItems: "center", background: "transparent", border: "none",
          cursor: "pointer", padding: "4px 0" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: CHARCOAL, letterSpacing: "0.5px" }}>
          {group.label}
        </span>
        {open ? <FiChevronUp size={14} color={MUTED}/> : <FiChevronDown size={14} color={MUTED}/>}
      </button>

      {open && (
        <div style={{ marginTop: 10 }}>
          {/* COLOR */}
          {group.type === "color" && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {group.options.map(opt => {
                const sel = (filters[group.key] || []).includes(opt.value);
                return (
                  <div key={opt.value} onClick={() => onToggle(group.key, opt.value)}
                    style={{ display: "flex", flexDirection: "column",
                      alignItems: "center", gap: 3, cursor: "pointer" }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: "50%",
                      background: opt.hex || opt.value,
                      border: sel ? `3px solid ${GOLD}` : `2px solid ${opt.border ? "#ccc" : "rgba(0,0,0,0.1)"}`,
                      boxShadow: sel ? `0 0 0 2px ${GOLD_LIGHT}` : "0 1px 4px rgba(0,0,0,0.15)",
                      transition: "all 0.15s",
                    }}/>
                    <span style={{ fontSize: 8, color: MUTED, maxWidth: 32, textAlign: "center", lineHeight: 1.2 }}>
                      {opt.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* RADIO */}
          {group.type === "radio" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {group.options.map(opt => {
                const sel = filters[group.key] === opt.value;
                return (
                  <label key={opt.value}
                    style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <div onClick={() => onToggle(group.key, opt.value)}
                      style={{
                        width: 15, height: 15, borderRadius: "50%", flexShrink: 0,
                        border: `2px solid ${sel ? GOLD : "#bbb"}`,
                        background: sel ? GOLD : "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.15s",
                      }}>
                      {sel && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff" }}/>}
                    </div>
                    <span style={{ fontSize: 12, color: sel ? CHARCOAL : MUTED, fontWeight: sel ? 600 : 400 }}>
                      {opt.label}
                    </span>
                  </label>
                );
              })}
            </div>
          )}

          {/* CHECKBOX */}
          {group.type === "checkbox" && (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {group.options.map(opt => {
                const sel = (filters[group.key] || []).includes(opt.value);
                return (
                  <label key={opt.value}
                    style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}>
                    <div onClick={() => onToggle(group.key, opt.value)}
                      style={{
                        width: 16, height: 16, borderRadius: 4, flexShrink: 0,
                        border: `1.5px solid ${sel ? GOLD : "#bbb"}`,
                        background: sel ? GOLD : "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "all 0.15s",
                      }}>
                      {sel && (
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <polyline points="1.5,6 4.5,9 10.5,3"
                            stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      )}
                    </div>
                    <span style={{ fontSize: 12, color: sel ? CHARCOAL : MUTED, fontWeight: sel ? 600 : 400 }}>
                      {opt.label}
                    </span>
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

// ── Mobile Filter Bottom Sheet ─────────────────────────────────
function MobileFilterSheet({ open, onClose, filterGroups, filters, onToggle, onClear, activeCount }) {
  const [activeIdx, setActiveIdx] = useState(0);
  if (!open || !filterGroups.length) return null;
  const group = filterGroups[activeIdx] || filterGroups[0];

  return (
    <>
      <div onClick={onClose}
        style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", zIndex: 1200 }}/>
      <div style={{
        position: "fixed", bottom: 0, left: 0, right: 0, height: "85vh",
        backgroundColor: "#fff", borderRadius: "16px 16px 0 0",
        zIndex: 1300, display: "flex", flexDirection: "column", overflow: "hidden",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "16px 16px 12px", borderBottom: `1px solid ${BORDER}`, flexShrink: 0 }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: CHARCOAL }}>
            Filters{" "}
            {activeCount > 0 && (
              <span style={{ fontSize: 11, color: "#fff", backgroundColor: GOLD,
                padding: "1px 7px", borderRadius: 20, marginLeft: 4 }}>
                {activeCount}
              </span>
            )}
          </span>
          <button onClick={onClose}
            style={{ background: "none", border: "none", cursor: "pointer", display: "flex" }}>
            <FiX size={22} color={MUTED}/>
          </button>
        </div>

        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* Left panel */}
          <div style={{ width: 120, backgroundColor: SURFACE, overflowY: "auto",
            flexShrink: 0, scrollbarWidth: "none" }}>
            {filterGroups.map((g, idx) => {
              const hasActive = filters[g.key] &&
                (Array.isArray(filters[g.key]) ? filters[g.key].length > 0 : true);
              return (
                <button key={g._id || g.key} onClick={() => setActiveIdx(idx)}
                  style={{
                    width: "100%", padding: "13px 10px", background: activeIdx === idx ? "#fff" : "transparent",
                    border: "none", borderLeft: `3px solid ${activeIdx === idx ? GOLD : "transparent"}`,
                    cursor: "pointer", textAlign: "left", fontSize: 11,
                    fontWeight: activeIdx === idx ? 700 : 500,
                    color: activeIdx === idx ? GOLD_DARK : MUTED, lineHeight: 1.3,
                  }}>
                  {g.label}
                  {hasActive && (
                    <span style={{ display: "inline-block", width: 6, height: 6,
                      borderRadius: "50%", backgroundColor: GOLD,
                      marginLeft: 4, verticalAlign: "middle" }}/>
                  )}
                </button>
              );
            })}
          </div>

          {/* Right panel */}
          <div style={{ flex: 1, overflowY: "auto", padding: "12px 14px", scrollbarWidth: "none" }}>
            <p style={{ fontSize: 10, fontWeight: 800, color: GOLD_DARK,
              letterSpacing: "0.8px", marginBottom: 14 }}>
              {group.label}
            </p>

            {group.type === "color" && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                {group.options.map(opt => {
                  const sel = (filters[group.key] || []).includes(opt.value);
                  return (
                    <div key={opt.value} onClick={() => onToggle(group.key, opt.value)}
                      style={{ display: "flex", flexDirection: "column",
                        alignItems: "center", gap: 4, cursor: "pointer" }}>
                      <div style={{
                        width: 34, height: 34, borderRadius: "50%",
                        background: opt.hex || opt.value,
                        border: sel ? `3px solid ${GOLD}` : "2px solid rgba(0,0,0,0.1)",
                        boxShadow: sel ? `0 0 0 2px ${GOLD_LIGHT}` : "0 1px 4px rgba(0,0,0,0.15)",
                      }}/>
                      <span style={{ fontSize: 9, color: sel ? GOLD_DARK : MUTED,
                        fontWeight: sel ? 700 : 400, textAlign: "center", maxWidth: 36 }}>
                        {opt.label}
                      </span>
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
                        padding: "13px 4px", background: "none", border: "none",
                        borderBottom: `1px solid ${BORDER}44`, cursor: "pointer" }}>
                      <span style={{ fontSize: 13, color: sel ? CHARCOAL : MUTED,
                        fontWeight: sel ? 700 : 400 }}>
                        {opt.label}
                      </span>
                      <div style={{ width: 18, height: 18, borderRadius: "50%",
                        border: `2px solid ${sel ? GOLD : "#ccc"}`,
                        background: sel ? GOLD : "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center" }}>
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
                        padding: "13px 4px", background: "none", border: "none",
                        borderBottom: `1px solid ${BORDER}44`, cursor: "pointer" }}>
                      <span style={{ fontSize: 13, color: sel ? CHARCOAL : MUTED,
                        fontWeight: sel ? 700 : 400 }}>
                        {opt.label}
                      </span>
                      <div style={{ width: 18, height: 18, borderRadius: 4,
                        border: `1.5px solid ${sel ? GOLD : "#ccc"}`,
                        background: sel ? GOLD : "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {sel && (
                          <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                            <polyline points="1.5,6 4.5,9 10.5,3"
                              stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
                          </svg>
                        )}
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

// ── Mobile Sort Sheet ──────────────────────────────────────────
function MobileSortSheet({ open, onClose, sort, onSort }) {
  if (!open) return null;
  return (
    <>
      <div onClick={onClose}
        style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", zIndex: 1200 }}/>
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0,
        backgroundColor: "#fff", borderRadius: "16px 16px 0 0", zIndex: 1300, overflow: "hidden" }}>
        <div style={{ padding: "16px 16px 12px", borderBottom: `1px solid ${BORDER}` }}>
          <span style={{ fontSize: 15, fontWeight: 800, color: CHARCOAL }}>Sort By</span>
        </div>
        {SORT_OPTIONS.map(s => (
          <button key={s} onClick={() => { onSort(s); onClose(); }}
            style={{ width: "100%", display: "flex", alignItems: "center",
              justifyContent: "space-between", padding: "14px 16px",
              background: s === sort ? GOLD_LIGHT : "#fff",
              border: "none", borderBottom: `1px solid ${BORDER}44`, cursor: "pointer" }}>
            <span style={{ fontSize: 13, fontWeight: s === sort ? 700 : 400,
              color: s === sort ? GOLD_DARK : CHARCOAL }}>
              {s}
            </span>
            {s === sort && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke={GOLD} strokeWidth="2.5">
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

// ── Skeleton ───────────────────────────────────────────────────
function SkeletonCard({ isMobile }) {
  return (
    <div style={{ background: "#fff", borderRadius: 10, overflow: "hidden",
      border: `1px solid ${BORDER}` }}>
      <div style={{ width: "100%", height: isMobile ? 200 : 260,
        background: "#f0ece6", animation: "pulse 1.5s infinite" }}/>
      <div style={{ padding: "10px 12px" }}>
        <div style={{ height: 12, background: "#f0ece6", borderRadius: 4,
          marginBottom: 8, animation: "pulse 1.5s infinite" }}/>
        <div style={{ height: 10, background: "#f0ece6", borderRadius: 4,
          width: "60%", animation: "pulse 1.5s infinite" }}/>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.5}}`}</style>
    </div>
  );
}

// ── MAIN ──────────────────────────────────────────────────────
const PER_PAGE = 16;

export default function CategoryPage() {
  const isMobile = useIsMobile();
  const { gender, subcategory } = useParams();
  const location = useLocation();

  // ── Resolve category from URL ────────────────────────────
  // Support two route patterns:
  // /category/women              → all women products
  // /category/women/sarees       → specific subcategory
  // /category/women/ethnic-wear  → colTitle only
  const resolved    = getCategoryByParams(gender || "", subcategory || "");
  const navName     = resolved?.gender   || (gender || "").toUpperCase();
  const colTitle    = resolved?.colTitle || "";
  const subItem     = resolved?.subcategory || "";

  // Display name for the page heading
  const displayCategory = subItem || colTitle || subcategory
    ? (subItem || colTitle || subcategory)
    : `${navName} — All Products`;

  // ── State ────────────────────────────────────────────────
  const [products,       setProducts]       = useState([]);
  const [filterGroups,   setFilterGroups]   = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [sort,           setSort]           = useState("Relevance");
  const [showSort,       setShowSort]       = useState(false);
  const [filters,        setFilters]        = useState({});
  const [showMobFilter,  setShowMobFilter]  = useState(false);
  const [showMobSort,    setShowMobSort]    = useState(false);
  const [page,           setPage]           = useState(1);

  // ── Fetch products when route changes ────────────────────
  useEffect(() => {
    setLoading(true);
    setProducts([]);
    setPage(1);
    setFilters({});

    fetchCategoryProducts(navName, colTitle, subItem)
      .then(prods => setProducts(prods))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [navName, colTitle, subItem]);

  // ── Fetch filters ────────────────────────────────────────
  useEffect(() => {
    setFiltersLoading(true);
    fetchFilters(navName)
      .then(groups => setFilterGroups(groups.length ? groups : FALLBACK_FILTERS))
      .catch(() => setFilterGroups(FALLBACK_FILTERS))
      .finally(() => setFiltersLoading(false));
  }, [navName]);

  // ── Filter toggle ────────────────────────────────────────
  const handleToggle = useCallback((key, value) => {
    setFilters(prev => {
      const group = filterGroups.find(g => g.key === key);
      if (!group) return prev;
      if (group.type === "radio") {
        return { ...prev, [key]: prev[key] === value ? undefined : value };
      }
      const arr = prev[key] || [];
      return {
        ...prev,
        [key]: arr.includes(value)
          ? arr.filter(v => v !== value)
          : [...arr, value],
      };
    });
    setPage(1);
  }, [filterGroups]);

  const clearAll = () => { setFilters({}); setPage(1); };

  const activeFilterCount = Object.values(filters).filter(v =>
    v !== undefined && (Array.isArray(v) ? v.length > 0 : true)
  ).length;

  // ── Apply filters + sort ─────────────────────────────────
  const filtered = useMemo(() => {
    let list = [...products];

    filterGroups.forEach(group => {
      const val = filters[group.key];
      if (!val || (Array.isArray(val) && !val.length) || val === undefined) return;

      if (group.type === "radio") {
        const opt = group.options.find(o => o.value === val);
        if (!opt) return;
        if (group.key === "price") {
          list = list.filter(p => p.price >= (opt.min ?? 0) && p.price <= (opt.max ?? 99999));
        } else if (group.key === "disc") {
          list = list.filter(p => getDiscount(p) >= (opt.min ?? 0));
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
          list = list.filter(p => {
            const fv = p[group.key] || p.details?.[group.key] || "";
            const fa = Array.isArray(fv) ? fv : [fv];
            return values.some(v => fa.some(f => String(f).toLowerCase().includes(v.toLowerCase())));
          });
        }
      }
    });

    switch (sort) {
      case "Price: Low to High":  list.sort((a,b) => a.price - b.price); break;
      case "Price: High to Low":  list.sort((a,b) => b.price - a.price); break;
      case "Better Discount":     list.sort((a,b) => getDiscount(b) - getDiscount(a)); break;
      case "Customer Rating":     list.sort((a,b) => (b.rating||0) - (a.rating||0)); break;
      case "What's New":          list.sort((a,b) => new Date(b.createdAt||0) - new Date(a.createdAt||0)); break;
      default: break;
    }

    return list;
  }, [products, filters, sort, filterGroups]);

  const displayed = filtered.slice(0, page * PER_PAGE);
  const cols = isMobile ? 2 : 4;

  return (
    <div style={{ backgroundColor: SURFACE, minHeight: "100vh" }}>
      <style>{`
        @keyframes fadeSlide {
          from { opacity:0; transform:translateY(10px); }
          to { opacity:1; transform:translateY(0); }
        }
      `}</style>

      {/* Breadcrumb */}
      <div style={{
        background: "#fff", borderBottom: `1px solid ${BORDER}`,
        padding: isMobile ? "8px 12px" : "10px 32px",
        display: "flex", alignItems: "center", gap: 6,
        overflowX: "auto", scrollbarWidth: "none",
      }}>
        <Link to="/" style={{ color: MUTED, fontSize: 12, textDecoration: "none",
          display: "flex", alignItems: "center", gap: 3 }}>
          ← Home
        </Link>
        <span style={{ color: "#ccc" }}>/</span>
        <Link to={`/category/${navName.toLowerCase()}`}
          style={{ color: MUTED, fontSize: 12, textDecoration: "none" }}>
          {navName}
        </Link>
        {colTitle && (
          <>
            <span style={{ color: "#ccc" }}>/</span>
            <span style={{ color: MUTED, fontSize: 12 }}>{colTitle}</span>
          </>
        )}
        {subItem && (
          <>
            <span style={{ color: "#ccc" }}>/</span>
            <span style={{ fontSize: 12, fontWeight: 700, color: GOLD_DARK }}>{subItem}</span>
          </>
        )}
      </div>

      <div style={{ display: "flex", maxWidth: 1400, margin: "0 auto" }}>

        {/* Desktop Sidebar */}
        {!isMobile && (
          <aside style={{
            width: 230, flexShrink: 0, backgroundColor: "#fff",
            borderRight: `1px solid ${BORDER}`, padding: "20px 16px",
            position: "sticky", top: 68, alignSelf: "flex-start",
            maxHeight: "calc(100vh - 68px)", overflowY: "auto",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 20 }}>
              <span style={{ fontSize: 13, fontWeight: 800, color: CHARCOAL, letterSpacing: "0.5px" }}>
                FILTERS
                {activeFilterCount > 0 && (
                  <span style={{ marginLeft: 8, fontSize: 10, color: "#fff",
                    backgroundColor: GOLD, padding: "1px 6px", borderRadius: 20 }}>
                    {activeFilterCount}
                  </span>
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
                  <div key={i} style={{ height: 80, background: "#f5f0eb",
                    borderRadius: 8, marginBottom: 16,
                    animation: "pulse 1.5s infinite" }}/>
                ))
              : filterGroups.map(g => (
                  <FilterSection key={g._id || g.key}
                    group={g} filters={filters} onToggle={handleToggle}/>
                ))
            }
          </aside>
        )}

        {/* Products area */}
        <div style={{ flex: 1, padding: isMobile ? "0 0 80px" : "20px 24px" }}>

          {/* Mobile sticky filter/sort bar */}
          {isMobile && (
            <div style={{
              position: "sticky", top: 52, zIndex: 50,
              backgroundColor: "#fff", borderBottom: `1px solid ${BORDER}`,
              display: "flex", boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
            }}>
              <button onClick={() => setShowMobFilter(true)}
                style={{ flex: 1, display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 6, padding: "11px 0",
                  background: "none", border: "none",
                  borderRight: `1px solid ${BORDER}`, cursor: "pointer",
                  fontSize: 12, fontWeight: 700,
                  color: activeFilterCount > 0 ? GOLD_DARK : CHARCOAL }}>
                <FiSliders size={14}/>
                FILTER
                {activeFilterCount > 0 && (
                  <span style={{ backgroundColor: GOLD, color: "#fff",
                    fontSize: 9, fontWeight: 800, padding: "1px 5px", borderRadius: 10 }}>
                    {activeFilterCount}
                  </span>
                )}
              </button>
              <button onClick={() => setShowMobSort(true)}
                style={{ flex: 1, display: "flex", alignItems: "center",
                  justifyContent: "center", gap: 6, padding: "11px 0",
                  background: "none", border: "none", cursor: "pointer",
                  fontSize: 12, fontWeight: 700, color: CHARCOAL }}>
                <FiFilter size={14}/>
                SORT
                {sort !== "Relevance" && (
                  <span style={{ fontSize: 10, color: GOLD_DARK, fontWeight: 700 }}>•</span>
                )}
              </button>
            </div>
          )}

          {/* Desktop top bar */}
          {!isMobile && (
            <div style={{ display: "flex", justifyContent: "space-between",
              alignItems: "center", marginBottom: 20 }}>
              <div>
                <h1 style={{ fontSize: 20, fontWeight: 700, color: CHARCOAL,
                  fontFamily: "'Playfair Display',Georgia,serif" }}>
                  {displayCategory}
                </h1>
                <p style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>
                  {loading ? "Loading products…" : `${filtered.length} products found`}
                </p>
              </div>

              {/* Sort dropdown */}
              <div style={{ position: "relative" }}>
                <button onClick={() => setShowSort(!showSort)}
                  style={{ display: "flex", alignItems: "center", gap: 8,
                    padding: "8px 16px", border: `1px solid ${BORDER}`,
                    background: "#fff", fontSize: 12, fontWeight: 600,
                    color: CHARCOAL, cursor: "pointer", borderRadius: 7 }}>
                  Sort: <span style={{ color: GOLD_DARK }}>{sort}</span>
                  <FiChevronDown size={12} color={MUTED}/>
                </button>
                {showSort && (
                  <div style={{
                    position: "absolute", right: 0, top: "calc(100% + 4px)",
                    backgroundColor: "#fff", border: `1px solid ${BORDER}`,
                    boxShadow: "0 8px 28px rgba(0,0,0,0.10)", zIndex: 50,
                    minWidth: 210, borderRadius: 8, overflow: "hidden",
                  }}>
                    {SORT_OPTIONS.map(s => (
                      <button key={s} onClick={() => { setSort(s); setShowSort(false); }}
                        style={{ display: "block", width: "100%", textAlign: "left",
                          padding: "10px 18px", fontSize: 13,
                          background: s === sort ? GOLD_LIGHT : "#fff",
                          color: s === sort ? GOLD_DARK : MUTED,
                          fontWeight: s === sort ? 700 : 400,
                          border: "none", cursor: "pointer" }}>
                        {s === sort && "✓ "}{s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mobile: category + product count + active filter chips */}
          {isMobile && (
            <div style={{ padding: "10px 12px 8px", backgroundColor: SURFACE }}>
              <p style={{ fontSize: 12, color: MUTED,
                marginBottom: activeFilterCount > 0 ? 8 : 0 }}>
                <span style={{ fontWeight: 700, color: CHARCOAL }}>{displayCategory}</span>
                {" — "}
                {loading ? "Loading…" : `${filtered.length} products`}
              </p>
              {activeFilterCount > 0 && (
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {Object.entries(filters).map(([key, val]) => {
                    if (!val || (Array.isArray(val) && !val.length)) return null;
                    const vals = Array.isArray(val) ? val : [val];
                    return vals.map(v => (
                      <span key={`${key}-${v}`} onClick={() => handleToggle(key, v)}
                        style={{ display: "flex", alignItems: "center", gap: 4,
                          padding: "4px 10px", borderRadius: 20, fontSize: 10,
                          fontWeight: 700, backgroundColor: GOLD_LIGHT,
                          color: GOLD_DARK, border: `1px solid ${GOLD}`, cursor: "pointer" }}>
                        {v} <FiX size={9}/>
                      </span>
                    ));
                  })}
                  <span onClick={clearAll}
                    style={{ display: "flex", alignItems: "center", gap: 4,
                      padding: "4px 10px", borderRadius: 20, fontSize: 10,
                      fontWeight: 700, backgroundColor: "#fff",
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
              <div style={{ display: "grid",
                gridTemplateColumns: `repeat(${cols},1fr)`,
                gap: isMobile ? 10 : 18 }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <SkeletonCard key={i} isMobile={isMobile}/>
                ))}
              </div>
            ) : displayed.length === 0 ? (
              <div style={{ display: "flex", flexDirection: "column",
                alignItems: "center", justifyContent: "center",
                padding: "60px 20px", color: MUTED }}>
                <FiShoppingBag size={48} color={BORDER}/>
                <p style={{ marginTop: 16, fontWeight: 700, fontSize: 16,
                  textAlign: "center", color: CHARCOAL }}>
                  {products.length === 0
                    ? "No products in this category yet"
                    : "No products match your filters"
                  }
                </p>
                <p style={{ marginTop: 6, fontSize: 12, textAlign: "center", color: MUTED }}>
                  {products.length === 0
                    ? "Add products from the Admin panel under this category"
                    : "Try removing some filters to see more results"
                  }
                </p>
                {activeFilterCount > 0 && (
                  <button onClick={clearAll}
                    style={{ marginTop: 18, padding: "10px 24px",
                      border: `1.5px solid ${GOLD}`, background: "transparent",
                      color: GOLD_DARK, fontWeight: 700, fontSize: 12,
                      borderRadius: 8, cursor: "pointer" }}>
                    Clear Filters
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: "grid",
                gridTemplateColumns: `repeat(${cols},1fr)`,
                gap: isMobile ? 10 : 18 }}>
                {displayed.map((p, i) => (
                  <div key={String(p._id || p.id)}
                    style={{ animation: `fadeSlide 0.35s ${(i % PER_PAGE) * 0.04}s ease both` }}>
                    <ProductCard p={p} isMobile={isMobile}/>
                  </div>
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
                  fontSize: 13, letterSpacing: "1px", borderRadius: 8,
                  cursor: "pointer" }}>
                Load More ({filtered.length - displayed.length} remaining)
              </button>
            </div>
          )}

          {!loading && displayed.length > 0 && displayed.length >= filtered.length && (
            <p style={{ textAlign: "center", padding: "24px 0 16px",
              fontSize: 12, color: MUTED }}>
              — All {filtered.length} products shown —
            </p>
          )}
        </div>
      </div>

      {/* Mobile sheets */}
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