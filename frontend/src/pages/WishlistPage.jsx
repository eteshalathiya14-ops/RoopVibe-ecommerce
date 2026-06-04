/**
 * WishlistPage.jsx — FIXED
 * Ab mockProducts nahi, real products from AdminDataContext use karta hai
 * Wishlist add/remove properly kaam karta hai
 */
import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiX } from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import { useAdminData } from '../Admin/context/Admindatacontext';

const GOLD      = '#C9A96E';
const GOLD_DARK = '#A07840';
const CHARCOAL  = '#1A1A1A';
const MUTED     = '#6B6560';
const BORDER    = '#EDE8E0';
const SURFACE   = '#FAF7F2';

function resolveImg(img) {
  if (!img) return "";
  if (typeof img === "string") return img;
  if (typeof img === "object") return img.src || img.url || "";
  return "";
}

function getPid(p) {
  return String(p._id || p.id || "");
}

function Stars({ rating }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <svg key={s} width="10" height="10" viewBox="0 0 24 24"
          fill={s <= Math.round(rating) ? GOLD : '#e0d8cc'}>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
        </svg>
      ))}
    </span>
  );
}

export default function WishlistPage() {
  const navigate = useNavigate();
  const { likedIds, removeFromWishlist } = useWishlist();
  const { products } = useAdminData();

  // Match wished IDs against real products from DB/context
  const likedProducts = useMemo(() => {
    if (!likedIds?.length || !products?.length) return [];
    return likedIds
      .map(id => products.find(p => getPid(p) === String(id)))
      .filter(Boolean);
  }, [likedIds, products]);

  return (
    <div style={{ backgroundColor: SURFACE, minHeight: '100vh' }}>
      {/* Header */}
      <div style={{ background: '#fff', borderBottom: `1px solid ${BORDER}`, padding: '14px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <h1 style={{ fontSize: 20, fontWeight: 900, color: CHARCOAL,
            fontFamily: "'Playfair Display', Georgia, serif" }}>
            WISHLIST
            {likedProducts.length > 0 && (
              <span style={{ fontSize: 13, fontWeight: 600, color: MUTED, marginLeft: 10 }}>
                ({likedProducts.length} items)
              </span>
            )}
          </h1>
          <button onClick={() => navigate(-1)}
            style={{ background: 'transparent', border: `1.5px solid ${BORDER}`, borderRadius: 8,
              padding: '7px 14px', color: MUTED, fontWeight: 700, cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <FiX size={14}/> Back
          </button>
        </div>
      </div>

      {likedProducts.length === 0 ? (
        <div style={{ padding: '80px 18px', maxWidth: 400, margin: '0 auto', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, margin: '0 auto', borderRadius: '50%',
            background: `${GOLD}14`, border: `1px solid ${GOLD}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', color: GOLD_DARK }}>
            <FiHeart size={28} fill={GOLD}/>
          </div>
          <p style={{ marginTop: 16, fontSize: 18, fontWeight: 900, color: CHARCOAL }}>
            No liked products
          </p>
          <p style={{ marginTop: 8, fontSize: 13, color: MUTED }}>
            Tap the heart on any product to save it here.
          </p>
          <Link to="/" style={{ display: 'inline-block', marginTop: 20, padding: '12px 28px',
            borderRadius: 8, background: GOLD, color: '#fff', textDecoration: 'none',
            fontWeight: 700, fontSize: 13 }}>
            Browse Products
          </Link>
        </div>
      ) : (
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '24px 24px 48px' }}>
          <div style={{ display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 18 }}>
            {likedProducts.map(p => {
              const pid   = getPid(p);
              const thumb = resolveImg(p.colorVariants?.[0]?.images?.[0]) || resolveImg(p.img);
              const disc  = p.mrp > 0 ? Math.round((1 - p.price / p.mrp) * 100) : 0;

              return (
                <div key={pid} style={{ backgroundColor: '#fff', borderRadius: 10,
                  overflow: 'hidden', border: `1px solid ${BORDER}`,
                  transition: 'all 0.2s ease', boxShadow: '0 2px 10px rgba(0,0,0,0.03)' }}>
                  <Link to={`/product/${pid}`} style={{ textDecoration: 'none', display: 'block' }}>
                    <div style={{ position: 'relative' }}>
                      {thumb ? (
                        <img src={thumb} alt={p.title}
                          style={{ width: '100%', height: 240, objectFit: 'cover',
                            objectPosition: 'top', display: 'block' }}
                          onError={e => e.target.style.opacity = '0'}/>
                      ) : (
                        <div style={{ width: '100%', height: 240, background: SURFACE,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: MUTED, fontSize: 12 }}>No Image</div>
                      )}
                      {disc > 0 && (
                        <div style={{ position: 'absolute', top: 10, left: 10,
                          background: GOLD, color: '#fff', fontSize: 9,
                          fontWeight: 900, padding: '3px 8px', borderRadius: 4 }}>
                          {disc}% OFF
                        </div>
                      )}
                      {/* Remove button */}
                      <button onClick={e => { e.preventDefault(); e.stopPropagation(); removeFromWishlist(pid); }}
                        style={{ position: 'absolute', top: 10, right: 10, width: 32, height: 32,
                          borderRadius: '50%', border: `1.5px solid ${GOLD}`,
                          background: 'rgba(255,255,255,0.92)', cursor: 'pointer',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#ff4d4f', transition: 'transform 0.15s' }}>
                        <FiHeart size={14} fill="#ff4d4f"/>
                      </button>
                    </div>

                    <div style={{ padding: '12px 14px 16px' }}>
                      {p.brand && (
                        <p style={{ fontSize: 9, fontWeight: 700, color: GOLD_DARK,
                          letterSpacing: '0.5px', textTransform: 'uppercase', marginBottom: 4 }}>
                          {p.brand}
                        </p>
                      )}
                      <p style={{ fontSize: 13, color: CHARCOAL, fontWeight: 600,
                        marginBottom: 8, lineHeight: 1.4,
                        display: '-webkit-box', WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {p.title}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                        <Stars rating={p.rating || 4}/>
                        <span style={{ fontSize: 11, color: MUTED }}>
                          {p.reviews || 0} reviews
                        </span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 15, fontWeight: 900, color: CHARCOAL }}>
                          ₹{p.price}
                        </span>
                        <span style={{ fontSize: 11, color: MUTED, textDecoration: 'line-through' }}>
                          ₹{p.mrp}
                        </span>
                      </div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}