import { useState, useMemo } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { FiHeart } from "react-icons/fi";
import { searchProducts } from "../utils/productMatcher";
import { sortOptions } from "../Data/Navdata";

// Reuse theme and components from CategoryPage (ideal to extract these to common components)
const GOLD      = "#C9A96E";
const GOLD_LIGHT= "#F5EDD9";
const GOLD_DARK = "#A07840";
const CHARCOAL  = "#1A1A1A";
const MUTED     = "#6B6560";
const BORDER    = "#EDE8E0";

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

function ProductCard({ p }) {
  const [wished, setWished] = useState(false);
  const [hov, setHov]       = useState(false);

  return (
    <Link to={`/product/${p.id}`}
      style={{ textDecoration: 'none' }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="rounded-md overflow-hidden cursor-pointer transition-all duration-200"
    >
      <div
        style={{
          background: "#fff",
          border: `1px solid ${hov ? GOLD : BORDER}`,
          transform: hov ? "translateY(-3px)" : "none",
          boxShadow: hov ? "0 8px 24px rgba(201,169,110,0.14)" : "none",
        }}
      >
        <div className="relative">
          <img src={p.img} alt={p.title} className="w-full object-cover block" style={{ height: 260 }} />
          <div className="absolute top-2 left-2 text-white text-xs font-bold px-2 py-0.5 rounded" style={{ background: GOLD, fontSize: 10 }}>{p.disc}% OFF</div>
          <button onClick={e => { e.preventDefault(); e.stopPropagation(); setWished(!wished); }} className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-sm border-none cursor-pointer" style={{ background: "rgba(255,255,255,0.9)", color: wished ? "#ff4d4f" : "#bbb" }}>
            <FiHeart fill={wished ? "currentColor" : "none"} size={14} />
          </button>
        </div>
        <div className="px-3 py-2.5">
          <p className="font-medium mb-1.5 leading-snug" style={{ fontSize: 12, color: CHARCOAL, height: '32px', overflow: 'hidden' }}>{p.title}</p>
          <Stars rating={p.rating} />
          <div className="flex items-center gap-2 mt-1.5">
            <span className="font-bold" style={{ fontSize: 14, color: CHARCOAL }}>₹{p.price}</span>
            <span className="line-through" style={{ fontSize: 11, color: MUTED }}>₹{p.mrp}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";
  
  const [sort, setSort] = useState("Relevance");
  const [showSort, setShowSort] = useState(false);
  
  const results = useMemo(() => {
    let list = searchProducts(query);
    
    // Sort
    switch (sort) {
      case "Price: Low to High":  list.sort((a,b) => a.price - b.price); break;
      case "Price: High to Low":  list.sort((a,b) => b.price - a.price); break;
      case "Customer Rating":     list.sort((a,b) => b.rating - a.rating); break;
      default: break;
    }
    
    return list;
  }, [query, sort]);

  return (
    <div className="min-h-screen" style={{ background: "#f5f5f1" }}>
      <div className="flex items-center gap-2 px-8 py-3" style={{ background: "#fff", borderBottom: `1px solid ${BORDER}` }}>
        <Link to="/" className="flex items-center gap-1 bg-transparent border-none cursor-pointer" style={{ color: MUTED, fontSize: 13, textDecoration: 'none' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          Home
        </Link>
        <span style={{ color: "#ccc" }}>/</span>
        <span className="font-semibold" style={{ fontSize: 13, color: GOLD_DARK }}>Search Results</span>
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-bold" style={{ fontSize: 24, color: CHARCOAL, fontFamily: "Georgia, serif" }}>
              Results for "{query}"
            </h1>
            <p style={{ fontSize: 14, color: MUTED, marginTop: 4 }}>
              Showing {results.length} results matching your search
            </p>
          </div>

          <div className="relative">
            <button
               onClick={() => setShowSort(!showSort)}
               className="flex items-center gap-2 cursor-pointer rounded"
               style={{ padding: "7px 16px", border: `1px solid ${BORDER}`, background: "#fff", fontSize: 12, fontWeight: 600, color: CHARCOAL }}
            >
               Sort: <span style={{ color: GOLD_DARK }}>{sort}</span>
               <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={MUTED} strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
            </button>
            {showSort && (
              <div className="absolute right-0 rounded-md z-50 overflow-hidden" style={{ top: "calc(100% + 4px)", background: "#fff", border: `1px solid ${BORDER}`, boxShadow: "0 8px 28px rgba(0,0,0,0.1)", minWidth: 210 }}>
                {sortOptions.map(s => (
                  <button key={s} onClick={() => { setSort(s); setShowSort(false); }} className="block w-full text-left border-none cursor-pointer p-3 transition-colors" style={{ fontSize: 13, background: s === sort ? GOLD_LIGHT : "#fff", color: s === sort ? GOLD_DARK : MUTED }}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {results.length === 0 ? (
          <div className="text-center py-24">
            <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke={BORDER} strokeWidth="1.5"><path d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" /></svg>
            <p className="mt-4 font-semibold" style={{ fontSize: 18, color: CHARCOAL }}>No products found</p>
            <p className="mt-1" style={{ fontSize: 14, color: MUTED }}>Try searching for something else like "Kurta" or "Saree"</p>
            <Link to="/" className="inline-block mt-6 px-8 py-3 rounded font-bold" style={{ background: GOLD, color: '#fff', textDecoration: 'none' }}>Back to Shopping</Link>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-6">
            {results.map(p => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </div>
    </div>
  );
}
