// frontend/src/pages/CustomerSupportPage.jsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FiChevronLeft, FiHeadphones, FiMessageCircle, FiPhone,
  FiMail, FiSmartphone, FiPackage, FiDollarSign,
  FiRefreshCw, FiMaximize, FiGift, FiTag, FiZap, FiSend,
  FiAlertTriangle, FiCheckCircle,
} from 'react-icons/fi';
import { submitSupportMessage } from '../Api/Supportapi';

const GOLD       = '#C9A96E';
const GOLD_DARK  = '#A07840';
const GOLD_LIGHT = '#F5EDD9';
const CHARCOAL   = '#1A1A1A';
const MUTED      = '#6B6560';
const SURFACE    = '#FAF7F2';
const BORDER     = '#EDE8E0';
const WHITE      = '#FFFFFF';
const GREEN      = '#2E7D32';
const RED        = '#C0392B';
const RED_BG     = '#FDECEA';

const SUPPORT_OPTIONS = [
  { icon: <FiMessageCircle size={24} />, title: 'Live Chat',  desc: 'Chat with us instantly',   badge: 'Online',     badgeColor: GREEN,     badgeBg: '#E8F5E9'  },
  { icon: <FiPhone size={24} />,         title: 'Call Us',    desc: '+91 98765 43210',          badge: '9AM–7PM',    badgeColor: '#1565C0', badgeBg: '#E3F2FD'  },
  { icon: <FiMail size={24} />,          title: 'Email Us',   desc: 'support@roopvibe.in',      badge: '24hr reply', badgeColor: GOLD_DARK, badgeBg: GOLD_LIGHT },
  { icon: <FiSmartphone size={24} />,    title: 'WhatsApp',   desc: 'Message us on WhatsApp',   badge: 'Fast Reply', badgeColor: GREEN,     badgeBg: '#E8F5E9'  },
];

const COMMON_ISSUES = [
  { icon: <FiPackage size={18} />,    label: 'Track my order'  },
  { icon: <FiDollarSign size={18} />, label: 'Refund status'   },
  { icon: <FiRefreshCw size={18} />,  label: 'Cancel my order' },
  { icon: <FiMaximize size={18} />,   label: 'Size help'       },
  { icon: <FiGift size={18} />,       label: 'Gift wrapping'   },
  { icon: <FiTag size={18} />,        label: 'Apply coupon'    },
];

function Spinner({ size = 18, color = WHITE }) {
  return (
    <div style={{ width: size, height: size, border: `2.5px solid ${color}40`, borderTopColor: color, borderRadius: '50%', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
  );
}

export default function CustomerSupportPage() {
  const [message,   setMessage]   = useState('');
  const [selected,  setSelected]  = useState(null);
  const [sending,   setSending]   = useState(false);
  const [sent,      setSent]      = useState(false);
  const [sendError, setSendError] = useState('');

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    setSendError('');
    try {
      await submitSupportMessage({
        topic:   selected || '',
        message: message.trim(),
      });
      setSent(true);
    } catch (e) {
      setSendError(e.message || 'Failed to send. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        textarea:focus { outline: none; border-color: ${GOLD} !important; }
      `}</style>

      <div style={{ backgroundColor: SURFACE, minHeight: '100vh', fontFamily: "'DM Sans', sans-serif", animation: 'fadeUp 0.3s ease' }}>

        {/* ── Header ── */}
        <div style={{ background: `linear-gradient(145deg,${CHARCOAL} 0%,#2C2416 60%,#3D2E10 100%)`, padding: '28px 20px 36px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -40, right: -40, width: 160, height: 160, borderRadius: '50%', border: '1px solid rgba(201,169,110,0.15)', pointerEvents: 'none' }} />
          <Link to="/profile" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.5)', fontSize: 12, textDecoration: 'none', marginBottom: 16 }}>
            <FiChevronLeft size={14} /> Back to Profile
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: 'rgba(201,169,110,0.15)', border: '1px solid rgba(201,169,110,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FiHeadphones size={20} color={GOLD} />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: WHITE, fontFamily: "'Playfair Display', serif" }}>Customer Support</h1>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>We're here 7 days a week</p>
            </div>
          </div>
        </div>

        <div style={{ padding: '20px 16px 100px' }}>

          {/* ── Contact Options ── */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
            {SUPPORT_OPTIONS.map((opt, i) => (
              <div key={i} style={{ backgroundColor: WHITE, borderRadius: 14, border: `1px solid ${BORDER}`, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                <div style={{ color: GOLD_DARK, marginBottom: 8 }}>{opt.icon}</div>
                <p style={{ fontSize: 14, fontWeight: 700, color: CHARCOAL, marginBottom: 4 }}>{opt.title}</p>
                <p style={{ fontSize: 12, color: MUTED, marginBottom: 8 }}>{opt.desc}</p>
                <span style={{ display: 'inline-block', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, color: opt.badgeColor, backgroundColor: opt.badgeBg }}>
                  {opt.badge}
                </span>
              </div>
            ))}
          </div>

          {/* ── Common Issues ── */}
          <div style={{ backgroundColor: WHITE, borderRadius: 14, border: `1px solid ${BORDER}`, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiZap size={14} color={GOLD_DARK} />
              <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '1.2px' }}>COMMON ISSUES</p>
            </div>
            <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {COMMON_ISSUES.map((issue, i) => (
                <button key={i} onClick={() => setSelected(s => s === issue.label ? null : issue.label)}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', borderRadius: 10, border: `1.5px solid ${selected === issue.label ? GOLD : BORDER}`, backgroundColor: selected === issue.label ? GOLD_LIGHT : SURFACE, cursor: 'pointer', fontFamily: 'inherit', transition: 'all 0.15s' }}>
                  <span style={{ color: selected === issue.label ? GOLD_DARK : MUTED }}>{issue.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: selected === issue.label ? GOLD_DARK : CHARCOAL, textAlign: 'left' }}>{issue.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ── Send Message ── */}
          <div style={{ backgroundColor: WHITE, borderRadius: 14, border: `1px solid ${BORDER}`, overflow: 'hidden' }}>
            <div style={{ padding: '14px 16px', borderBottom: `1px solid ${BORDER}`, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiMail size={14} color={GOLD_DARK} />
              <p style={{ fontSize: 11, fontWeight: 700, color: MUTED, letterSpacing: '1.2px' }}>SEND US A MESSAGE</p>
            </div>

            {!sent ? (
              <div style={{ padding: 16 }}>
                {/* Selected topic badge */}
                {selected && (
                  <div style={{ padding: '10px 14px', borderRadius: 8, backgroundColor: GOLD_LIGHT, border: `1px solid ${GOLD}`, marginBottom: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <p style={{ fontSize: 12, color: GOLD_DARK, fontWeight: 600 }}>Topic: {selected}</p>
                    <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: GOLD_DARK, fontSize: 16, lineHeight: 1 }}>×</button>
                  </div>
                )}

                <textarea
                  value={message}
                  onChange={e => { setMessage(e.target.value); setSendError(''); }}
                  placeholder="Describe your issue in detail…"
                  style={{ width: '100%', minHeight: 120, padding: 14, borderRadius: 10, border: `1.5px solid ${BORDER}`, fontFamily: 'inherit', fontSize: 13, color: CHARCOAL, resize: 'vertical', backgroundColor: SURFACE }}
                />

                {/* Error */}
                {sendError && (
                  <div style={{ marginTop: 10, padding: '10px 14px', borderRadius: 10, background: RED_BG, border: `1px solid #FFCDD2`, color: RED, fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FiAlertTriangle size={14} /> {sendError}
                  </div>
                )}

                <button
                  onClick={handleSend}
                  disabled={!message.trim() || sending}
                  style={{ marginTop: 12, width: '100%', padding: 14, background: message.trim() && !sending ? `linear-gradient(to right,${GOLD_DARK},${GOLD})` : BORDER, border: 'none', borderRadius: 12, color: message.trim() ? WHITE : MUTED, fontWeight: 700, fontSize: 14, cursor: message.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, transition: 'background 0.2s' }}>
                  {sending ? <><Spinner /> Sending…</> : <><FiSend size={14} /> Send Message</>}
                </button>
              </div>
            ) : (
              <div style={{ padding: 40, textAlign: 'center' }}>
                <div style={{ marginBottom: 12 }}><FiCheckCircle size={52} color={GREEN} /></div>
                <h3 style={{ fontSize: 18, fontWeight: 800, color: CHARCOAL, fontFamily: "'Playfair Display', serif", marginBottom: 8 }}>Message Sent!</h3>
                <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.7, marginBottom: 20 }}>
                  We've received your message{selected ? ` about "${selected}"` : ''}.<br />
                  Our team will reply within 24 hours.
                </p>
                <button onClick={() => { setSent(false); setMessage(''); setSelected(null); }}
                  style={{ padding: '10px 24px', borderRadius: 10, border: `1.5px solid ${GOLD}`, background: GOLD_LIGHT, color: GOLD_DARK, fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}>
                  Send Another Message
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}