import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  FiUser, FiPackage, FiRefreshCw,
  FiHeadphones, FiHelpCircle, FiLogOut, FiLogIn,
  FiChevronRight, FiGlobe, FiShield, FiEdit2, FiHeart,
} from 'react-icons/fi';

const GOLD      = '#C9A96E';
const GOLD_DARK  = '#A07840';
const GOLD_LIGHT = '#F5EDD9';
const CHARCOAL   = '#1A1A1A';
const MUTED      = '#6B6560';
const SURFACE    = '#FAF7F2';
const BORDER     = '#EDE8E0';

const LANGUAGES = [
  { code: 'en', native: 'ENG'     },
  { code: 'hi', native: 'हिन्दी' },
  { code: 'gu', native: 'ગુજ'    },
];

function useIsMobile() {
  const [m, setM] = useState(() => typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  useEffect(() => {
    const fn = () => setM(window.innerWidth <= 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return m;
}

export default function ProfilePage() {
  const { isLoggedIn, user, logout } = useAuth();
  const { language, changeLanguage }  = useLanguage();
  const navigate  = useNavigate();
  const isMobile  = useIsMobile();

  const accountLinks = [
    { icon: <FiPackage size={18} />,    label: 'My Orders',           to: '/orders' },
    { icon: <FiRefreshCw size={18} />,  label: 'Return & Replacement', to: '/returns' },
  ];
  const supportLinks = [
    { icon: <FiHeadphones size={18} />, label: 'Customer Support', to: '/support' },
    { icon: <FiHelpCircle size={18} />, label: 'FAQ & Help',        to: '/faq' },
    { icon: <FiShield size={18} />,     label: 'Privacy Policy',    to: '/privacy' },
  ];

  const content = (
    <div style={{ display:'flex', flexDirection:'column', gap:16, padding: isMobile ? '20px 16px 100px' : '32px 40px' }}>
      <SectionCard title="MY ACCOUNT" icon={<FiUser size={16} color={GOLD_DARK} />}>
        {accountLinks.map((item, i) => <ProfileRow key={i} {...item} />)}
      </SectionCard>

      <SectionCard title="SUPPORT" icon={<FiHeadphones size={16} color={GOLD_DARK} />}>
        {supportLinks.map((item, i) => <ProfileRow key={i} {...item} />)}
      </SectionCard>

      <div style={{ backgroundColor:'#fff', borderRadius:14, border:`1px solid ${BORDER}`, overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
        <div style={{ padding:'14px 16px', borderBottom:`1px solid ${BORDER}`, display:'flex', alignItems:'center', gap:8 }}>
          <FiGlobe size={14} color={GOLD_DARK} />
          <p style={{ fontSize:11, fontWeight:700, color:MUTED, letterSpacing:'1.2px' }}>LANGUAGE</p>
        </div>
        <div style={{ padding:16, display:'flex', gap:10 }}>
          {LANGUAGES.map(lang => {
            const sel = language === lang.code;
            return (
              <button key={lang.code} onClick={() => changeLanguage(lang.code)}
                style={{ flex:1, padding:'12px 8px', borderRadius:10, border:`1.5px solid ${sel ? GOLD : BORDER}`, backgroundColor: sel ? GOLD_LIGHT : '#fff', color: sel ? GOLD_DARK : MUTED, fontWeight: sel ? 800 : 600, fontSize:13, cursor:'pointer', transition:'all 0.15s', fontFamily:'inherit' }}>
                {lang.native}
              </button>
            );
          })}
        </div>
      </div>

      {isLoggedIn ? (
        <button onClick={() => { logout(); navigate('/'); }}
          style={{ width:'100%', padding:15, backgroundColor:'#fff', border:'1.5px solid #FFCDD2', borderRadius:12, color:'#C62828', fontWeight:700, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10, fontFamily:'inherit' }}>
          <FiLogOut size={18} color="#C62828" /> LOGOUT
        </button>
      ) : (
        <button onClick={() => navigate('/login')}
          style={{ width:'100%', padding:15, background:`linear-gradient(to right,${GOLD_DARK},${GOLD})`, border:'none', borderRadius:12, color:'#fff', fontWeight:700, fontSize:14, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:10, fontFamily:'inherit', boxShadow:'0 4px 14px rgba(160,120,64,0.3)' }}>
          <FiLogIn size={18} /> LOGIN TO ROOPVIBE
        </button>
      )}
      <p style={{ textAlign:'center', fontSize:11, color:'#ccc', letterSpacing:'0.5px' }}>RoopVibe v1.0.0 · Made with <FiHeart size={10} color="#ff4d4f" style={{verticalAlign:'middle'}} /> in India</p>
    </div>
  );

  const hero = (
    <div style={{ background:`linear-gradient(145deg,${CHARCOAL} 0%,#2C2416 60%,#3D2E10 100%)`, padding: isMobile ? '28px 20px 36px' : '40px 40px 48px', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:-40, right:-40, width:160, height:160, borderRadius:'50%', border:'1px solid rgba(201,169,110,0.15)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:-60, left:-30, width:200, height:200, borderRadius:'50%', background:'radial-gradient(circle,rgba(201,169,110,0.08) 0%,transparent 70%)', pointerEvents:'none' }} />

      {isLoggedIn ? (
        <div style={{ display:'flex', alignItems:'center', gap:16, position:'relative', maxWidth: isMobile ? '100%' : 600 }}>
          <div style={{ width:60, height:60, borderRadius:'50%', background:`linear-gradient(135deg,${GOLD},${GOLD_DARK})`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, border:'2px solid rgba(255,255,255,0.2)' }}>
            <span style={{ color:'#fff', fontSize:22, fontWeight:800, fontFamily:"'Playfair Display', serif" }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:11, color:'rgba(255,255,255,0.4)', letterSpacing:'2px', fontWeight:600, marginBottom:4 }}>WELCOME BACK</p>
            <h2 style={{ fontSize:20, fontWeight:800, color:'#fff', fontFamily:"'Playfair Display', serif", marginBottom:2 }}>{user?.name || 'User'}</h2>
            <p style={{ fontSize:12, color:'rgba(255,255,255,0.5)' }}>{user?.email}</p>
          </div>
          <button style={{ background:'none', border:'1px solid rgba(201,169,110,0.3)', borderRadius:8, padding:8, cursor:'pointer', color:GOLD }}>
            <FiEdit2 size={14} />
          </button>
        </div>
      ) : (
        <div style={{ position:'relative', maxWidth: isMobile ? '100%' : 500 }}>
          <div style={{ width:56, height:56, borderRadius:'50%', backgroundColor:'rgba(201,169,110,0.15)', border:'2px solid rgba(201,169,110,0.3)', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:16 }}>
            <FiUser size={24} color={GOLD} />
          </div>
          <h2 style={{ fontSize:20, fontWeight:800, color:'#fff', fontFamily:"'Playfair Display', serif", marginBottom:6 }}>Hello, Guest!</h2>
          <p style={{ fontSize:13, color:'rgba(255,255,255,0.5)', marginBottom:20 }}>Login to view your orders & more</p>
          <button onClick={() => navigate('/login')}
            style={{ padding:'12px 28px', background:`linear-gradient(to right,${GOLD_DARK},${GOLD})`, color:'#fff', border:'none', borderRadius:10, fontWeight:700, fontSize:13, cursor:'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', gap:8, boxShadow:'0 4px 14px rgba(160,120,64,0.4)' }}>
            <FiLogIn size={16} /> LOGIN / SIGN UP
          </button>
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
          @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
          .profile-row:active { background-color:${GOLD_LIGHT} !important; }
        `}</style>
        <div style={{ backgroundColor:SURFACE, minHeight:'calc(100vh - 52px)', fontFamily:"'DM Sans', sans-serif", animation:'fadeUp 0.3s ease' }}>
          {hero}
          {content}
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:translateY(0)} }
        .profile-row:hover { background-color:${GOLD_LIGHT} !important; }
      `}</style>
      <div style={{ backgroundColor:SURFACE, minHeight:'calc(100vh - 68px)', fontFamily:"'DM Sans', sans-serif", padding:'40px 24px 60px', animation:'fadeUp 0.3s ease' }}>
        <div style={{ maxWidth:720, margin:'0 auto', borderRadius:16, overflow:'hidden', boxShadow:'0 8px 40px rgba(0,0,0,0.10)', border:`1px solid ${BORDER}` }}>
          {hero}
          {content}
        </div>
      </div>
    </>
  );
}

function SectionCard({ title, icon, children }) {
  return (
    <div style={{ backgroundColor:'#fff', borderRadius:14, border:`1px solid ${BORDER}`, overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.04)' }}>
      <div style={{ padding:'14px 16px', borderBottom:`1px solid ${BORDER}`, display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:13 }}>{icon}</span>
        <p style={{ fontSize:11, fontWeight:700, color:MUTED, letterSpacing:'1.2px' }}>{title}</p>
      </div>
      <div>{children}</div>
    </div>
  );
}

function ProfileRow({ icon, label, to }) {
  if (to === '#') {
    return (
      <div className="profile-row" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:16, borderBottom:`1px solid ${BORDER}`, transition:'background 0.15s', backgroundColor:'#fff', cursor:'not-allowed', opacity:0.6 }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:36, height:36, borderRadius:10, backgroundColor:GOLD_LIGHT, display:'flex', alignItems:'center', justifyContent:'center', color:GOLD_DARK, flexShrink:0 }}>{icon}</div>
          <span style={{ fontSize:14, fontWeight:500, color:CHARCOAL, fontFamily:"'DM Sans', sans-serif" }}>{label} (Coming Soon)</span>
        </div>
        <FiChevronRight size={16} color={MUTED} />
      </div>
    );
  }
  return (
    <Link to={to} className="profile-row" style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:16, borderBottom:`1px solid ${BORDER}`, textDecoration:'none', transition:'background 0.15s', backgroundColor:'#fff' }}>
      <div style={{ display:'flex', alignItems:'center', gap:14 }}>
        <div style={{ width:36, height:36, borderRadius:10, backgroundColor:GOLD_LIGHT, display:'flex', alignItems:'center', justifyContent:'center', color:GOLD_DARK, flexShrink:0 }}>{icon}</div>
        <span style={{ fontSize:14, fontWeight:500, color:CHARCOAL, fontFamily:"'DM Sans', sans-serif" }}>{label}</span>
      </div>
      <FiChevronRight size={16} color={MUTED} />
    </Link>
  );
}