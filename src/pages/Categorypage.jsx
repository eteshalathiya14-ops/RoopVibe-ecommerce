// ─────────────────────────────────────────────────────────────
//  src/pages/CategoryPage.jsx
//  Product listing page — opens when any nav item is clicked
// ─────────────────────────────────────────────────────────────
import { useState, useMemo } from "react";
import { mockProducts, filterGroups, sortOptions } from "../Data/Navdata";
import { FiHeart } from "react-icons/fi";

// ── THEME ─────────────────────────────────────────────────────
const GOLD      = "#C9A96E";
const GOLD_LIGHT= "#F5EDD9";
const GOLD_DARK = "#A07840";
const CHARCOAL  = "#1A1A1A";
const MUTED     = "#6B6560";
const BORDER    = "#EDE8E0";

// ── STAR RATING ───────────────────────────────────────────────
function Stars({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <svg key={s} width="11" height="11" viewBox="0 0 24 24"
          fill={s <= Math.round(rating) ? GOLD : "#e0d8cc"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
      <span className="text-xs ml-1" style={{ color: MUTED }}>{rating}</span>
    </div>
  );
}

// ── PRODUCT CARD ──────────────────────────────────────────────
function ProductCard({ p }) {
  const [wished, setWished] = useState(false);
  const [hov, setHov]       = useState(false);

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="rounded-md overflow-hidden cursor-pointer transition-all duration-200"
      style={{
        background: "#fff",
        border: `1px solid ${hov ? GOLD : BORDER}`,
        transform: hov ? "translateY(-3px)" : "none",
        boxShadow: hov ? "0 8px 24px rgba(201,169,110,0.14)" : "none",
      }}
    >
      {/* Image */}
      <div className="relative">
        <img src={p.img} alt={p.title}
          className="w-full object-cover block" style={{ height: 260 }} />

        {/* Discount badge */}
        <div className="absolute top-2 left-2 text-white text-xs font-bold px-2 py-0.5 rounded"
          style={{ background: GOLD, fontSize: 10 }}>
          {p.disc}% OFF
        </div>

        {/* Wishlist */}
        <button
          onClick={e => { e.stopPropagation(); setWished(!wished); }}
          className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-sm border-none cursor-pointer"
          style={{ background: "rgba(255,255,255,0.9)", color: wished ? "#ff4d4f" : "#bbb" }}
        >
          <FiHeart fill={wished ? "currentColor" : "none"} size={14} />
        </button>

        {/* By seller */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1">
          <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
            style={{ background: GOLD_LIGHT, border: `1px solid ${GOLD}`, color: GOLD_DARK, fontSize: 8 }}>
            {p.by.charAt(0)}
          </div>
          <span className="text-white font-semibold"
            style={{ fontSize: 10, textShadow: "0 1px 3px rgba(0,0,0,0.6)" }}>
            By {p.by}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="px-3 py-2.5">
        <p className="font-medium mb-1.5 leading-snug"
          style={{ fontSize: 12, color: CHARCOAL }}>{p.title}</p>
        <Stars rating={p.rating} />
        <div className="flex items-center gap-2 mt-1.5">
          <span className="font-bold" style={{ fontSize: 14, color: CHARCOAL }}>₹{p.price}</span>
          <span className="line-through" style={{ fontSize: 11, color: MUTED }}>₹{p.mrp}</span>
          <span className="font-semibold" style={{ fontSize: 11, color: "#2e7d32" }}>{p.disc}% off</span>
        </div>
      </div>
    </div>
  );
}

// ── FILTER SECTION ────────────────────────────────────────────
function FilterSection({ group, filters, onToggle }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="pb-4 mb-4" style={{ borderBottom: `1px solid ${BORDER}` }}>
      {/* Header */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center bg-transparent border-none cursor-pointer py-1"
      >
        <span className="font-bold tracking-wide" style={{ fontSize: 12, color: CHARCOAL }}>
          {group.label}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke={MUTED} strokeWidth="2.5"
          style={{ transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}>
          <polyline points="6 9 12 15 18 9"/>
        </svg>
      </button>

      {open && (
        <div className="mt-2.5">
          {/* COLOR type */}
          {group.type === "color" && (
            <div className="flex flex-wrap gap-2">
              {group.options.map(opt => {
                const sel = (filters.colors || []).includes(opt.name);
                return (
                  <div key={opt.name} onClick={() => onToggle("colors", opt.name)}
                    className="flex flex-col items-center gap-1 cursor-pointer">
                    <div style={{
                      width: 26, height: 26, borderRadius: "50%",
                      background: opt.hex,
                      border: sel ? `3px solid ${GOLD}` : `2px solid ${opt.border ? "#ccc" : "transparent"}`,
                      boxSizing: "border-box",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                    }} />
                    <span style={{ fontSize: 9, color: MUTED, maxWidth: 32, textAlign: "center" }}>{opt.name}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* RADIO type (price / discount) */}
          {group.type === "radio" && (
            <div className="flex flex-col gap-2">
              {group.options.map(opt => {
                const sel = filters[group.key] === opt.label;
                return (
                  <label key={opt.label} className="flex items-center gap-2 cursor-pointer">
                    <div
                      onClick={() => onToggle(group.key, opt.label)}
                      style={{
                        width: 15, height: 15, borderRadius: "50%", flexShrink: 0, cursor: "pointer",
                        border: `2px solid ${sel ? GOLD : "#bbb"}`,
                        background: sel ? GOLD : "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      {sel && <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#fff" }} />}
                    </div>
                    <span style={{ fontSize: 12, color: MUTED }}>{opt.label}</span>
                  </label>
                );
              })}
            </div>
          )}

          {/* CHECKBOX type */}
          {group.type === "checkbox" && (
            <div className="flex flex-col gap-2">
              {group.options.map(opt => {
                const arrKey = group.key;
                const sel = (filters[arrKey] || []).includes(opt);
                return (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <div
                      onClick={() => onToggle(arrKey, opt)}
                      style={{
                        width: 15, height: 15, borderRadius: 3, flexShrink: 0, cursor: "pointer",
                        border: `1.5px solid ${sel ? GOLD : "#bbb"}`,
                        background: sel ? GOLD : "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      {sel && (
                        <svg width="9" height="9" viewBox="0 0 12 12" fill="none">
                          <polyline points="1.5,6 4.5,9 10.5,3" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
                        </svg>
                      )}
                    </div>
                    <span style={{ fontSize: 12, color: MUTED }}>{opt}</span>
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

// ── MAIN PAGE ─────────────────────────────────────────────────
import { useParams, Link } from 'react-router-dom';
import { getCategoryByParams } from '../utils/categoryIndex';
import { getFilteredProducts } from '../utils/productMatcher';

export default function CategoryPage() {
  const { gender, subcategory } = useParams();
  const resolved = getCategoryByParams(gender || '', subcategory || '');

  const category = resolved?.subcategory || '';
  const genderLabel = resolved?.gender || (gender || '').toUpperCase();

  const baseList = useMemo(
    () => getFilteredProducts(genderLabel, category),
    [genderLabel, category]
  );

  // If category mapping fails, keep an empty list (fallback UI will handle it)
  const [sort,      setSort]      = useState("Relevance");
  const [showSort,  setShowSort]  = useState(false);
  const [filters,   setFilters]   = useState({});
  const [page,      setPage]      = useState(1);
  const PER_PAGE = 16;

  // Toggle filter value
  const handleToggle = (key, value) => {
    setFilters(prev => {
      // radio — single select, toggle off if same
      if (key === "price" || key === "disc") {
        return { ...prev, [key]: prev[key] === value ? undefined : value };
      }
      // checkbox/color — multi select
      const arr = prev[key] || [];
      return {
        ...prev,
        [key]: arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value],
      };
    });
    setPage(1);
  };

  const clearAll = () => { setFilters({}); setPage(1); };

  const activeFilterCount = Object.values(filters).filter(v =>
    v !== undefined && (Array.isArray(v) ? v.length > 0 : true)
  ).length;

  // Apply filters + sort
  const filtered = useMemo(() => {
    let list = Array.isArray(baseList) ? [...baseList] : [...mockProducts];

    // Price filter
    if (filters.price) {
      const opt = filterGroups.find(g => g.key === "price")?.options.find(o => o.label === filters.price);
      if (opt) list = list.filter(p => p.price >= opt.min && p.price <= opt.max);
    }
    // Discount filter
    if (filters.disc) {
      const opt = filterGroups.find(g => g.key === "disc")?.options.find(o => o.label === filters.disc);
      if (opt) list = list.filter(p => p.disc >= opt.min);
    }
    // Sizes
    if (filters.sizes?.length) list = list.filter(p => filters.sizes.some(s => p.sizes?.includes(s)));
    // Colors
    if (filters.colors?.length) list = list.filter(p => filters.colors.some(c => p.colors?.includes(c)));
    // Pattern
    if (filters.pattern?.length) list = list.filter(p => filters.pattern.includes(p.pattern));
    // Fabric
    if (filters.fabric?.length) list = list.filter(p => filters.fabric.includes(p.fabric));
    // Occasion
    if (filters.occasion?.length) list = list.filter(p => filters.occasion.includes(p.occasion));

    // Sort
    switch (sort) {
      case "Price: Low to High":  list.sort((a,b) => a.price - b.price); break;
      case "Price: High to Low":  list.sort((a,b) => b.price - a.price); break;
      case "Better Discount":     list.sort((a,b) => b.disc  - a.disc);  break;
      case "Customer Rating":     list.sort((a,b) => b.rating - a.rating); break;
      default: break;
    }

    return list;
  }, [filters, sort, baseList]);

  const displayed = filtered.slice(0, page * PER_PAGE);

  return (
    <div className="min-h-screen" style={{ background: "#f5f5f1" }}>

      {/* ── BREADCRUMB ── */}
      <div className="flex items-center gap-2 px-8 py-3"
        style={{ background: "#fff", borderBottom: `1px solid ${BORDER}` }}>
        <Link
          to="/"
          className="flex items-center gap-1 bg-transparent border-none cursor-pointer"
          style={{ color: MUTED, fontSize: 13, textDecoration: 'none' }}>

          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Home
        </Link>
        <span style={{ color: "#ccc" }}>/</span>
        <span style={{ color: MUTED, fontSize: 13 }}>{genderLabel}</span><span style={{ color: "#ccc" }}>/</span>
        <span className="font-semibold" style={{ fontSize: 13, color: GOLD_DARK }}>{category || "All Products"}</span>
      </div>

      <div className="flex" style={{ maxWidth: 1400, margin: "0 auto", padding: "0" }}>

        {/* ══════════════ LEFT SIDEBAR — FILTERS ══════════════ */}
        <aside className="flex-shrink-0"
          style={{
            width: 230,
            background: "#fff",
            borderRight: `1px solid ${BORDER}`,
            padding: "20px 16px",
            minHeight: "calc(100vh - 120px)",
            position: "sticky",
            top: 68,
            alignSelf: "flex-start",
            overflowY: "auto",
            maxHeight: "calc(100vh - 68px)",
          }}
        >
          <div className="flex justify-between items-center mb-5">
            <span className="font-bold tracking-wider" style={{ fontSize: 13, color: CHARCOAL }}>
              FILTERS
              {activeFilterCount > 0 && (
                <span className="ml-2 text-white text-xs px-1.5 py-0.5 rounded-full"
                  style={{ background: GOLD, fontSize: 10 }}>
                  {activeFilterCount}
                </span>
              )}
            </span>
            {activeFilterCount > 0 && (
              <button onClick={clearAll}
                className="bg-transparent border-none cursor-pointer underline font-semibold"
                style={{ fontSize: 11, color: GOLD_DARK }}>
                CLEAR ALL
              </button>
            )}
          </div>

          {filterGroups.map(g => (
            <FilterSection key={g.key} group={g} filters={filters} onToggle={handleToggle} />
          ))}
        </aside>

        {/* ══════════════ RIGHT — PRODUCTS AREA ══════════════ */}
        <div className="flex-1 px-6 py-5">

          {/* Top bar: count + sort */}
          <div className="flex justify-between items-center mb-5">
            <div>
              <h2 className="font-bold" style={{ fontSize: 20, color: CHARCOAL, fontFamily: "Georgia, serif" }}>
                {category}
              </h2>
              <p style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>
                {filtered.length} Products Found
              </p>
            </div>

            {/* Sort dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowSort(!showSort)}
                className="flex items-center gap-2 cursor-pointer rounded"
                style={{
                  padding: "7px 16px",
                  border: `1px solid ${BORDER}`,
                  background: "#fff",
                  fontSize: 12, fontWeight: 600, color: CHARCOAL,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2">
                  <line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="10" y2="18"/>
                </svg>
                Sort: <span style={{ color: GOLD_DARK }}>{sort}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>

              {showSort && (
                <div className="absolute right-0 rounded-md z-50 overflow-hidden"
                  style={{
                    top: "calc(100% + 4px)",
                    background: "#fff",
                    border: `1px solid ${BORDER}`,
                    boxShadow: "0 8px 28px rgba(0,0,0,0.1)",
                    minWidth: 210,
                  }}
                >
                  {sortOptions.map(s => (
                    <button key={s}
                      onClick={() => { setSort(s); setShowSort(false); }}
                      className="block w-full text-left border-none cursor-pointer transition-colors"
                      style={{
                        padding: "10px 18px",
                        fontSize: 13,
                        background: s === sort ? GOLD_LIGHT : "#fff",
                        color: s === sort ? GOLD_DARK : MUTED,
                        fontWeight: s === sort ? 700 : 400,
                      }}
                    >
                      {s === sort && "✓ "}{s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Active filter chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {Object.entries(filters).map(([key, val]) => {
                if (!val || (Array.isArray(val) && !val.length)) return null;
                const vals = Array.isArray(val) ? val : [val];
                return vals.map(v => (
                  <span key={`${key}-${v}`}
                    className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer"
                    style={{ background: GOLD_LIGHT, color: GOLD_DARK, border: `1px solid ${GOLD}` }}
                    onClick={() => handleToggle(key, v)}
                  >
                    {v} ✕
                  </span>
                ));
              })}
            </div>
          )}

          {/* Products grid — 4 columns like LimeRoad */}
          {displayed.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24" style={{ color: MUTED }}>
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke={BORDER} strokeWidth="1.5">
                <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9M9 21a1 1 0 100-2 1 1 0 000 2zm10 0a1 1 0 100-2 1 1 0 000 2z"/>
              </svg>
              <p className="mt-4 font-semibold" style={{ fontSize: 16 }}>No products found</p>
              <p className="mt-1" style={{ fontSize: 13 }}>Try removing some filters</p>
              <button onClick={clearAll}
                className="mt-4 px-6 py-2 rounded font-bold cursor-pointer"
                style={{ border: `1.5px solid ${GOLD}`, background: "transparent", color: GOLD_DARK, fontSize: 13 }}>
                CLEAR FILTERS
              </button>
            </div>
          ) : (
            <div className="grid gap-3.5"
              style={{ gridTemplateColumns: "repeat(4, 1fr)" }}>
              {displayed.map(p => <ProductCard key={p.id} p={p} />)}
            </div>
          )}

          {/* Load More */}
          {displayed.length < filtered.length && (
            <div className="text-center mt-10 pb-10">
              <button
                onClick={() => setPage(p => p + 1)}
                className="px-12 py-3 rounded font-bold tracking-widest cursor-pointer transition-all"
                style={{
                  border: `1.5px solid ${GOLD}`,
                  background: "transparent",
                  color: GOLD_DARK,
                  fontSize: 13,
                  letterSpacing: "1.5px",
                }}
              >
                LOAD MORE ({filtered.length - displayed.length} more)
              </button>
            </div>
          )}

          {displayed.length >= filtered.length && displayed.length > 0 && (
            <p className="text-center mt-8 pb-8" style={{ fontSize: 13, color: MUTED }}>
              — All {filtered.length} products shown —
            </p>
          )}
        </div>
      </div>
    </div>
  );
}