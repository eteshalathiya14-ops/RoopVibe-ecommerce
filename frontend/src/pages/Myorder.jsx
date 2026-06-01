import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiChevronLeft, FiShoppingBag } from 'react-icons/fi';

const GOLD       = '#C9A96E';
const GOLD_DARK  = '#A07840';
const GOLD_LIGHT = '#F5EDD9';
const CHARCOAL   = '#1A1A1A';
const MUTED      = '#6B6560';
const SURFACE    = '#FAF7F2';
const BORDER     = '#EDE8E0';

const ORDERS = [
  {
    id: 'RV-20248810',
    date: '24 May 2025',
    items: [
      { name: 'Silk Anarkali Set', color: 'Ivory', size: 'M', qty: 1, price: 3499, img: <FiShoppingBag /> },
      { name: 'Zari Dupatta', color: 'Gold', size: 'Free', qty: 1, price: 899, img: <FiShoppingBag /> },
    ],
    status: 'Delivered',
    statusColor: '#2E7D32',
    statusBg: '#E8F5E9',
    total: 4398,
  },
  {
    id: 'RV-20249021',
    date: '18 May 2025',
    items: [
      { name: 'Chanderi Kurta', color: 'Blush Pink', size: 'L', qty: 1, price: 1899, img: <FiShoppingBag /> },
    ],
    status: 'In Transit',
    statusColor: '#E65100',
    statusBg: '#FFF3E0',
    total: 1899,
  },
  {
    id: 'RV-20247563',
    date: '5 May 2025',
    items: [
      { name: 'Embroidered Lehenga', color: 'Royal Blue', size: 'S', qty: 1, price: 8499, img: <FiShoppingBag /> },
    ],
    status: 'Processing',
    statusColor: '#1565C0',
    statusBg: '#E3F2FD',
    total: 8499,
  },
];

export default function MyOrdersPage() {
  const [activeTab, setActiveTab]     = useState('all');
  const [expandedOrder, setExpanded]  = useState(null);

  const tabs = [
    { id: 'all',       label: 'All' },
    { id: 'active',    label: 'Active' },
    { id: 'delivered', label: 'Delivered' },
  ];

  const filtered = ORDERS.filter(o => {
    if (activeTab === 'active')    return o.status !== 'Delivered';
    if (activeTab === 'delivered') return o.status === 'Delivered';
    return true;
  });

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
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
              <FiPackage size={20} color={GOLD} />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: "'Playfair Display', serif" }}>My Orders</h1>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{ORDERS.length} orders placed</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 16px 100px' }}>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
            {tabs.map(t => {
              const sel = activeTab === t.id;
              return (
                <button key={t.id} onClick={() => setActiveTab(t.id)}
                  style={{ flex: 1, padding: '10px 8px', borderRadius: 10, border: `1.5px solid ${sel ? GOLD : BORDER}`, backgroundColor: sel ? GOLD_LIGHT : '#fff', color: sel ? GOLD_DARK : MUTED, fontWeight: sel ? 700 : 500, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                  {t.label}
                </button>
              );
            })}
          </div>

          {filtered.length === 0 && (
            <div style={{ backgroundColor: '#fff', borderRadius: 14, border: `1px solid ${BORDER}`, padding: 40, textAlign: 'center' }}>
              <div style={{ marginBottom: 12 }}><FiPackage size={48} color={BORDER} /></div>
              <p style={{ color: MUTED, fontSize: 14 }}>No orders found</p>
            </div>
          )}

          {filtered.map(order => (
            <div key={order.id} style={{ backgroundColor: '#fff', borderRadius: 14, border: `1px solid ${BORDER}`, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: 16 }}>

              {/* Order Header */}
              <div style={{ padding: '16px 16px 12px', borderBottom: `1px solid ${BORDER}`, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <p style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>Order ID</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: CHARCOAL, fontFamily: "'Playfair Display', serif" }}>{order.id}</p>
                  <p style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{order.date}</p>
                </div>
                <span style={{ display: 'inline-block', padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700, color: order.statusColor, backgroundColor: order.statusBg }}>
                  {order.status}
                </span>
              </div>

              {/* Items */}
              <div style={{ padding: '12px 16px' }}>
                {order.items.slice(0, expandedOrder === order.id ? undefined : 1).map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '8px 0', borderBottom: i < order.items.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 10, backgroundColor: GOLD_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0, color: GOLD_DARK }}>{item.img}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: CHARCOAL }}>{item.name}</p>
                      <p style={{ fontSize: 12, color: MUTED }}>{item.color} · Size {item.size} · Qty {item.qty}</p>
                    </div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: GOLD_DARK }}>₹{item.price.toLocaleString()}</p>
                  </div>
                ))}
                {order.items.length > 1 && (
                  <button onClick={() => setExpanded(expandedOrder === order.id ? null : order.id)}
                    style={{ background: 'none', border: 'none', color: GOLD_DARK, fontSize: 12, fontWeight: 700, cursor: 'pointer', padding: '8px 0 0', fontFamily: 'inherit' }}>
                    {expandedOrder === order.id ? 'Show less ▲' : `+${order.items.length - 1} more item(s) ▼`}
                  </button>
                )}
              </div>

              {/* Footer */}
              <div style={{ padding: '12px 16px', backgroundColor: SURFACE, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <p style={{ fontSize: 11, color: MUTED }}>Order Total</p>
                  <p style={{ fontSize: 16, fontWeight: 800, color: CHARCOAL }}>₹{order.total.toLocaleString()}</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {order.status === 'Delivered' && (
                    <button style={{ padding: '8px 16px', borderRadius: 8, border: `1.5px solid ${BORDER}`, backgroundColor: '#fff', color: CHARCOAL, fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}>
                      Review
                    </button>
                  )}
                  <button style={{ padding: '8px 16px', borderRadius: 8, border: 'none', background: `linear-gradient(to right,${GOLD_DARK},${GOLD})`, color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
                    {order.status === 'Delivered' ? 'Reorder' : 'Track Order'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}