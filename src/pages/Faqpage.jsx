import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiChevronLeft, FiHelpCircle, FiPackage, FiRefreshCw, FiCreditCard, FiShoppingBag, FiSearch } from 'react-icons/fi';

const GOLD       = '#C9A96E';
const GOLD_DARK  = '#A07840';
const GOLD_LIGHT = '#F5EDD9';
const CHARCOAL   = '#1A1A1A';
const MUTED      = '#6B6560';
const SURFACE    = '#FAF7F2';
const BORDER     = '#EDE8E0';

const FAQ_DATA = [
  {
    category: 'Orders & Shipping',
    icon: <FiPackage size={14} />,
    items: [
      { q: 'How long does delivery take?',       a: 'Standard delivery takes 5–7 business days. Express delivery (select cities) takes 2–3 days. You\'ll receive tracking details via SMS and email once shipped.' },
      { q: 'Can I change or cancel my order?',   a: 'Orders can be modified or cancelled within 2 hours of placing. After that, the order enters processing. Visit My Orders to request cancellation.' },
      { q: 'Do you offer free shipping?',        a: 'Yes! All orders above ₹999 get free standard shipping. Below ₹999, a flat shipping fee of ₹79 applies.' },
      { q: 'How do I track my order?',           a: 'Go to My Orders in your profile and click Track Order. You\'ll see real-time tracking updates via SMS/WhatsApp too.' },
    ],
  },
  {
    category: 'Returns & Refunds',
    icon: <FiRefreshCw size={14} />,
    items: [
      { q: 'What is your return policy?',           a: 'We offer a 7-day easy return for most items. Items must be unused, unwashed, in original packaging with tags. Innerwear and customized items are non-returnable.' },
      { q: 'How long does a refund take?',          a: 'Once received and inspected, refunds are processed in 5–7 business days to your original payment method or RoopVibe wallet.' },
      { q: 'My item arrived damaged. What do I do?', a: 'Take a photo and raise a return request within 48 hours of delivery. Select Defective/Damaged as the reason. We\'ll prioritize your case.' },
    ],
  },
  {
    category: 'Payments & Offers',
    icon: <FiCreditCard size={14} />,
    items: [
      { q: 'What payment methods do you accept?', a: 'We accept UPI (GPay, PhonePe, Paytm), all major credit/debit cards, net banking, and Cash on Delivery (COD) for orders up to ₹10,000.' },
      { q: 'How do I apply a coupon?',            a: 'On the checkout page, enter your coupon code in the Apply Coupon field. Only one coupon can be applied per order.' },
      { q: 'What are LR Credits?',                a: 'LR Credits are loyalty points. You earn 1 credit per ₹100 spent. 1 credit = ₹1. Credits expire after 12 months.' },
    ],
  },
  {
    category: 'Sizing & Products',
    icon: <FiShoppingBag size={14} />,
    items: [
      { q: 'How do I find my correct size?', a: 'Each product page has a size guide. Measure your bust, waist, and hip and compare with our chart. When in doubt, size up.' },
      { q: 'Are your products authentic?',   a: 'Absolutely. All products are sourced directly from verified artisans, weavers, and manufacturers across India. No replicas.' },
    ],
  },
];

export default function FAQPage() {
  const [openItem, setOpenItem] = useState(null);
  const [search,   setSearch]   = useState('');

  const filtered = FAQ_DATA.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      item.q.toLowerCase().includes(search.toLowerCase()) ||
      item.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(cat => cat.items.length > 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input:focus { outline: none; border-color: ${GOLD} !important; }
      `}</style>
      <div style={{ backgroundColor: SURFACE, minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", animation: 'fadeUp 0.3s ease' }}>

        {/* Header */}
        <div style={{ background: `linear-gradient(145deg,${CHARCOAL} 0%,#2C2416 60%,#3D2E10 100%)`, padding: '28px 20px 36px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', border: '1px solid rgba(201,169,110,0.15)' }} />
          <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.5)', fontSize: 12, textDecoration: 'none', marginBottom: 16 }}>
            <FiChevronLeft size={14} /> Back to Profile
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(201,169,110,0.15)', border: '1px solid rgba(201,169,110,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiHelpCircle size={20} color={GOLD} />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: "'Playfair Display', serif" }}>FAQ & Help</h1>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>Quick answers to common questions</p>
            </div>
          </div>
        </div>

        <div style={{ padding: '20px 16px 100px' }}>

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: 20 }}>
            <FiSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)' }} color={MUTED} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search your question…"
              style={{ width: '100%', padding: '14px 14px 14px 42px', borderRadius: 12, border: `1.5px solid ${BORDER}`, fontFamily: 'inherit', fontSize: 13, color: CHARCOAL, backgroundColor: '#fff' }} />
          </div>

          {filtered.length === 0 && (
            <div style={{ backgroundColor: '#fff', borderRadius: 14, border: `1px solid ${BORDER}`, padding: 40, textAlign: 'center' }}>
              <div style={{ marginBottom: 12 }}><FiSearch size={40} color={BORDER} /></div>
              <p style={{ color: MUTED, fontSize: 14 }}>No results found. Try different keywords.</p>
            </div>
          )}

          {filtered.map((cat, ci) => (
            <div key={ci} style={{ backgroundColor: '#fff', borderRadius: 14, border: `1px solid ${BORDER}`, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: 16 }}>
              <div style={{ padding: '14px 16px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ color: GOLD_DARK }}>{cat.icon}</span>
                <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '1.2px' }}>{cat.category.toUpperCase()}</p>
              </div>
              {cat.items.map((item, ii) => {
                const key  = `${ci}-${ii}`;
                const open = openItem === key;
                return (
                  <div key={ii} style={{ borderBottom: ii < cat.items.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
                    <button onClick={() => setOpenItem(open ? null : key)}
                      style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, background: open ? GOLD_LIGHT : 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12, fontFamily: 'inherit', transition: 'background 0.15s' }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: open ? GOLD_DARK : CHARCOAL, flex: 1 }}>{item.q}</span>
                      <span style={{ color: GOLD_DARK, fontSize: 20, flexShrink: 0, display: 'block', transition: 'transform 0.2s', transform: open ? 'rotate(45deg)' : 'rotate(0)' }}>+</span>
                    </button>
                    {open && (
                      <div style={{ padding: '0 16px 16px', animation: 'fadeUp 0.2s ease' }}>
                        <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.7, backgroundColor: SURFACE, padding: 14, borderRadius: 10, borderLeft: `3px solid ${GOLD}` }}>
                          {item.a}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {/* Still need help */}
          <div style={{ background: `linear-gradient(135deg,${CHARCOAL},#2C2416)`, borderRadius: 16, padding: 24, textAlign: 'center' }}>
            <p style={{ fontSize: 16, fontWeight: 700, color: '#fff', fontFamily: "'Playfair Display', serif", marginBottom: 8 }}>Still need help?</p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>Our support team is available 7 days a week</p>
            <Link to="/support">
              <button style={{ padding: '12px 28px', background: `linear-gradient(to right,${GOLD_DARK},${GOLD})`, border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                Contact Support
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}