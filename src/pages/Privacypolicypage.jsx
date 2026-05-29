import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiChevronLeft, FiShield, FiClipboard, FiTarget, 
  FiUsers, FiGlobe, FiLock, FiCheckSquare, FiRefreshCw, FiMail, FiHeart 
} from 'react-icons/fi';

const GOLD       = '#C9A96E';
const GOLD_DARK  = '#A07840';
const GOLD_LIGHT = '#F5EDD9';
const CHARCOAL   = '#1A1A1A';
const MUTED      = '#6B6560';
const SURFACE    = '#FAF7F2';
const BORDER     = '#EDE8E0';

const PRIVACY_SECTIONS = [
  {
    icon: <FiClipboard size={20} />,
    title: 'Information We Collect',
    content: `When you use RoopVibe, we collect information you provide directly — when you create an account, place an order, or contact support.\n\nThis includes:\n• Name, email, phone number, date of birth\n• Delivery addresses and billing information\n• Payment details (processed securely; we don't store full card numbers)\n• Order history, wishlist, and browsing preferences\n• Device information and usage data`,
  },
  {
    icon: <FiTarget size={20} />,
    title: 'How We Use Your Information',
    content: `We use the information collected to:\n\n• Process and fulfill your orders, send confirmations and shipping updates\n• Provide customer support and respond to your queries\n• Send promotional communications (with your consent)\n• Personalize your shopping experience and recommend products\n• Improve our platform, detect fraud, and ensure security\n• Comply with legal obligations`,
  },
  {
    icon: <FiUsers size={20} />,
    title: 'Sharing Your Information',
    content: `We do not sell your personal data. We share information only in these circumstances:\n\n• With delivery partners (Shiprocket, Delhivery) to fulfill your orders\n• With payment processors (Razorpay, PayU) for secure transactions\n• With analytics providers to improve our services\n• When required by law or to protect our legal rights\n\nAll partners are contractually bound to keep your data confidential.`,
  },
  {
    icon: <FiGlobe size={20} />,
    title: 'Cookies & Tracking',
    content: `RoopVibe uses cookies and similar technologies to:\n\n• Remember your login session and cart contents\n• Understand how you interact with our website\n• Show you relevant advertisements on other platforms\n• Improve page load speed and performance\n\nYou can manage cookie preferences through your browser settings. Disabling cookies may affect some features of the site.`,
  },
  {
    icon: <FiLock size={20} />,
    title: 'Data Security',
    content: `We take security seriously. Your data is protected by:\n\n• SSL/TLS encryption for all data transmitted\n• Secure, encrypted storage of personal information\n• Regular security audits and vulnerability assessments\n• Strict access controls — only authorized personnel can access your data\n• PCI-DSS compliance for all payment processing\n\nDespite our best efforts, no system is 100% secure. Please use a strong password and don't share your credentials.`,
  },
  {
    icon: <FiCheckSquare size={20} />,
    title: 'Your Rights',
    content: `You have the following rights regarding your personal data:\n\n• Access: Request a copy of the data we hold about you\n• Correction: Ask us to fix inaccurate or incomplete data\n• Deletion: Request deletion of your data (right to be forgotten)\n• Portability: Request your data in a machine-readable format\n• Opt-out: Unsubscribe from marketing at any time\n\nTo exercise these rights, email privacy@roopvibe.in`,
  },
  {
    icon: <FiRefreshCw size={20} />,
    title: 'Changes to This Policy',
    content: `We may update this Privacy Policy for legal, operational, or regulatory reasons.\n\nWhen we make significant changes, we will:\n• Update the "Last Updated" date at the top of this page\n• Notify you via email or a prominent notice on our app\n• In some cases, seek your consent if required by law\n\nContinued use of RoopVibe after changes constitutes acceptance of the revised policy.`,
  },
];

export default function PrivacyPolicyPage() {
  const [openSection, setOpenSection] = useState(0);

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
              <FiShield size={20} color={GOLD} />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: '#fff', fontFamily: "'Playfair Display', serif" }}>Privacy Policy</h1>
              <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>Last updated: 1 May 2025</p>
            </div>
          </div>
        </div>

        <div style={{ padding: '20px 16px 100px' }}>

          {/* Intro Banner */}
          <div style={{ background: `linear-gradient(135deg,${GOLD_LIGHT},#fff)`, borderRadius: 14, border: `1.5px solid ${GOLD}`, padding: 16, marginBottom: 16 }}>
            <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.7 }}>
              At <strong style={{ color: GOLD_DARK }}>RoopVibe</strong>, we respect your privacy and are committed to protecting your personal data. This policy explains how we collect, use, and safeguard your information when you shop with us.
            </p>
          </div>

          {/* Sections */}
          <div style={{ backgroundColor: '#fff', borderRadius: 14, border: `1px solid ${BORDER}`, overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: 16 }}>
            {PRIVACY_SECTIONS.map((section, i) => {
              const open = openSection === i;
              return (
                <div key={i} style={{ borderBottom: i < PRIVACY_SECTIONS.length - 1 ? `1px solid ${BORDER}` : 'none' }}>
                  <button onClick={() => setOpenSection(open ? null : i)}
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 16, background: open ? GOLD_LIGHT : 'none', border: 'none', cursor: 'pointer', textAlign: 'left', gap: 12, fontFamily: 'inherit', transition: 'background 0.15s' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <span style={{ fontSize: 20 }}>{section.icon}</span>
                      <span style={{ fontSize: 14, fontWeight: 700, color: open ? GOLD_DARK : CHARCOAL }}>{section.title}</span>
                    </div>
                    <span style={{ color: GOLD_DARK, fontSize: 20, flexShrink: 0, display: 'block', transition: 'transform 0.2s', transform: open ? 'rotate(45deg)' : 'rotate(0)' }}>+</span>
                  </button>
                  {open && (
                    <div style={{ padding: '0 16px 16px', animation: 'fadeUp 0.2s ease' }}>
                      <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.85, whiteSpace: 'pre-line', backgroundColor: SURFACE, padding: 14, borderRadius: 10, borderLeft: `3px solid ${GOLD}` }}>
                        {section.content}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Contact DPO */}
          <div style={{ backgroundColor: '#fff', borderRadius: 14, border: `1px solid ${BORDER}`, padding: 20, display: 'flex', gap: 14, alignItems: 'flex-start', boxShadow: '0 2px 8px rgba(0,0,0,0.04)', marginBottom: 16 }}>
            <FiMail size={28} color={GOLD_DARK} style={{ flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: CHARCOAL, marginBottom: 6 }}>Privacy Concerns?</p>
              <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.6 }}>
                Contact our Data Protection Officer at{' '}
                <strong style={{ color: GOLD_DARK }}>privacy@roopvibe.in</strong>
                {' '}or write to us at RoopVibe, 42 Fashion Street, Mumbai – 400001, Maharashtra, India.
              </p>
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: 11, color: '#ccc', letterSpacing: '0.5px' }}>RoopVibe v1.0.0 · Made with <FiHeart size={10} color="#ff4d4f" style={{verticalAlign:'middle'}} /> in India</p>
        </div>
      </div>
    </>
  );
}