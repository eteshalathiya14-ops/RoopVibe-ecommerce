/**
 * CategoryBar.jsx — USER SIDE (Homepage)
 * - Fetches categories from backend via AdminDataContext or direct API
 * - Gender tabs: WOMEN / MEN / GIRLS / BOYS + any custom tabs added by admin
 * - FIX: clicking a category image navigates to its link correctly
 * - FIX: shows all gender tabs that exist in DB (dynamic, not hardcoded)
 */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { fetchActiveCategoriesGrouped } from "../Api/HomepageApi"; // adjust path as needed

const GOLD       = "#C9A96E";
const GOLD_DARK  = "#A07840";
const GOLD_LIGHT = "#F5EDD9";
const CHARCOAL   = "#1A1A1A";
const MUTED      = "#6B6560";
const BORDER     = "#EDE8E0";
const SURFACE    = "#FAF7F2";

// Default tab order — DB tabs are merged and unknown ones appended
const TAB_ORDER = ["WOMEN", "MEN", "GIRLS", "BOYS", "KIDS"];

export default function CategoryBar() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState({});
  const [selectedGender, setSelectedGender] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActiveCategoriesGrouped()
      .then(data => {
        setCategories(data || {});
        // Auto-select first available tab
        const keys = Object.keys(data || {});
        if (keys.length > 0) {
          // Prefer WOMEN if it exists
          const first = TAB_ORDER.find(t => keys.includes(t)) || keys[0];
          setSelectedGender(first);
        }
      })
      .catch(err => {
        console.error("CategoryBar fetch error:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Sorted gender tabs: known ones first in TAB_ORDER, then extras
  const dbGenders  = Object.keys(categories);
  const knownFirst = TAB_ORDER.filter(t => dbGenders.includes(t));
  const extras     = dbGenders.filter(t => !TAB_ORDER.includes(t));
  const genders    = [...knownFirst, ...extras];

  const items = [...(categories[selectedGender] || [])]
    .filter(c => c.active)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // FIX: navigate to the link stored in the category
  // Links are stored as full paths like /category/women/sarees
  const handleCategoryClick = (item) => {
    if (item.isMy) {
      // MY FEED — no navigation or custom logic
      return;
    }
    if (item.link) {
      navigate(item.link);
    }
  };

  if (loading) {
    return (
      <div style={{ padding:"20px 0", background:"#fff" }}>
        <div style={{ display:"flex", gap:12, padding:"0 16px", overflowX:"auto" }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} style={{ flexShrink:0, width:72, display:"flex", flexDirection:"column", alignItems:"center", gap:8 }}>
              <div style={{ width:64, height:78, borderRadius:"32px 32px 6px 6px", background:"#f0ece6", animation:"pulse 1.5s ease-in-out infinite" }}/>
              <div style={{ width:50, height:10, borderRadius:4, background:"#f0ece6" }}/>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (genders.length === 0) return null;

  return (
    <div style={{ background:"#fff", borderBottom:`1px solid ${BORDER}` }}>
      {/* Gender tabs */}
      <div style={{ display:"flex", gap:0, padding:"0 16px", borderBottom:`1px solid ${BORDER}`, overflowX:"auto" }}>
        {genders.map(g => (
          <button
            key={g}
            onClick={() => setSelectedGender(g)}
            style={{
              padding:"10px 18px",
              fontSize:12,
              fontWeight: selectedGender === g ? 700 : 500,
              cursor:"pointer",
              fontFamily:"inherit",
              background:"transparent",
              border:"none",
              borderBottom: selectedGender === g ? `2.5px solid ${GOLD}` : "2.5px solid transparent",
              color: selectedGender === g ? GOLD_DARK : MUTED,
              letterSpacing:"0.5px",
              whiteSpace:"nowrap",
              transition:"all 0.15s",
            }}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Category images row */}
      <div
        style={{
          display:"flex",
          gap:8,
          padding:"16px 16px",
          overflowX:"auto",
          scrollbarWidth:"none",
          msOverflowStyle:"none",
        }}
      >
        {items.map(cat => {
          const imgSrc = typeof cat.img === "string" ? cat.img : "";
          const catId  = cat.id || cat._id;
          const isClickable = cat.isMy || !!cat.link;

          return (
            <div
              key={catId}
              onClick={() => handleCategoryClick(cat)}
              style={{
                flexShrink:0,
                display:"flex",
                flexDirection:"column",
                alignItems:"center",
                gap:8,
                cursor: isClickable ? "pointer" : "default",
                userSelect:"none",
                minWidth:72,
              }}
            >
              {/* Arch shaped image */}
              {cat.isMy ? (
                <div style={{
                  width:68, height:84,
                  borderRadius:"34px 34px 8px 8px",
                  background:`linear-gradient(135deg, ${GOLD_LIGHT}, ${GOLD}33)`,
                  border:`2px solid ${GOLD}`,
                  display:"flex",
                  alignItems:"center",
                  justifyContent:"center",
                  flexShrink:0,
                }}>
                  <span style={{ fontSize:13, fontWeight:800, color:GOLD_DARK }}>MY</span>
                </div>
              ) : (
                <div style={{
                  width:68, height:84,
                  borderRadius:"34px 34px 8px 8px",
                  overflow:"hidden",
                  border:`1.5px solid ${BORDER}`,
                  background:SURFACE,
                  flexShrink:0,
                  transition:"border-color 0.15s, transform 0.15s",
                }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = GOLD;
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = BORDER;
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={cat.label}
                      style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top" }}
                      onError={e => { e.target.style.opacity = "0"; }}
                    />
                  ) : (
                    <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center",
                      justifyContent:"center", background:"#f5f0eb" }}>
                      <span style={{ fontSize:18 }}>👗</span>
                    </div>
                  )}
                </div>
              )}

              {/* Label */}
              <span style={{
                fontSize:10,
                fontWeight:600,
                color: CHARCOAL,
                letterSpacing:"0.4px",
                textAlign:"center",
                maxWidth:72,
                overflow:"hidden",
                textOverflow:"ellipsis",
                whiteSpace:"nowrap",
              }}>
                {cat.label}
              </span>
            </div>
          );
        })}
      </div>

      <style>{`
        div::-webkit-scrollbar { display: none; }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}