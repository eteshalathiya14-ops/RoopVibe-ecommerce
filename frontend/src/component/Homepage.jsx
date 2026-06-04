/**
 * HomePage.jsx — FIXED
 * 1. Product card shows actual product title (not hardcoded "ROOPVIBE")
 * 2. Brand shows product.brand if set, else site name
 * 3. Meesho-style product card layout
 * 4. Wishlist + Add to Cart on product cards
 * 5. Works with both local-state and MongoDB data
 */
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart }     from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAdminData } from "../Admin/context/Admindatacontext";
import { FiHeart, FiPlus, FiArrowRight, FiChevronLeft, FiChevronRight, FiStar, FiShoppingBag, FiCheck } from "react-icons/fi";
import { getCategoryPath, toSlug } from "../utils/categoryIndex";

const GOLD       = "#C9A96E";
const GOLD_DARK  = "#A07840";
const GOLD_LIGHT = "#F5EDD9";
const CHARCOAL   = "#1A1A1A";
const SURFACE    = "#FAF7F2";
const MUTED      = "#7A736B";
const BORDER     = "#EDE8E0";
const GREEN      = "#2E7D32";

function resolveImg(img) {
  if (!img) return "";
  if (typeof img === "string") return img;
  if (typeof img === "object") return img.src || img.url || "";
  return "";
}

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700;800&display=swap');
@keyframes shimmer   { 0%{transform:translateX(-100%)} 100%{transform:translateX(250%)} }
@keyframes pulse     { 0%,100%{opacity:0.15} 50%{opacity:0.55} }
@keyframes goldLine  { 0%{width:0} 100%{width:48px} }
@keyframes fadeSlide { 0%{opacity:0;transform:translateY(12px)} 100%{opacity:1;transform:translateY(0)} }
@keyframes imgIn     { 0%{opacity:0;transform:scale(1.06)} 100%{opacity:1;transform:scale(1)} }
@keyframes kenBurns  { 0%{transform:scale(1)} 100%{transform:scale(1.07)} }
@keyframes slideInL  { 0%{opacity:0;transform:translateX(-20px)} 100%{opacity:1;transform:translateX(0)} }
@keyframes tagPop    { 0%{opacity:0;transform:scale(0.8)} 100%{opacity:1;transform:scale(1)} }
.rv-prod-card { transition: all 0.22s ease; }
.rv-prod-card:hover { transform:translateY(-3px); box-shadow:0 10px 28px rgba(0,0,0,0.12) !important; }
.rv-prod-card:hover .rv-prod-img { transform: scale(1.04); }
.rv-prod-img { transition: transform 0.3s ease; }
.rv-cta-btn:hover { background:#C9A96E !important; color:#fff !important; }
.rv-cat-btn:hover img { transform: scale(1.07) !important; }
.rv-wish-btn:hover { color: #ff4d4f !important; }
`;

function useIsMobile() {
  const [m, setM] = useState(() => window.innerWidth <= 768);
  useEffect(() => {
    const fn = () => setM(window.innerWidth <= 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return m;
}

// ─── Arch Cat Item ─────────────────────────────────────────────
function ArchCatItem({ cat, isActive, onClick, isMobile, activeTab }) {
  const W  = isMobile ? 62 : 80;
  const H  = isMobile ? 76 : 96;
  const BR = isMobile ? "31px 31px 6px 6px" : "40px 40px 8px 8px";
  const navigate = useNavigate();
  const imgSrc = resolveImg(cat.img);

  const handleClick = () => {
    onClick();
    // Build proper /category/ URL
    // cat.link can be set by admin, otherwise build from label + activeTab
    if (cat.link) {
      navigate(cat.link);
    } else if (cat.label && activeTab) {
      const path = getCategoryPath(activeTab, "", cat.label);
      navigate(path);
    }
  };

  return (
    <button className="rv-cat-btn" onClick={handleClick}
      style={{ display:"flex", flexDirection:"column", alignItems:"center", background:"none", border:"none", cursor:"pointer", minWidth: isMobile ? 72:90, flexShrink:0, padding:"0 4px" }}>
      <div style={{ width:W, height:H, position:"relative", overflow:"hidden", borderRadius:BR, backgroundColor: isActive ? GOLD_LIGHT : "#F2EBE0", border: isActive ? `2px solid ${GOLD}` : "2px solid transparent", transition:"border-color 0.2s" }}>
        {cat.isMy ? (
          <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", background:`linear-gradient(135deg,${GOLD_LIGHT},${GOLD}22)` }}>
            <span style={{ fontFamily:"Georgia,serif", fontWeight:900, fontSize: isMobile ? "16px":"20px", color:GOLD_DARK }}>MY</span>
          </div>
        ) : imgSrc ? (
          <img src={imgSrc} alt={cat.label}
            style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top", display:"block", transition:"transform 0.3s ease" }}
            onError={e=>{ e.target.style.display="none"; }}/>
        ) : (
          <div style={{ width:"100%", height:"100%", background:`${GOLD}22`, display:"flex", alignItems:"center", justifyContent:"center", fontSize: isMobile ? 9:11, color:GOLD_DARK, fontWeight:700, textAlign:"center", padding:2 }}>
            {cat.label?.charAt(0)}
          </div>
        )}
      </div>
      <span style={{ fontSize: isMobile ? "8.5px":"9.5px", fontWeight: isActive ? "700":"500", color: isActive ? GOLD_DARK : MUTED, letterSpacing:"0.3px", textAlign:"center", whiteSpace:"nowrap", marginTop:"6px", borderBottom: isActive ? `1.5px solid ${GOLD}` : "1.5px solid transparent", paddingBottom:"1px" }}>
        {cat.label}
      </span>
    </button>
  );
}

// ─── Category Bar ──────────────────────────────────────────────
function CategoryBar({ activeTab, setActiveTab }) {
  const { categories, loading } = useAdminData();
  const isMobile = useIsMobile();
  const [activeItem, setActiveItem] = useState("MY FEED");

  const genders = Object.keys(categories);
  const cats    = (categories[activeTab] || []).filter(x => x.active).sort((a,b) => a.order - b.order);

  if (loading && !genders.length) return (
    <div style={{ height:80, backgroundColor:SURFACE, borderBottom:`1px solid ${BORDER}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ fontSize:12, color:MUTED }}>Loading categories…</div>
    </div>
  );

  return (
    <div style={{ backgroundColor:"#FAF7F2", borderBottom:`1px solid ${BORDER}` }}>
      <div style={{ display:"flex", padding: isMobile ? "0 8px":"0 40px", borderBottom:`1px solid ${BORDER}` }}>
        {genders.map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setActiveItem("MY FEED"); }}
            style={{ padding: isMobile ? "9px 10px":"11px 22px", fontSize: isMobile ? "11px":"13px", fontWeight:"600", letterSpacing: isMobile ? "0.3px":"0.6px", color: activeTab===tab ? GOLD_DARK : MUTED, background:"none", border:"none", borderBottom: activeTab===tab ? `2.5px solid ${GOLD}` : "2.5px solid transparent", cursor:"pointer" }}>
            {tab}
          </button>
        ))}
      </div>
      <div style={{ display:"flex", alignItems:"flex-end", overflowX:"auto", padding: isMobile ? "10px 8px 8px":"16px 32px 12px", gap:"2px", scrollbarWidth:"none", WebkitOverflowScrolling:"touch" }}>
        {cats.map(cat => (
          <ArchCatItem key={cat.id || cat._id} cat={cat} isActive={activeItem===cat.label} onClick={() => setActiveItem(cat.label)} isMobile={isMobile} activeTab={activeTab} />
        ))}
      </div>
    </div>
  );
}

// ─── Hero Banner ───────────────────────────────────────────────
function HeroBanner() {
  const { banners, loading } = useAdminData();
  const isMobile = useIsMobile();
  const slides = banners.filter(b => b.active).sort((a,b) => a.order - b.order);
  const [current, setCurrent] = useState(0);
  const [imgKey,  setImgKey]  = useState(0);
  const [txtKey,  setTxtKey]  = useState(0);
  const timerRef = useRef(null);
  const total    = slides.length;

  const goTo = idx => {
    const next = (idx + total) % total;
    setCurrent(next); setImgKey(k=>k+1); setTxtKey(k=>k+1);
  };
  const startTimer = () => {
    clearInterval(timerRef.current);
    if (total > 1) timerRef.current = setInterval(() => setCurrent(c => { setImgKey(k=>k+1); setTxtKey(k=>k+1); return (c+1)%total; }), 3000);
  };
  useEffect(() => { startTimer(); return () => clearInterval(timerRef.current); }, [total]);

  const touchStartX = useRef(null);
  const onTouchStart = e => { touchStartX.current = e.touches?.[0]?.clientX ?? null; };
  const onTouchEnd   = e => {
    const ex = e.changedTouches?.[0]?.clientX ?? null;
    if (touchStartX.current == null || ex == null) return;
    const dx = ex - touchStartX.current;
    if (Math.abs(dx) < 40) return;
    dx < 0 ? goTo(current+1) : goTo(current-1);
    touchStartX.current = null;
  };

  if (loading && !total) return (
    <div style={{ height:200, backgroundColor:SURFACE, display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ fontSize:12, color:MUTED }}>Loading banners…</div>
    </div>
  );
  if (!total) return null;

  const slide    = slides[current % total];
  const slideImg = resolveImg(slide.img);
  const hasRealTitle = slide.title && !/\.(jpe?g|png|webp|gif|bmp|svg)$/i.test(slide.title.trim());
  const hasText  = hasRealTitle || slide.tag || slide.cta || slide.sub;
  const isFullWidth = !hasText;

  const H       = isMobile ? 200 : 300;
  const textW   = isMobile ? "57%" : "55%";
  const imgW    = isMobile ? "41%" : "42%";
  const textPad = isMobile ? "12px 6px 12px 12px" : "28px 28px 28px 32px";
  const titleSz = isMobile ? "17px" : "28px";
  const subSz   = isMobile ? "9px" : "11px";
  const ctaPad  = isMobile ? "5px 10px" : "8px 20px";
  const ctaSz   = isMobile ? "8px" : "10px";

  return (
    <div style={{ padding: isMobile ? "10px 0 8px":"14px 0 10px", backgroundColor:SURFACE, display:"flex", justifyContent:"center" }}>
      <div onMouseEnter={() => clearInterval(timerRef.current)} onMouseLeave={startTimer}
        style={{ position:"relative", width: isMobile ? "95%":"72%", maxWidth:"960px", touchAction:"pan-y" }}
        onTouchStart={isMobile ? onTouchStart : undefined} onTouchEnd={isMobile ? onTouchEnd : undefined}>
        <div style={{ position:"relative", height:H, borderRadius: isMobile ? 10:12, overflow:"hidden", boxShadow:"0 6px 32px rgba(201,169,110,0.18)", border:`1px solid ${GOLD}44`, background: slide.bg || "#2C1A0E" }}>
          {isFullWidth && slideImg && (
            <>
              <img key={`i${imgKey}`} src={slideImg} alt="banner"
                style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center", display:"block", animation:"imgIn 0.8s ease both, kenBurns 5s ease forwards" }}
                onError={e => e.target.style.opacity = "0"} />
              <div style={{ position:"absolute", bottom:0, left:0, right:0, height:60, background:"linear-gradient(to top, rgba(0,0,0,0.35), transparent)", pointerEvents:"none" }} />
            </>
          )}
          {!isFullWidth && (<>
            <div key={`t${txtKey}`} style={{ position:"absolute", left:0, top:0, bottom:0, width:textW, padding:textPad, display:"flex", flexDirection:"column", justifyContent:"center", zIndex:2 }}>
              {slide.tag && (
                <div style={{ display:"inline-flex", alignItems:"center", gap:5, backgroundColor:`${GOLD}20`, border:`1px solid ${GOLD}50`, padding: isMobile ? "2px 8px":"3px 12px", borderRadius:20, marginBottom: isMobile ? 8:12, width:"fit-content", animation:"tagPop 0.5s ease both" }}>
                  <span style={{ width:5, height:5, borderRadius:"50%", backgroundColor:GOLD, display:"inline-block" }}/>
                  <span style={{ fontSize: isMobile ? "7px":"9px", fontWeight:800, letterSpacing:"1.5px", color:GOLD }}>{slide.tag}</span>
                </div>
              )}
              {hasRealTitle && (
                <h2 style={{ fontSize:titleSz, fontWeight:800, color:"#fff", lineHeight:1.15, marginBottom: isMobile ? 6:10, fontFamily:"'Playfair Display',Georgia,serif", whiteSpace:"pre-line", textShadow:"0 2px 14px rgba(0,0,0,0.35)", animation:"slideInL 0.6s 0.1s ease both" }}>
                  {slide.title}
                </h2>
              )}
              {slide.sub && (
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom: isMobile ? 10:18, animation:"slideInL 0.6s 0.2s ease both" }}>
                  <div style={{ height:"1.5px", width:16, background:GOLD, opacity:0.8, borderRadius:1 }}/>
                  <p style={{ fontSize:subSz, color:GOLD, fontWeight:700, letterSpacing:"1.2px" }}>{slide.sub}</p>
                </div>
              )}
              {slide.cta && (
                <Link to={slide.ctaLink || "/"} style={{ textDecoration:"none" }}>
                  <button className="rv-cta-btn" style={{ backgroundColor:"transparent", border:`1.5px solid ${GOLD}`, color:GOLD, padding:ctaPad, fontSize:ctaSz, fontWeight:800, letterSpacing:"1px", borderRadius:4, cursor:"pointer", transition:"all 0.2s", display:"flex", alignItems:"center", gap:4, animation:"slideInL 0.6s 0.3s ease both" }}>
                    {slide.cta} <FiArrowRight size={isMobile ? 10:12}/>
                  </button>
                </Link>
              )}
            </div>
            {slideImg && (
              <div style={{ position:"absolute", right:0, top:0, bottom:0, width:imgW, overflow:"hidden" }}>
                <img key={`i${imgKey}`} src={slideImg} alt=""
                  style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top", display:"block", animation:"imgIn 0.8s ease both, kenBurns 5s ease forwards" }}
                  onError={e => e.target.style.opacity = "0"} />
                <div style={{ position:"absolute", left:0, top:0, bottom:0, width:"45%", background:"linear-gradient(to right,#2C1A0E,transparent)", pointerEvents:"none" }}/>
              </div>
            )}
          </>)}
          <div style={{ position:"absolute", bottom:10, right:10, backgroundColor:"rgba(26,20,8,0.55)", border:`1px solid ${GOLD}44`, padding:"2px 8px", borderRadius:20, fontSize:9, fontWeight:700, color:GOLD, zIndex:10 }}>
            {current+1}/{total}
          </div>
          {!isMobile && total > 1 && [[-1,"left"],[1,"right"]].map(([d,p]) => (
            <button key={p} onClick={() => goTo(current+d)}
              style={{ position:"absolute", top:"50%", [p]:10, transform:"translateY(-50%)", width:30, height:30, borderRadius:"50%", backgroundColor:"rgba(26,20,8,0.55)", border:`1px solid ${GOLD}55`, color:GOLD, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", zIndex:10 }}>
              {d===-1 ? <FiChevronLeft size={18}/> : <FiChevronRight size={18}/>}
            </button>
          ))}
        </div>
        {total > 1 && (
          <div style={{ display:"flex", justifyContent:"center", gap:8, marginTop:8 }}>
            {slides.map((_,i) => (
              <button key={i} onClick={() => goTo(i)} style={{ padding:0, border:"none", background:"none", cursor:"pointer" }}>
                <div style={{ width:i===current?18:6, height:6, borderRadius:4, backgroundColor:i===current?GOLD:BORDER, transition:"all 0.3s" }}/>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Meesho-style Product Card ─────────────────────────────────
function ProductCard({ product, isMobile }) {
  const { addToCart }               = useCart();
  const { toggleWishlist, isLiked } = useWishlist();
  const pid    = product.id || product._id;
  const liked  = isLiked?.(pid);
  const [added, setAdded] = useState(false);

  // Resolve images
  const imgs = (product.colorVariants?.[0]?.images || []).map(resolveImg).filter(Boolean);
  const thumb  = imgs[0] || "";
  const thumb2 = imgs[1] || thumb;

  const discount = product.mrp > 0 ? Math.round((1 - product.price / product.mrp) * 100) : 0;

  // Brand: use product.brand if set, else nothing (don't hardcode)
  const brandName = product.brand || "";

  // Title: always show actual product title
  const productTitle = product.title || "";

  const imgH = isMobile ? 180 : 240;

  const handleCart = (e) => {
    e.preventDefault(); e.stopPropagation();
    addToCart({ id: pid, title: product.title, brand: product.brand, price: product.price, mrp: product.mrp, img: thumb, quantity: 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleWish = (e) => {
    e.preventDefault(); e.stopPropagation();
    toggleWishlist({ ...product, id: pid, img: thumb });
  };

  return (
    <div className="rv-prod-card"
      style={{ backgroundColor: "#fff", borderRadius: 8, overflow: "hidden", border: `1px solid #f0f0f0`, cursor: "pointer", display: "flex", flexDirection: "column", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
      
      <Link to={`/product/${pid}`} style={{ textDecoration: "none", display: "block", position: "relative" }}>
        {/* Product image */}
        <div style={{ position: "relative", overflow: "hidden", height: imgH, background: "#f5f5f5" }}>
          {thumb
            ? <img src={thumb} alt={productTitle} className="rv-prod-img"
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top", display: "block" }}
                onError={e => e.target.style.opacity = "0"}/>
            : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: MUTED, fontSize: 12, flexDirection: "column", gap: 6 }}>
                <FiShoppingBag size={24} color={BORDER}/>
                <span>No Image</span>
              </div>
          }
          {/* Discount badge */}
          {discount > 0 && (
            <div style={{ position: "absolute", top: 8, left: 8, background: "#ff6161", color: "#fff", fontSize: isMobile ? 9 : 10, fontWeight: 800, padding: "2px 7px", borderRadius: 3 }}>
              {discount}% OFF
            </div>
          )}
          {/* Wishlist button */}
          <button onClick={handleWish} className="rv-wish-btn"
            style={{ position: "absolute", top: 8, right: 8, width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.92)", border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: liked ? "#ff4d4f" : "#888", transition: "color 0.18s", boxShadow: "0 1px 4px rgba(0,0,0,0.1)" }}>
            <FiHeart size={14} fill={liked ? "#ff4d4f" : "none"} stroke={liked ? "#ff4d4f" : "currentColor"}/>
          </button>
        </div>
      </Link>

      {/* Product info — Meesho style */}
      <div style={{ padding: isMobile ? "8px 10px 10px" : "10px 12px 12px", flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Brand */}
        {brandName && (
          <p style={{ fontSize: isMobile ? 10 : 11, fontWeight: 700, color: MUTED, letterSpacing: "0.3px", marginBottom: 2, textTransform: "uppercase", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {brandName}
          </p>
        )}

        {/* Product Title — this was the bug, was showing hardcoded "ROOPVIBE" */}
        <Link to={`/product/${pid}`} style={{ textDecoration: "none" }}>
          <p style={{ fontSize: isMobile ? 12 : 13, fontWeight: 500, color: CHARCOAL, lineHeight: 1.4, marginBottom: 6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {productTitle}
          </p>
        </Link>

        {/* Price row */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
          <span style={{ fontSize: isMobile ? 13 : 14, fontWeight: 800, color: CHARCOAL }}>₹{product.price}</span>
          {product.mrp > product.price && (
            <span style={{ fontSize: isMobile ? 10 : 11, color: MUTED, textDecoration: "line-through" }}>₹{product.mrp}</span>
          )}
          {discount > 0 && (
            <span style={{ fontSize: isMobile ? 9 : 10, fontWeight: 700, color: "#ff6161" }}>
              ({discount}% off)
            </span>
          )}
        </div>

        {/* Free delivery tag (Meesho style) */}
        <p style={{ fontSize: isMobile ? 9 : 10, color: GREEN, fontWeight: 600, marginBottom: 8 }}>
          Free Delivery
        </p>

        {/* Add to cart button */}
        <button onClick={handleCart}
          style={{ width: "100%", padding: isMobile ? "7px" : "9px", background: added ? GREEN : "#fff", color: added ? "#fff" : GOLD_DARK, border: `1.5px solid ${added ? GREEN : GOLD}`, borderRadius: 6, fontSize: isMobile ? 10 : 11, fontWeight: 700, cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginTop: "auto" }}>
          {added ? <><FiCheck size={12}/> Added!</> : <><FiShoppingBag size={12}/> Add to Cart</>}
        </button>
      </div>
    </div>
  );
}

// ─── Products Section ──────────────────────────────────────────
const PAGE_SIZE = 8;

function AllProductsSection() {
  const { products, loading } = useAdminData();
  const isMobile = useIsMobile();
  const [count, setCount] = useState(PAGE_SIZE);
  const loaderRef = useRef(null);

  const homeProducts = products.filter(p => p.active && p.showOnHome);

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) setCount(c => Math.min(c + PAGE_SIZE, homeProducts.length));
    }, { threshold: 0.1 });
    if (loaderRef.current) obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, [homeProducts.length]);

  const visible = homeProducts.slice(0, count);
  const cols    = isMobile ? 2 : 4;
  const gap     = isMobile ? 8 : 16;

  return (
    <section style={{ padding: isMobile ? "16px 10px 32px" : "32px 32px 48px", backgroundColor: "#f8f8f8", borderTop: `1px solid ${BORDER}` }}>
      <div style={{ maxWidth: 1320, margin: "0 auto" }}>
        <div style={{ marginBottom: isMobile ? 14 : 24 }}>
          <h2 style={{ fontSize: isMobile ? "18px" : "22px", fontWeight: 700, color: CHARCOAL, fontFamily: "'Playfair Display',Georgia,serif", marginBottom: 4 }}>
            Trending Right Now
          </h2>
          <p style={{ fontSize: isMobile ? "12px" : "13px", color: MUTED, marginBottom: 8 }}>
            Handpicked looks you'll love
          </p>
          <div style={{ height: "2.5px", width: 0, backgroundColor: GOLD, animation: "goldLine 0.8s 0.2s ease forwards", borderRadius: 2 }}/>
        </div>

        {loading && !homeProducts.length ? (
          <div style={{ display: "flex", justifyContent: "center", gap: 10, padding: "40px 0" }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: GOLD, animation: `pulse 1.2s ${i*0.2}s ease-in-out infinite` }}/>)}
          </div>
        ) : homeProducts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: MUTED, fontSize: 14 }}>
            No products yet. Add products from Admin panel.
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols},1fr)`, gap }}>
            {visible.map((p, i) => (
              <div key={p.id || p._id} style={{ animation: `fadeSlide 0.4s ${(i % PAGE_SIZE) * 0.06}s ease both` }}>
                <ProductCard product={p} isMobile={isMobile}/>
              </div>
            ))}
          </div>
        )}

        {count < homeProducts.length && (
          <div ref={loaderRef} style={{ display: "flex", justifyContent: "center", gap: 10, padding: "32px 0 8px" }}>
            {[0,1,2].map(i => <div key={i} style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: GOLD, animation: `pulse 1.2s ${i*0.2}s ease-in-out infinite` }}/>)}
          </div>
        )}
        {count >= homeProducts.length && homeProducts.length > 0 && (
          <p style={{ textAlign: "center", marginTop: 28, fontSize: 12, color: MUTED }}>
            <FiStar style={{ verticalAlign: "middle" }}/>&nbsp;You've seen all products&nbsp;<FiStar style={{ verticalAlign: "middle" }}/>
          </p>
        )}
      </div>
    </section>
  );
}

// ─── Root ──────────────────────────────────────────────────────
export default function HomePage() {
  const { categories } = useAdminData();
  const genders        = Object.keys(categories);
  const [activeTab, setActiveTab] = useState(genders[0] || "WOMEN");

  useEffect(() => {
    if (genders.length && !genders.includes(activeTab)) {
      setActiveTab(genders[0]);
    }
  }, [genders.join(",")]);

  return (
    <main style={{ backgroundColor: SURFACE, minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: STYLES }}/>
      <CategoryBar activeTab={activeTab} setActiveTab={setActiveTab}/>
      <HeroBanner/>
      <AllProductsSection/>
    </main>
  );
}