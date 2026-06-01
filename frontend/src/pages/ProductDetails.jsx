/**
 * ProductDetailPage.jsx — DYNAMIC VERSION
 * - Data AdminDataContext se aata hai
 * - Color click pe us color ki images dikhti hain (Amazon / Meesho style)
 * - Multiple images per color in thumbnails
 */
import { useState, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useCart }      from "../context/CartContext";
import { useAuth }      from "../context/AuthContext";
import { useAdminData } from "../Admin/context/Admindatacontext";
import {
  FiShoppingCart, FiCheck, FiZap, FiTruck, FiRotateCcw,
  FiCheckCircle, FiLock, FiAlertTriangle, FiStar,
} from "react-icons/fi";

const GOLD       = "#C9A96E";
const GOLD_DARK  = "#A07840";
const GOLD_LIGHT = "#F5EDD9";
const CHARCOAL   = "#1A1A1A";
const SURFACE    = "#FAFAF8";
const MUTED      = "#7A736B";
const BORDER     = "#EDE8E0";
const GREEN      = "#2E7D32";

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&display=swap');
@keyframes fadeIn  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
@keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
@keyframes zoomIn  { from{transform:scale(0.96)} to{transform:scale(1)} }
.pdp-thumb:hover   { border-color:${GOLD} !important; }
.pdp-size:hover    { border-color:${GOLD} !important; color:${GOLD_DARK} !important; }
.pdp-color:hover   { transform:scale(1.12); }
.pdp-btn-cart:hover { background:${GOLD_DARK} !important; }
.pdp-related:hover  { transform:translateY(-4px); box-shadow:0 10px 28px rgba(201,169,110,0.18) !important; border-color:${GOLD} !important; }
.pdp-related { transition:all 0.2s ease; }
`;

function Stars({ rating, size=12 }) {
  return (
    <span style={{ display:"inline-flex", alignItems:"center", gap:2 }}>
      {[1,2,3,4,5].map(s => (
        <svg key={s} width={size} height={size} viewBox="0 0 24 24" fill={s<=Math.round(rating)?GOLD:"#E0D8CC"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </span>
  );
}

export default function ProductDetailPage() {
  const navigate      = useNavigate();
  const { id }        = useParams();
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();
  const { products }  = useAdminData();

  // Find product from admin data
  const product = useMemo(() => {
    return products.find(p => String(p.id) === String(id)) || products[0];
  }, [products, id]);

  // Color variants
  const variants       = product?.colorVariants || [];
  const [selectedVariantIdx, setSelectedVariantIdx] = useState(0);
  const selectedVariant = variants[selectedVariantIdx] || variants[0];

  // Images of selected color
  const images = useMemo(() => {
    return (selectedVariant?.images || []).filter(Boolean);
  }, [selectedVariant]);

  const [activeImg,    setActiveImg]    = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);
  const [qty,          setQty]          = useState(1);
  const [addedToCart,  setAddedToCart]  = useState(false);
  const [activeTab,    setActiveTab]    = useState("description");
  const [sizeError,    setSizeError]    = useState(false);

  // Reset image index when color changes
  const handleColorClick = idx => {
    setSelectedVariantIdx(idx);
    setActiveImg(0);
  };

  const handleAddToCart = () => {
    if (!selectedSize) { setSizeError(true); return; }
    setSizeError(false);
    addToCart({
      ...product,
      img: images[0] || "",
      selectedSize,
      selectedColor: selectedVariant?.colorName || "",
      quantity: qty,
    });
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const handleBuyNow = () => {
    if (!selectedSize) { setSizeError(true); return; }
    if (!isLoggedIn) { navigate("/login", { state:{ from:{ pathname:window.location.pathname } } }); return; }
    navigate("/checkout");
  };

  const discount    = product ? Math.round((1 - product.price / product.mrp) * 100) : 0;
  const relatedProds = products.filter(p => p.id !== product?.id && p.active).slice(0, 4);

  const ratingDist = [
    { star:5, pct:62 }, { star:4, pct:24 }, { star:3, pct:9 }, { star:2, pct:3 }, { star:1, pct:2 },
  ];

  if (!product) return (
    <div style={{ padding:40, textAlign:"center", color:MUTED }}>Product not found.</div>
  );

  return (
    <div style={{ backgroundColor:SURFACE, minHeight:"100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: STYLES }}/>

      {/* Breadcrumb */}
      <div style={{ backgroundColor:"#fff", borderBottom:`1px solid ${BORDER}`, padding:"10px 40px" }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:MUTED }}>
          {["Home", "Women", "Ethnic Wear", product.title].map((b,i,arr) => (
            <span key={b} style={{ display:"flex", alignItems:"center", gap:6 }}>
              <span onClick={() => i===0 && navigate("/")}
                style={{ cursor:i<arr.length-1?"pointer":"default",
                  color:i===arr.length-1 ? GOLD_DARK : MUTED,
                  fontWeight:i===arr.length-1 ? 600 : 400,
                  maxWidth:200, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {b}
              </span>
              {i<arr.length-1 && <span style={{ color:"#ccc" }}>/</span>}
            </span>
          ))}
        </div>
      </div>

      <div style={{ maxWidth:1280, margin:"0 auto", padding:"28px 40px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:40, alignItems:"start" }}>

          {/* ── Gallery ── */}
          <div style={{ position:"sticky", top:80 }}>
            <div style={{ borderRadius:12, overflow:"hidden", border:`1px solid ${BORDER}`,
              backgroundColor:"#fff", position:"relative", animation:"zoomIn 0.4s ease" }}>
              {images.length > 0 ? (
                <img key={`${selectedVariantIdx}-${activeImg}`} src={images[activeImg] || images[0]}
                  alt={product.title}
                  style={{ width:"100%", height:520, objectFit:"cover", objectPosition:"top",
                    display:"block", animation:"fadeIn 0.35s ease" }}
                  onError={e=>e.target.style.opacity="0"} />
              ) : (
                <div style={{ width:"100%", height:520, background:SURFACE, display:"flex",
                  alignItems:"center", justifyContent:"center", color:MUTED, fontSize:13 }}>
                  No image
                </div>
              )}
              <div style={{ position:"absolute", top:14, left:14,
                background:`linear-gradient(135deg,${GOLD_DARK},${GOLD})`,
                color:"#fff", fontSize:12, fontWeight:800, padding:"4px 10px", borderRadius:4 }}>
                {discount}% OFF
              </div>
            </div>

            {/* Thumbnails — current color ke saare images */}
            {images.length > 1 && (
              <div style={{ display:"flex", gap:8, marginTop:12, overflowX:"auto", scrollbarWidth:"none" }}>
                {images.map((img,i) => (
                  <div key={i} className="pdp-thumb" onClick={() => setActiveImg(i)}
                    style={{ width:72, height:90, flexShrink:0, borderRadius:6, overflow:"hidden",
                      border:`2px solid ${i===activeImg ? GOLD : BORDER}`, cursor:"pointer", transition:"border-color 0.15s" }}>
                    <img src={img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top" }}
                      onError={e=>e.target.style.opacity="0"} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Right panel ── */}
          <div style={{ animation:"slideUp 0.4s ease" }}>
            <p style={{ fontSize:12, color:GOLD_DARK, fontWeight:700, letterSpacing:1, marginBottom:4 }}>
              {(product.brand || "").toUpperCase()}
            </p>
            <h1 style={{ fontSize:24, fontWeight:700, color:CHARCOAL, lineHeight:1.3, marginBottom:10,
              fontFamily:"'Playfair Display', Georgia, serif" }}>
              {product.title}
            </h1>

            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, backgroundColor:GOLD,
                borderRadius:4, padding:"3px 8px" }}>
                <Stars rating={product.rating} size={10}/>
                <span style={{ fontSize:11, fontWeight:800, color:"#fff" }}>{product.rating}</span>
              </div>
              <span style={{ fontSize:12, color:MUTED }}>{product.reviews} Reviews</span>
              <span style={{ fontSize:12, color: product.inStock ? GREEN : "#C0392B", fontWeight:600 }}>
                ● {product.inStock ? "In Stock" : "Out of Stock"}
              </span>
            </div>

            {/* Price */}
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:20,
              padding:"14px 16px", backgroundColor:GOLD_LIGHT, borderRadius:8, border:`1px solid ${GOLD}44` }}>
              <span style={{ fontSize:28, fontWeight:900, color:CHARCOAL }}>₹{product.price}</span>
              <span style={{ fontSize:15, color:MUTED, textDecoration:"line-through" }}>₹{product.mrp}</span>
              <span style={{ fontSize:13, fontWeight:800, color:GREEN, backgroundColor:"#E8F5E9",
                padding:"2px 8px", borderRadius:4 }}>{discount}% OFF</span>
              <span style={{ fontSize:11, color:MUTED, marginLeft:"auto" }}>
                Save ₹{product.mrp - product.price}
              </span>
            </div>

            {/* ── Color selector (AMAZON / MEESHO STYLE) ── */}
            {variants.length > 0 && (
              <div style={{ marginBottom:20 }}>
                <p style={{ fontSize:12, fontWeight:700, color:CHARCOAL, marginBottom:8, letterSpacing:0.5 }}>
                  COLOR: <span style={{ color:GOLD_DARK }}>{selectedVariant?.colorName || "Select"}</span>
                </p>
                <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
                  {variants.map((v,i) => (
                    <div key={v.id} onClick={() => handleColorClick(i)}
                      className="pdp-color"
                      title={v.colorName}
                      style={{
                        width:52, height:64, borderRadius:6, overflow:"hidden", cursor:"pointer",
                        border:`2.5px solid ${i===selectedVariantIdx ? GOLD : BORDER}`,
                        transition:"all 0.15s",
                        boxShadow: i===selectedVariantIdx ? `0 0 0 2px ${GOLD}44` : "none",
                        flexShrink:0,
                      }}>
                      {v.images?.[0] ? (
                        <img src={v.images[0]} alt={v.colorName}
                          style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top" }}
                          onError={e => { e.target.style.display="none"; e.target.parentElement.style.background = v.hex; }} />
                      ) : (
                        <div style={{ width:"100%", height:"100%", background:v.hex }}/>
                      )}
                    </div>
                  ))}
                </div>
                {/* Color name chips */}
                <div style={{ display:"flex", gap:6, marginTop:8, flexWrap:"wrap" }}>
                  {variants.map((v,i) => (
                    <span key={v.id} onClick={() => handleColorClick(i)}
                      style={{ fontSize:10, padding:"2px 8px", borderRadius:20, cursor:"pointer",
                        background: i===selectedVariantIdx ? GOLD_LIGHT : "transparent",
                        color: i===selectedVariantIdx ? GOLD_DARK : MUTED,
                        border:`1px solid ${i===selectedVariantIdx ? GOLD : BORDER}`,
                        fontWeight: i===selectedVariantIdx ? 700 : 400 }}>
                      {v.colorName}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Size */}
            <div style={{ marginBottom:20 }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                <p style={{ fontSize:12, fontWeight:700, color:CHARCOAL, letterSpacing:0.5 }}>
                  SIZE: {selectedSize && <span style={{ color:GOLD_DARK }}>{selectedSize}</span>}
                </p>
                <span style={{ fontSize:11, color:GOLD_DARK, cursor:"pointer", textDecoration:"underline", fontWeight:600 }}>
                  Size Guide
                </span>
              </div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {(product.sizes||[]).map(s => (
                  <button key={s} className="pdp-size"
                    onClick={() => { setSelectedSize(s); setSizeError(false); }}
                    style={{ width:48, height:40, borderRadius:6,
                      border:`1.5px solid ${selectedSize===s ? GOLD : BORDER}`,
                      backgroundColor:selectedSize===s ? GOLD_LIGHT : "#fff",
                      color:selectedSize===s ? GOLD_DARK : CHARCOAL,
                      fontSize:12, fontWeight:selectedSize===s?700:500, cursor:"pointer", transition:"all 0.15s" }}>
                    {s}
                  </button>
                ))}
              </div>
              {sizeError && (
                <p style={{ fontSize:11, color:"#E53935", marginTop:6, fontWeight:600,
                  display:"flex", alignItems:"center", gap:4 }}>
                  <FiAlertTriangle size={12}/> Please select a size
                </p>
              )}
            </div>

            {/* Qty */}
            <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:22 }}>
              <p style={{ fontSize:12, fontWeight:700, color:CHARCOAL, letterSpacing:0.5 }}>QTY:</p>
              <div style={{ display:"flex", alignItems:"center", border:`1.5px solid ${BORDER}`, borderRadius:6, overflow:"hidden" }}>
                {["-","qty","+"].map(item =>
                  item === "qty" ? (
                    <span key="qty" style={{ width:40, textAlign:"center", fontSize:14, fontWeight:700, color:CHARCOAL }}>{qty}</span>
                  ) : (
                    <button key={item} onClick={() => setQty(q => item==="-" ? Math.max(1,q-1) : Math.min(10,q+1))}
                      style={{ width:36, height:36, border:"none", backgroundColor:"#fff",
                        cursor:"pointer", fontSize:18, fontWeight:700, color:GOLD_DARK }}>
                      {item}
                    </button>
                  )
                )}
              </div>
            </div>

            {/* CTA */}
            <div style={{ display:"flex", gap:12, marginBottom:24 }}>
              <button className="pdp-btn-cart" onClick={handleAddToCart}
                style={{ flex:1, padding:"14px", backgroundColor: addedToCart ? GREEN : GOLD,
                  color:"#fff", border:"none", borderRadius:6, fontSize:13, fontWeight:800,
                  letterSpacing:1, cursor:"pointer", transition:"background 0.2s",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
                {addedToCart ? <><FiCheck/> ADDED</> : <><FiShoppingCart/> ADD TO CART</>}
              </button>
              <button onClick={handleBuyNow}
                style={{ flex:1, padding:"14px", backgroundColor:"#fff", color:GOLD_DARK,
                  border:`2px solid ${GOLD}`, borderRadius:6, fontSize:13, fontWeight:800,
                  letterSpacing:1, cursor:"pointer", display:"flex", alignItems:"center",
                  justifyContent:"center", gap:8 }}>
                <FiZap/> BUY NOW
              </button>
            </div>

            {/* Trust badges */}
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16, marginBottom:24,
              padding:16, backgroundColor:"#fff", borderRadius:8, border:`1px solid ${BORDER}` }}>
              {[
                { icon:<FiTruck/>, title:"Free Delivery", sub:"On orders above ₹499" },
                { icon:<FiRotateCcw/>, title:"Easy Returns", sub:"15-day hassle-free" },
                { icon:<FiCheckCircle/>, title:"100% Authentic", sub:"Verified products only" },
                { icon:<FiLock/>, title:"Secure Payment", sub:"Encrypted transactions" },
              ].map(b => (
                <div key={b.title} style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <span style={{ fontSize:20, color:GOLD }}>{b.icon}</span>
                  <div>
                    <p style={{ fontSize:11, fontWeight:700, color:CHARCOAL }}>{b.title}</p>
                    <p style={{ fontSize:10, color:MUTED }}>{b.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <div>
              <div style={{ display:"flex", borderBottom:`2px solid ${BORDER}`, marginBottom:16 }}>
                {["description","details","reviews"].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)}
                    style={{ padding:"10px 20px", background:"none", border:"none", fontSize:12,
                      fontWeight:700, letterSpacing:0.5, cursor:"pointer", textTransform:"uppercase",
                      color: activeTab===tab ? GOLD_DARK : MUTED,
                      borderBottom:`2.5px solid ${activeTab===tab ? GOLD : "transparent"}`,
                      marginBottom:-2, transition:"color 0.15s", fontFamily:"inherit" }}>
                    {tab}
                  </button>
                ))}
              </div>

              {activeTab === "description" && (
                <div style={{ animation:"fadeIn 0.3s ease" }}>
                  <p style={{ fontSize:13, color:MUTED, lineHeight:1.7, marginBottom:14 }}>
                    {product.description}
                  </p>
                  <ul style={{ paddingLeft:0, listStyle:"none" }}>
                    {(product.highlights||[]).map((h,i) => (
                      <li key={i} style={{ display:"flex", alignItems:"flex-start", gap:8, fontSize:13,
                        color:CHARCOAL, marginBottom:8 }}>
                        <FiStar size={12} style={{ color:GOLD, marginTop:1 }}/>{h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === "details" && (
                <div style={{ animation:"fadeIn 0.3s ease" }}>
                  {[
                    ["Fabric",    product.fabric],
                    ["Pattern",   product.pattern],
                    ["Occasion",  product.occasion],
                    ["Fit",       product.fit],
                    ["Wash Care", product.washCare],
                  ].map(([k,v]) => (
                    <div key={k} style={{ display:"flex", padding:"10px 0", borderBottom:`1px solid ${BORDER}` }}>
                      <span style={{ width:120, fontSize:12, color:MUTED, fontWeight:600 }}>{k}</span>
                      <span style={{ fontSize:12, color:CHARCOAL, fontWeight:500 }}>{v}</span>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "reviews" && (
                <div style={{ animation:"fadeIn 0.3s ease" }}>
                  <div style={{ display:"flex", gap:24, alignItems:"center", padding:"16px",
                    backgroundColor:GOLD_LIGHT, borderRadius:8, marginBottom:16, border:`1px solid ${GOLD}33` }}>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ fontSize:40, fontWeight:900, color:GOLD_DARK }}>{product.rating}</div>
                      <Stars rating={product.rating} size={14}/>
                      <div style={{ fontSize:11, color:MUTED, marginTop:4 }}>{product.reviews} reviews</div>
                    </div>
                    <div style={{ flex:1 }}>
                      {ratingDist.map(r => (
                        <div key={r.star} style={{ display:"flex", alignItems:"center", gap:8, marginBottom:5 }}>
                          <span style={{ fontSize:11, color:MUTED, width:10 }}>{r.star}</span>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill={GOLD}>
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                          </svg>
                          <div style={{ flex:1, height:6, backgroundColor:BORDER, borderRadius:3, overflow:"hidden" }}>
                            <div style={{ width:`${r.pct}%`, height:"100%", backgroundColor:GOLD, borderRadius:3 }}/>
                          </div>
                          <span style={{ fontSize:11, color:MUTED, width:26 }}>{r.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {(product.reviews_list||[]).map((r,idx) => (
                    <div key={idx} style={{ padding:"14px 0",
                      borderBottom: idx<(product.reviews_list.length-1) ? `1px solid ${BORDER}` : "none" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:6 }}>
                        <div style={{ width:32, height:32, borderRadius:"50%",
                          background:`linear-gradient(135deg,${GOLD_LIGHT},${GOLD})`,
                          display:"flex", alignItems:"center", justifyContent:"center",
                          fontSize:13, fontWeight:800, color:GOLD_DARK }}>
                          {r.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                            <span style={{ fontSize:12, fontWeight:700, color:CHARCOAL }}>{r.name}</span>
                            {r.verified && (
                              <span style={{ fontSize:9, color:GREEN, fontWeight:600,
                                backgroundColor:"#E8F5E9", padding:"1px 6px", borderRadius:10 }}>
                                ✓ Verified
                              </span>
                            )}
                          </div>
                          <div style={{ display:"flex", alignItems:"center", gap:6, marginTop:2 }}>
                            <Stars rating={r.rating} size={10}/>
                            <span style={{ fontSize:10, color:MUTED }}>{r.date}</span>
                          </div>
                        </div>
                      </div>
                      <p style={{ fontSize:12, color:MUTED, lineHeight:1.6, paddingLeft:42 }}>{r.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related products */}
        {relatedProds.length > 0 && (
          <div style={{ marginTop:60, borderTop:`1px solid ${BORDER}`, paddingTop:40 }}>
            <h2 style={{ fontSize:20, fontWeight:700, color:CHARCOAL, marginBottom:24,
              fontFamily:"'Playfair Display', Georgia, serif", textAlign:"center" }}>
              YOU MIGHT ALSO LIKE
            </h2>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:24 }}>
              {relatedProds.map(p => {
                const thumb = p.colorVariants?.[0]?.images?.[0] || "";
                const d     = Math.round((1 - p.price/p.mrp)*100);
                return (
                  <Link key={p.id} to={`/product/${p.id}`} className="pdp-related"
                    style={{ backgroundColor:"#fff", borderRadius:12, overflow:"hidden",
                      border:`1px solid ${BORDER}`, cursor:"pointer", textDecoration:"none",
                      display:"block", boxShadow:"0 2px 10px rgba(0,0,0,0.03)" }}>
                    <div style={{ position:"relative" }}>
                      <img src={thumb} alt={p.title}
                        style={{ width:"100%", height:240, objectFit:"cover", display:"block" }}
                        onError={e=>e.target.style.opacity="0"} />
                      <div style={{ position:"absolute", top:10, left:10,
                        background:`linear-gradient(135deg,${GOLD_DARK},${GOLD})`,
                        color:"#fff", fontSize:10, fontWeight:800, padding:"3px 8px", borderRadius:4 }}>
                        {d}% OFF
                      </div>
                    </div>
                    <div style={{ padding:"12px 16px 16px" }}>
                      <p style={{ fontSize:13, color:CHARCOAL, fontWeight:600, marginBottom:8, lineHeight:1.4 }}>
                        {p.title}
                      </p>
                      <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                        <span style={{ fontSize:15, fontWeight:800, color:CHARCOAL }}>₹{p.price}</span>
                        <span style={{ fontSize:12, color:MUTED, textDecoration:"line-through" }}>₹{p.mrp}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}