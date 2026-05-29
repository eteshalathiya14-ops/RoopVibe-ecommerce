// src/pages/CategoryPage.jsx
import { useState, useMemo, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from 'react-router-dom';
import { mockProducts, filterGroups, sortOptions } from "../Data/Navdata";
import { getCategoryByParams } from '../utils/categoryIndex';
import { getFilteredProducts } from '../utils/productMatcher';
import { FiHeart, FiX, FiChevronDown, FiChevronUp, FiFilter, FiSliders } from "react-icons/fi";

// ── THEME ──────────────────────────────────────────────────────
const GOLD       = "#C9A96E";
const GOLD_LIGHT = "#F5EDD9";
const GOLD_DARK  = "#A07840";
const CHARCOAL   = "#1A1A1A";
const MUTED      = "#6B6560";
const BORDER     = "#EDE8E0";
const SURFACE    = "#F5F3EE";

// ── MOBILE HOOK ────────────────────────────────────────────────
function useIsMobile() {
  const [m, setM] = useState(() => window.innerWidth <= 768);
  useEffect(() => {
    const fn = () => setM(window.innerWidth <= 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return m;
}

// ── STAR RATING ────────────────────────────────────────────────
function Stars({ rating }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:2 }}>
      {[1,2,3,4,5].map(s => (
        <svg key={s} width="10" height="10" viewBox="0 0 24 24"
          fill={s <= Math.round(rating) ? GOLD : "#e0d8cc"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
      <span style={{ fontSize:10, color:MUTED, marginLeft:2 }}>{rating}</span>
    </div>
  );
}

// ── PRODUCT CARD ───────────────────────────────────────────────
function ProductCard({ p, isMobile }) {
  const [wished, setWished] = useState(false);
  const [hov, setHov]       = useState(false);
  const imgH = isMobile ? 200 : 260;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "#fff",
        borderRadius: 8,
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.2s",
        border: `1px solid ${hov ? GOLD : BORDER}`,
        transform: hov ? "translateY(-2px)" : "none",
        boxShadow: hov ? "0 8px 24px rgba(201,169,110,0.14)" : "none",
      }}
    >
      <div style={{ position:"relative" }}>
        <img
          src={p.img} alt={p.title}
          style={{ width:"100%", height:imgH, objectFit:"cover", display:"block" }}
        />
        <div style={{
          position:"absolute", top:8, left:8,
          background: GOLD, color:"#fff",
          fontSize:9, fontWeight:800,
          padding:"2px 6px", borderRadius:3,
        }}>
          {p.disc}% OFF
        </div>
        <button
          onClick={e => { e.stopPropagation(); setWished(!wished); }}
          style={{
            position:"absolute", top:6, right:6,
            width:28, height:28, borderRadius:"50%",
            background:"rgba(255,255,255,0.92)",
            border:"none", cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center",
            color: wished ? "#ff4d4f" : "#bbb",
          }}
        >
          <FiHeart fill={wished ? "currentColor" : "none"} size={13} />
        </button>
        {/* Seller tag */}
        <div style={{
          position:"absolute", bottom:6, left:6,
          display:"flex", alignItems:"center", gap:4,
        }}>
          <div style={{
            width:18, height:18, borderRadius:"50%",
            background: GOLD_LIGHT, border:`1px solid ${GOLD}`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:7, fontWeight:800, color:GOLD_DARK,
          }}>
            {p.by?.charAt(0)}
          </div>
          <span style={{
            fontSize:9, color:"#fff", fontWeight:600,
            textShadow:"0 1px 3px rgba(0,0,0,0.6)",
          }}>
            By {p.by}
          </span>
        </div>
      </div>

      <div style={{ padding: isMobile ? "8px 10px" : "10px 12px" }}>
        <p style={{
          fontSize: isMobile ? 11 : 12,
          color: CHARCOAL, fontWeight:500,
          marginBottom:4, lineHeight:1.3,
          display:"-webkit-box", WebkitLineClamp:2,
          WebkitBoxOrient:"vertical", overflow:"hidden",
        }}>
          {p.title}
        </p>
        <Stars rating={p.rating} />
        <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:4 }}>
          <span style={{ fontSize: isMobile ? 13:14, fontWeight:800, color:CHARCOAL }}>₹{p.price}</span>
          <span style={{ fontSize:10, color:MUTED, textDecoration:"line-through" }}>₹{p.mrp}</span>
          <span style={{ fontSize:10, color:"#2e7d32", fontWeight:700 }}>{p.disc}%</span>
        </div>
      </div>
    </div>
  );
}

// ── FILTER SECTION (desktop sidebar) ──────────────────────────
function FilterSection({ group, filters, onToggle }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ paddingBottom:16, marginBottom:16, borderBottom:`1px solid ${BORDER}` }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          width:"100%", display:"flex", justifyContent:"space-between",
          alignItems:"center", background:"transparent", border:"none",
          cursor:"pointer", padding:"4px 0",
        }}
      >
        <span style={{ fontSize:12, fontWeight:700, color:CHARCOAL, letterSpacing:"0.5px" }}>
          {group.label}
        </span>
        {open ? <FiChevronUp size={14} color={MUTED}/> : <FiChevronDown size={14} color={MUTED}/>}
      </button>

      {open && (
        <div style={{ marginTop:10 }}>
          {group.type === "color" && (
            <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
              {group.options.map(opt => {
                const sel = (filters.colors||[]).includes(opt.name);
                return (
                  <div key={opt.name} onClick={()=>onToggle("colors",opt.name)}
                    style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:3, cursor:"pointer" }}>
                    <div style={{
                      width:24, height:24, borderRadius:"50%", background:opt.hex,
                      border: sel ? `3px solid ${GOLD}` : `2px solid ${opt.border?"#ccc":"transparent"}`,
                      boxShadow:"0 1px 4px rgba(0,0,0,0.15)",
                    }}/>
                    <span style={{ fontSize:8, color:MUTED, maxWidth:30, textAlign:"center" }}>{opt.name}</span>
                  </div>
                );
              })}
            </div>
          )}
          {group.type === "radio" && (
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {group.options.map(opt => {
                const sel = filters[group.key] === opt.label;
                return (
                  <label key={opt.label} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
                    <div onClick={()=>onToggle(group.key,opt.label)}
                      style={{ width:15, height:15, borderRadius:"50%", flexShrink:0, cursor:"pointer", border:`2px solid ${sel?GOLD:"#bbb"}`, background: sel?GOLD:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {sel && <div style={{ width:5, height:5, borderRadius:"50%", background:"#fff" }}/>}
                    </div>
                    <span style={{ fontSize:12, color:MUTED }}>{opt.label}</span>
                  </label>
                );
              })}
            </div>
          )}
          {group.type === "checkbox" && (
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {group.options.map(opt => {
                const sel = (filters[group.key]||[]).includes(opt);
                return (
                  <label key={opt} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
                    <div onClick={()=>onToggle(group.key,opt)}
                      style={{ width:15, height:15, borderRadius:3, flexShrink:0, cursor:"pointer", border:`1.5px solid ${sel?GOLD:"#bbb"}`, background: sel?GOLD:"#fff", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {sel && <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><polyline points="1.5,6 4.5,9 10.5,3" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>}
                    </div>
                    <span style={{ fontSize:12, color:MUTED }}>{opt}</span>
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

// ── MOBILE BOTTOM SHEET — Filter ──────────────────────────────
function MobileFilterSheet({ open, onClose, filters, onToggle, onClear, activeCount }) {
  if (!open) return null;
  const [activeGroup, setActiveGroup] = useState(filterGroups[0].key);
  const group = filterGroups.find(g => g.key === activeGroup) || filterGroups[0];

  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, backgroundColor:"rgba(0,0,0,0.45)", zIndex:1200 }}/>
      <div style={{
        position:"fixed", bottom:0, left:0, right:0,
        height:"85vh",
        backgroundColor:"#fff",
        borderRadius:"16px 16px 0 0",
        zIndex:1300,
        display:"flex", flexDirection:"column",
        overflow:"hidden",
      }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 16px 12px", borderBottom:`1px solid ${BORDER}`, flexShrink:0 }}>
          <span style={{ fontSize:15, fontWeight:800, color:CHARCOAL }}>
            Filters {activeCount > 0 && <span style={{ fontSize:11, color:"#fff", backgroundColor:GOLD, padding:"1px 7px", borderRadius:20, marginLeft:6 }}>{activeCount}</span>}
          </span>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", display:"flex" }}><FiX size={22} color={MUTED}/></button>
        </div>

        {/* Two-panel: left = filter categories, right = options */}
        <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
          {/* Left */}
          <div style={{ width:120, backgroundColor:SURFACE, overflowY:"auto", flexShrink:0, scrollbarWidth:"none" }}>
            {filterGroups.map(g => (
              <button key={g.key} onClick={() => setActiveGroup(g.key)}
                style={{
                  width:"100%", padding:"13px 10px", background: activeGroup===g.key ? "#fff":"transparent",
                  border:"none", borderLeft:`3px solid ${activeGroup===g.key ? GOLD:"transparent"}`,
                  cursor:"pointer", textAlign:"left",
                  fontSize:11, fontWeight: activeGroup===g.key ? 700:500,
                  color: activeGroup===g.key ? GOLD_DARK : MUTED,
                  lineHeight:1.3,
                }}>
                {g.label}
                {/* dot if any selected */}
                {((filters[g.key] && (Array.isArray(filters[g.key]) ? filters[g.key].length > 0 : true))) && (
                  <span style={{ display:"inline-block", width:6, height:6, borderRadius:"50%", backgroundColor:GOLD, marginLeft:4, verticalAlign:"middle" }}/>
                )}
              </button>
            ))}
          </div>

          {/* Right */}
          <div style={{ flex:1, overflowY:"auto", padding:"12px 14px", scrollbarWidth:"none" }}>
            <p style={{ fontSize:10, fontWeight:800, color:GOLD_DARK, letterSpacing:"0.8px", marginBottom:14 }}>
              {group.label}
            </p>

            {group.type === "color" && (
              <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
                {group.options.map(opt => {
                  const sel = (filters.colors||[]).includes(opt.name);
                  return (
                    <div key={opt.name} onClick={()=>onToggle("colors",opt.name)}
                      style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, cursor:"pointer" }}>
                      <div style={{
                        width:32, height:32, borderRadius:"50%", background:opt.hex,
                        border: sel ? `3px solid ${GOLD}` : `2px solid ${opt.border?"#ccc":"transparent"}`,
                        boxShadow: sel ? `0 0 0 2px ${GOLD_LIGHT}` : "0 1px 4px rgba(0,0,0,0.15)",
                      }}/>
                      <span style={{ fontSize:9, color: sel ? GOLD_DARK : MUTED, fontWeight: sel?700:400, textAlign:"center", maxWidth:36 }}>{opt.name}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {group.type === "radio" && (
              <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
                {group.options.map(opt => {
                  const sel = filters[group.key] === opt.label;
                  return (
                    <button key={opt.label} onClick={()=>onToggle(group.key,opt.label)}
                      style={{
                        display:"flex", alignItems:"center", justifyContent:"space-between",
                        padding:"12px 4px", background:"none", border:"none",
                        borderBottom:`1px solid ${BORDER}44`, cursor:"pointer",
                      }}>
                      <span style={{ fontSize:13, color: sel ? CHARCOAL : MUTED, fontWeight: sel?700:400 }}>{opt.label}</span>
                      <div style={{ width:18, height:18, borderRadius:"50%", border:`2px solid ${sel?GOLD:"#ccc"}`, background: sel?GOLD:"#fff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        {sel && <div style={{ width:6, height:6, borderRadius:"50%", background:"#fff" }}/>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {group.type === "checkbox" && (
              <div style={{ display:"flex", flexDirection:"column", gap:0 }}>
                {group.options.map(opt => {
                  const sel = (filters[group.key]||[]).includes(opt);
                  return (
                    <button key={opt} onClick={()=>onToggle(group.key,opt)}
                      style={{
                        display:"flex", alignItems:"center", justifyContent:"space-between",
                        padding:"12px 4px", background:"none", border:"none",
                        borderBottom:`1px solid ${BORDER}44`, cursor:"pointer",
                      }}>
                      <span style={{ fontSize:13, color: sel ? CHARCOAL : MUTED, fontWeight: sel?700:400 }}>{opt}</span>
                      <div style={{ width:18, height:18, borderRadius:4, border:`1.5px solid ${sel?GOLD:"#ccc"}`, background: sel?GOLD:"#fff", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                        {sel && <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><polyline points="1.5,6 4.5,9 10.5,3" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/></svg>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer buttons */}
        <div style={{ display:"flex", gap:12, padding:"12px 16px", borderTop:`1px solid ${BORDER}`, flexShrink:0, paddingBottom:"max(12px, env(safe-area-inset-bottom))" }}>
          <button onClick={onClear}
            style={{ flex:1, padding:"13px", background:"#fff", border:`1.5px solid ${BORDER}`, borderRadius:10, fontWeight:700, fontSize:13, cursor:"pointer", color:MUTED }}>
            Clear All
          </button>
          <button onClick={onClose}
            style={{ flex:1, padding:"13px", background:`linear-gradient(to right,${GOLD_DARK},${GOLD})`, border:"none", borderRadius:10, fontWeight:800, fontSize:13, cursor:"pointer", color:"#fff" }}>
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
}

// ── MOBILE BOTTOM SHEET — Sort ─────────────────────────────────
function MobileSortSheet({ open, onClose, sort, onSort }) {
  if (!open) return null;
  return (
    <>
      <div onClick={onClose} style={{ position:"fixed", inset:0, backgroundColor:"rgba(0,0,0,0.45)", zIndex:1200 }}/>
      <div style={{
        position:"fixed", bottom:0, left:0, right:0,
        backgroundColor:"#fff",
        borderRadius:"16px 16px 0 0",
        zIndex:1300,
        overflow:"hidden",
      }}>
        <div style={{ padding:"16px 16px 12px", borderBottom:`1px solid ${BORDER}` }}>
          <span style={{ fontSize:15, fontWeight:800, color:CHARCOAL }}>Sort By</span>
        </div>
        {sortOptions.map(s => (
          <button key={s} onClick={() => { onSort(s); onClose(); }}
            style={{
              width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"14px 16px", background: s===sort ? GOLD_LIGHT : "#fff",
              border:"none", borderBottom:`1px solid ${BORDER}44`, cursor:"pointer",
            }}>
            <span style={{ fontSize:13, fontWeight: s===sort ? 700:400, color: s===sort ? GOLD_DARK : CHARCOAL }}>{s}</span>
            {s===sort && (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={GOLD} strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
            )}
          </button>
        ))}
        <div style={{ height:"max(8px, env(safe-area-inset-bottom))" }}/>
      </div>
    </>
  );
}

// ── MAIN PAGE ──────────────────────────────────────────────────
export default function CategoryPage() {
  const isMobile = useIsMobile();
  const { gender, subcategory } = useParams();
  const resolved = getCategoryByParams(gender || '', subcategory || '');

  const category   = resolved?.subcategory || '';
  const genderLabel = resolved?.gender || (gender || '').toUpperCase();

  const baseList = useMemo(
    () => getFilteredProducts(genderLabel, category),
    [genderLabel, category]
  );

  const [sort,       setSort]       = useState("Relevance");
  const [showSort,   setShowSort]   = useState(false);
  const [filters,    setFilters]    = useState({});
  const [showMobFilter, setShowMobFilter] = useState(false);
  const [showMobSort,   setShowMobSort]   = useState(false);
  const [page,       setPage]       = useState(1);
  const PER_PAGE = 16;

  const handleToggle = (key, value) => {
    setFilters(prev => {
      if (key === "price" || key === "disc") {
        return { ...prev, [key]: prev[key] === value ? undefined : value };
      }
      const arr = prev[key] || [];
      return { ...prev, [key]: arr.includes(value) ? arr.filter(v=>v!==value) : [...arr, value] };
    });
    setPage(1);
  };

  const clearAll = () => { setFilters({}); setPage(1); };

  const activeFilterCount = Object.values(filters).filter(v =>
    v !== undefined && (Array.isArray(v) ? v.length > 0 : true)
  ).length;

  const filtered = useMemo(() => {
    let list = Array.isArray(baseList) ? [...baseList] : [...mockProducts];
    if (filters.price) {
      const opt = filterGroups.find(g=>g.key==="price")?.options.find(o=>o.label===filters.price);
      if (opt) list = list.filter(p => p.price >= opt.min && p.price <= opt.max);
    }
    if (filters.disc) {
      const opt = filterGroups.find(g=>g.key==="disc")?.options.find(o=>o.label===filters.disc);
      if (opt) list = list.filter(p => p.disc >= opt.min);
    }
    if (filters.sizes?.length)   list = list.filter(p => filters.sizes.some(s=>p.sizes?.includes(s)));
    if (filters.colors?.length)  list = list.filter(p => filters.colors.some(c=>p.colors?.includes(c)));
    if (filters.pattern?.length) list = list.filter(p => filters.pattern.includes(p.pattern));
    if (filters.fabric?.length)  list = list.filter(p => filters.fabric.includes(p.fabric));
    if (filters.occasion?.length)list = list.filter(p => filters.occasion.includes(p.occasion));

    switch (sort) {
      case "Price: Low to High":  list.sort((a,b)=>a.price-b.price); break;
      case "Price: High to Low":  list.sort((a,b)=>b.price-a.price); break;
      case "Better Discount":     list.sort((a,b)=>b.disc-a.disc);   break;
      case "Customer Rating":     list.sort((a,b)=>b.rating-a.rating); break;
      default: break;
    }
    return list;
  }, [filters, sort, baseList]);

  const displayed = filtered.slice(0, page * PER_PAGE);

  const cols = isMobile ? 2 : 4;

  return (
    <div style={{ backgroundColor:SURFACE, minHeight:"100vh" }}>

      {/* ── BREADCRUMB ── */}
      <div style={{
        background:"#fff", borderBottom:`1px solid ${BORDER}`,
        padding: isMobile ? "8px 12px" : "10px 32px",
        display:"flex", alignItems:"center", gap:6,
        overflowX:"auto", scrollbarWidth:"none", whiteSpace:"nowrap",
      }}>
        <Link to="/" style={{ color:MUTED, fontSize:12, textDecoration:"none", display:"flex", alignItems:"center", gap:4 }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Home
        </Link>
        <span style={{ color:"#ccc" }}>/</span>
        <span style={{ color:MUTED, fontSize:12 }}>{genderLabel}</span>
        <span style={{ color:"#ccc" }}>/</span>
        <span style={{ fontSize:12, fontWeight:700, color:GOLD_DARK }}>{category || "All Products"}</span>
      </div>

      <div style={{ display:"flex", maxWidth:1400, margin:"0 auto" }}>

        {/* ── DESKTOP SIDEBAR ── */}
        {!isMobile && (
          <aside style={{
            width:230, flexShrink:0,
            backgroundColor:"#fff",
            borderRight:`1px solid ${BORDER}`,
            padding:"20px 16px",
            position:"sticky", top:68, alignSelf:"flex-start",
            maxHeight:"calc(100vh - 68px)", overflowY:"auto",
          }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <span style={{ fontSize:13, fontWeight:800, color:CHARCOAL, letterSpacing:"0.5px" }}>
                FILTERS
                {activeFilterCount > 0 && (
                  <span style={{ marginLeft:8, fontSize:10, color:"#fff", backgroundColor:GOLD, padding:"1px 6px", borderRadius:20 }}>
                    {activeFilterCount}
                  </span>
                )}
              </span>
              {activeFilterCount > 0 && (
                <button onClick={clearAll} style={{ background:"transparent", border:"none", cursor:"pointer", fontSize:11, color:GOLD_DARK, fontWeight:700, textDecoration:"underline" }}>
                  CLEAR ALL
                </button>
              )}
            </div>
            {filterGroups.map(g => (
              <FilterSection key={g.key} group={g} filters={filters} onToggle={handleToggle} />
            ))}
          </aside>
        )}

        {/* ── PRODUCTS AREA ── */}
        <div style={{ flex:1, padding: isMobile ? "0 0 80px" : "20px 24px" }}>

          {/* ── MOBILE: Sticky filter+sort bar ── */}
          {isMobile && (
            <div style={{
              position:"sticky", top:52, zIndex:50,
              backgroundColor:"#fff",
              borderBottom:`1px solid ${BORDER}`,
              display:"flex",
              boxShadow:"0 2px 8px rgba(0,0,0,0.05)",
            }}>
              {/* Filter button */}
              <button
                onClick={() => setShowMobFilter(true)}
                style={{
                  flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                  padding:"11px 0",
                  background:"none", border:"none", borderRight:`1px solid ${BORDER}`,
                  cursor:"pointer", fontSize:12, fontWeight:700,
                  color: activeFilterCount > 0 ? GOLD_DARK : CHARCOAL,
                }}
              >
                <FiSliders size={14} />
                FILTER
                {activeFilterCount > 0 && (
                  <span style={{ backgroundColor:GOLD, color:"#fff", fontSize:9, fontWeight:800, padding:"1px 5px", borderRadius:10 }}>
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Sort button */}
              <button
                onClick={() => setShowMobSort(true)}
                style={{
                  flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                  padding:"11px 0",
                  background:"none", border:"none",
                  cursor:"pointer", fontSize:12, fontWeight:700, color:CHARCOAL,
                }}
              >
                <FiFilter size={14} />
                SORT
                {sort !== "Relevance" && (
                  <span style={{ fontSize:10, color:GOLD_DARK, fontWeight:700 }}>•</span>
                )}
              </button>
            </div>
          )}

          {/* ── DESKTOP: Top bar ── */}
          {!isMobile && (
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <div>
                <h2 style={{ fontSize:20, fontWeight:700, color:CHARCOAL, fontFamily:"Georgia,serif" }}>{category}</h2>
                <p style={{ fontSize:12, color:MUTED, marginTop:2 }}>{filtered.length} Products Found</p>
              </div>
              <div style={{ position:"relative" }}>
                <button onClick={()=>setShowSort(!showSort)}
                  style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 16px", border:`1px solid ${BORDER}`, background:"#fff", fontSize:12, fontWeight:600, color:CHARCOAL, cursor:"pointer", borderRadius:6 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="14" y2="12"/><line x1="4" y1="18" x2="10" y2="18"/></svg>
                  Sort: <span style={{ color:GOLD_DARK }}>{sort}</span>
                  <FiChevronDown size={12} color={MUTED}/>
                </button>
                {showSort && (
                  <div style={{ position:"absolute", right:0, top:"calc(100% + 4px)", backgroundColor:"#fff", border:`1px solid ${BORDER}`, boxShadow:"0 8px 28px rgba(0,0,0,0.10)", zIndex:50, minWidth:210, borderRadius:8, overflow:"hidden" }}>
                    {sortOptions.map(s => (
                      <button key={s} onClick={()=>{setSort(s);setShowSort(false);}}
                        style={{ display:"block", width:"100%", textAlign:"left", padding:"10px 18px", fontSize:13, background: s===sort ? GOLD_LIGHT : "#fff", color: s===sort ? GOLD_DARK : MUTED, fontWeight: s===sort ? 700:400, border:"none", cursor:"pointer" }}>
                        {s===sort && "✓ "}{s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Mobile: count + active chips */}
          {isMobile && (
            <div style={{ padding:"10px 12px 8px", backgroundColor:SURFACE }}>
              <p style={{ fontSize:11, color:MUTED, marginBottom: activeFilterCount > 0 ? 8 : 0 }}>
                <span style={{ fontWeight:700, color:CHARCOAL }}>{category}</span> — {filtered.length} products
              </p>
              {activeFilterCount > 0 && (
                <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
                  {Object.entries(filters).map(([key,val]) => {
                    if (!val || (Array.isArray(val) && !val.length)) return null;
                    const vals = Array.isArray(val) ? val : [val];
                    return vals.map(v => (
                      <span key={`${key}-${v}`}
                        onClick={() => handleToggle(key, v)}
                        style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 10px", borderRadius:20, fontSize:10, fontWeight:700, backgroundColor:GOLD_LIGHT, color:GOLD_DARK, border:`1px solid ${GOLD}`, cursor:"pointer" }}>
                        {v} <FiX size={9}/>
                      </span>
                    ));
                  })}
                  <span onClick={clearAll} style={{ display:"flex", alignItems:"center", gap:4, padding:"4px 10px", borderRadius:20, fontSize:10, fontWeight:700, backgroundColor:"#fff", color:MUTED, border:`1px solid ${BORDER}`, cursor:"pointer" }}>
                    Clear all
                  </span>
                </div>
              )}
            </div>
          )}

          {/* ── PRODUCTS GRID ── */}
          <div style={{ padding: isMobile ? "12px 10px 0" : "0" }}>
            {displayed.length === 0 ? (
              <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"60px 20px", color:MUTED }}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke={BORDER} strokeWidth="1.5"><path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m12-9l2 9M9 21a1 1 0 100-2 1 1 0 000 2zm10 0a1 1 0 100-2 1 1 0 000 2z"/></svg>
                <p style={{ marginTop:16, fontWeight:700, fontSize:15, textAlign:"center" }}>No products found</p>
                <p style={{ marginTop:4, fontSize:12, textAlign:"center" }}>Try removing some filters</p>
                <button onClick={clearAll} style={{ marginTop:16, padding:"10px 24px", border:`1.5px solid ${GOLD}`, background:"transparent", color:GOLD_DARK, fontWeight:700, fontSize:12, borderRadius:8, cursor:"pointer" }}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols},1fr)`, gap: isMobile ? 10 : 18 }}>
                {displayed.map(p => <ProductCard key={p.id} p={p} isMobile={isMobile}/>)}
              </div>
            )}
          </div>

          {/* Load more */}
          {displayed.length < filtered.length && (
            <div style={{ textAlign:"center", padding:"32px 0 16px" }}>
              <button onClick={()=>setPage(p=>p+1)}
                style={{ padding:"12px 40px", border:`1.5px solid ${GOLD}`, background:"transparent", color:GOLD_DARK, fontWeight:700, fontSize:13, letterSpacing:"1px", borderRadius:8, cursor:"pointer" }}>
                LOAD MORE ({filtered.length - displayed.length} more)
              </button>
            </div>
          )}
          {displayed.length >= filtered.length && displayed.length > 0 && (
            <p style={{ textAlign:"center", padding:"24px 0 16px", fontSize:12, color:MUTED }}>
              — All {filtered.length} products shown —
            </p>
          )}
        </div>
      </div>

      {/* ── MOBILE BOTTOM SHEETS ── */}
      <MobileFilterSheet
        open={showMobFilter}
        onClose={() => setShowMobFilter(false)}
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