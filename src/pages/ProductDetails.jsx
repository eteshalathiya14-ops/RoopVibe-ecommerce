import { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { mockProducts } from "../Data/Navdata";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import {

  FiShoppingCart,
  FiCheck,
  FiZap,
  FiTruck,
  FiRotateCcw,
  FiCheckCircle,
  FiLock,
  FiAlertTriangle,
  FiStar,
} from "react-icons/fi";

// ── THEME ─────────────────────────────────────────────────
const GOLD = "#C9A96E";
const GOLD_DARK = "#A07840";
const GOLD_LIGHT = "#F5EDD9";
const CHARCOAL = "#1A1A1A";
const SURFACE = "#FAFAF8";
const MUTED = "#7A736B";
const BORDER = "#EDE8E0";
const GREEN = "#2E7D32";

// ── MOCK DATA (replace with real API later) ───────────────
const mockProduct = {
  id: 1,
  title: "Printed Anarkali Kurta Set",
  brand: "Divya Agrawal",
  price: 899,
  mrp: 2499,
  discount: 64,
  rating: 4.3,
  reviews: 128,
  inStock: true,
  sku: "RV-KRT-001",
  fabric: "Cotton Blend",
  pattern: "Printed",
  occasion: "Casual / Festive",
  fit: "Regular Fit",
  washCare: "Machine Wash Cold",
  sizes: ["XS", "S", "M", "L", "XL", "XXL"],
  colors: [
    { name: "Red", hex: "#E53935" },
    { name: "Blue", hex: "#1E88E5" },
    { name: "Green", hex: "#43A047" },
  ],
  images: [
    "https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600&h=800&fit=crop&crop=top",
    "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=600&h=800&fit=crop&crop=top",
    "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=600&h=800&fit=crop&crop=top",
    "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop&crop=top",
    "https://images.unsplash.com/photo-1617375407175-baa01a8d69f8?w=600&h=800&fit=crop&crop=top",
  ],
  description: "A beautifully crafted Anarkali Kurta Set featuring vibrant prints inspired by Indian heritage. Perfect for casual outings and festive occasions. The flowy silhouette and premium cotton blend ensure all-day comfort while keeping you stylish.",
  highlights: [
    "Premium 100% Cotton Blend fabric",
    "Vibrant ethnic print design",
    "Includes kurta + palazzo + dupatta",
    "Comfortable for all-day wear",
    "Easy machine washable",
  ],
  reviews_list: [
    { name: "Priya R.", rating: 5, date: "12 May 2025", text: "Absolutely love this kurta! The fabric is so soft and the print is gorgeous. Fits true to size.", verified: true },
    { name: "Meera S.", rating: 4, date: "3 Apr 2025", text: "Very nice quality. The color is exactly as shown in pictures. Comfortable to wear.", verified: true },
    { name: "Kavya M.", rating: 4, date: "18 Mar 2025", text: "Good product for the price. The dupatta is beautiful. Will order more.", verified: false },
    { name: "Divya K.", rating: 5, date: "2 Feb 2025", text: "Perfect festive wear! Got many compliments. Highly recommend.", verified: true },
  ],
};

const relatedProducts = [
  { id: 2, title: "Floral Maxi Dress", price: 1199, mrp: 3499, discount: 66, img: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=400&fit=crop" },
  { id: 3, title: "Silk Blend Saree", price: 1599, mrp: 4299, discount: 63, img: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300&h=400&fit=crop" },
  { id: 4, title: "Co-Ord Ethnic Set", price: 1099, mrp: 2799, discount: 61, img: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=300&h=400&fit=crop" },
  { id: 5, title: "Palazzo Kurta Set", price: 799, mrp: 1999, discount: 60, img: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=300&h=400&fit=crop" },
];

// ── HELPERS ───────────────────────────────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&display=swap');
@keyframes fadeIn  { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
@keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
@keyframes zoomIn  { from{transform:scale(0.96)} to{transform:scale(1)} }
.pdp-thumb:hover   { border-color:${GOLD} !important; }
.pdp-size:hover    { border-color:${GOLD} !important; color:${GOLD_DARK} !important; }
.pdp-color:hover   { transform:scale(1.12); }
.pdp-btn-cart:hover { background:${GOLD_DARK} !important; }
.pdp-btn-wish:hover { background:${GOLD_LIGHT} !important; border-color:${GOLD} !important; }
.pdp-related:hover  { transform:translateY(-4px); box-shadow:0 10px 28px rgba(201,169,110,0.18) !important; border-color:${GOLD} !important; }
.pdp-related { transition:all 0.2s ease; }
`;

function Stars({ rating, size = 12 }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 2 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <svg key={s} width={size} height={size} viewBox="0 0 24 24"
          fill={s <= Math.round(rating) ? GOLD : "#E0D8CC"}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}

// ── MAIN COMPONENT ────────────────────────────────────────
export default function ProductDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addToCart } = useCart();
  const { isLoggedIn } = useAuth();

  // Find product by ID or use first one as fallback
  const baseProduct = mockProducts.find(p => p.id === parseInt(id)) || mockProducts[0];

  // Merge dynamic product with the detailed template
  const product = useMemo(() => {
    const merged = {
      ...mockProduct, // Template with all properties
      ...baseProduct, // Dynamic info (id, title, price, img, etc.)
    };

    // Fix images: ensure we have an array
    merged.images = baseProduct.img ? [baseProduct.img, ...mockProduct.images.slice(1)] : mockProduct.images;

    // Fix colors: baseProduct has strings, mockProduct has objects.
    // Convert baseProduct.colors (strings) to objects if they exist.
    if (baseProduct.colors && Array.isArray(baseProduct.colors)) {
      merged.colors = baseProduct.colors.map(colorName => {
        // Find hex in template colors or fallback to a default
        const templateColor = mockProduct.colors.find(c => c.name === colorName);
        return templateColor || { name: colorName, hex: "#ddd" };
      });
    } else {
      merged.colors = mockProduct.colors;
    }

    return merged;
  }, [baseProduct]);

  const [activeImg, setActiveImg] = useState(0);
  const [selectedSize, setSelectedSize] = useState(null);

  // Always derive selectedColor from product.colors[0] when product changes
  const [selectedColor, setSelectedColor] = useState(() => product?.colors?.[0] || null);
  useEffect(() => {
    setSelectedColor(product?.colors?.[0] || null);
  }, [product]);

  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  const [sizeError, setSizeError] = useState(false);

  const handleAddToCart = () => {
    if (!selectedSize) { setSizeError(true); return; }
    setSizeError(false);

    // Add product to cart with selected options
    addToCart({
      ...product,
      selectedSize,
      selectedColor: selectedColor?.name || product.colors[0]?.name,
      quantity: qty
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const handleBuyNow = () => {
    if (!selectedSize) { setSizeError(true); return; }
    if (!isLoggedIn) {
      navigate("/login", { state: { from: { pathname: window.location.pathname } } });
      return;
    }
    navigate("/checkout");
  };

  const ratingDist = [
    { star: 5, pct: 62 },
    { star: 4, pct: 24 },
    { star: 3, pct: 9 },
    { star: 2, pct: 3 },
    { star: 1, pct: 2 },
  ];

  return (
    <div style={{ backgroundColor: SURFACE, minHeight: "100vh" }}>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />

      {/* ── BREADCRUMB ── */}
      <div style={{ backgroundColor: "#fff", borderBottom: `1px solid ${BORDER}`, padding: "10px 40px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: MUTED }}>
          {["Home", "Women", "Ethnic Wear", "Kurta Kurtis"].map((b, i, arr) => (
            <span key={b} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span
                onClick={() => i === 0 && navigate("/")}
                style={{
                  cursor: i < arr.length - 1 ? "pointer" : "default",
                  color: i === arr.length - 1 ? GOLD_DARK : MUTED,
                  fontWeight: i === arr.length - 1 ? 600 : 400
                }}
              >{b}</span>
              {i < arr.length - 1 && <span style={{ color: "#ccc" }}>/</span>}
            </span>
          ))}
        </div>
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "28px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, alignItems: "start" }}>

          {/* ══════════ LEFT — IMAGE GALLERY ══════════ */}
          <div style={{ position: "sticky", top: 80 }}>
            {/* Main image */}
            <div style={{
              borderRadius: 12, overflow: "hidden",
              border: `1px solid ${BORDER}`,
              backgroundColor: "#fff",
              position: "relative",
              animation: "zoomIn 0.4s ease",
            }}>
              <img
                key={activeImg}
                src={product.images[activeImg]}
                alt={product.title}
                style={{
                  width: "100%", height: 520,
                  objectFit: "cover", objectPosition: "top",
                  display: "block",
                  animation: "fadeIn 0.35s ease",
                }}
              />
              {/* Discount badge */}
              <div style={{
                position: "absolute", top: 14, left: 14,
                background: `linear-gradient(135deg,${GOLD_DARK},${GOLD})`,
                color: "#fff", fontSize: 12, fontWeight: 800,
                padding: "4px 10px", borderRadius: 4,
              }}>
                {product.discount}% OFF
              </div>
              {/* Wishlist btn */}
              <button
                className="pdp-btn-wish"
                onClick={() => setWishlisted(w => !w)}
                style={{
                  position: "absolute", top: 14, right: 14,
                  width: 38, height: 38, borderRadius: "50%",
                  background: "rgba(255,255,255,0.95)",
                  border: `1.5px solid ${wishlisted ? GOLD : BORDER}`,
                  cursor: "pointer", display: "flex", alignItems: "center",
                  justifyContent: "center", fontSize: 18,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  transition: "all 0.2s",
                }}
              >
                <svg width="20" height="20" fill={wishlisted ? "#ff4d4f" : "none"} stroke={wishlisted ? "#ff4d4f" : "currentColor"} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            </div>

            {/* Thumbnails */}
            <div style={{ display: "flex", gap: 8, marginTop: 12, overflowX: "auto", scrollbarWidth: "none" }}>
              {product.images.map((img, i) => (
                <div
                  key={i}
                  className="pdp-thumb"
                  onClick={() => setActiveImg(i)}
                  style={{
                    width: 72, height: 90, flexShrink: 0,
                    borderRadius: 6, overflow: "hidden",
                    border: `2px solid ${i === activeImg ? GOLD : BORDER}`,
                    cursor: "pointer", transition: "border-color 0.15s",
                  }}
                >
                  <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                </div>
              ))}
            </div>
          </div>

          {/* ══════════ RIGHT — PRODUCT INFO ══════════ */}
          <div style={{ animation: "slideUp 0.4s ease" }}>

            {/* Brand + Title */}
            <p style={{ fontSize: 12, color: GOLD_DARK, fontWeight: 700, letterSpacing: 1, marginBottom: 4 }}>
              {product.brand.toUpperCase()}
            </p>
            <h1 style={{
              fontSize: 24, fontWeight: 700, color: CHARCOAL,
              lineHeight: 1.3, marginBottom: 10,
              fontFamily: "'Playfair Display', Georgia, serif",
            }}>
              {product.title}
            </h1>

            {/* Rating row */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 6,
                backgroundColor: GOLD, borderRadius: 4,
                padding: "3px 8px",
              }}>
                <Stars rating={product.rating} size={10} />
                <span style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>{product.rating}</span>
              </div>
              <span style={{ fontSize: 12, color: MUTED }}>{product.reviews} Reviews</span>
              <span style={{ fontSize: 12, color: GREEN, fontWeight: 600 }}>● In Stock</span>
            </div>

            {/* Price */}
            <div style={{
              display: "flex", alignItems: "center", gap: 12,
              marginBottom: 20, padding: "14px 16px",
              backgroundColor: GOLD_LIGHT, borderRadius: 8,
              border: `1px solid ${GOLD}44`,
            }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: CHARCOAL }}>₹{product.price}</span>
              <span style={{ fontSize: 15, color: MUTED, textDecoration: "line-through" }}>₹{product.mrp}</span>
              <span style={{
                fontSize: 13, fontWeight: 800, color: GREEN,
                backgroundColor: "#E8F5E9", padding: "2px 8px", borderRadius: 4,
              }}>
                {product.discount}% OFF
              </span>
              <span style={{ fontSize: 11, color: MUTED, marginLeft: "auto" }}>
                Save ₹{product.mrp - product.price}
              </span>
            </div>

            {/* Color selector */}
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: CHARCOAL, marginBottom: 8, letterSpacing: 0.5 }}>
                COLOR: <span style={{ color: GOLD_DARK }}>{selectedColor?.name || "Select Color"}</span>
              </p>
              <div style={{ display: "flex", gap: 10 }}>
                {product.colors.map(c => (
                  <div
                    key={c.name}
                    className="pdp-color"
                    onClick={() => setSelectedColor(c)}
                    title={c.name}
                    style={{
                      width: 28, height: 28, borderRadius: "50%",
                      backgroundColor: c.hex,
                      border: `3px solid ${selectedColor?.name === c.name ? GOLD : "transparent"}`,
                      outline: `2px solid ${selectedColor?.name === c.name ? GOLD : "#ddd"}`,
                      cursor: "pointer", transition: "transform 0.15s",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Size selector */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <p style={{ fontSize: 12, fontWeight: 700, color: CHARCOAL, letterSpacing: 0.5 }}>
                  SIZE: {selectedSize && <span style={{ color: GOLD_DARK }}>{selectedSize}</span>}
                </p>
                <span style={{ fontSize: 11, color: GOLD_DARK, cursor: "pointer", textDecoration: "underline", fontWeight: 600 }}>
                  Size Guide
                </span>
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {product.sizes.map(s => (
                  <button
                    key={s}
                    className="pdp-size"
                    onClick={() => { setSelectedSize(s); setSizeError(false); }}
                    style={{
                      width: 48, height: 40,
                      borderRadius: 6,
                      border: `1.5px solid ${selectedSize === s ? GOLD : BORDER}`,
                      backgroundColor: selectedSize === s ? GOLD_LIGHT : "#fff",
                      color: selectedSize === s ? GOLD_DARK : CHARCOAL,
                      fontSize: 12, fontWeight: selectedSize === s ? 700 : 500,
                      cursor: "pointer", transition: "all 0.15s",
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
              {sizeError && (
                <p style={{ fontSize: 11, color: "#E53935", marginTop: 6, fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                  <FiAlertTriangle size={12} /> Please select a size before adding to cart
                </p>
              )}
            </div>

            {/* Quantity */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: CHARCOAL, letterSpacing: 0.5 }}>QTY:</p>
              <div style={{
                display: "flex", alignItems: "center",
                border: `1.5px solid ${BORDER}`, borderRadius: 6, overflow: "hidden",
              }}>
                {["-", "qty", "+"].map((item, i) => (
                  item === "qty"
                    ? <span key="q" style={{ width: 40, textAlign: "center", fontSize: 14, fontWeight: 700, color: CHARCOAL }}>{qty}</span>
                    : <button
                      key={item}
                      onClick={() => setQty(q => item === "-" ? Math.max(1, q - 1) : Math.min(10, q + 1))}
                      style={{
                        width: 36, height: 36, border: "none",
                        backgroundColor: "#fff",
                        cursor: "pointer", fontSize: 18, fontWeight: 700,
                        color: GOLD_DARK,
                      }}
                    >{item}</button>
                ))}
              </div>
            </div>

            {/* CTA Buttons */}
            <div style={{ display: "flex", gap: 12, marginBottom: 24 }}>
              <button
                className="pdp-btn-cart"
                onClick={handleAddToCart}
                style={{
                  flex: 1, padding: "14px",
                  backgroundColor: addedToCart ? GREEN : GOLD,
                  color: "#fff", border: "none",
                  borderRadius: 6, fontSize: 13, fontWeight: 800,
                  letterSpacing: 1, cursor: "pointer",
                  transition: "background 0.2s",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                {addedToCart ? <><FiCheck /> ADDED TO CART</> : <><FiShoppingCart /> ADD TO CART</>}
              </button>
              <button
                onClick={handleBuyNow}
                style={{
                  flex: 1, padding: "14px",
                  backgroundColor: "#fff",
                  color: GOLD_DARK,
                  border: `2px solid ${GOLD}`,
                  borderRadius: 6, fontSize: 13, fontWeight: 800,
                  letterSpacing: 1, cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                }}
              >
                <FiZap /> BUY NOW
              </button>
            </div>

            {/* Trust badges */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: 16, marginBottom: 24,
              padding: 16, backgroundColor: "#fff",
              borderRadius: 8, border: `1px solid ${BORDER}`,
            }}>
              {[
                { icon: <FiTruck />, title: "Free Delivery", sub: "On orders above ₹499" },
                { icon: <FiRotateCcw />, title: "Easy Returns", sub: "15-day hassle-free" },
                { icon: <FiCheckCircle />, title: "100% Authentic", sub: "Verified products only" },
                { icon: <FiLock />, title: "Secure Payment", sub: "Encrypted transactions" },
              ].map(b => (
                <div key={b.title} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontSize: 20, color: GOLD }}>{b.icon}</span>
                  <div>
                    <p style={{ fontSize: 11, fontWeight: 700, color: CHARCOAL }}>{b.title}</p>
                    <p style={{ fontSize: 10, color: MUTED }}>{b.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabs: Description / Details / Reviews */}
            <div>
              <div style={{ display: "flex", borderBottom: `2px solid ${BORDER}`, marginBottom: 16 }}>
                {["description", "details", "reviews"].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      padding: "10px 20px", background: "none", border: "none",
                      fontSize: 12, fontWeight: 700, letterSpacing: 0.5,
                      color: activeTab === tab ? GOLD_DARK : MUTED,
                      borderBottom: `2.5px solid ${activeTab === tab ? GOLD : "transparent"}`,
                      marginBottom: -2, cursor: "pointer", textTransform: "uppercase",
                      transition: "color 0.15s",
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Description */}
              {activeTab === "description" && (
                <div style={{ animation: "fadeIn 0.3s ease" }}>
                  <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.7, marginBottom: 14 }}>
                    {product.description}
                  </p>
                  <ul style={{ paddingLeft: 0, listStyle: "none" }}>
                    {product.highlights.map(h => (
                      <li key={h} style={{
                        display: "flex", alignItems: "flex-start", gap: 8,
                        fontSize: 13, color: CHARCOAL, marginBottom: 8,
                      }}>
                        <FiStar size={12} style={{ color: GOLD, marginTop: 1 }} />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Details */}
              {activeTab === "details" && (
                <div style={{ animation: "fadeIn 0.3s ease" }}>
                  {[
                    ["Fabric", product.fabric],
                    ["Pattern", product.pattern],
                    ["Occasion", product.occasion],
                    ["Fit", product.fit],
                    ["Wash Care", product.washCare],
                    ["SKU", product.sku],
                  ].map(([k, v]) => (
                    <div key={k} style={{
                      display: "flex", padding: "10px 0",
                      borderBottom: `1px solid ${BORDER}`,
                    }}>
                      <span style={{ width: 120, fontSize: 12, color: MUTED, fontWeight: 600 }}>{k}</span>
                      <span style={{ fontSize: 12, color: CHARCOAL, fontWeight: 500 }}>{v}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Reviews */}
              {activeTab === "reviews" && (
                <div style={{ animation: "fadeIn 0.3s ease" }}>
                  {/* Rating summary */}
                  <div style={{
                    display: "flex", gap: 24, alignItems: "center",
                    padding: "16px", backgroundColor: GOLD_LIGHT,
                    borderRadius: 8, marginBottom: 16,
                    border: `1px solid ${GOLD}33`,
                  }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 40, fontWeight: 900, color: GOLD_DARK }}>{product.rating}</div>
                      <Stars rating={product.rating} size={14} />
                      <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>{product.reviews} reviews</div>
                    </div>
                    <div style={{ flex: 1 }}>
                      {ratingDist.map(r => (
                        <div key={r.star} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 5 }}>
                          <span style={{ fontSize: 11, color: MUTED, width: 10 }}>{r.star}</span>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill={GOLD}><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
                          <div style={{ flex: 1, height: 6, backgroundColor: BORDER, borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ width: `${r.pct}%`, height: "100%", backgroundColor: GOLD, borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 11, color: MUTED, width: 26 }}>{r.pct}%</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Individual reviews */}
                  {product.reviews_list.map((r, i) => (
                    <div key={i} style={{
                      padding: "14px 0",
                      borderBottom: i < product.reviews_list.length - 1 ? `1px solid ${BORDER}` : "none",
                    }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                        <div style={{
                          width: 32, height: 32, borderRadius: "50%",
                          background: `linear-gradient(135deg,${GOLD_LIGHT},${GOLD})`,
                          display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: 13, fontWeight: 800, color: GOLD_DARK,
                        }}>
                          {r.name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontSize: 12, fontWeight: 700, color: CHARCOAL }}>{r.name}</span>
                            {r.verified && (
                              <span style={{
                                fontSize: 9, color: GREEN, fontWeight: 600,
                                backgroundColor: "#E8F5E9", padding: "1px 6px", borderRadius: 10
                              }}>
                                ✓ Verified
                              </span>
                            )}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 2 }}>
                            <Stars rating={r.rating} size={10} />
                            <span style={{ fontSize: 10, color: MUTED }}>{r.date}</span>
                          </div>
                        </div>
                      </div>
                      <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6, paddingLeft: 42 }}>{r.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div style={{ marginTop: 60, borderTop: `1px solid ${BORDER}`, paddingTop: 40 }}>
          <h2 style={{ 
            fontSize: 20, fontWeight: 700, color: CHARCOAL, marginBottom: 24,
            fontFamily: "'Playfair Display', Georgia, serif", textAlign: 'center'
          }}>
            YOU MIGHT ALSO LIKE
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24 }}>
            {relatedProducts.map(p => (
              <Link
                key={p.id}
                to={`/product/${p.id}`}
                className="pdp-related"
                style={{
                  backgroundColor: "#fff", borderRadius: 12,
                  overflow: "hidden", border: `1px solid ${BORDER}`,
                  cursor: "pointer",
                  textDecoration: "none",
                  display: "block",
                  boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
                }}
              >
                <div style={{ position: "relative" }}>
                  <img src={p.img} alt={p.title}
                    style={{ width: "100%", height: 240, objectFit: "cover", display: "block" }} />
                  <div style={{
                    position: "absolute", top: 10, left: 10,
                    background: `linear-gradient(135deg,${GOLD_DARK},${GOLD})`,
                    color: "#fff", fontSize: 10, fontWeight: 800,
                    padding: "3px 8px", borderRadius: 4,
                  }}>
                    {p.discount}% OFF
                  </div>
                </div>
                <div style={{ padding: "12px 16px 16px" }}>
                  <p style={{ fontSize: 13, color: CHARCOAL, fontWeight: 600, marginBottom: 8, lineHeight: 1.4 }}>{p.title}</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 800, color: CHARCOAL }}>₹{p.price}</span>
                    <span style={{ fontSize: 12, color: MUTED, textDecoration: "line-through" }}>₹{p.mrp}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
