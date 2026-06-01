
import { Link, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const GOLD      = '#C9A96E';
const GOLD_DARK = '#A07840';
const GOLD_LIGHT= '#F5EDD9';
const MUTED     = '#9E968E';
const BORDER    = '#EDE8E0';

export default function MobileBottomNav() {
  const { cartCount } = useCart();
  const { isLoggedIn, user } = useAuth();
  const { pathname } = useLocation();

  const tabs = [
    {
      to: '/',
      label: 'Home',
      match: p => p === '/',
      icon: active => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? GOLD_LIGHT : 'none'}
          stroke={active ? GOLD_DARK : MUTED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      ),
    },
    {
      to: '/categories',
      label: 'Categories',
      match: p => p.startsWith('/categories') || p.startsWith('/category'),
      icon: active => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke={active ? GOLD_DARK : MUTED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3"  y="3"  width="7" height="7" fill={active ? GOLD_LIGHT : 'none'} rx="1"/>
          <rect x="14" y="3"  width="7" height="7" fill={active ? GOLD_LIGHT : 'none'} rx="1"/>
          <rect x="3"  y="14" width="7" height="7" fill={active ? GOLD_LIGHT : 'none'} rx="1"/>
          <rect x="14" y="14" width="7" height="7" fill={active ? GOLD_LIGHT : 'none'} rx="1"/>
        </svg>
      ),
    },
    {
      to: '/offers',
      label: 'Offers',
      match: p => p === '/offers',
      icon: active => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke={active ? GOLD_DARK : MUTED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z" fill={active ? GOLD_LIGHT : 'none'}/>
          <line x1="7" y1="7" x2="7.01" y2="7" strokeWidth="3"/>
        </svg>
      ),
    },
    {
      to: '/profile',
      label: isLoggedIn ? (user?.name?.split(' ')[0]?.slice(0, 6) || 'Profile') : 'Login',
      match: p => p === '/profile' || p === '/login',
      badge: null,
      icon: active => (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
          stroke={active ? GOLD_DARK : MUTED} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" fill={active ? GOLD_LIGHT : 'none'}/>
          <circle cx="12" cy="7" r="4" fill={active ? GOLD_LIGHT : 'none'}/>
        </svg>
      ),
    },
  ];

  return (
    <nav className="rv-mobile-bottom-nav" style={{
      position: 'fixed',
      bottom: 0, left: 0, right: 0,
      height: 62,
      backgroundColor: 'rgba(255,255,255,0.97)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      borderTop: `1px solid ${BORDER}`,
      zIndex: 1100,
      boxShadow: '0 -4px 24px rgba(201,169,110,0.10)',
      display: 'none',   // shown via CSS: @media(max-width:768px){ .rv-mobile-bottom-nav{ display:flex } }
      alignItems: 'center',
      paddingBottom: 'env(safe-area-inset-bottom, 0px)',
    }}>
      {tabs.map(tab => {
        const active = tab.match(pathname);
        return (
          <Link key={tab.to} to={tab.to} style={{
            flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 3, textDecoration: 'none', position: 'relative', paddingTop: 4, minHeight: 44,
          }}>
            {/* Gold bar at top when active */}
            {active && (
              <div style={{ position:'absolute', top:0, left:'50%', transform:'translateX(-50%)', width:32, height:3, backgroundColor:GOLD, borderRadius:'0 0 4px 4px' }} />
            )}
            {/* Icon with optional badge */}
            <div style={{ position:'relative' }}>
              {tab.icon(active)}
              {tab.badge > 0 && (
                <span style={{ position:'absolute', top:-6, right:-8, backgroundColor:GOLD, color:'#fff', fontSize:9, fontWeight:800, width:16, height:16, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                  {tab.badge}
                </span>
              )}
            </div>
            {/* Label */}
            <span style={{ fontSize:9, fontWeight: active ? 700 : 500, letterSpacing:'0.4px', color: active ? GOLD_DARK : MUTED, maxWidth:60, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}