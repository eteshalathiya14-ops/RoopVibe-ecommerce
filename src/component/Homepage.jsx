
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { FiHeart, FiShare2, FiPlus, FiArrowRight, FiChevronLeft, FiChevronRight, FiStar } from "react-icons/fi";

const GOLD       = "#C9A96E";
const GOLD_DARK  = "#A07840";
const GOLD_LIGHT = "#F5EDD9";
const CHARCOAL   = "#1A1A1A";
const SURFACE    = "#FAF7F2";
const MUTED      = "#7A736B";
const BORDER     = "#EDE8E0";

// Simple hook
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return isMobile;
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
@keyframes float2    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
.rv-prod-card { transition: all 0.22s ease; }
.rv-prod-card:hover { transform:translateY(-4px); box-shadow:0 12px 32px rgba(201,169,110,0.18) !important; border-color:#C9A96E !important; }
.rv-cta-btn:hover { background:#C9A96E !important; color:#fff !important; }
.rv-cat-btn:hover img { transform: scale(1.07) !important; }
`;

const genderTabs = ["WOMEN", "MEN", "GIRLS", "BOYS"];

const categoryIcons = {
  WOMEN: [
    { label: "MY FEED", isMy: true },
    { label: "SAREES",      img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=160&h=200&fit=crop&crop=top" },
    { label: "ETHNIC SETS", img: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=160&h=200&fit=crop&crop=top" },
    { label: "DRESSES",     img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=160&h=200&fit=crop&crop=top" },
    { label: "KURTAS",      img: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=160&h=200&fit=crop&crop=top" },
    { label: "TOPS",        img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=160&h=200&fit=crop&crop=top" },
    { label: "CO ORD SETS", img: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=160&h=200&fit=crop&crop=top" },
    { label: "BOTTOMS",     img: "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=160&h=200&fit=crop&crop=top" },
    { label: "SUITS",       img: "https://images.unsplash.com/photo-1594938298603-c8148c4b4e83?w=160&h=200&fit=crop&crop=top" },
    { label: "FOOTWEAR",    img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=160&h=200&fit=crop" },
    { label: "ACCESSORIES", img: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=160&h=200&fit=crop" },
    { label: "BAGS",        img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=160&h=200&fit=crop" },
    { label: "BEAUTY",      img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=160&h=200&fit=crop" },
  ],
  MEN: [
    { label: "MY FEED", isMy: true },
    { label: "JEANS",       img: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=160&h=200&fit=crop&crop=top" },
    { label: "T-SHIRT",     img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=160&h=200&fit=crop&crop=top" },
    { label: "SHIRTS",      img: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=160&h=200&fit=crop&crop=top" },
    { label: "ETHNIC SETS", img: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=160&h=200&fit=crop&crop=top" },
    { label: "TROUSERS",    img: "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=160&h=200&fit=crop&crop=top" },
    { label: "FOOTWEAR",    img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=160&h=200&fit=crop" },
    { label: "ACCESSORIES", img: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=160&h=200&fit=crop" },
  ],
  GIRLS: [
    { label: "MY FEED", isMy: true },
    { label: "DRESSES",     img: "https://images.unsplash.com/photo-1618245318763-a15156d6b23c?w=160&h=200&fit=crop&crop=top" },
    { label: "TOPS",        img: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=160&h=200&fit=crop&crop=top" },
    { label: "ETHNIC WEAR", img: "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=160&h=200&fit=crop&crop=top" },
    { label: "FOOTWEAR",    img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=160&h=200&fit=crop" },
  ],
  BOYS: [
    { label: "MY FEED", isMy: true },
    { label: "T-SHIRTS",    img: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=160&h=200&fit=crop&crop=top" },
    { label: "SHIRTS",      img: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=160&h=200&fit=crop&crop=top" },
    { label: "JEANS",       img: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=160&h=200&fit=crop&crop=top" },
    { label: "ETHNIC WEAR", img: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=160&h=200&fit=crop&crop=top" },
  ],
};

const bannerSlides = [
  { bg: "linear-gradient(120deg,#2C1A0E 0%,#5C3A1E 55%,#8B5E2E 100%)", tag:"NEW ARRIVALS", title:"Summer Wedding\nLooks", sub:"UP TO 85% OFF", cta:"Shop Trends", img:"https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=480&h=320&fit=crop&crop=top" },
  { bg: "linear-gradient(120deg,#1A1408 0%,#3D2E10 55%,#6B4F1A 100%)", tag:"PREMIUM EDIT", title:"Festive\nCollection",   sub:"STARTING ₹599",  cta:"Explore Now", img:"https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=480&h=320&fit=crop&crop=top" },
  { bg: "linear-gradient(120deg,#0D1F1A 0%,#1E4035 55%,#2D6050 100%)", tag:"SUMMER SALE",  title:"Sun-Kissed\nStyles",   sub:"UP TO 80% OFF",  cta:"Shop Now",    img:"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=480&h=320&fit=crop&crop=top" },
  { bg: "linear-gradient(120deg,#1A0D08 0%,#3D1E10 55%,#6B2E1A 100%)", tag:"KIDS STORE",   title:"Summer\nSplash",        sub:"Upto 70% Off",   cta:"Shop Kids",   img:"https://images.unsplash.com/photo-1518831959646-742c3a14ebf6?w=480&h=320&fit=crop&crop=top" },
];

const allProducts = [
  { id:1,  title:"Printed Anarkali Kurta",  price:899,  mrp:2499, img:"https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=300&h=400&fit=crop" },
  { id:2,  title:"Floral Maxi Dress",       price:1199, mrp:3499, img:"https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=400&fit=crop" },
  { id:3,  title:"Silk Blend Saree",        price:1599, mrp:4299, img:"https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300&h=400&fit=crop" },
  { id:4,  title:"Co-Ord Set Ethnic",       price:1099, mrp:2799, img:"https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=300&h=400&fit=crop" },
  { id:5,  title:"Palazzo Kurta Set",       price:799,  mrp:1999, img:"https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=300&h=400&fit=crop" },
  { id:6,  title:"Embroidered Dupatta",     price:499,  mrp:1299, img:"https://images.unsplash.com/photo-1617375407175-baa01a8d69f8?w=300&h=400&fit=crop" },
  { id:7,  title:"Block Print Top",         price:649,  mrp:1599, img:"https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=300&h=400&fit=crop" },
  { id:8,  title:"Cigarette Pants",         price:849,  mrp:2199, img:"https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=300&h=400&fit=crop" },
  { id:9,  title:"Banarasi Lehenga",        price:2499, mrp:6999, img:"https://images.unsplash.com/photo-1594938298603-c8148c4b4e83?w=300&h=400&fit=crop" },
  { id:10, title:"Linen Co-Ord Set",        price:1299, mrp:3299, img:"https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=300&h=400&fit=crop" },
  { id:11, title:"Embroidered Kurti",       price:699,  mrp:1799, img:"https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=300&h=400&fit=crop" },
  { id:12, title:"Chiffon Saree",           price:1199, mrp:3199, img:"https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=300&h=400&fit=crop" },
  { id:13, title:"Georgette Anarkali",      price:1099, mrp:2999, img:"https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=300&h=400&fit=crop&sig=13" },
  { id:14, title:"Printed Wrap Dress",      price:799,  mrp:1999, img:"https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=400&fit=crop&sig=14" },
  { id:15, title:"Silk Kurta Set",          price:1399, mrp:3599, img:"https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=300&h=400&fit=crop&sig=15" },
  { id:16, title:"Floral Midi Skirt",       price:649,  mrp:1699, img:"https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=300&h=400&fit=crop&sig=16" },
  { id:17, title:"Embroidered Blouse",      price:599,  mrp:1499, img:"https://images.unsplash.com/photo-1617375407175-baa01a8d69f8?w=300&h=400&fit=crop&sig=17" },
  { id:18, title:"Palazzo Set Cotton",      price:899,  mrp:2299, img:"https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=300&h=400&fit=crop&sig=18" },
  { id:19, title:"Lucknowi Kurti",          price:749,  mrp:1899, img:"https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300&h=400&fit=crop&sig=19" },
  { id:20, title:"Rayon Sharara Set",       price:999,  mrp:2599, img:"https://images.unsplash.com/photo-1594938298603-c8148c4b4e83?w=300&h=400&fit=crop&sig=20" },
];

const PAGE_SIZE = 8;

// ─────────────────────────────────────────────────────────
function StyleInject() { return <style dangerouslySetInnerHTML={{ __html: STYLES }} />; }

// ─────────────────────────────────────────────────────────
function ArchCatItem({ cat, isActive, onClick, isMobile }) {
  const W = isMobile ? 62 : 80;
  const H = isMobile ? 76 : 96;
  const BR = isMobile ? "31px 31px 6px 6px" : "40px 40px 8px 8px";
  const labelSize = isMobile ? "8.5px" : "9.5px";

  return (
    <button
      className="rv-cat-btn"
      onClick={onClick}
      style={{ display:"flex", flexDirection:"column", alignItems:"center", background:"none", border:"none", cursor:"pointer", minWidth: isMobile ? 72 : 90, flexShrink:0, padding:"0 4px" }}
    >
      <div style={{ width:W, height:H, position:"relative", overflow:"hidden", borderRadius:BR, backgroundColor: isActive ? GOLD_LIGHT : "#F2EBE0", border: isActive ? `2px solid ${GOLD}` : "2px solid transparent", transition:"border-color 0.2s" }}>
        {cat.isMy ? (
          <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", background:`linear-gradient(135deg,${GOLD_LIGHT},${GOLD}22)` }}>
            <span style={{ fontFamily:"Georgia,serif", fontWeight:900, fontSize: isMobile ? "16px":"20px", color:GOLD_DARK }}>MY</span>
          </div>
        ) : (
          <img src={cat.img} alt={cat.label} style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top", display:"block", transition:"transform 0.3s ease" }} />
        )}
      </div>
      <span style={{ fontSize:labelSize, fontWeight: isActive ? "700":"500", color: isActive ? GOLD_DARK : MUTED, letterSpacing:"0.3px", textAlign:"center", whiteSpace:"nowrap", marginTop:"6px", borderBottom: isActive ? `1.5px solid ${GOLD}` : "1.5px solid transparent", paddingBottom:"1px" }}>
        {cat.label}
      </span>
    </button>
  );
}

// ─────────────────────────────────────────────────────────
function CategoryBar({ activeTab, setActiveTab }) {
  const isMobile = useIsMobile();
  const [activeItem, setActiveItem] = useState("MY FEED");
  const cats = categoryIcons[activeTab] || categoryIcons.WOMEN;

  return (
    <div style={{ backgroundColor:"#FAF7F2", borderBottom:`1px solid ${BORDER}` }}>
      <div style={{ display:"flex", padding: isMobile ? "0 8px" : "0 40px", borderBottom:`1px solid ${BORDER}` }}>
        {genderTabs.map(tab => (
          <button
            key={tab}
            onClick={() => { setActiveTab(tab); setActiveItem("MY FEED"); }}
            style={{ padding: isMobile ? "9px 10px" : "11px 22px", fontSize: isMobile ? "11px":"13px", fontWeight:"600", letterSpacing: isMobile ? "0.3px":"0.6px", color: activeTab===tab ? GOLD_DARK : MUTED, background:"none", border:"none", borderBottom: activeTab===tab ? `2.5px solid ${GOLD}` : "2.5px solid transparent", cursor:"pointer" }}
          >
            {tab}
          </button>
        ))}
      </div>
      <div style={{ display:"flex", alignItems:"flex-end", overflowX:"auto", padding: isMobile ? "10px 8px 8px" : "16px 32px 12px", gap:"2px", scrollbarWidth:"none", WebkitOverflowScrolling:"touch" }}>
        {cats.map(cat => (
          <ArchCatItem key={cat.label} cat={cat} isActive={activeItem===cat.label} onClick={() => setActiveItem(cat.label)} isMobile={isMobile} />
        ))}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
function HeroBanner() {
  const isMobile = useIsMobile();
  const [current, setCurrent] = useState(0);
  const [imgKey, setImgKey]   = useState(0);
  const [txtKey, setTxtKey]   = useState(0);
  const timerRef = useRef(null);
  const total = bannerSlides.length;

  const goTo = idx => {
    const next = (idx + total) % total;
    setCurrent(next); setImgKey(k=>k+1); setTxtKey(k=>k+1);
  };
  const startTimer = () => {
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => setCurrent(c => { const n=(c+1)%total; setImgKey(k=>k+1); setTxtKey(k=>k+1); return n; }), 3000);
  };
  useEffect(() => { startTimer(); return () => clearInterval(timerRef.current); }, []);

  const touchStartX = useRef(null);
  const touchEndX = useRef(null);

  const onTouchStart = (e) => {
    touchStartX.current = e.touches?.[0]?.clientX ?? null;
  };

  const onTouchEnd = (e) => {
    touchEndX.current = e.changedTouches?.[0]?.clientX ?? null;
    if (touchStartX.current == null || touchEndX.current == null) return;

    const dx = touchEndX.current - touchStartX.current;
    // swipe threshold: ignore tiny movements
    if (Math.abs(dx) < 40) return;

    if (dx < 0) goTo(current + 1); // swipe left => next
    else goTo(current - 1); // swipe right => prev

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const slide = bannerSlides[current];
  const H     = isMobile ? 170 : 260;
  const titleSz = isMobile ? "17px" : "28px";
  const subSz   = isMobile ? "9px"  : "11px";
  const ctaSz   = isMobile ? "8px"  : "10px";
  const ctaPad  = isMobile ? "5px 10px" : "8px 20px";
  const textW   = isMobile ? "57%" : "55%";
  const textPad = isMobile ? "12px 6px 12px 12px" : "28px 28px 28px 32px";
  const imgW    = isMobile ? "41%" : "42%";

  return (
    <div style={{ padding: isMobile ? "10px 0 8px" : "14px 0 10px", backgroundColor:SURFACE, display:"flex", justifyContent:"center" }}>
      <div
        onMouseEnter={() => clearInterval(timerRef.current)}
        onMouseLeave={startTimer}
        style={{ position:"relative", width: isMobile ? "95%" : "72%", maxWidth:"960px", touchAction: "pan-y" }}
        onTouchStart={isMobile ? onTouchStart : undefined}
        onTouchEnd={isMobile ? onTouchEnd : undefined}
      >
        <div style={{ position:"relative", height:H, borderRadius: isMobile ? 10:12, overflow:"hidden", boxShadow:"0 6px 32px rgba(201,169,110,0.18)", border:`1px solid ${GOLD}44`, background:slide.bg, transition:"background 0.6s" }}>

          {/* floating circles — desktop only */}
          {!isMobile && (
            <div style={{ position:"absolute", inset:0, pointerEvents:"none", overflow:"hidden" }}>
              <div style={{ position:"absolute", width:180, height:180, borderRadius:"50%", background:`radial-gradient(circle,${GOLD}18 0%,transparent 70%)`, top:-40, left:-40, animation:"float1 5s ease-in-out infinite" }}/>
              <div style={{ position:"absolute", width:140, height:140, borderRadius:"50%", background:`radial-gradient(circle,${GOLD}12 0%,transparent 70%)`, bottom:-30, left:"30%", animation:"float2 7s ease-in-out infinite" }}/>
            </div>
          )}

          {/* TEXT */}
          <div key={`t${txtKey}`} style={{ position:"absolute", left:0, top:0, bottom:0, width:textW, padding:textPad, display:"flex", flexDirection:"column", justifyContent:"center", zIndex:2 }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:5, backgroundColor:`${GOLD}20`, border:`1px solid ${GOLD}50`, padding: isMobile ? "2px 8px":"3px 12px", borderRadius:20, marginBottom: isMobile ? 8:12, width:"fit-content", animation:"tagPop 0.5s ease both" }}>
              <span style={{ width:5, height:5, borderRadius:"50%", backgroundColor:GOLD, display:"inline-block" }}/>
              <span style={{ fontSize: isMobile ? "7px":"9px", fontWeight:800, letterSpacing:"1.5px", color:GOLD }}>{slide.tag}</span>
            </div>
            <h2 style={{ fontSize:titleSz, fontWeight:800, color:"#fff", lineHeight:1.15, marginBottom: isMobile ? 6:10, fontFamily:"'Playfair Display',Georgia,serif", whiteSpace:"pre-line", textShadow:"0 2px 14px rgba(0,0,0,0.35)", animation:"slideInL 0.6s 0.1s ease both" }}>
              {slide.title}
            </h2>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom: isMobile ? 10:18, animation:"slideInL 0.6s 0.2s ease both" }}>
              <div style={{ height:"1.5px", width:16, background:GOLD, opacity:0.8, borderRadius:1 }}/>
              <p style={{ fontSize:subSz, color:GOLD, fontWeight:700, letterSpacing:"1.2px" }}>{slide.sub}</p>
            </div>
            <button className="rv-cta-btn" style={{ width:"fit-content", backgroundColor:"transparent", border:`1.5px solid ${GOLD}`, color:GOLD, padding:ctaPad, fontSize:ctaSz, fontWeight:800, letterSpacing:"1px", borderRadius:4, cursor:"pointer", transition:"all 0.2s", display:"flex", alignItems:"center", gap:4, animation:"slideInL 0.6s 0.3s ease both" }}>
              {slide.cta} <FiArrowRight size={isMobile ? 10:12} />
            </button>
          </div>

          {/* IMAGE */}
          <div style={{ position:"absolute", right:0, top:0, bottom:0, width:imgW, overflow:"hidden" }}>
            <img key={`i${imgKey}`} src={slide.img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top", display:"block", animation:"imgIn 0.8s ease both, kenBurns 5s ease forwards" }} />
            <div style={{ position:"absolute", left:0, top:0, bottom:0, width:"45%", background:`linear-gradient(to right,#2C1A0E,transparent)`, pointerEvents:"none" }}/>
          </div>

          {/* counter */}
          <div style={{ position:"absolute", bottom:10, right:10, backgroundColor:"rgba(26,20,8,0.55)", border:`1px solid ${GOLD}44`, padding:"2px 8px", borderRadius:20, fontSize:9, fontWeight:700, color:GOLD, zIndex:10 }}>
            {current+1}/{total}
          </div>

          {/* arrows */}
          {[{d:-1,p:"left"},{d:1,p:"right"}].map(({d,p})=> (
            !isMobile && (
              <button
                key={p}
                onClick={()=>goTo(current+d)}
                style={{ position:"absolute", top:"50%", [p]: isMobile ? 6:10, transform:"translateY(-50%)", width: isMobile ? 24:30, height: isMobile ? 24:30, borderRadius:"50%", backgroundColor:"rgba(26,20,8,0.55)", border:`1px solid ${GOLD}55`, color:GOLD, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", zIndex:10 }}
              >
                {d===-1 ? <FiChevronLeft size={isMobile ? 14:18}/> : <FiChevronRight size={isMobile ? 14:18}/>}
              </button>
            )
          ))}
        </div>

        {/* dots */}
        <div style={{ display:"flex", justifyContent:"center", gap:8, marginTop:8 }}>
          {bannerSlides.map((_,i)=>(
            <button key={i} onClick={()=>goTo(i)} style={{ padding:0, border:"none", background:"none", cursor:"pointer" }}>
              <div style={{ width: i===current ? 18:6, height:6, borderRadius:4, backgroundColor: i===current ? GOLD : BORDER, transition:"all 0.3s" }}/>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
function SectionHeading({ title, sub, isMobile }) {
  return (
    <div style={{ marginBottom: isMobile ? 18:28 }}>
      <h2 style={{ fontSize: isMobile ? "18px":"22px", fontWeight:700, color:CHARCOAL, fontFamily:"'Playfair Display',Georgia,serif", marginBottom:4 }}>{title}</h2>
      {sub && <p style={{ fontSize: isMobile ? "12px":"13px", color:MUTED, marginBottom:8 }}>{sub}</p>}
      <div style={{ height:"2.5px", width:0, backgroundColor:GOLD, animation:"goldLine 0.8s 0.2s ease forwards", borderRadius:2 }}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
function ProductCard({ product, isMobile }) {
  const { addToCart } = useCart();
  const { toggleWishlist, isLiked } = useWishlist();
  const liked = isLiked?.(product?.id);
  const [hov, setHov] = useState(false);
  const mainH = isMobile ? 160 : 220;
  const sideH = isMobile ? 78  : 108;
  const moreCount = 12;
  const discount  = Math.round((1 - product.price/product.mrp)*100);

  return (
    <div className="rv-prod-card" onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ backgroundColor:"#FAF7F2", borderRadius:8, overflow:"hidden", border:`1px solid ${hov ? GOLD:"#e8e8e8"}`, cursor:"pointer", display:"flex", flexDirection:"column" }}
    >
      <Link to={`/product/${product.id}`} style={{ textDecoration:"none", display:"flex", gap:4, padding:4 }}>
        <div style={{ flex:"1.5", height:mainH, borderRadius:4, overflow:"hidden" }}>
          <img src={product.img} alt={product.title} style={{ width:"100%", height:"100%", objectFit:"cover", display:"block" }} />
        </div>
        <div style={{ flex:"0.6", display:"flex", flexDirection:"column", gap:4 }}>
          <div style={{ height:sideH, borderRadius:4, overflow:"hidden" }}>
            <img src={product.img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", filter:"blur(1px)", opacity:0.85 }} />
          </div>
          <div style={{ position:"relative", height:sideH, borderRadius:4, overflow:"hidden" }}>
            <img src={product.img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", filter:"grayscale(100%)" }} />
            <div style={{ position:"absolute", inset:0, backgroundColor:"rgba(0,0,0,0.4)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize: isMobile ? 14:16, fontWeight:800 }}>+{moreCount}</div>
          </div>
        </div>
      </Link>

      <div style={{ padding: isMobile ? "7px 8px":"10px 12px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <div style={{ flex:1, minWidth:0 }}>
          <p style={{ fontSize:9, fontWeight:800, color:MUTED, letterSpacing:"0.4px", textTransform:"uppercase", whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>
            EXCLUSIVE STORY
          </p>
          <div style={{ display:"flex", alignItems:"center", gap:4, marginTop:2, flexWrap:"wrap" }}>
            <span style={{ fontSize: isMobile ? 12:13, fontWeight:800, color:CHARCOAL }}>₹{product.price}</span>
            <span style={{ fontSize:10, color:MUTED, textDecoration:"line-through" }}>₹{product.mrp}</span>
            <span style={{ fontSize:9, fontWeight:700, color:"#2E7D32", backgroundColor:"#E8F5E9", padding:"1px 5px", borderRadius:3 }}>{discount}%</span>
          </div>
        </div>

        <div style={{ display:"flex", alignItems:"center", justifyContent:"flex-end", gap:8, flexShrink:0 }}>

          <button
            onClick={e=>{e.preventDefault();e.stopPropagation();toggleWishlist(product);}}
            style={{ background:"none", border:"none", padding:0, cursor:"pointer", color: liked ? "#ff4d4f":CHARCOAL, display:"flex", alignItems:"center", justifyContent:"center", transition:"all 0.18s ease" }}
          >
            <FiHeart size={isMobile ? 15:18} fill={liked ? "#ff4d4f":"none"} stroke={liked ? "#ff4d4f":"currentColor"} />
          </button>

          {!isMobile && (
            <button
              onClick={e=>{e.preventDefault();e.stopPropagation();}}
              style={{ background:"none", border:"none", padding:0, cursor:"pointer", color:CHARCOAL, display:"flex", alignItems:"center", justifyContent:"center" }}
            >
              <FiShare2 size={14} />
            </button>
          )}

          {!isMobile && (
            <button
              onClick={e=>{e.preventDefault();e.stopPropagation();addToCart(product);}}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                background: GOLD,
                color: "#fff",
                boxShadow: "0 2px 8px rgba(201,169,110,0.35)",
                border: "none",
                padding: 0,
                cursor: "pointer",
                transition: "transform 0.15s ease",
              }}
            >
              <FiPlus size={isMobile ? 13 : 18} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
function AllProductsSection() {
  const isMobile = useIsMobile();
  const [count, setCount] = useState(PAGE_SIZE);
  const loaderRef = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) setCount(c => Math.min(c + PAGE_SIZE, allProducts.length));
    }, { threshold: 0.1 });
    if (loaderRef.current) obs.observe(loaderRef.current);
    return () => obs.disconnect();
  }, []);

  const visible = allProducts.slice(0, count);
  const cols    = isMobile ? 2 : 4;
  const gap     = isMobile ? 10 : 18;
  const pad     = isMobile ? "20px 12px 32px" : "36px 40px 48px";

  return (
    <section style={{ padding:pad, backgroundColor:"#fff", borderTop:`1px solid ${BORDER}` }}>
      <div style={{ maxWidth:1320, margin:"0 auto" }}>
        <SectionHeading title="Trending Right Now" sub="Handpicked looks you'll love" isMobile={isMobile} />
        <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols},1fr)`, gap }}>
          {visible.map((p,i) => (
            <div key={p.id} style={{ animation:`fadeSlide 0.4s ${(i%PAGE_SIZE)*0.06}s ease both` }}>
              <ProductCard product={p} isMobile={isMobile} />
            </div>
          ))}
        </div>

        {count < allProducts.length && (
          <div ref={loaderRef} style={{ display:"flex", justifyContent:"center", gap:10, padding:"32px 0 8px" }}>
            {[0,1,2].map(i=><div key={i} style={{ width:8, height:8, borderRadius:"50%", backgroundColor:GOLD, animation:`pulse 1.2s ${i*0.2}s ease-in-out infinite` }}/>)}
          </div>
        )}
        {count >= allProducts.length && (
          <p style={{ textAlign:"center", marginTop:28, fontSize:12, color:MUTED }}>
            <FiStar style={{ verticalAlign:"middle" }}/> &nbsp;You've seen all products&nbsp; <FiStar style={{ verticalAlign:"middle" }}/>
          </p>
        )}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────
export default function HomePage() {
  const [activeTab, setActiveTab] = useState("WOMEN");
  return (
    <main style={{ backgroundColor:SURFACE, minHeight:"100vh" }}>
      <StyleInject />
      <CategoryBar activeTab={activeTab} setActiveTab={setActiveTab} />
      <HeroBanner />
      <AllProductsSection />
    </main>
  );
}