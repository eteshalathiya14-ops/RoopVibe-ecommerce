
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { FiHeart, FiZap, FiClock, FiTag, FiArrowRight, FiPlus } from 'react-icons/fi';
import { useMobileLayout } from '../hooks/Usemobilelayout';

const GOLD       = '#C9A96E';
const GOLD_DARK  = '#A07840';
const CHARCOAL   = '#1A1A1A';
const MUTED      = '#7A736B';
const BORDER     = '#EDE8E0';
const SURFACE    = '#FAF7F2';
const GREEN      = '#2E7D32';

/* ── Offer banners ─────────────────────────────── */
const BANNERS = [
  {
    bg: 'linear-gradient(120deg,#7B1FA2,#AB47BC)',
    title: 'MEGA SALE',
    sub: 'Up to 85% Off',
    tag: 'LIMITED TIME',
    cta: 'Shop Now',
    img: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=200&h=140&fit=crop&crop=top',
  },
  {
    bg: 'linear-gradient(120deg,#C62828,#EF5350)',
    title: 'FLASH DEALS',
    sub: 'Starting ₹199',
    tag: 'TODAY ONLY',
    cta: 'Grab Now',
    img: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=200&h=140&fit=crop&crop=top',
  },
  {
    bg: 'linear-gradient(120deg,#1565C0,#42A5F5)',
    title: 'NEW ARRIVALS',
    sub: 'Extra 10% Off',
    tag: 'USE CODE: NEW10',
    cta: 'Explore',
    img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=200&h=140&fit=crop&crop=top',
  },
];

/* ── Coupons ───────────────────────────────────── */
const COUPONS = [
  { code: 'FIRST50',  title: 'First Order Discount', desc: '50% off on your first order above ₹499', color: '#7B1FA2' },
  { code: 'SAVE200',  title: 'Flat ₹200 Off',        desc: 'On orders above ₹999. Valid today only',  color: '#C62828' },
  { code: 'UPIOFF',   title: 'UPI Extra 5% Off',     desc: 'Pay via UPI and get 5% cashback',          color: '#1565C0' },
  { code: 'SUMMER30', title: 'Summer Special',       desc: '30% off on all ethnic wear collections',   color: GOLD_DARK },
];

/* ── Category deals ────────────────────────────── */
const CAT_DEALS = [
  { label: 'Ethnic Wear',  disc: 'Up to 80%', img: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=200&h=200&fit=crop&crop=top', path: '/category/women/ethnic-wear' },
  { label: 'Western Wear', disc: 'Up to 70%', img: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=200&h=200&fit=crop&crop=top', path: '/category/women/western-wear' },
  { label: 'Men Fashion',  disc: 'Up to 75%', img: 'https://images.unsplash.com/photo-1617137968427-85924c800a22?w=200&h=200&fit=crop&crop=top', path: '/category/men/top-wear' },
  { label: 'Footwear',     disc: 'Up to 65%', img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=200&h=200&fit=crop',              path: '/category/women/footwear' },
  { label: 'Jewellery',    disc: 'Up to 85%', img: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=200&h=200&fit=crop',            path: '/category/women/jewellery' },
  { label: 'Kids',         disc: 'Up to 60%', img: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=200&h=200&fit=crop&crop=top',   path: '/category/kids/boys' },
];

/* ── Flash deal products ───────────────────────── */
const DEALS = [
  { id: 1,  title: 'Printed Anarkali Kurta',  price: 399,  mrp: 1299, img: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=300&h=380&fit=crop&crop=top',  disc: 69 },
  { id: 2,  title: 'Floral Maxi Dress',       price: 599,  mrp: 1999, img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=300&h=380&fit=crop&crop=top',  disc: 70 },
  { id: 3,  title: 'Silk Blend Saree',        price: 899,  mrp: 2999, img: 'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=300&h=380&fit=crop&crop=top',  disc: 70 },
  { id: 4,  title: 'Co-Ord Ethnic Set',       price: 699,  mrp: 2499, img: 'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=300&h=380&fit=crop&crop=top',  disc: 72 },
  { id: 5,  title: 'Embroidered Kurti',       price: 449,  mrp: 1499, img: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=300&h=380&fit=crop&crop=top',  disc: 70 },
  { id: 6,  title: 'Chikankari Kurta',        price: 799,  mrp: 2599, img: 'https://images.unsplash.com/photo-1617375407175-baa01a8d69f8?w=300&h=380&fit=crop&crop=top',  disc: 69 },
  { id: 7,  title: 'Palazzo Kurta Set',       price: 549,  mrp: 1799, img: 'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=300&h=380&fit=crop&crop=top',  disc: 69 },
  { id: 8,  title: 'Georgette Anarkali',      price: 699,  mrp: 2199, img: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4e83?w=300&h=380&fit=crop&crop=top',  disc: 68 },
];

/* ── Flash countdown (static display) ─────────── */
function FlashTimer() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <FiClock size={13} color={GOLD} />
      <span style={{ fontSize: 11, fontWeight: 700, color: GOLD_DARK }}>Ends in</span>
      {['05', '23', '41'].map((t, i) => (
        <React.Fragment key={i}>
          <span style={{ backgroundColor: CHARCOAL, color: '#fff', fontSize: 11, fontWeight: 800, padding: '2px 6px', borderRadius: 4 }}>{t}</span>
          {i < 2 && <span style={{ fontSize: 11, fontWeight: 800, color: CHARCOAL }}>:</span>}
        </React.Fragment>
      ))}
    </div>
  );
}

/* ── Deal card ─────────────────────────────────── */
function DealCard({ product }) {
  const { addToCart } = useCart();
  const [wish, setWish] = useState(false);

  return (
    <div style={{ backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden', border: `1px solid ${BORDER}`, display: 'flex', flexDirection: 'column' }}>
      <Link to={`/product/${product.id}`} style={{ textDecoration: 'none', position: 'relative', display: 'block' }}>
        <img
          src={product.img}
          alt={product.title}
          style={{ width: '100%', height: 200, objectFit: 'cover', objectPosition: 'top', display: 'block' }}
          onError={e => { e.target.style.backgroundColor = SURFACE; e.target.style.minHeight = '200px'; }}
        />
        <div style={{ position: 'absolute', top: 8, left: 8, backgroundColor: '#C62828', color: '#fff', fontSize: 10, fontWeight: 800, padding: '3px 7px', borderRadius: 4 }}>
          {product.disc}% OFF
        </div>
        <button
          onClick={e => { e.preventDefault(); e.stopPropagation(); setWish(w => !w); }}
          style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(255,255,255,0.92)', border: 'none', borderRadius: '50%', width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: wish ? '#ff4d4f' : MUTED }}>
          <FiHeart size={15} fill={wish ? 'currentColor' : 'none'} />
        </button>
      </Link>
      <div style={{ padding: '8px 10px 10px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: CHARCOAL, lineHeight: 1.35, marginBottom: 4 }}>{product.title}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 6 }}>
          <div>
            <span style={{ fontSize: 13, fontWeight: 800, color: CHARCOAL }}>₹{product.price}</span>
            <span style={{ fontSize: 10, color: MUTED, textDecoration: 'line-through', marginLeft: 4 }}>₹{product.mrp}</span>
          </div>
          <button
            onClick={() => addToCart(product)}
            style={{ backgroundColor: GOLD, border: 'none', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff', flexShrink: 0 }}>
            <FiPlus size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════
   MAIN COMPONENT
   ════════════════════════════════════════════════ */
export default function OffersPage() {
  useCart();
  const [copiedCode, setCopiedCode] = useState('');
  const { isMobile } = useMobileLayout();


  const copyCode = (code) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  return (
      <div className="rv-offers-page" style={{ backgroundColor: SURFACE, minHeight: '100vh', paddingBottom: isMobile ? 86 : 40 }}>

      {/* ── HEADER — mobile only ─────────────────── */}
      {isMobile && (
        <header style={{
          backgroundColor: '#fff',
          borderBottom: `1px solid ${BORDER}`,
          padding: '0 16px',
          height: 56,
          display: 'flex',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          gap: 12,
        }}>
          <FiTag size={18} color={GOLD_DARK} />
          <h1 style={{ fontSize: 16, fontWeight: 900, color: CHARCOAL, letterSpacing: '1px', fontFamily: 'Georgia, serif', flex: 1 }}>
            OFFERS
          </h1>
        </header>
      )}

      {/* ── DESKTOP HEADING ─────────────────────── */}
      {!isMobile && (
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '28px 40px 0' }}>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: CHARCOAL, fontFamily: 'Georgia, serif', display: 'flex', alignItems: 'center', gap: 10 }}>
            <FiTag color={GOLD_DARK} /> Offers & Deals
          </h1>
          <p style={{ color: MUTED, fontSize: 13, marginTop: 4 }}>Best prices, exclusive coupons & flash sales</p>
        </div>
      )}

      <div style={{ maxWidth: isMobile ? '100%' : 1100, margin: '0 auto', padding: isMobile ? '14px 12px' : '20px 40px', display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* ── PROMO BANNERS ─────────────────────── */}
        <section>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {BANNERS.map((b, i) => (
              <div key={i} style={{
                borderRadius: 12,
                overflow: 'hidden',
                background: b.bg,
                display: 'flex',
                alignItems: 'center',
                height: isMobile ? 110 : 130,
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                cursor: 'pointer',
              }}>
                <div style={{ padding: '16px 20px', flex: 1 }}>
                  <span style={{ fontSize: 8, fontWeight: 800, letterSpacing: '1.5px', color: 'rgba(255,255,255,0.85)', backgroundColor: 'rgba(255,255,255,0.15)', padding: '2px 8px', borderRadius: 20, display: 'inline-block', marginBottom: 6 }}>
                    {b.tag}
                  </span>
                  <p style={{ fontSize: isMobile ? 22 : 26, fontWeight: 900, color: '#fff', lineHeight: 1.1, fontFamily: 'Georgia, serif', marginBottom: 4 }}>{b.title}</p>
                  <p style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginBottom: 10 }}>{b.sub}</p>
                  <button style={{ backgroundColor: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.6)', color: '#fff', fontSize: 9, fontWeight: 800, padding: '5px 14px', borderRadius: 20, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {b.cta} <FiArrowRight size={10} />
                  </button>
                </div>
                <div style={{ width: isMobile ? 110 : 160, height: '100%', flexShrink: 0, overflow: 'hidden', position: 'relative' }}>
                  <img
                    src={b.img}
                    alt={b.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(0,0,0,0.25), transparent)' }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── COUPON CODES ─────────────────────── */}
        <section>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: CHARCOAL, marginBottom: 14, fontFamily: 'Georgia, serif', display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiTag color={GOLD_DARK} /> Coupon Codes
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
            {COUPONS.map((c, i) => (
              <div key={i} style={{
                backgroundColor: '#fff',
                borderRadius: 10,
                border: `1px dashed ${c.color}55`,
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
              }}>
                <div style={{ width: 4, alignSelf: 'stretch', backgroundColor: c.color, borderRadius: 4, flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12, fontWeight: 800, color: CHARCOAL, marginBottom: 2 }}>{c.title}</p>
                  <p style={{ fontSize: 10, color: MUTED, marginBottom: 8 }}>{c.desc}</p>
                  <div style={{ display: 'inline-flex', alignItems: 'center', backgroundColor: `${c.color}12`, border: `1.5px dashed ${c.color}`, borderRadius: 6, padding: '3px 10px' }}>
                    <span style={{ fontSize: 12, fontWeight: 900, color: c.color, letterSpacing: '1.5px' }}>{c.code}</span>
                  </div>
                </div>
                <button
                  onClick={() => copyCode(c.code)}
                  style={{
                    backgroundColor: copiedCode === c.code ? GREEN : c.color,
                    color: '#fff', border: 'none', borderRadius: 6,
                    padding: '8px 14px', fontSize: 10, fontWeight: 800,
                    cursor: 'pointer', flexShrink: 0, letterSpacing: '0.5px',
                    transition: 'background 0.2s', minWidth: 60,
                  }}>
                  {copiedCode === c.code ? '✓ Copied' : 'COPY'}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ── SHOP BY CATEGORY ─────────────────── */}
        <section>
          <h2 style={{ fontSize: 16, fontWeight: 800, color: CHARCOAL, marginBottom: 14, fontFamily: 'Georgia, serif', display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiZap color={GOLD_DARK} /> Shop by Category
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(3,1fr)' : 'repeat(6,1fr)', gap: 14 }}>
            {CAT_DEALS.map((cat, i) => (
              <Link key={i} to={cat.path} style={{ textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{ width: '100%', aspectRatio: '1/1', borderRadius: '50%', overflow: 'hidden', border: `2px solid ${BORDER}`, position: 'relative', backgroundColor: SURFACE }}>
                  <img
                    src={cat.img}
                    alt={cat.label}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }}
                    onError={e => { e.target.style.display = 'none'; }}
                  />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.55)', padding: '4px 0', textAlign: 'center' }}>
                    <span style={{ fontSize: 8, fontWeight: 800, color: '#fff' }}>{cat.disc}</span>
                  </div>
                </div>
                <span style={{ fontSize: isMobile ? 9 : 11, fontWeight: 700, color: CHARCOAL, textAlign: 'center', lineHeight: 1.3 }}>{cat.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ── FLASH DEALS ─────────────────────── */}
        <section>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: CHARCOAL, fontFamily: 'Georgia, serif', display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiZap size={16} color={GOLD_DARK} /> Flash Deals
            </h2>
            <FlashTimer />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(4,1fr)', gap: 12 }}>
            {DEALS.map(product => (
              <DealCard key={product.id} product={product} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
}