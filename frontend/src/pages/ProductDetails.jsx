import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useCart }      from "../context/CartContext";
import { useAuth }      from "../context/AuthContext";
import { useWishlist }  from "../context/WishlistContext";
import { useAdminData } from "../Admin/context/Admindatacontext";
import {
  FiShoppingCart, FiCheck, FiZap, FiAlertTriangle,
  FiStar, FiHeart, FiX, FiChevronLeft, FiChevronRight, FiPlus,
} from "react-icons/fi";

const GOLD       = "#C9A96E";
const GOLD_DARK  = "#A07840";
const GOLD_LIGHT = "#F5EDD9";
const CHARCOAL   = "#1A1A1A";
const SURFACE    = "#FAFAF8";
const MUTED      = "#7A736B";
const BORDER     = "#EDE8E0";
const GREEN      = "#2E7D32";
const BASE       = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&display=swap');
@keyframes fadeIn   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
@keyframes slideUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
@keyframes zoomIn   { from{transform:scale(0.96)} to{transform:scale(1)} }
@keyframes imgIn    { from{opacity:0} to{opacity:1} }
@keyframes slideInR { from{transform:translateX(100%)} to{transform:translateX(0)} }
.pdp-thumb:hover    { border-color:${GOLD} !important; }
.pdp-size:hover     { border-color:${GOLD} !important; color:${GOLD_DARK} !important; }
.pdp-swatch:hover   { transform:scale(1.1) !important; }
.pdp-btn-cart:hover { background:${GOLD_DARK} !important; }
.pdp-related:hover  { transform:translateY(-3px); box-shadow:0 8px 24px rgba(201,169,110,0.16) !important; border-color:${GOLD} !important; }
.pdp-related        { transition:all 0.2s ease; }
.pdp-related-heart:hover { color:#ff4d4f !important; }
.pdp-related-cart:hover  { background:${GOLD_DARK} !important; }
`;

function resolveImg(img) {
  if (!img) return "";
  if (typeof img === "string") return img;
  if (typeof img === "object") return img.src || img.url || "";
  return "";
}
function getPid(p) { return String(p._id || p.id || ""); }

function Stars({ rating, size = 12 }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
      {[1,2,3,4,5].map(s => (
        <svg key={s} width={size} height={size} viewBox="0 0 24 24"
          fill={s <= Math.round(rating) ? GOLD : "#E0D8CC"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </span>
  );
}

// ── Fullscreen viewer ──────────────────────────────────────────
function ImageViewer({ images, startIdx, onClose }) {
  const [idx, setIdx] = useState(startIdx);
  const prev = (e) => { e.stopPropagation(); setIdx(i => (i - 1 + images.length) % images.length); };
  const next = (e) => { e.stopPropagation(); setIdx(i => (i + 1) % images.length); };

  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [onClose]);

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, backgroundColor:"rgba(0,0,0,0.94)", zIndex:99999, display:"flex", alignItems:"center", justifyContent:"center" }}>
      {images.length > 1 && (
        <button onClick={prev} style={{ position:"absolute", left:16, top:"50%", transform:"translateY(-50%)", background:"rgba(255,255,255,0.15)", border:"none", borderRadius:"50%", width:48, height:48, color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100000 }}>
          <FiChevronLeft size={24}/>
        </button>
      )}
      <div onClick={e => e.stopPropagation()} style={{ maxWidth:"88vw", maxHeight:"88vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <img key={idx} src={images[idx]} alt="" style={{ maxWidth:"88vw", maxHeight:"88vh", objectFit:"contain", borderRadius:8, display:"block", animation:"imgIn 0.25s ease" }}/>
      </div>
      {images.length > 1 && (
        <button onClick={next} style={{ position:"absolute", right:16, top:"50%", transform:"translateY(-50%)", background:"rgba(255,255,255,0.15)", border:"none", borderRadius:"50%", width:48, height:48, color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100000 }}>
          <FiChevronRight size={24}/>
        </button>
      )}
      <button onClick={onClose} style={{ position:"absolute", top:16, right:16, background:"rgba(255,255,255,0.15)", border:"none", borderRadius:"50%", width:42, height:42, color:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", zIndex:100000 }}>
        <FiX size={20}/>
      </button>
      {images.length > 1 && (
        <div style={{ position:"absolute", bottom:16, left:"50%", transform:"translateX(-50%)", color:"rgba(255,255,255,0.6)", fontSize:12, background:"rgba(0,0,0,0.4)", padding:"4px 12px", borderRadius:20, zIndex:100000 }}>
          {idx + 1} / {images.length}
        </div>
      )}
      {images.length > 1 && (
        <div onClick={e => e.stopPropagation()} style={{ position:"absolute", bottom:48, left:"50%", transform:"translateX(-50%)", display:"flex", gap:8, zIndex:100000 }}>
          {images.map((img, i) => (
            <div key={i} onClick={() => setIdx(i)} style={{ width:48, height:56, borderRadius:6, overflow:"hidden", cursor:"pointer", border:`2.5px solid ${i === idx ? GOLD : "rgba(255,255,255,0.3)"}`, flexShrink:0, transition:"border-color 0.15s" }}>
              <img src={img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top" }}/>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Review Item ────────────────────────────────────────────────
function ReviewItem({ r, isLast }) {
  return (
    <div style={{ padding:"16px 0", borderBottom: isLast ? "none" : `1px solid ${BORDER}` }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
        <div style={{ width:34, height:34, borderRadius:"50%", background:`linear-gradient(135deg,${GOLD_LIGHT},${GOLD})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:GOLD_DARK, flexShrink:0 }}>
          {(r.name || "?").charAt(0)}
        </div>
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:13, fontWeight:700, color:CHARCOAL }}>{r.name}</span>
            {r.verified && (
              <span style={{ fontSize:9, color:GREEN, fontWeight:600, backgroundColor:"#E8F5E9", padding:"1px 6px", borderRadius:10 }}>✓ Verified</span>
            )}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:2 }}>
            <Stars rating={r.rating} size={10}/>
            <span style={{ fontSize:11, color:MUTED }}>{r.date}</span>
          </div>
        </div>
      </div>
      <p style={{ fontSize:13, color:MUTED, lineHeight:1.6, paddingLeft:44 }}>{r.text}</p>
      {r.images?.length > 0 && (
        <div style={{ display:"flex", gap:8, marginTop:10, paddingLeft:44, flexWrap:"wrap" }}>
          {r.images.map((img, i) => (
            <img key={i} src={img} alt="review" style={{ width:80, height:100, objectFit:"cover", borderRadius:8, border:`1px solid ${BORDER}`, cursor:"pointer" }} onClick={() => window.open(img, "_blank")}/>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Add Review Form ────────────────────────────────────────────
function AddReviewForm({ onSubmit, submitting }) {
  const [name,   setName]   = useState("");
  const [rating, setRating] = useState(5);
  const [text,   setText]   = useState("");
  const [images, setImages] = useState([]);
  const [hov,    setHov]    = useState(0);
  const [err,    setErr]    = useState("");
  const [done,   setDone]   = useState(false);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 4) { alert("Maximum 4 images allowed"); return; }
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => setImages(prev => [...prev, ev.target.result]);
      reader.readAsDataURL(file);
    });
  };

  const removeImg = (i) => setImages(prev => prev.filter((_, idx) => idx !== i));

  const submit = async () => {
    if (!name.trim() || !text.trim()) { setErr("Name aur review dono required hain"); return; }
    setErr("");
    const d = new Date();
    const date = `${d.getDate()} ${d.toLocaleString("default", { month:"short" })} ${d.getFullYear()}`;
    await onSubmit({ name: name.trim(), rating, text: text.trim(), date, verified: false, images });
    setName(""); setText(""); setRating(5); setImages([]);
    setDone(true);
    setTimeout(() => setDone(false), 3000);
  };

  const labels = ["","Poor","Fair","Good","Very Good","Excellent"];

  return (
    <div style={{ background:SURFACE, border:`1px solid ${BORDER}`, borderRadius:10, padding:18, marginBottom:24 }}>
      <p style={{ fontSize:13, fontWeight:700, color:CHARCOAL, marginBottom:14 }}>Write a Review</p>

      {done && (
        <div style={{ fontSize:12, color:GREEN, background:"#E8F5E9", padding:"8px 12px", borderRadius:8, marginBottom:12, fontWeight:600, display:"flex", alignItems:"center", gap:6 }}>
          <FiCheck size={14}/> Review submitted successfully!
        </div>
      )}
      {err && (
        <div style={{ fontSize:11, color:"#E53935", background:"#FDECEA", padding:"6px 10px", borderRadius:6, marginBottom:10, fontWeight:600 }}>
          {err}
        </div>
      )}

      <div style={{ marginBottom:12 }}>
        <label style={{ fontSize:11, color:MUTED, fontWeight:600, display:"block", marginBottom:5 }}>Your Name *</label>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Priya S."
          style={{ width:"100%", padding:"8px 12px", border:`1px solid ${BORDER}`, borderRadius:6, fontSize:13, fontFamily:"inherit", outline:"none", boxSizing:"border-box", color:CHARCOAL }}/>
      </div>

      <div style={{ marginBottom:12 }}>
        <label style={{ fontSize:11, color:MUTED, fontWeight:600, display:"block", marginBottom:5 }}>Rating *</label>
        <div style={{ display:"flex", alignItems:"center", gap:6 }}>
          {[1,2,3,4,5].map(s => (
            <svg key={s} width={26} height={26} viewBox="0 0 24 24"
              fill={s <= (hov || rating) ? GOLD : "#E0D8CC"}
              style={{ cursor:"pointer", transition:"fill 0.1s" }}
              onMouseEnter={() => setHov(s)} onMouseLeave={() => setHov(0)}
              onClick={() => setRating(s)}>
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          ))}
          <span style={{ fontSize:12, color:MUTED, marginLeft:6 }}>{labels[hov || rating]}</span>
        </div>
      </div>

      <div style={{ marginBottom:16 }}>
        <label style={{ fontSize:11, color:MUTED, fontWeight:600, display:"block", marginBottom:5 }}>Your Review *</label>
        <textarea value={text} onChange={e => setText(e.target.value)} placeholder="Share your experience…" rows={3}
          style={{ width:"100%", padding:"8px 12px", border:`1px solid ${BORDER}`, borderRadius:6, fontSize:13, fontFamily:"inherit", outline:"none", resize:"vertical", boxSizing:"border-box", color:CHARCOAL }}/>
      </div>

      <div style={{ marginBottom:16 }}>
        <label style={{ fontSize:11, color:MUTED, fontWeight:600, display:"block", marginBottom:8 }}>Add Photos (Optional)</label>
        <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginBottom:8 }}>
          {images.map((img, i) => (
            <div key={i} style={{ position:"relative" }}>
              <img src={img} alt="preview" style={{ width:60, height:60, objectFit:"cover", borderRadius:6, border:`1.5px solid ${GOLD}` }}/>
              <button onClick={() => removeImg(i)} style={{ position:"absolute", top:-5, right:-5, width:18, height:18, borderRadius:"50%", background:"#C0392B", border:"none", color:"#fff", fontSize:10, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
            </div>
          ))}
          {images.length < 4 && (
            <label style={{ width:60, height:60, borderRadius:6, border:`1.5px dashed ${BORDER}`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", cursor:"pointer", color:MUTED, backgroundColor:"#fff" }}>
              <FiPlus size={18}/>
              <span style={{ fontSize:8, marginTop:2 }}>Upload</span>
              <input type="file" accept="image/*" multiple style={{ display:"none" }} onChange={handleImageUpload}/>
            </label>
          )}
        </div>
        <p style={{ fontSize:10, color:MUTED }}>Upload up to 4 photos.</p>
      </div>

      <button onClick={submit} disabled={submitting}
        style={{ padding:"10px 24px", background: submitting ? "#ccc" : GOLD, color:"#fff", border:"none", borderRadius:6, fontSize:13, fontWeight:700, cursor: submitting ? "not-allowed" : "pointer", display:"flex", alignItems:"center", gap:8 }}>
        {submitting ? "Submitting…" : "Submit Review"}
      </button>
    </div>
  );
}

// ── Related Product Card ───────────────────────────────────────
function RelatedCard({ p }) {
  const { addToCart }               = useCart();
  const { toggleWishlist, isLiked } = useWishlist();
  const rpid  = getPid(p);
  const liked = isLiked?.(rpid);
  const thumb = resolveImg(p.colorVariants?.[0]?.images?.[0]);
  const d     = p.mrp > 0 ? Math.round((1 - p.price / p.mrp) * 100) : 0;
  const [addedR, setAddedR] = useState(false);

  const handleCart = (e) => {
    e.preventDefault(); e.stopPropagation();
    addToCart({ id: rpid, title: p.title, brand: p.brand, price: p.price, mrp: p.mrp, img: thumb, quantity: 1 });
    setAddedR(true);
    setTimeout(() => setAddedR(false), 2000);
  };

  return (
    <div className="pdp-related" style={{ backgroundColor:"#fff", borderRadius:10, overflow:"hidden", border:`1px solid ${BORDER}`, display:"block", position:"relative" }}>
      <Link to={`/product/${rpid}`} style={{ textDecoration:"none", display:"block" }}>
        <div style={{ position:"relative" }}>
          {thumb
            ? <img src={thumb} alt={p.title} style={{ width:"100%", height:200, objectFit:"cover", display:"block" }} onError={e => e.target.style.opacity = "0"}/>
            : <div style={{ width:"100%", height:200, background:SURFACE, display:"flex", alignItems:"center", justifyContent:"center", color:MUTED, fontSize:12 }}>No Image</div>
          }
          {d > 0 && (
            <div style={{ position:"absolute", top:8, left:8, background:`linear-gradient(135deg,${GOLD_DARK},${GOLD})`, color:"#fff", fontSize:9, fontWeight:800, padding:"2px 7px", borderRadius:3 }}>
              {d}% OFF
            </div>
          )}
          <button className="pdp-related-heart"
            onClick={e => { e.preventDefault(); e.stopPropagation(); toggleWishlist({ ...p, id: rpid, img: thumb }); }}
            style={{ position:"absolute", top:8, right:8, width:30, height:30, borderRadius:"50%", background:"rgba(255,255,255,0.92)", border:`1px solid ${BORDER}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color: liked ? "#ff4d4f" : CHARCOAL, transition:"color 0.18s" }}>
            <FiHeart size={14} fill={liked ? "#ff4d4f" : "none"} stroke={liked ? "#ff4d4f" : "currentColor"}/>
          </button>
        </div>
        <div style={{ padding:"10px 14px 6px" }}>
          <p style={{ fontSize:11, color:GOLD_DARK, fontWeight:700, letterSpacing:"0.4px", marginBottom:2, textTransform:"uppercase" }}>{p.brand || ""}</p>
          <p style={{ fontSize:12, color:CHARCOAL, fontWeight:600, marginBottom:6, lineHeight:1.4 }}>{p.title}</p>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ fontSize:14, fontWeight:800, color:CHARCOAL }}>₹{p.price}</span>
            <span style={{ fontSize:11, color:MUTED, textDecoration:"line-through" }}>₹{p.mrp}</span>
          </div>
        </div>
      </Link>
      <div style={{ padding:"8px 14px 12px" }}>
        <button className="pdp-related-cart" onClick={handleCart}
          style={{ width:"100%", padding:"9px", background: addedR ? GREEN : GOLD, color:"#fff", border:"none", borderRadius:6, fontSize:11, fontWeight:700, cursor:"pointer", transition:"background 0.2s", display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
          {addedR ? <><FiCheck size={13}/> ADDED</> : <><FiShoppingCart size={13}/> ADD TO CART</>}
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════
export default function ProductDetailPage() {
  const navigate              = useNavigate();
  const { id }                = useParams();
  const { addToCart }         = useCart();
  const { isLoggedIn }        = useAuth();
  const { toggleWishlist, isLiked } = useWishlist();
  const { products, loading } = useAdminData();

  const product = useMemo(() => products.find(p => getPid(p) === String(id)), [products, id]);
  const pid     = product ? getPid(product) : id;
  const liked   = isLiked?.(pid);

  const variants   = product?.colorVariants || [];
  const [varIdx, setVarIdx] = useState(0);
  const selVariant = variants[varIdx] || variants[0];

  const images = useMemo(() =>
    (selVariant?.images || []).map(resolveImg).filter(Boolean),
  [selVariant]);

  const [activeImg,  setActiveImg]  = useState(0);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selSize,    setSelSize]    = useState(null);
  const [qty,        setQty]        = useState(1);
  const [added,      setAdded]      = useState(false);
  const [tab,        setTab]        = useState("description");
  const [sizeErr,    setSizeErr]    = useState(false);
  const [showReviewDrawer, setShowReviewDrawer] = useState(false);

  // ── Reviews: Backend se fetch ────────────────────────────────
  const [reviewsList,    setReviewsList]    = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [submitting,     setSubmitting]     = useState(false);

  useEffect(() => {
    if (!pid) return;
    setReviewsLoading(true);
    fetch(`${BASE}/reviews/${pid}`)
      .then(r => r.json())
      .then(data => { if (data.success) setReviewsList(data.reviews || []); })
      .catch(() => {})
      .finally(() => setReviewsLoading(false));
  }, [pid]);

  const reviews = reviewsList;

  const handleAddReview = async (r) => {
    setSubmitting(true);
    try {
      const res  = await fetch(`${BASE}/reviews/${pid}`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(r),
      });
      const data = await res.json();
      if (data.success) setReviewsList(prev => [data.review, ...prev]);
    } catch (err) {
      console.error("Review submit failed:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length > 0
    ? parseFloat((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1))
    : (product?.rating || 0);

  const ratingDist = [5,4,3,2,1].map(star => {
    const cnt = reviews.filter(r => r.rating === star).length;
    const pct = reviews.length ? Math.round(cnt / reviews.length * 100) : 0;
    return { star, pct };
  });

  const handleColorClick = i => { setVarIdx(i); setActiveImg(0); };

  const handleAddToCart = () => {
    if (product?.sizes?.length > 0 && !selSize) { setSizeErr(true); return; }
    setSizeErr(false);
    addToCart({ id: pid, title: product.title, brand: product.brand, price: product.price, mrp: product.mrp, img: images[0] || "", selectedSize: selSize, selectedColor: selVariant?.colorName || "", quantity: qty });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  const handleBuyNow = () => {
    if (product?.sizes?.length > 0 && !selSize) { setSizeErr(true); return; }
    if (!isLoggedIn) { navigate("/login", { state: { from: { pathname: window.location.pathname } } }); return; }
    navigate("/checkout?identifier=buy_now", {
      state: {
        buyNowItem: { id: pid, _id: pid, title: product.title, name: product.title, brand: product.brand || "", price: product.price, mrp: product.mrp, img: images[0] || "", selectedSize: selSize || "", selectedColor: selVariant?.colorName || "", quantity: qty }
      }
    });
  };

  const flatDetails = useMemo(() => {
    if (!product) return {};
    const LABELS = { fabric:"Fabric / Material", pattern:"Pattern / Style", occasion:"Occasion", fit:"Fit Type", washCare:"Wash Care", blouseIncluded:"Blouse", sareeLength:"Saree Length", setIncludes:"Set Includes", neckType:"Neck Type", sleeveType:"Sleeve Type", rise:"Rise", closure:"Closure", activity:"Activity / Sport", padding:"Padding", wiretype:"Wire Type", material:"Material", sole:"Sole Type", heelHeight:"Heel Height", plating:"Plating / Finish", stoneType:"Stone Type", threadCount:"Thread Count", color:"Color", dimensions:"Dimensions", capacity:"Capacity", safeFor:"Safe For" };
    const autoLabel = (k) => String(k).replace(/([a-z0-9])([A-Z])/g,"$1 $2").replace(/_/g," ").replace(/^./,c=>c.toUpperCase());
    const result = {};
    ["fabric","pattern","occasion","fit","washCare"].forEach(k => { if (product?.[k]) result[LABELS[k] || k] = product[k]; });
    const d = product.details || {};
    Object.entries(d).forEach(([k, v]) => {
      if (k === "description") return;
      if (v === undefined || v === null) return;
      if (Array.isArray(v)) { if (v.length === 0) return; const label = LABELS[k] || autoLabel(k); if (result[label] === undefined) result[label] = v.join(", "); return; }
      if (typeof v === "string" && !v.trim()) return;
      const label = LABELS[k] || autoLabel(k);
      if (result[label] === undefined) result[label] = v;
    });
    return result;
  }, [product]);

  const descText = product?.description || product?.details?.description || "";
  const discount = product ? Math.round((1 - product.price / product.mrp) * 100) : 0;

  const relatedProds = useMemo(() => {
    if (!product) return [];
    return products.filter(p => {
      if (getPid(p) === String(id)) return false;
      if (!p.active) return false;
      if (product.navName && p.navName !== product.navName) return false;
      if (product.colTitle && p.colTitle && p.colTitle !== product.colTitle) return false;
      return true;
    }).slice(0, 4);
  }, [products, id, product]);

  if (loading && !products.length) return <div style={{ padding:60, textAlign:"center", color:MUTED }}>Loading…</div>;
  if (!product) return (
    <div style={{ padding:60, textAlign:"center", color:MUTED }}>
      Product not found.{" "}
      <span style={{ color:GOLD_DARK, cursor:"pointer", textDecoration:"underline" }} onClick={() => navigate("/")}>Go home</span>
    </div>
  );

  return (
    <div style={{ backgroundColor:SURFACE, minHeight:"100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: STYLES }}/>

      {/* Breadcrumb */}
      <div style={{ backgroundColor:"#fff", borderBottom:`1px solid ${BORDER}`, padding:"10px 24px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:MUTED, flexWrap:"wrap" }}>
          {["Home", product.navName||"", product.colTitle||"", product.title].filter(Boolean).map((b, i, arr) => (
            <span key={i} style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span onClick={() => i === 0 && navigate("/")} style={{ cursor: i < arr.length-1 ? "pointer" : "default", color: i === arr.length-1 ? GOLD_DARK : MUTED, fontWeight: i === arr.length-1 ? 600 : 400 }}>{b}</span>
              {i < arr.length-1 && <span style={{ color:"#ccc" }}>/</span>}
            </span>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:1200, margin:"0 auto", padding:"24px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"minmax(0,1fr) minmax(0,1fr)", gap:32, alignItems:"start" }}>

          {/* ── LEFT: Gallery ── */}
          <div style={{ position:"sticky", top:80 }}>
            <div onClick={() => images.length > 0 && setViewerOpen(true)}
              style={{ borderRadius:10, overflow:"hidden", border:`1px solid ${BORDER}`, backgroundColor:"#fff", position:"relative", cursor: images.length > 0 ? "zoom-in" : "default", animation:"zoomIn 0.4s ease" }}>
              {images.length > 0
                ? <img key={`${varIdx}-${activeImg}`} src={images[activeImg] || images[0]} alt={product.title} style={{ width:"100%", height:420, objectFit:"cover", objectPosition:"top", display:"block", animation:"imgIn 0.3s ease" }} onError={e => e.target.style.opacity = "0"}/>
                : <div style={{ width:"100%", height:420, background:SURFACE, display:"flex", alignItems:"center", justifyContent:"center", color:MUTED, fontSize:13 }}>No image</div>
              }
              {discount > 0 && <div style={{ position:"absolute", top:12, left:12, background:`linear-gradient(135deg,${GOLD_DARK},${GOLD})`, color:"#fff", fontSize:11, fontWeight:800, padding:"3px 9px", borderRadius:4 }}>{discount}% OFF</div>}
              <button onClick={e => { e.stopPropagation(); toggleWishlist({ ...product, id: pid, img: images[0] || "" }); }}
                style={{ position:"absolute", top:12, right:12, width:34, height:34, borderRadius:"50%", background:"rgba(255,255,255,0.92)", border:`1px solid ${BORDER}`, display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
                <FiHeart size={16} fill={liked ? "#ff4d4f" : "none"} stroke={liked ? "#ff4d4f" : CHARCOAL}/>
              </button>
              {images.length > 1 && (<>
                <button onClick={e => { e.stopPropagation(); setActiveImg(i => (i-1+images.length)%images.length); }} style={{ position:"absolute", left:8, top:"50%", transform:"translateY(-50%)", width:30, height:30, borderRadius:"50%", background:"rgba(255,255,255,0.85)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><FiChevronLeft size={16}/></button>
                <button onClick={e => { e.stopPropagation(); setActiveImg(i => (i+1)%images.length); }} style={{ position:"absolute", right:8, top:"50%", transform:"translateY(-50%)", width:30, height:30, borderRadius:"50%", background:"rgba(255,255,255,0.85)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}><FiChevronRight size={16}/></button>
              </>)}
            </div>
            {images.length > 1 && (
              <div style={{ display:"flex", gap:8, marginTop:10, overflowX:"auto", scrollbarWidth:"none" }}>
                {images.map((img, i) => (
                  <div key={i} className="pdp-thumb" onClick={() => setActiveImg(i)}
                    style={{ width:64, height:80, flexShrink:0, borderRadius:6, overflow:"hidden", cursor:"pointer", border:`2px solid ${i === activeImg ? GOLD : BORDER}`, transition:"border-color 0.15s" }}>
                    <img src={img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top" }} onError={e => e.target.style.opacity = "0"}/>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── RIGHT: Info ── */}
          <div style={{ animation:"slideUp 0.4s ease" }}>
            {product.brand && <p style={{ fontSize:11, color:GOLD_DARK, fontWeight:700, letterSpacing:1, marginBottom:4, textTransform:"uppercase" }}>{product.brand}</p>}
            <h1 style={{ fontSize:22, fontWeight:700, color:CHARCOAL, lineHeight:1.3, marginBottom:10, fontFamily:"'Playfair Display',Georgia,serif" }}>{product.title}</h1>

            {/* Rating */}
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, backgroundColor:GOLD, borderRadius:4, padding:"3px 8px" }}>
                <Stars rating={avgRating} size={10}/>
                <span style={{ fontSize:11, fontWeight:800, color:"#fff" }}>{avgRating}</span>
              </div>
              <span style={{ fontSize:12, color:MUTED }}>{reviews.length} Reviews</span>
            </div>

            {/* Price */}
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20, padding:"14px 16px", backgroundColor:GOLD_LIGHT, borderRadius:8, border:`1px solid ${GOLD}44` }}>
              <span style={{ fontSize:26, fontWeight:900, color:CHARCOAL }}>₹{product.price}</span>
              <span style={{ fontSize:14, color:MUTED, textDecoration:"line-through" }}>₹{product.mrp}</span>
              {discount > 0 && <span style={{ fontSize:12, fontWeight:800, color:GREEN, backgroundColor:"#E8F5E9", padding:"2px 8px", borderRadius:4 }}>{discount}% OFF</span>}
              <span style={{ fontSize:11, color:MUTED, marginLeft:"auto" }}>Save ₹{product.mrp - product.price}</span>
            </div>

            {/* Color swatches */}
            {variants.length > 0 && (
              <div style={{ marginBottom:20 }}>
                <p style={{ fontSize:12, fontWeight:700, color:CHARCOAL, marginBottom:10, letterSpacing:0.5 }}>
                  COLOR: <span style={{ color:GOLD_DARK, fontWeight:600 }}>{selVariant?.colorName || "Select"}</span>
                </p>
                <div style={{ display:"flex", gap:12, flexWrap:"wrap", alignItems:"center" }}>
                  {variants.map((v, i) => (
                    <button key={v.id || i} className="pdp-swatch" onClick={() => handleColorClick(i)} title={v.colorName}
                      style={{ width:36, height:36, borderRadius:"50%", background: v.hex || GOLD_LIGHT, cursor:"pointer", flexShrink:0, border: i === varIdx ? `3px solid ${GOLD_DARK}` : `3px solid transparent`, boxShadow: i === varIdx ? `0 0 0 2px #fff, 0 0 0 4px ${GOLD}` : "0 1px 4px rgba(0,0,0,0.25)", transition:"all 0.15s", padding:0, outline:"none" }}/>
                  ))}
                </div>
                <div style={{ display:"flex", gap:6, marginTop:8, flexWrap:"wrap" }}>
                  {variants.map((v, i) => (
                    <span key={v.id || i} onClick={() => handleColorClick(i)}
                      style={{ fontSize:10, padding:"2px 10px", borderRadius:20, cursor:"pointer", background: i === varIdx ? GOLD_LIGHT : "transparent", color: i === varIdx ? GOLD_DARK : MUTED, border:`1px solid ${i === varIdx ? GOLD : BORDER}`, fontWeight: i === varIdx ? 700 : 400, transition:"all 0.15s" }}>
                      {v.colorName}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div style={{ marginBottom:20 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                  <p style={{ fontSize:12, fontWeight:700, color:CHARCOAL, letterSpacing:0.5 }}>SIZE: {selSize && <span style={{ color:GOLD_DARK }}>{selSize}</span>}</p>
                  <span style={{ fontSize:11, color:GOLD_DARK, cursor:"pointer", textDecoration:"underline", fontWeight:600 }}>Size Guide</span>
                </div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  {product.sizes.map(s => (
                    <button key={s} className="pdp-size" onClick={() => { setSelSize(s); setSizeErr(false); }}
                      style={{ minWidth:44, height:40, padding:"0 10px", borderRadius:6, border:`1.5px solid ${selSize === s ? GOLD : BORDER}`, backgroundColor: selSize === s ? GOLD_LIGHT : "#fff", color: selSize === s ? GOLD_DARK : CHARCOAL, fontSize:12, fontWeight: selSize === s ? 700 : 500, cursor:"pointer", transition:"all 0.15s", fontFamily:"inherit" }}>
                      {s}
                    </button>
                  ))}
                </div>
                {sizeErr && <p style={{ fontSize:11, color:"#E53935", marginTop:6, fontWeight:600, display:"flex", alignItems:"center", gap:4 }}><FiAlertTriangle size={12}/> Please select a size</p>}
              </div>
            )}

            {/* Qty */}
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:22 }}>
              <p style={{ fontSize:12, fontWeight:700, color:CHARCOAL, letterSpacing:0.5 }}>QTY:</p>
              <div style={{ display:"flex", alignItems:"center", border:`1.5px solid ${BORDER}`, borderRadius:6, overflow:"hidden" }}>
                <button onClick={() => setQty(q => Math.max(1, q-1))} style={{ width:36, height:36, border:"none", background:"#fff", cursor:"pointer", fontSize:18, fontWeight:700, color:GOLD_DARK }}>−</button>
                <span style={{ width:40, textAlign:"center", fontSize:14, fontWeight:700, color:CHARCOAL }}>{qty}</span>
                <button onClick={() => setQty(q => Math.min(10, q+1))} style={{ width:36, height:36, border:"none", background:"#fff", cursor:"pointer", fontSize:18, fontWeight:700, color:GOLD_DARK }}>+</button>
              </div>
            </div>

            {/* CTAs */}
            <div style={{ display:"flex", gap:12, marginBottom:24 }}>
              <button className="pdp-btn-cart" onClick={handleAddToCart}
                style={{ flex:1, padding:"14px", backgroundColor: added ? GREEN : GOLD, color:"#fff", border:"none", borderRadius:6, fontSize:13, fontWeight:800, letterSpacing:1, cursor:"pointer", transition:"background 0.2s", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                {added ? <><FiCheck/> ADDED</> : <><FiShoppingCart/> ADD TO CART</>}
              </button>
              <button onClick={handleBuyNow}
                style={{ flex:1, padding:"14px", backgroundColor:"#fff", color:GOLD_DARK, border:`2px solid ${GOLD}`, borderRadius:6, fontSize:13, fontWeight:800, letterSpacing:1, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                <FiZap/> BUY NOW
              </button>
            </div>

            {/* Tabs */}
            <div>
              <div style={{ display:"flex", borderBottom:`2px solid ${BORDER}`, marginBottom:16 }}>
                {["description","details","reviews"].map(t => (
                  <button key={t} onClick={() => setTab(t)}
                    style={{ padding:"10px 20px", background:"none", border:"none", fontSize:12, fontWeight:700, letterSpacing:0.5, cursor:"pointer", textTransform:"uppercase", fontFamily:"inherit", color: tab === t ? GOLD_DARK : MUTED, borderBottom:`2.5px solid ${tab === t ? GOLD : "transparent"}`, marginBottom:-2, transition:"color 0.15s" }}>
                    {t}{t === "reviews" && ` (${reviews.length})`}
                  </button>
                ))}
              </div>

              {/* Description */}
              {tab === "description" && (
                <div style={{ animation:"fadeIn 0.3s ease" }}>
                  {descText
                    ? <p style={{ fontSize:13, color:MUTED, lineHeight:1.75, marginBottom:14 }}>{descText}</p>
                    : <p style={{ fontSize:13, color:MUTED, fontStyle:"italic" }}>No description added.</p>
                  }
                  {product.highlights?.filter(Boolean).length > 0 && (
                    <ul style={{ paddingLeft:0, listStyle:"none", marginTop:12 }}>
                      {product.highlights.filter(Boolean).map((h, i) => (
                        <li key={i} style={{ display:"flex", alignItems:"flex-start", gap:8, fontSize:13, color:CHARCOAL, marginBottom:8 }}>
                          <FiStar size={12} style={{ color:GOLD, marginTop:1, flexShrink:0 }}/>{h}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* Details */}
              {tab === "details" && (
                <div style={{ animation:"fadeIn 0.3s ease" }}>
                  {Object.entries(flatDetails).filter(([,v]) => v).length === 0
                    ? <p style={{ fontSize:13, color:MUTED, fontStyle:"italic" }}>No details added.</p>
                    : Object.entries(flatDetails).filter(([,v]) => v).map(([k, v]) => (
                      <div key={k} style={{ display:"flex", padding:"10px 0", borderBottom:`1px solid ${BORDER}` }}>
                        <span style={{ width:150, fontSize:12, color:MUTED, fontWeight:600, flexShrink:0 }}>{k}</span>
                        <span style={{ fontSize:12, color:CHARCOAL, fontWeight:500 }}>{v}</span>
                      </div>
                    ))
                  }
                </div>
              )}

              {/* Reviews */}
              {tab === "reviews" && (
                <div style={{ animation:"fadeIn 0.3s ease" }}>
                  {/* Rating summary */}
                  <div style={{ display:"flex", gap:20, alignItems:"center", padding:16, backgroundColor:GOLD_LIGHT, borderRadius:8, marginBottom:20, border:`1px solid ${GOLD}33` }}>
                    <div style={{ textAlign:"center", flexShrink:0 }}>
                      <div style={{ fontSize:36, fontWeight:900, color:GOLD_DARK }}>{avgRating}</div>
                      <Stars rating={avgRating} size={14}/>
                      <div style={{ fontSize:11, color:MUTED, marginTop:4 }}>{reviews.length} reviews</div>
                    </div>
                    <div style={{ flex:1 }}>
                      {ratingDist.map(r => (
                        <div key={r.star} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:4 }}>
                          <span style={{ fontSize:11, color:MUTED, width:8 }}>{r.star}</span>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill={GOLD}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                          <div style={{ flex:1, height:6, backgroundColor:BORDER, borderRadius:3, overflow:"hidden" }}>
                            <div style={{ width:`${r.pct}%`, height:"100%", backgroundColor:GOLD, borderRadius:3 }}/>
                          </div>
                          <span style={{ fontSize:11, color:MUTED, width:26 }}>{r.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add review form */}
                  <AddReviewForm onSubmit={handleAddReview} submitting={submitting}/>

                  {/* Reviews list */}
                  {reviewsLoading ? (
                    <div style={{ textAlign:"center", padding:"20px 0", color:MUTED, fontSize:13 }}>Loading reviews…</div>
                  ) : reviews.length === 0 ? (
                    <p style={{ fontSize:13, color:MUTED, textAlign:"center", padding:"20px 0", fontStyle:"italic" }}>No reviews yet. Be the first!</p>
                  ) : (
                    <>
                      {reviews.slice(0, 2).map((r, i) => (
                        <ReviewItem key={r._id || i} r={r} isLast={i === 1 || i === reviews.length - 1}/>
                      ))}
                      {reviews.length > 2 && (
                        <div style={{ textAlign:"center", marginTop:16 }}>
                          <button onClick={() => setShowReviewDrawer(true)}
                            style={{ background:"none", border:`1.5px solid ${GOLD}`, borderRadius:30, padding:"10px 28px", color:GOLD_DARK, fontSize:13, fontWeight:700, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:8 }}
                            onMouseEnter={e => e.currentTarget.style.background = GOLD_LIGHT}
                            onMouseLeave={e => e.currentTarget.style.background = "none"}>
                            View All {reviews.length} Reviews <FiChevronRight/>
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related products */}
        {relatedProds.length > 0 && (
          <div style={{ marginTop:60, borderTop:`1px solid ${BORDER}`, paddingTop:40 }}>
            <h2 style={{ fontSize:20, fontWeight:700, color:CHARCOAL, marginBottom:8, fontFamily:"'Playfair Display',Georgia,serif", textAlign:"center" }}>YOU MIGHT ALSO LIKE</h2>
            {product.colTitle && <p style={{ textAlign:"center", fontSize:12, color:MUTED, marginBottom:24 }}>More from {product.colTitle}</p>}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:18 }}>
              {relatedProds.map(p => <RelatedCard key={getPid(p)} p={p}/>)}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen viewer */}
      {viewerOpen && images.length > 0 && <ImageViewer images={images} startIdx={activeImg} onClose={() => setViewerOpen(false)}/>}

      {/* Reviews Drawer */}
      {showReviewDrawer && (
        <>
          <div onClick={() => setShowReviewDrawer(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:10000, backdropFilter:"blur(4px)" }}/>
          <div style={{ position:"fixed", top:0, right:0, width:"min(450px, 90%)", height:"100vh", background:"#fff", zIndex:10001, boxShadow:"-10px 0 30px rgba(0,0,0,0.1)", display:"flex", flexDirection:"column", animation:"slideInR 0.3s ease" }}>
            <div style={{ padding:"20px 24px", borderBottom:`1px solid ${BORDER}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <div>
                <h3 style={{ fontSize:18, fontWeight:800, color:CHARCOAL, margin:0 }}>Customer Reviews</h3>
                <p style={{ fontSize:12, color:MUTED, margin:"4px 0 0" }}>{reviews.length} total reviews</p>
              </div>
              <button onClick={() => setShowReviewDrawer(false)} style={{ background:SURFACE, border:"none", width:36, height:36, borderRadius:"50%", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:CHARCOAL }}>
                <FiX size={20}/>
              </button>
            </div>
            <div style={{ flex:1, overflowY:"auto", padding:"0 24px 40px" }}>
              {reviews.map((r, i) => <ReviewItem key={r._id || i} r={r} isLast={i === reviews.length-1}/>)}
            </div>
          </div>
        </>
      )}
    </div>
  );
}