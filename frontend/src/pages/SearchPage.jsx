import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import { useAdminData } from "../Admin/context/Admindatacontext";
import { sortOptions } from "../Data/Navdata";

const GOLD       = "#C9A96E";
const GOLD_LIGHT = "#F5EDD9";
const GOLD_DARK  = "#A07840";
const CHARCOAL   = "#1A1A1A";
const MUTED      = "#6B6560";
const BORDER     = "#EDE8E0";

function Stars({ rating }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
      {[1,2,3,4,5].map(s => (
        <svg key={s} width="11" height="11" viewBox="0 0 24 24"
          fill={s <= Math.round(rating) ? GOLD : "#e0d8cc"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
      <span style={{ fontSize: 11, color: MUTED, marginLeft: 3 }}>{rating}</span>
    </div>
  );
}

function ProductCard({ p }) {
  const [wished, setWished] = useState(false);
  const [hov, setHov]       = useState(false);

  // ✅ Admin products ka image structure handle karo
  const img = p.colorVariants?.[0]?.images?.[0];
  const imgSrc = img
    ? (typeof img === "string" ? img : img.src || img.url || "")
    : (p.img || "");

  const pid = String(p._id || p.id || "");

  return (
    <Link to={`/product/${pid}`}
      style={{ textDecoration: "none" }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div style={{
        background: "#fff",
        border: `1px solid ${hov ? GOLD : BORDER}`,
        borderRadius: 8,
        overflow: "hidden",
        transform: hov ? "translateY(-3px)" : "none",
        boxShadow: hov ? "0 8px 24px rgba(201,169,110,0.14)" : "none",
        transition: "all 0.2s ease",
      }}>
        <div style={{ position: "relative" }}>
          {imgSrc ? (
            <img src={imgSrc} alt={p.title}
              style={{ width: "100%", height: 260, objectFit: "cover", display: "block" }}
              onError={e => e.target.style.opacity = "0"}
            />
          ) : (
            <div style={{ width: "100%", height: 260, background: GOLD_LIGHT, display: "flex", alignItems: "center", justifyContent: "center", color: MUTED, fontSize: 12 }}>
              No Image
            </div>
          )}
          {p.mrp > p.price && (
            <div style={{ position: "absolute", top: 8, left: 8, background: GOLD, color: "#fff", fontSize: 10, fontWeight: 800, padding: "2px 7px", borderRadius: 3 }}>
              {Math.round((1 - p.price / p.mrp) * 100)}% OFF
            </div>
          )}
          <button
            onClick={e => { e.preventDefault(); e.stopPropagation(); setWished(!wished); }}
            style={{ position: "absolute", top: 8, right: 8, width: 28, height: 28, borderRadius: "50%", background: "rgba(255,255,255,0.92)", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: wished ? "#ff4d4f" : "#bbb" }}>
            <FiHeart fill={wished ? "currentColor" : "none"} size={14} />
          </button>
        </div>
        <div style={{ padding: "10px 12px 14px" }}>
          <p style={{ fontSize: 12, color: CHARCOAL, fontWeight: 500, marginBottom: 6, lineHeight: 1.4, height: 32, overflow: "hidden" }}>{p.title}</p>
          <Stars rating={p.rating || 4} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: CHARCOAL }}>₹{p.price}</span>
            {p.mrp > p.price && <span style={{ fontSize: 11, color: MUTED, textDecoration: "line-through" }}>₹{p.mrp}</span>}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [sort, setSort]       = useState("Relevance");
  const [showSort, setShowSort] = useState(false);

  // ✅ Admin se real products lo
  const { products } = useAdminData();

  const results = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase().trim();

    let list = products.filter(p => {
      if (!p.active) return false; // inactive products mat dikhao
      return (
        p.title?.toLowerCase().includes(q)     ||
        p.brand?.toLowerCase().includes(q)     ||
        p.fabric?.toLowerCase().includes(q)    ||
        p.pattern?.toLowerCase().includes(q)   ||
        p.occasion?.toLowerCase().includes(q)  ||
        p.navName?.toLowerCase().includes(q)   ||
        p.colTitle?.toLowerCase().includes(q)  ||
        p.description?.toLowerCase().includes(q)
      );
    });

    // Sort
    switch (sort) {
      case "Price: Low to High": list = [...list].sort((a,b) => a.price - b.price); break;
      case "Price: High to Low": list = [...list].sort((a,b) => b.price - a.price); break;
      case "Customer Rating":    list = [...list].sort((a,b) => (b.rating||0) - (a.rating||0)); break;
      default: break;
    }

    return list;
  }, [query, sort, products]);

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f1" }}>
      {/* Breadcrumb */}
      <div style={{ background: "#fff", borderBottom: `1px solid ${BORDER}`, padding: "10px 32px", display: "flex", alignItems: "center", gap: 8 }}>
        <Link to="/" style={{ color: MUTED, fontSize: 13, textDecoration: "none", display: "flex", alignItems: "center", gap: 4 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Home
        </Link>
        <span style={{ color: "#ccc" }}>/</span>
        <span style={{ fontSize: 13, fontWeight: 600, color: GOLD_DARK }}>Search Results</span>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: CHARCOAL, fontFamily: "Georgia, serif" }}>
              Results for "{query}"
            </h1>
            <p style={{ fontSize: 14, color: MUTED, marginTop: 4 }}>
              {results.length} result{results.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {/* Sort dropdown */}
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowSort(!showSort)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 16px", border: `1px solid ${BORDER}`, background: "#fff", borderRadius: 6, fontSize: 12, fontWeight: 600, color: CHARCOAL, cursor: "pointer", fontFamily: "inherit" }}>
              Sort: <span style={{ color: GOLD_DARK }}>{sort}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {showSort && (
              <div style={{ position: "absolute", right: 0, top: "calc(100% + 4px)", background: "#fff", border: `1px solid ${BORDER}`, borderRadius: 8, boxShadow: "0 8px 28px rgba(0,0,0,0.1)", minWidth: 210, zIndex: 50, overflow: "hidden" }}>
                {sortOptions.map(s => (
                  <button key={s} onClick={() => { setSort(s); setShowSort(false); }}
                    style={{ display: "block", width: "100%", textAlign: "left", padding: "11px 16px", border: "none", cursor: "pointer", fontSize: 13, background: s === sort ? GOLD_LIGHT : "#fff", color: s === sort ? GOLD_DARK : MUTED, fontFamily: "inherit" }}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Results */}
        {results.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke={BORDER} strokeWidth="1.5" style={{ display: "block", margin: "0 auto 16px" }}>
              <path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <p style={{ fontSize: 18, fontWeight: 600, color: CHARCOAL, marginBottom: 6 }}>No products found</p>
            <p style={{ fontSize: 14, color: MUTED, marginBottom: 24 }}>
              "{query}" ke liye koi product nahi mila. Kuch aur try karein.
            </p>
            <Link to="/" style={{ display: "inline-block", padding: "12px 32px", background: GOLD, color: "#fff", textDecoration: "none", borderRadius: 6, fontWeight: 700, fontSize: 13 }}>
              Back to Shopping
            </Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
            {results.map(p => (
              <ProductCard key={String(p._id || p.id)} p={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}