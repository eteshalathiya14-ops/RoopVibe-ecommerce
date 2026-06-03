/**
 * HomePage.jsx — BACKEND CONNECTED
 * Works with both local-state and MongoDB data.
 * Images can be base64 strings, {src,name} objects, or URLs.
 */
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart }     from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { useAdminData } from "../Admin/context/Admindatacontext";
import { FiHeart, FiPlus, FiArrowRight, FiChevronLeft, FiChevronRight, FiStar } from "react-icons/fi";

const GOLD       = "#C9A96E";
const GOLD_DARK  = "#A07840";
const GOLD_LIGHT = "#F5EDD9";
const CHARCOAL   = "#1A1A1A";
const SURFACE    = "#FAF7F2";
const MUTED      = "#7A736B";
const BORDER     = "#EDE8E0";

// ── Resolve image from string URL or {src,name} object ────────
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
@keyframes float1    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
.rv-prod-card { transition: all 0.22s ease; }
.rv-prod-card:hover { transform:translateY(-4px); box-shadow:0 12px 32px rgba(201,169,110,0.18) !important; border-color:#C9A96E !important; }
.rv-cta-btn:hover { background:#C9A96E !important; color:#fff !important; }
.rv-cat-btn:hover img { transform: scale(1.07) !important; }
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
function ArchCatItem({ cat, isActive, onClick, isMobile }) {
  const W  = isMobile ? 62 : 80;
  const H  = isMobile ? 76 : 96;
  const BR = isMobile ? "31px 31px 6px 6px" : "40px 40px 8px 8px";
  const navigate = useNavigate();
  const imgSrc = resolveImg(cat.img);

  const handleClick = () => {
    onClick();
    if (cat.link) navigate(cat.link);
  };

  return (
    <button className="rv-cat-btn" onClick={handleClick}
      style={{ display:"flex", flexDirection:"column", alignItems:"center", background:"none",
        border:"none", cursor:"pointer", minWidth: isMobile ? 72:90, flexShrink:0, padding:"0 4px" }}>
      <div style={{ width:W, height:H, position:"relative", overflow:"hidden", borderRadius:BR,
        backgroundColor: isActive ? GOLD_LIGHT : "#F2EBE0",
        border: isActive ? `2px solid ${GOLD}` : "2px solid transparent", transition:"border-color 0.2s" }}>
        {cat.isMy ? (
          <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center",
            justifyContent:"center", background:`linear-gradient(135deg,${GOLD_LIGHT},${GOLD}22)` }}>
            <span style={{ fontFamily:"Georgia,serif", fontWeight:900,
              fontSize: isMobile ? "16px":"20px", color:GOLD_DARK }}>MY</span>
          </div>
        ) : imgSrc ? (
          <img src={imgSrc} alt={cat.label}
            style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top",
              display:"block", transition:"transform 0.3s ease" }}
            onError={e=>{ e.target.style.display="none"; }}/>
        ) : (
          <div style={{ width:"100%", height:"100%", background:`${GOLD}22`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize: isMobile ? 9:11, color:GOLD_DARK, fontWeight:700, textAlign:"center", padding:2 }}>
            {cat.label?.charAt(0)}
          </div>
        )}
      </div>
      <span style={{ fontSize: isMobile ? "8.5px":"9.5px", fontWeight: isActive ? "700":"500",
        color: isActive ? GOLD_DARK : MUTED, letterSpacing:"0.3px", textAlign:"center",
        whiteSpace:"nowrap", marginTop:"6px",
        borderBottom: isActive ? `1.5px solid ${GOLD}` : "1.5px solid transparent", paddingBottom:"1px" }}>
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
    <div style={{ height:80, backgroundColor:SURFACE, borderBottom:`1px solid ${BORDER}`,
      display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ fontSize:12, color:MUTED }}>Loading categories…</div>
    </div>
  );

  return (
    <div style={{ backgroundColor:"#FAF7F2", borderBottom:`1px solid ${BORDER}` }}>
      <div style={{ display:"flex", padding: isMobile ? "0 8px":"0 40px", borderBottom:`1px solid ${BORDER}` }}>
        {genders.map(tab => (
          <button key={tab} onClick={() => { setActiveTab(tab); setActiveItem("MY FEED"); }}
            style={{ padding: isMobile ? "9px 10px":"11px 22px", fontSize: isMobile ? "11px":"13px",
              fontWeight:"600", letterSpacing: isMobile ? "0.3px":"0.6px",
              color: activeTab===tab ? GOLD_DARK : MUTED, background:"none", border:"none",
              borderBottom: activeTab===tab ? `2.5px solid ${GOLD}` : "2.5px solid transparent",
              cursor:"pointer" }}>
            {tab}
          </button>
        ))}
      </div>
      <div style={{ display:"flex", alignItems:"flex-end", overflowX:"auto",
        padding: isMobile ? "10px 8px 8px":"16px 32px 12px",
        gap:"2px", scrollbarWidth:"none", WebkitOverflowScrolling:"touch" }}>
        {cats.map(cat => (
          <ArchCatItem key={cat.id || cat._id} cat={cat}
            isActive={activeItem===cat.label}
            onClick={() => setActiveItem(cat.label)}
            isMobile={isMobile} />
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
    if (total > 1)
      timerRef.current = setInterval(() => setCurrent(c => {
        setImgKey(k=>k+1); setTxtKey(k=>k+1); return (c+1)%total;
      }), 3000);
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

  // Full-width mode: no title text (image-only upload from admin)
  const hasRealTitle = slide.title && !/\.(jpe?g|png|webp|gif|bmp|svg)$/i.test(slide.title.trim());
  const hasText      = hasRealTitle || slide.tag || slide.cta || slide.sub;
  const isFullWidth  = !hasText;

  const H       = isMobile ? 200 : 300;
  const textW   = isMobile ? "57%" : "55%";
  const imgW    = isMobile ? "41%" : "42%";
  const textPad = isMobile ? "12px 6px 12px 12px" : "28px 28px 28px 32px";
  const titleSz = isMobile ? "17px" : "28px";
  const subSz   = isMobile ? "9px" : "11px";
  const ctaPad  = isMobile ? "5px 10px" : "8px 20px";
  const ctaSz   = isMobile ? "8px" : "10px";

  return (
    <div style={{ padding: isMobile ? "10px 0 8px":"14px 0 10px",
      backgroundColor:SURFACE, display:"flex", justifyContent:"center" }}>
      <div onMouseEnter={() => clearInterval(timerRef.current)} onMouseLeave={startTimer}
        style={{ position:"relative", width: isMobile ? "95%":"72%", maxWidth:"960px", touchAction:"pan-y" }}
        onTouchStart={isMobile ? onTouchStart : undefined}
        onTouchEnd={isMobile ? onTouchEnd : undefined}>

        <div style={{ position:"relative", height:H, borderRadius: isMobile ? 10:12, overflow:"hidden",
          boxShadow:"0 6px 32px rgba(201,169,110,0.18)", border:`1px solid ${GOLD}44`,
          background: slide.bg || "#2C1A0E" }}>

          {/* ── FULL-WIDTH (image only banner) ── */}
          {isFullWidth && slideImg && (
            <>
              <img key={`i${imgKey}`} src={slideImg} alt="banner"
                style={{ position:"absolute", inset:0, width:"100%", height:"100%",
                  objectFit:"cover", objectPosition:"center", display:"block",
                  animation:"imgIn 0.8s ease both, kenBurns 5s ease forwards" }}
                onError={e => e.target.style.opacity = "0"} />
              <div style={{ position:"absolute", bottom:0, left:0, right:0, height:60,
                background:"linear-gradient(to top, rgba(0,0,0,0.35), transparent)",
                pointerEvents:"none" }} />
            </>
          )}

          {/* ── SPLIT (text + image) ── */}
          {!isFullWidth && (<>
            <div key={`t${txtKey}`} style={{ position:"absolute", left:0, top:0, bottom:0,
              width:textW, padding:textPad, display:"flex", flexDirection:"column",
              justifyContent:"center", zIndex:2 }}>
              {slide.tag && (
                <div style={{ display:"inline-flex", alignItems:"center", gap:5,
                  backgroundColor:`${GOLD}20`, border:`1px solid ${GOLD}50`,
                  padding: isMobile ? "2px 8px":"3px 12px", borderRadius:20,
                  marginBottom: isMobile ? 8:12, width:"fit-content", animation:"tagPop 0.5s ease both" }}>
                  <span style={{ width:5, height:5, borderRadius:"50%", backgroundColor:GOLD, display:"inline-block" }}/>
                  <span style={{ fontSize: isMobile ? "7px":"9px", fontWeight:800, letterSpacing:"1.5px", color:GOLD }}>
                    {slide.tag}
                  </span>
                </div>
              )}
              {hasRealTitle && (
                <h2 style={{ fontSize:titleSz, fontWeight:800, color:"#fff", lineHeight:1.15,
                  marginBottom: isMobile ? 6:10, fontFamily:"'Playfair Display',Georgia,serif",
                  whiteSpace:"pre-line", textShadow:"0 2px 14px rgba(0,0,0,0.35)",
                  animation:"slideInL 0.6s 0.1s ease both" }}>
                  {slide.title}
                </h2>
              )}
              {slide.sub && (
                <div style={{ display:"flex", alignItems:"center", gap:6,
                  marginBottom: isMobile ? 10:18, animation:"slideInL 0.6s 0.2s ease both" }}>
                  <div style={{ height:"1.5px", width:16, background:GOLD, opacity:0.8, borderRadius:1 }}/>
                  <p style={{ fontSize:subSz, color:GOLD, fontWeight:700, letterSpacing:"1.2px" }}>{slide.sub}</p>
                </div>
              )}
              {slide.cta && (
                <Link to={slide.ctaLink || "/"} style={{ textDecoration:"none" }}>
                  <button className="rv-cta-btn" style={{ backgroundColor:"transparent",
                    border:`1.5px solid ${GOLD}`, color:GOLD, padding:ctaPad, fontSize:ctaSz,
                    fontWeight:800, letterSpacing:"1px", borderRadius:4, cursor:"pointer",
                    transition:"all 0.2s", display:"flex", alignItems:"center", gap:4,
                    animation:"slideInL 0.6s 0.3s ease both" }}>
                    {slide.cta} <FiArrowRight size={isMobile ? 10:12}/>
                  </button>
                </Link>
              )}
            </div>

            {slideImg && (
              <div style={{ position:"absolute", right:0, top:0, bottom:0, width:imgW, overflow:"hidden" }}>
                <img key={`i${imgKey}`} src={slideImg} alt=""
                  style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top",
                    display:"block", animation:"imgIn 0.8s ease both, kenBurns 5s ease forwards" }}
                  onError={e => e.target.style.opacity = "0"} />
                <div style={{ position:"absolute", left:0, top:0, bottom:0, width:"45%",
                  background:"linear-gradient(to right,#2C1A0E,transparent)", pointerEvents:"none" }}/>
              </div>
            )}
          </>)}

          {/* Counter */}
          <div style={{ position:"absolute", bottom:10, right:10, backgroundColor:"rgba(26,20,8,0.55)",
            border:`1px solid ${GOLD}44`, padding:"2px 8px", borderRadius:20,
            fontSize:9, fontWeight:700, color:GOLD, zIndex:10 }}>
            {current+1}/{total}
          </div>

          {/* Arrows */}
          {!isMobile && total > 1 && [[-1,"left"],[1,"right"]].map(([d,p]) => (
            <button key={p} onClick={() => goTo(current+d)}
              style={{ position:"absolute", top:"50%", [p]:10, transform:"translateY(-50%)",
                width:30, height:30, borderRadius:"50%", backgroundColor:"rgba(26,20,8,0.55)",
                border:`1px solid ${GOLD}55`, color:GOLD, cursor:"pointer",
                display:"flex", alignItems:"center", justifyContent:"center", zIndex:10 }}>
              {d===-1 ? <FiChevronLeft size={18}/> : <FiChevronRight size={18}/>}
            </button>
          ))}
        </div>

        {/* Dots */}
        {total > 1 && (
          <div style={{ display:"flex", justifyContent:"center", gap:8, marginTop:8 }}>
            {slides.map((_,i) => (
              <button key={i} onClick={() => goTo(i)}
                style={{ padding:0, border:"none", background:"none", cursor:"pointer" }}>
                <div style={{ width:i===current?18:6, height:6, borderRadius:4,
                  backgroundColor:i===current?GOLD:BORDER, transition:"all 0.3s" }}/>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Product Card ──────────────────────────────────────────────
function ProductCard({ product, isMobile }) {
  const { addToCart }               = useCart();
  const { toggleWishlist, isLiked } = useWishlist();
  const liked  = isLiked?.(product?.id || product?._id);
  const [hov, setHov] = useState(false);
  const pid    = product.id || product._id;

  // Resolve images (handles both base64 objects and URL strings)
  const thumb  = resolveImg(product.colorVariants?.[0]?.images?.[0]);
  const thumb2 = resolveImg(product.colorVariants?.[0]?.images?.[1]) || thumb;

  const totalImgs = product.colorVariants?.reduce(
    (s, v) => s + (v.images?.filter(Boolean).length || 0), 0
  ) || 0;

  const discount = product.mrp > 0
    ? Math.round((1 - product.price / product.mrp) * 100)
    : 0;

  const mainH = isMobile ? 160 : 220;
  const sideH = isMobile ? 78  : 108;

  return (
    <div className="rv-prod-card"
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ backgroundColor:"#FAF7F2", borderRadius:8, overflow:"hidden",
        border:`1px solid ${hov ? GOLD:"#e8e8e8"}`, cursor:"pointer",
        display:"flex", flexDirection:"column" }}>

      <Link to={`/product/${pid}`} style={{ textDecoration:"none", display:"flex", gap:4, padding:4 }}>
        {/* Main image */}
        <div style={{ flex:"1.5", height:mainH, borderRadius:4, overflow:"hidden",
          backgroundColor:"#f0f0f0" }}>
          {thumb
            ? <img src={thumb} alt={product.title}
                style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }}
                onError={e => e.target.style.opacity="0"} />
            : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center",
                justifyContent:"center", color:MUTED, fontSize:11 }}>No Image</div>
          }
        </div>

        {/* Side images */}
        <div style={{ flex:"0.6", display:"flex", flexDirection:"column", gap:4 }}>
          <div style={{ height:sideH, borderRadius:4, overflow:"hidden", backgroundColor:"#f0f0f0" }}>
            {thumb2
              ? <img src={thumb2} alt="" style={{ width:"100%", height:"100%", objectFit:"cover",
                  filter:"blur(1px)", opacity:0.85 }} onError={e => e.target.style.opacity="0"} />
              : <div style={{ width:"100%", height:"100%", background:`${GOLD}20` }}/>
            }
          </div>
          <div style={{ position:"relative", height:sideH, borderRadius:4, overflow:"hidden",
            backgroundColor:"#f0f0f0" }}>
            {thumb
              ? <img src={thumb} alt="" style={{ width:"100%", height:"100%", objectFit:"cover",
                  filter:"grayscale(100%)" }} onError={e => e.target.style.opacity="0"} />
              : <div style={{ width:"100%", height:"100%", background:`${GOLD}10` }}/>
            }
            <div style={{ position:"absolute", inset:0, backgroundColor:"rgba(0,0,0,0.4)",
              display:"flex", alignItems:"center", justifyContent:"center",
              color:"#fff", fontSize: isMobile ? 14:16, fontWeight:800 }}>
              +{totalImgs}
            </div>
          </div>
        </div>
      </Link>

      {/* Bottom info */}
      <div style={{ padding: isMobile ? "7px 8px":"10px 12px", display:"flex",
        alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontSize:9, fontWeight:800, color:MUTED, letterSpacing:"0.4px",
            textTransform:"uppercase", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            {product.brand || "ROOPVIBE"}
          </p>
          <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:2, flexWrap:"wrap" }}>
            <span style={{ fontSize: isMobile ? 12:13, fontWeight:800, color:CHARCOAL }}>₹{product.price}</span>
            <span style={{ fontSize:10, color:MUTED, textDecoration:"line-through" }}>₹{product.mrp}</span>
            {discount > 0 && (
              <span style={{ fontSize:9, fontWeight:700, color:"#2E7D32",
                backgroundColor:"#E8F5E9", padding:"1px 5px", borderRadius:3 }}>
                {discount}%
              </span>
            )}
          </div>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
          <button onClick={e=>{e.preventDefault();e.stopPropagation();toggleWishlist(product);}}
            style={{ background:"none", border:"none", padding:0, cursor:"pointer",
              color: liked ? "#ff4d4f":CHARCOAL, display:"flex", alignItems:"center", transition:"all 0.18s" }}>
            <FiHeart size={isMobile?15:18} fill={liked?"#ff4d4f":"none"} stroke={liked?"#ff4d4f":"currentColor"}/>
          </button>
          {!isMobile && (
            <button onClick={e=>{e.preventDefault();e.stopPropagation();addToCart({ ...product, img: thumb });}}
              style={{ width:28, height:28, borderRadius:"50%", display:"flex", alignItems:"center",
                justifyContent:"center", background:GOLD, color:"#fff",
                boxShadow:"0 2px 8px rgba(201,169,110,0.35)", border:"none", cursor:"pointer" }}>
              <FiPlus size={18}/>
            </button>
          )}
        </div>
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
  const gap     = isMobile ? 10 : 18;

  return (
    <section style={{ padding: isMobile ? "20px 12px 32px":"36px 40px 48px",
      backgroundColor:"#fff", borderTop:`1px solid ${BORDER}` }}>
      <div style={{ maxWidth:1320, margin:"0 auto" }}>
        <div style={{ marginBottom: isMobile ? 18:28 }}>
          <h2 style={{ fontSize: isMobile ? "18px":"22px", fontWeight:700, color:CHARCOAL,
            fontFamily:"'Playfair Display',Georgia,serif", marginBottom:4 }}>
            Trending Right Now
          </h2>
          <p style={{ fontSize: isMobile ? "12px":"13px", color:MUTED, marginBottom:8 }}>
            Handpicked looks you'll love
          </p>
          <div style={{ height:"2.5px", width:0, backgroundColor:GOLD,
            animation:"goldLine 0.8s 0.2s ease forwards", borderRadius:2 }}/>
        </div>

        {loading && !homeProducts.length ? (
          <div style={{ display:"flex", justifyContent:"center", gap:10, padding:"40px 0" }}>
            {[0,1,2].map(i=><div key={i} style={{ width:8, height:8, borderRadius:"50%",
              backgroundColor:GOLD, animation:`pulse 1.2s ${i*0.2}s ease-in-out infinite` }}/>)}
          </div>
        ) : homeProducts.length === 0 ? (
          <div style={{ textAlign:"center", padding:"60px 0", color:MUTED, fontSize:14 }}>
            No products yet. Add products from Admin panel.
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols},1fr)`, gap }}>
            {visible.map((p,i) => (
              <div key={p.id || p._id}
                style={{ animation:`fadeSlide 0.4s ${(i%PAGE_SIZE)*0.06}s ease both` }}>
                <ProductCard product={p} isMobile={isMobile}/>
              </div>
            ))}
          </div>
        )}

        {count < homeProducts.length && (
          <div ref={loaderRef} style={{ display:"flex", justifyContent:"center", gap:10, padding:"32px 0 8px" }}>
            {[0,1,2].map(i=><div key={i} style={{ width:8, height:8, borderRadius:"50%",
              backgroundColor:GOLD, animation:`pulse 1.2s ${i*0.2}s ease-in-out infinite` }}/>)}
          </div>
        )}
        {count >= homeProducts.length && homeProducts.length > 0 && (
          <p style={{ textAlign:"center", marginTop:28, fontSize:12, color:MUTED }}>
            <FiStar style={{ verticalAlign:"middle" }}/>&nbsp;You've seen all products&nbsp;
            <FiStar style={{ verticalAlign:"middle" }}/>
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

  // Sync activeTab when categories load from DB
  useEffect(() => {
    if (genders.length && !genders.includes(activeTab)) {
      setActiveTab(genders[0]);
    }
  }, [genders.join(",")]);

  return (
    <main style={{ backgroundColor:SURFACE, minHeight:"100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: STYLES }}/>
      <CategoryBar activeTab={activeTab} setActiveTab={setActiveTab}/>
      <HeroBanner/>
      <AllProductsSection/>
    </main>
  );
}