import { useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiHeart, FiX } from 'react-icons/fi';

import { useWishlist } from '../context/WishlistContext';
import { mockProducts } from '../Data/Navdata';

const GOLD = '#C9A96E';
const GOLD_DARK = '#A07840';
const CHARCOAL = '#1A1A1A';
const MUTED = '#6B6560';
const BORDER = '#EDE8E0';

function Stars({ rating }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((s) => (
        <svg
          key={s}
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill={s <= Math.round(rating) ? GOLD : '#e0d8cc'}
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}

export default function WishlistPage() {
  const navigate = useNavigate();
  const { likedIds, removeFromWishlist } = useWishlist();

  const likedProducts = useMemo(() => {
    if (!likedIds?.length) return [];
    // product objects exist inside app mock data. Use id to map.
    const map = new Map(mockProducts.map((p) => [p.id, p]));
    return likedIds.map((id) => map.get(id)).filter(Boolean);
  }, [likedIds]);

  return (
    <div style={{ backgroundColor: '#FAF7F2', minHeight: '100vh' }}>
      <div style={{ background: '#fff', borderBottom: `1px solid ${BORDER}`, padding: '14px 32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <h1
            style={{
              fontSize: 22,
              fontWeight: 900,
              color: CHARCOAL,
              fontFamily: "'Playfair Display', Georgia, serif",
            }}
          >
            LIKED PRODUCTS
          </h1>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'transparent',
              border: `1.5px solid ${BORDER}`,
              borderRadius: 8,
              padding: '8px 12px',
              color: MUTED,
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <FiX size={16} /> Back
          </button>
        </div>
      </div>

      {!likedProducts.length ? (
        <div
          style={{
            padding: '60px 18px',
            maxWidth: 900,
            margin: '0 auto',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              width: 84,
              height: 84,
              margin: '0 auto',
              borderRadius: '50%',
              background: `${GOLD}14`,
              border: `1px solid ${GOLD}55`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: GOLD_DARK,
            }}
          >
            <FiHeart size={28} fill={GOLD} />
          </div>
          <p style={{ marginTop: 14, fontSize: 18, fontWeight: 900, color: CHARCOAL }}>No liked products</p>
          <p style={{ marginTop: 8, fontSize: 13, color: MUTED }}>Tap the heart on any product to save it here.</p>
          <Link
            to="/"
            style={{
              display: 'inline-block',
              marginTop: 18,
              padding: '12px 26px',
              borderRadius: 10,
              background: GOLD,
              color: '#fff',
              textDecoration: 'none',
              fontWeight: 900,
            }}
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div style={{ maxWidth: 1320, margin: '0 auto', padding: '26px 32px 40px' }}>
          <div className="rv-wishlist-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 18 }}>
            {likedProducts.map((p) => (

              <div
                key={p.id}
                className="rv-wishlist-card"
                style={{
                  backgroundColor: '#fff',
                  borderRadius: 10,
                  overflow: 'hidden',
                  border: `1px solid ${BORDER}`,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                }}
              >
                <Link to={`/product/${p.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                  <div style={{ position: 'relative' }}>
                    <img src={p.img} alt={p.title} style={{ width: '100%', height: 240, objectFit: 'cover', display: 'block' }} />

                    <div
                      style={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        background: GOLD,
                        color: '#fff',
                        fontSize: 9,
                        fontWeight: 900,
                        padding: '3px 8px',
                        borderRadius: 4,
                      }}
                    >
                      {p.disc}% OFF
                    </div>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        removeFromWishlist(p.id);
                      }}
                      style={{
                        position: 'absolute',
                        top: 10,
                        right: 10,
                        width: 34,
                        height: 34,
                        borderRadius: '50%',
                        border: `1.5px solid ${GOLD}`,
                        background: 'rgba(255,255,255,0.92)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#ff4d4f',
                        transition: 'transform 0.15s',
                      }}
                      aria-label="Remove from wishlist"
                    >
                      <FiHeart size={16} fill="#ff4d4f" />
                    </button>
                  </div>
                  <div style={{ padding: '12px 14px 16px' }}>
                    <p className="rv-wishlist-title" style={{ fontSize: 13, color: CHARCOAL, fontWeight: 700, height: 36, overflow: 'hidden' }}>{p.title}</p>

                    <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Stars rating={p.rating} />
                      <span style={{ fontSize: 12, color: MUTED, fontWeight: 700 }}>{p.reviews} reviews</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                      <span style={{ fontSize: 16, fontWeight: 900, color: CHARCOAL }}>₹{p.price}</span>
                      <span style={{ fontSize: 12, color: MUTED, textDecoration: 'line-through' }}>₹{p.mrp}</span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

