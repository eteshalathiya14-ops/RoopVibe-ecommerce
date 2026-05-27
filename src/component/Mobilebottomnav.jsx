// src/components/MobileBottomNav.jsx
// Add this component at the bottom of your App.jsx layout
// Only shows on mobile screens

import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiSearch, FiShoppingCart, FiUser, FiGrid } from 'react-icons/fi';
import { useCart } from '../context/CartContext';

const GOLD      = '#C9A96E';
const GOLD_DARK = '#A07840';
const SURFACE   = '#FAF7F2';
const BORDER    = '#EDE8E0';
const MUTED     = '#7A736B';

export default function MobileBottomNav() {
  const { cartCount } = useCart();
  const location = useLocation();
  const path = location.pathname;

  const tabs = [
    { to: '/',        icon: <FiHome size={22} />,        label: 'Home',     match: p => p === '/' },
    { to: '/search?q=',icon: <FiSearch size={22} />,     label: 'Search',   match: p => p.startsWith('/search') },
    { to: '/category/women/sarees', icon: <FiGrid size={22} />, label: 'Categories', match: p => p.startsWith('/category') },
    { to: '/cart',    icon: <FiShoppingCart size={22} />,label: 'Cart',     match: p => p === '/cart', badge: cartCount },
    { to: '/login',   icon: <FiUser size={22} />,        label: 'Profile',  match: p => p === '/login' || p === '/profile' },
  ];

  return (
    <nav style={{
      display: 'none',
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '60px',
      backgroundColor: SURFACE,
      borderTop: `1px solid ${BORDER}`,
      zIndex: 1100,
      boxShadow: '0 -2px 12px rgba(0,0,0,0.08)',
    }}
    className="rv-mobile-bottom-nav"
    >
      {tabs.map(tab => {
        const active = tab.match(path);
        return (
          <Link
            key={tab.to}
            to={tab.to}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '3px',
              textDecoration: 'none',
              color: active ? GOLD_DARK : MUTED,
              position: 'relative',
              paddingTop: '4px',
            }}
          >
            <span style={{ position: 'relative' }}>
              {tab.icon}
              {tab.badge > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-6px',
                  right: '-8px',
                  backgroundColor: GOLD,
                  color: '#fff',
                  fontSize: '9px',
                  fontWeight: '800',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {tab.badge}
                </span>
              )}
            </span>
            <span style={{
              fontSize: '9px',
              fontWeight: active ? '700' : '500',
              letterSpacing: '0.3px',
            }}>
              {tab.label}
            </span>
            {active && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '28px',
                height: '2.5px',
                backgroundColor: GOLD,
                borderRadius: '0 0 3px 3px',
              }} />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

/*
  CSS to add in mobile.css or index.css:

  @media (max-width: 768px) {
    .rv-mobile-bottom-nav {
      display: flex !important;
    }
    main, #root > div {
      padding-bottom: 60px;
    }
  }
*/