import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiChevronLeft, FiRefreshCw, FiPackage, FiFileText, 
  FiTruck, FiCheckCircle, FiShield, FiDollarSign, FiShoppingBag 
} from 'react-icons/fi';

const GOLD       = '#C9A96E';
const GOLD_DARK  = '#A07840';
const GOLD_LIGHT = '#F5EDD9';
const CHARCOAL   = '#1A1A1A';
const MUTED      = '#6B6560';
const SURFACE    = '#FAF7F2';
const BORDER     = '#EDE8E0';
const GREEN      = '#2E7D32';

const RETURN_STEPS = [
  { icon: <FiPackage />, title: 'Select Item',        desc: 'Choose the item from your delivered orders.' },
  { icon: <FiFileText />, title: 'Raise Request',      desc: 'Fill reason and submit your request.' },
  { icon: <FiTruck />, title: 'Pickup Scheduled',   desc: 'Pickup within 2–3 business days.' },
  { icon: <FiCheckCircle />, title: 'Refund / Replace',   desc: 'Refund in 5–7 days or replacement shipped.' },
];

const ELIGIBLE_ORDERS = [
  { id: 'RV-20248810', item: 'Silk Anarkali Set', date: '24 May 2025', img: <FiShoppingBag />, eligible: true },
  { id: 'RV-20249021', item: 'Chanderi Kurta',    date: '18 May 2025', img: <FiShoppingBag />, eligible: false, reason: 'Item not yet delivered' },
];

const RETURN_REASONS = [
  'Wrong size / fit',
  'Defective / damaged product',
  'Wrong item received',
  'Quality not as expected',
  'Changed my mind',
  'Other',
];

export default function ReturnReplacementPage() {
  const [selected,  setSelected]  = useState(null);
  const [type,      setType]      = useState('return');
  const [reason,    setReason]    = useState('');
  const [submitted, setSubmitted] = useState(false);

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
              <FiRefreshCw size={20} color={GOLD} />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: "'Playfair Display', serif" }}>Return & Replacement</h1>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>Easy 7-day return policy</p>
            </div>
          </div>
        </div>

        <div style={{ padding: '20px 16px 100px' }}>

          {/* Policy Banner */}
          <div style={{ background: `linear-gradient(135deg,${GOLD_LIGHT},#fff)`, borderRadius: 14, border: `1.5px solid ${GOLD}`, padding: 16, marginBottom: 16, display: 'flex', gap: 12 }}>
            <FiShield size={24} color={GOLD_DARK} style={{ flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: GOLD_DARK, marginBottom: 4 }}>RoopVibe Easy Returns</p>
              <p style={{ fontSize: 12, color: MUTED, lineHeight: 1.6 }}>Return or replace eligible items within <strong>7 days</strong> of delivery. Items must be unused, unwashed, and with original tags.</p>
            </div>
          </div>

          {/* How it works */}
          <div style={{ backgroundColor: '#fff', borderRadius: 14, border: `1px solid ${BORDER}`, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: 16 }}>
            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiRefreshCw size={14} color={GOLD_DARK} />
              <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '1.2px' }}>HOW IT WORKS</p>
            </div>
            <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {RETURN_STEPS.map((step, i) => (
                <div key={i} style={{ padding: 12, borderRadius: 10, backgroundColor: SURFACE, border: `1px solid ${BORDER}` }}>
                  <div style={{ fontSize: 22, marginBottom: 6, color: GOLD_DARK }}>{step.icon}</div>
                  <p style={{ fontSize: 12, fontWeight: 700, color: CHARCOAL, marginBottom: 4 }}>Step {i + 1}: {step.title}</p>
                  <p style={{ fontSize: 11, color: MUTED, lineHeight: 1.5 }}>{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Select Order */}
          {!submitted ? (
            <div style={{ backgroundColor: '#fff', borderRadius: 14, border: `1px solid ${BORDER}`, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
              <div style={{ padding: '14px 16px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiPackage size={14} color={GOLD_DARK} />
                <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '1.2px' }}>SELECT ORDER</p>
              </div>
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {ELIGIBLE_ORDERS.map(o => (
                  <div key={o.id} onClick={() => o.eligible && setSelected(o.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 10, border: `1.5px solid ${selected === o.id ? GOLD : BORDER}`, backgroundColor: selected === o.id ? GOLD_LIGHT : '#fff', cursor: o.eligible ? 'pointer' : 'not-allowed', opacity: o.eligible ? 1 : 0.55, transition: 'all 0.15s' }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: GOLD_LIGHT, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: GOLD_DARK }}>{o.img}</div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 14, fontWeight: 600, color: CHARCOAL }}>{o.item}</p>
                      <p style={{ fontSize: 11, color: MUTED }}>{o.id} · {o.date}</p>
                      {!o.eligible && <p style={{ fontSize: 11, color: '#C62828', marginTop: 2 }}>{o.reason}</p>}
                    </div>
                    {o.eligible && (
                      <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${selected === o.id ? GOLD_DARK : BORDER}`, backgroundColor: selected === o.id ? GOLD_DARK : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        {selected === o.id && <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#fff' }} />}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {selected && (
                <>
                  {/* Type */}
                  <div style={{ padding: '0 16px 16px' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '1px', marginBottom: 10 }}>REQUEST TYPE</p>
                    <div style={{ display: 'flex', gap: 10 }}>
                      {['return', 'replacement'].map(t => (
                        <button key={t} onClick={() => setType(t)}
                          style={{ flex: 1, padding: 12, borderRadius: 10, border: `1.5px solid ${type === t ? GOLD : BORDER}`, backgroundColor: type === t ? GOLD_LIGHT : '#fff', color: type === t ? GOLD_DARK : MUTED, fontWeight: type === t ? 700 : 500, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                          {t === 'return' ? <><FiDollarSign style={{verticalAlign:'middle'}} /> Return</> : <><FiRefreshCw style={{verticalAlign:'middle'}} /> Replace</>}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Reason */}
                  <div style={{ padding: '0 16px 16px' }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '1px', marginBottom: 10 }}>SELECT REASON</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {RETURN_REASONS.map(r => (
                        <button key={r} onClick={() => setReason(r)}
                          style={{ textAlign: 'left', padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${reason === r ? GOLD : BORDER}`, backgroundColor: reason === r ? GOLD_LIGHT : '#fff', color: reason === r ? GOLD_DARK : CHARCOAL, fontSize: 13, fontWeight: reason === r ? 700 : 400, cursor: 'pointer', fontFamily: 'inherit' }}>
                          {reason === r ? '✓ ' : ''}{r}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ padding: '0 16px 16px' }}>
                    <button onClick={() => reason && setSubmitted(true)} disabled={!reason}
                      style={{ width: '100%', padding: 15, background: reason ? `linear-gradient(to right,${GOLD_DARK},${GOLD})` : BORDER, border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, fontSize: 14, cursor: reason ? 'pointer' : 'not-allowed', fontFamily: 'inherit' }}>
                      Submit Request
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div style={{ backgroundColor: '#fff', borderRadius: 14, border: `1px solid ${BORDER}`, padding: 40, textAlign: 'center' }}>
              <div style={{ marginBottom: 16 }}><FiCheckCircle size={56} color={GREEN} /></div>
              <h3 style={{ fontSize: 20, fontWeight: 800, color: CHARCOAL, fontFamily: "'Playfair Display', serif", marginBottom: 8 }}>Request Submitted!</h3>
              <p style={{ fontSize: 13, color: MUTED, marginBottom: 16, lineHeight: 1.6 }}>Your {type} request has been placed. Our team will reach out within 24 hours.</p>
              <p style={{ fontSize: 12, color: MUTED }}>Request ID: <strong style={{ color: GOLD_DARK }}>REQ-{Math.floor(Math.random() * 90000 + 10000)}</strong></p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}