// frontend/src/pages/OffersPage.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import {
  FiHeart, FiZap, FiClock, FiTag, FiArrowRight,
  FiChevronLeft, FiChevronRight, FiRefreshCw,
  FiShoppingBag, FiCheck,
} from "react-icons/fi";
import { useMobileLayout } from "../hooks/Usemobilelayout";
import { fetchAllOffers } from "../Api/Offersapi";
import { useAdminData } from "../Admin/context/Admindatacontext";

// ── RoopVibe Design Tokens ────────────────────────────────────
const T = {
  primary:     "#C9A96E",   // RoopVibe Gold
  primaryDark: "#A07840",   // Gold Dark
  primaryBg:   "#F5EDD9",   // Gold Light
  gold:        "#C9A96E",
  goldDark:    "#A07840",
  goldBg:      "#FAF3E7",
  green:       "#2E7D32",
  greenBg:     "#E8F5E9",
  red:         "#D32F2F",
  redBg:       "#FFEBEE",
  charcoal:    "#1A1A1A",
  text:        "#2D2D2D",
  muted:       "#757575",
  light:       "#BDBDBD",
  border:      "#EBEBEB",
  surface:     "#FAF7F2",
  white:       "#FFFFFF",
};

function resolveImg(img) {
  if (!img) return "";
  if (typeof img === "string") return img;
  if (typeof img === "object") return img.src || img.url || "";
  return "";
}

// ── Deal Card ─────────────────────────────────────────────────
function DealCard({ product, isMobile }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isLiked } = useWishlist();
  const [added, setAdded] = useState(false);

  const pid = product._id;
  const liked = isLiked?.(pid);

  const imgs = (product.colorVariants?.[0]?.images || []).map(resolveImg).filter(Boolean);
  const thumb = product.img || product.image || imgs[0] || "";
  const discPercentage = product.disc ?? (product.mrp > 0 ? Math.round((1 - product.price / product.mrp) * 100) : 0);

  const handleAdd = e => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({ 
      id: pid, 
      title: product.title, 
      price: product.price, 
      mrp: product.mrp, 
      img: thumb, 
      quantity: 1 
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div style={{
      background: T.white, borderRadius: 12,
      border: `1px solid ${T.border}`,
      overflow: "hidden", display: "flex", flexDirection: "column",
      transition: "all 0.22s", cursor: "pointer",
      boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
    }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 10px 28px rgba(201,169,110,0.18)";
        e.currentTarget.style.borderColor = T.primary;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "none";
        e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.06)";
        e.currentTarget.style.borderColor = T.border;
      }}>

      <Link to={`/product/${product._id}`} style={{ textDecoration: "none", position: "relative", display: "block" }}>
        <img
          src={thumb}
          alt={product.title}
          loading="lazy"
          style={{ width: "100%", height: isMobile ? 185 : 215, objectFit: "cover", objectPosition: "top", display: "block" }}
          onError={e => { e.target.src = "https://via.placeholder.com/300x380?text=RoopVibe"; }}
        />

        {/* Discount badge */}
        <div style={{
          position: "absolute", top: 8, left: 8,
          background: T.primary, color: "#fff",
          fontSize: 10, fontWeight: 800,
          padding: "3px 9px", borderRadius: 6,
        }}>
          {discPercentage}% OFF
        </div>

        {/* Special badge */}
        {product.badge && (
          <div style={{
            position: "absolute", top: 8, right: 38,
            background: T.gold, color: "#fff",
            fontSize: 8, fontWeight: 800,
            padding: "2px 7px", borderRadius: 4,
          }}>
            {product.badge}
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation(); toggleWishlist({ ...product, id: pid }); }}
          style={{
            position: "absolute", top: 8, right: 8,
            width: 32, height: 32, borderRadius: "50%",
            background: "rgba(255,255,255,0.96)",
            border: "none", display: "flex", alignItems: "center",
            justifyContent: "center", cursor: "pointer",
            boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
            transition: "transform 0.15s",
          }}
          onMouseEnter={e => e.currentTarget.style.transform = "scale(1.18)"}
          onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
          aria-label={liked ? "Remove from wishlist" : "Add to wishlist"}>
          <FiHeart size={14} fill={liked ? T.primary : "none"} color={liked ? T.primary : T.muted} />
        </button>
      </Link>

      <div style={{ padding: "10px 12px 13px", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <p style={{
          fontSize: 12, fontWeight: 600, color: T.text,
          lineHeight: 1.4, marginBottom: 8,
          display: "-webkit-box", WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical", overflow: "hidden",
        }}>
          {product.title}
        </p>

        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
            <div>
              <span style={{ fontSize: 16, fontWeight: 900, color: T.charcoal }}>₹{product.price}</span>
              <span style={{ fontSize: 10, color: T.light, textDecoration: "line-through", marginLeft: 6 }}>₹{product.mrp}</span>
            </div>
          </div>

          <button
            onClick={handleAdd}
            style={{
              width: "100%", padding: isMobile ? "7px" : "9px",
              background: added ? T.green : "#fff",
              color: added ? "#fff" : T.primaryDark,
              border: `1.5px solid ${added ? T.green : T.primary}`,
              borderRadius: 8, fontSize: isMobile ? 10 : 11,
              fontWeight: 700, cursor: "pointer", transition: "all 0.2s",
              display: "flex", alignItems: "center", justifyContent: "center",
              gap: 5, marginTop: 10,
            }}>
            {added ? <><FiCheck size={12}/> Added!</> : <><FiShoppingBag size={12}/> Add to Cart</>}
          </button>

          <div style={{ background: T.greenBg, borderRadius: 5, padding: "3px 9px", display: "inline-block", marginTop: 8 }}>
            <span style={{ fontSize: 10, color: T.green, fontWeight: 800 }}>
              Save ₹{product.mrp - product.price}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Banner Carousel ───────────────────────────────────────────
function BannerCarousel({ banners, isMobile }) {
  const [active, setActive] = useState(0);
  const intervalRef = useRef(null);

  const startAutoPlay = useCallback(() => {
    if (banners.length <= 1) return;
    intervalRef.current = setInterval(() => {
      setActive(p => (p + 1) % banners.length);
    }, 4500);
  }, [banners.length]);

  useEffect(() => {
    startAutoPlay();
    return () => clearInterval(intervalRef.current);
  }, [startAutoPlay]);

  const goTo = idx => {
    clearInterval(intervalRef.current);
    setActive(idx);
    startAutoPlay();
  };

  const prev = () => goTo((active - 1 + banners.length) % banners.length);
  const next = () => goTo((active + 1) % banners.length);

  if (!banners.length) return null;

  return (
    <section>
      <div style={{
        position: "relative", borderRadius: isMobile ? 12 : 18,
        overflow: "hidden", height: isMobile ? 165 : 230,
        boxShadow: "0 6px 28px rgba(0,0,0,0.16)",
      }}>
        {banners.map((b, i) => (
          <div key={b._id} style={{
            position: "absolute", inset: 0,
            transition: "opacity 0.65s ease",
            opacity: i === active ? 1 : 0,
            pointerEvents: i === active ? "auto" : "none",
            background: b.image ? `url(${b.image}) center/cover no-repeat` : b.gradient,
          }}>
            {/* Dark overlay for readability */}
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(0,0,0,0.48) 0%, rgba(0,0,0,0.18) 60%, transparent 100%)" }} />

            <div style={{
              position: "relative", zIndex: 1, height: "100%",
              display: "flex", flexDirection: "column",
              justifyContent: "center",
              padding: isMobile ? "0 22px" : "0 48px",
            }}>
              {b.tag && (
                <span style={{
                  background: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(4px)",
                  border: "1px solid rgba(255,255,255,0.3)",
                  color: "#fff", fontSize: 9, fontWeight: 800,
                  padding: "3px 12px", borderRadius: 20,
                  display: "inline-block", width: "fit-content",
                  marginBottom: 10, letterSpacing: 1.2,
                }}>
                  {b.tag}
                </span>
              )}
              <h2 style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: isMobile ? 28 : 40,
                fontWeight: 900, color: "#fff",
                lineHeight: 1.1, marginBottom: 6,
                textShadow: "0 2px 8px rgba(0,0,0,0.3)",
              }}>
                {b.title}
              </h2>
              {b.subtitle && (
                <p style={{
                  fontSize: isMobile ? 13 : 16,
                  fontWeight: 600, color: "rgba(255,255,255,0.92)",
                  marginBottom: 18, textShadow: "0 1px 4px rgba(0,0,0,0.25)",
                }}>
                  {b.subtitle}
                </p>
              )}
              <Link
                to={b.ctaLink || "/"}
                style={{
                  background: T.primary,
                  color: "#fff", borderRadius: 25,
                  padding: isMobile ? "9px 22px" : "11px 28px",
                  fontSize: isMobile ? 12 : 13,
                  fontWeight: 800, display: "inline-flex",
                  alignItems: "center", gap: 7,
                  textDecoration: "none", width: "fit-content",
                  boxShadow: "0 4px 16px rgba(201,169,110,0.35)",
                  transition: "transform 0.15s",
                }}
                onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
                onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                {b.cta || "Shop Now"} <FiArrowRight size={13} />
              </Link>
            </div>
          </div>
        ))}

        {/* Prev / Next arrows — desktop only */}
        {banners.length > 1 && !isMobile && (
          <>
            <button
              onClick={prev}
              style={{
                position: "absolute", left: 14, top: "50%",
                transform: "translateY(-50%)", width: 38, height: 38,
                borderRadius: "50%", background: "rgba(255,255,255,0.9)",
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 10, boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
                transition: "transform 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-50%) scale(1.1)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(-50%) scale(1)"}>
              <FiChevronLeft size={18} color={T.charcoal} />
            </button>
            <button
              onClick={next}
              style={{
                position: "absolute", right: 14, top: "50%",
                transform: "translateY(-50%)", width: 38, height: 38,
                borderRadius: "50%", background: "rgba(255,255,255,0.9)",
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                zIndex: 10, boxShadow: "0 2px 12px rgba(0,0,0,0.18)",
                transition: "transform 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-50%) scale(1.1)"}
              onMouseLeave={e => e.currentTarget.style.transform = "translateY(-50%) scale(1)"}>
              <FiChevronRight size={18} color={T.charcoal} />
            </button>
          </>
        )}

        {/* Dots */}
        {banners.length > 1 && (
          <div style={{
            position: "absolute", bottom: 12, left: "50%",
            transform: "translateX(-50%)",
            display: "flex", gap: 6, zIndex: 10,
          }}>
            {banners.map((_, i) => (
              <button
                key={i} onClick={() => goTo(i)}
                aria-label={`Go to banner ${i + 1}`}
                style={{
                  width: i === active ? 22 : 7, height: 7,
                  borderRadius: 4,
                  background: i === active ? T.primary : "rgba(255,255,255,0.55)",
                  border: "none", cursor: "pointer",
                  transition: "all 0.3s", padding: 0,
                }} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ══════════════════════════════════════════════════════════════
//  MAIN PAGE
// ══════════════════════════════════════════════════════════════
export default function OffersPage() {
  const { isMobile } = useMobileLayout();
  const { products, loading: adminLoading } = useAdminData();
  const [data, setData]       = useState({ banners: [], coupons: [], categories: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [copied, setCopied]   = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const result = await fetchAllOffers();
      setData({
        banners:    Array.isArray(result?.banners)    ? result.banners    : [],
        coupons:    Array.isArray(result?.coupons)    ? result.coupons    : [],
        categories: Array.isArray(result?.categories) ? result.categories : [],
      });
    } catch (e) {
      console.error("OffersPage:", e);
      setError(e.message || "Could not load offers. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const copyCode = code => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied(""), 2200);
  };

  const px = isMobile ? "12px" : "40px";
  const mw = isMobile ? "100%" : "1100px";

  // ── Loading ──────────────────────────────────────────────────
  if (loading || adminLoading) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: 14 }}>
      <div style={{ width: 48, height: 48, border: `4px solid ${T.border}`, borderTopColor: T.primary, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <p style={{ color: T.muted, fontSize: 14, fontWeight: 600 }}>Loading offers...</p>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  // ── Error ────────────────────────────────────────────────────
  if (error) return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "50vh", gap: 16, padding: 24 }}>
      <span style={{ fontSize: 44 }}>😕</span>
      <p style={{ color: T.muted, fontSize: 14, fontWeight: 600, textAlign: "center" }}>{error}</p>
      <button
        onClick={loadData}
        style={{ background: T.primary, color: "#fff", border: "none", borderRadius: 10, padding: "11px 28px", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
        <FiRefreshCw size={14} /> Try Again
      </button>
    </div>
  );

  const activeBanners    = data.banners;
  const activeCoupons    = data.coupons;
  const activeCategories = data.categories;
  
  const dbFlashDeals = (products || []).filter(p => p.active && p.showOnHome).slice(0, 8);

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes fadeIn { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }
        * { box-sizing: border-box; }
      `}</style>

      <div style={{ background: T.surface, minHeight: "100vh", paddingBottom: isMobile ? 90 : 60, fontFamily: "'Nunito','Segoe UI',sans-serif", animation: "fadeIn 0.3s ease" }}>

        {/* ── Mobile sticky header ─────────────────────────── */}
        {isMobile && (
          <header style={{
            background: T.white, borderBottom: `1px solid ${T.border}`,
            padding: "0 16px", height: 54,
            display: "flex", alignItems: "center", gap: 10,
            position: "sticky", top: 0, zIndex: 100,
            boxShadow: "0 1px 8px rgba(0,0,0,0.07)",
          }}>
            <FiTag size={18} color={T.primary} />
            <h1 style={{ fontSize: 16, fontWeight: 900, color: T.charcoal }}>Offers &amp; Deals</h1>
          </header>
        )}

        {/* ── Desktop heading ──────────────────────────────── */}
        {!isMobile && (
          <div style={{ maxWidth: mw, margin: "0 auto", padding: "28px 40px 0" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: T.primaryBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <FiTag size={18} color={T.primary} />
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 900, color: T.charcoal }}>Offers &amp; Deals</h1>
            </div>
            <p style={{ color: T.muted, fontSize: 13, marginLeft: 46 }}>Best prices · exclusive coupons · flash sales</p>
          </div>
        )}

        {/* ── Main content ─────────────────────────────────── */}
        <div style={{ maxWidth: mw, margin: "0 auto", padding: `16px ${px} 0`, display: "flex", flexDirection: "column", gap: 32 }}>

          {/* HERO BANNERS */}
          {activeBanners.length > 0 && (
            <BannerCarousel banners={activeBanners} isMobile={isMobile} />
          )}

          {/* COUPON CODES */}
          {activeCoupons.length > 0 && (
            <section>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <div style={{ width: 30, height: 30, borderRadius: 8, background: T.primaryBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <FiTag size={15} color={T.primary} />
                </div>
                <h2 style={{ fontSize: isMobile ? 16 : 19, fontWeight: 900, color: T.charcoal }}>Coupon Codes</h2>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)", gap: 14 }}>
                {activeCoupons.map(c => (
                  <div key={c._id} style={{
                    background: T.white, borderRadius: 14,
                    border: `1px solid ${T.border}`,
                    overflow: "hidden", display: "flex",
                    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
                    transition: "box-shadow 0.2s",
                  }}
                    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 6px 22px rgba(0,0,0,0.1)"}
                    onMouseLeave={e => e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.05)"}>

                    {/* Color strip */}
                    <div style={{ width: 6, background: c.color || T.primary, flexShrink: 0 }} />

                    <div style={{ padding: "14px 16px", flex: 1 }}>
                      {/* Discount pill */}
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 5, background: `${c.color || T.primary}15`, border: `1px solid ${c.color || T.primary}40`, borderRadius: 6, padding: "3px 10px", marginBottom: 8 }}>
                        <span style={{ fontSize: 13, fontWeight: 900, color: c.color || T.primary }}>
                          {c.type === "flat" ? `₹${c.value} OFF` : `${c.value}% OFF`}
                        </span>
                      </div>

                      <p style={{ fontSize: 13, fontWeight: 800, color: T.charcoal, marginBottom: 3 }}>{c.title}</p>
                      {c.description && <p style={{ fontSize: 12, color: T.muted, marginBottom: 12, lineHeight: 1.45 }}>{c.description}</p>}

                      {/* Code + copy button */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                        <div style={{
                          border: `1.5px dashed ${c.color || T.primary}`,
                          borderRadius: 7, padding: "6px 14px",
                          background: `${c.color || T.primary}10`,
                        }}>
                          <span style={{ fontSize: 14, fontWeight: 900, color: c.color || T.primary, letterSpacing: 1.8 }}>
                            {c.code}
                          </span>
                        </div>
                        <button
                          onClick={() => copyCode(c.code)}
                          style={{
                            background: copied === c.code ? T.green : (c.color || T.primary),
                            color: "#fff", border: "none",
                            borderRadius: 9, padding: "9px 18px",
                            fontSize: 12, fontWeight: 800,
                            cursor: "pointer", transition: "all 0.2s",
                            minWidth: 80,
                            transform: copied === c.code ? "scale(1.05)" : "scale(1)",
                          }}>
                          {copied === c.code ? "✓ Copied!" : "COPY"}
                        </button>
                      </div>

                      {/* Fine print */}
                      {(c.minOrder > 0 || c.expiry) && (
                        <p style={{ fontSize: 10, color: T.light, marginTop: 9, lineHeight: 1.4 }}>
                          {c.minOrder > 0 && `Min order ₹${c.minOrder}`}
                          {c.minOrder > 0 && c.expiry && " · "}
                          {c.expiry && `Expires: ${c.expiry}`}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* SHOP BY CATEGORY */}
          {activeCategories.length > 0 && (
            <section>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: T.goldBg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FiZap size={15} color={T.gold} />
                  </div>
                  <h2 style={{ fontSize: isMobile ? 16 : 19, fontWeight: 900, color: T.charcoal }}>Shop by Category</h2>
                </div>
                
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(3, 1fr)" : "repeat(6, 1fr)", gap: isMobile ? 12 : 18 }}>
                {activeCategories.map(cat => (
                  <Link key={cat._id} to={cat.link || "/"} style={{ textDecoration: "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 7 }}>
                    <div
                      style={{
                        width: "100%", aspectRatio: "1/1",
                        borderRadius: "50%", overflow: "hidden",
                        border: `2.5px solid ${T.border}`,
                        position: "relative", background: T.surface,
                        transition: "border-color 0.2s, box-shadow 0.2s, transform 0.2s",
                        boxShadow: "0 2px 10px rgba(0,0,0,0.07)",
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = T.primary;
                        e.currentTarget.style.boxShadow = "0 6px 20px rgba(201,169,110,0.22)";
                        e.currentTarget.style.transform = "scale(1.06)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = T.border;
                        e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.07)";
                        e.currentTarget.style.transform = "scale(1)";
                      }}>
                      {cat.image ? (
                        <img
                          src={cat.image} alt={cat.label}
                          loading="lazy"
                          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                          onError={e => { e.target.style.display = "none"; e.target.parentElement.innerHTML = `<div style="height:100%;display:flex;align-items:center;justify:center;font-size:20px;">👗</div>`; }}
                        />
                      ) : (
                        <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: T.primaryBg }}>
                          <FiTag size={24} color={T.primary} />
                        </div>
                      )}
                      {/* Discount overlay */}
                      <div style={{
                        position: "absolute", bottom: 0, left: 0, right: 0,
                        background: "linear-gradient(transparent, rgba(0,0,0,0.68))",
                        padding: "14px 4px 5px", textAlign: "center",
                      }}>
                        <span style={{ fontSize: isMobile ? 8 : 9, fontWeight: 800, color: "#fff" }}>
                          {cat.discount}
                        </span>
                      </div>
                    </div>
                    <span style={{ fontSize: isMobile ? 10 : 12, fontWeight: 700, color: T.charcoal, textAlign: "center", lineHeight: 1.3 }}>
                      {cat.label}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* FLASH DEALS */}
          {dbFlashDeals.length > 0 && (
            <section>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 8, background: "#FFEBEE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <FiZap size={15} color={T.red} />
                  </div>
                  <h2 style={{ fontSize: isMobile ? 16 : 19, fontWeight: 900, color: T.red }}>Flash Deals</h2>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(4, 1fr)", gap: 14 }}>
                {dbFlashDeals.map(p => (
                  <DealCard key={p._id || p.id} product={p} isMobile={isMobile} />
                ))}
              </div>
            </section>
          )}

          {/* Empty state — no dynamic content at all */}
          {!activeBanners.length && !activeCoupons.length && !activeCategories.length && !dbFlashDeals.length && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: T.muted }}>
              <FiTag size={40} style={{ marginBottom: 12, opacity: 0.3 }} />
              <p style={{ fontSize: 15, fontWeight: 700 }}>No active offers right now</p>
              <p style={{ fontSize: 13, marginTop: 4 }}>Check back soon for exciting deals!</p>
            </div>
          )}

        </div>
      </div>
    </>
  );
}