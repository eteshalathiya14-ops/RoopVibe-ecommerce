// src/component/Navbar.jsx  — BACKEND CONNECTED VERSION
// Static navLinks hata diya — ab MongoDB se live data aata hai
// Admin panel mein jo bhi change kare wo yahan instantly reflect hoga

import { useMemo, useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import logo from '../assets/logo.png';
import { toSlug } from '../utils/slug';
import { useCart } from '../context/CartContext';
import { FiSearch, FiShoppingCart, FiUser, FiX, FiHeart } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { fetchNavbar } from '../Api/Navbarapi';

const GOLD       = '#C9A96E';
const GOLD_LIGHT = '#F5EDD9';
const GOLD_DARK  = '#A07840';
const CHARCOAL   = '#1A1A1A';
const MUTED      = '#6B6560';
const SURFACE    = '#FAF7F2';
const BORDER     = '#EDE8E0';

// ── Static fallback (used if API fails) ─────────────────────────
const FALLBACK_NAV = [
  { _id:"f1", name:"WOMEN",  order:0, special:false, active:true, link:"", columns:[] },
  { _id:"f2", name:"MEN",    order:1, special:false, active:true, link:"", columns:[] },
  { _id:"f3", name:"KIDS",   order:2, special:false, active:true, link:"", columns:[] },
  { _id:"f4", name:"HOME",   order:3, special:false, active:true, link:"", columns:[] },
  { _id:"f5", name:"OFFERS", order:4, special:true,  active:true, link:"/offers", columns:[] },
];

function useIsMobile() {
  const [m, setM] = useState(() => window.innerWidth <= 768);
  useEffect(() => {
    const fn = () => setM(window.innerWidth <= 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  }, []);
  return m;
}

// Convert DB navbar item to mega-menu column format (same as old navLinks)
function itemToMegaLink(item) {
  if (!item.columns || item.columns.length === 0) return null;
  return {
    columns: item.columns.map(col => ({
      title: col.title,
      badge: col.badge,
      items: col.items || [],
      extra: (col.extra || []).map(ex => ({
        title: ex.title,
        badge: ex.badge,
        items: ex.items || [],
      })),
    })),
  };
}

function CategoryTitle({ title, badge }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
      <h3 style={{ fontSize:12, fontWeight:700, color:CHARCOAL, backgroundColor:GOLD_LIGHT, padding:'2px 8px', borderRadius:4 }}>{title}</h3>
      {badge && <span style={{ fontSize:10, fontWeight:700, backgroundColor:GOLD, color:'#fff', padding:'2px 8px', borderRadius:20 }}>{badge}</span>}
    </div>
  );
}

function MenuLink({ children, isActive, to, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <Link to={to} onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display:'block', fontSize:13,
        color: isActive ? GOLD_DARK : hov ? GOLD_DARK : MUTED,
        padding:'3px 0', transition:'color 0.15s', textDecoration:'none',
        fontWeight: isActive ? 700 : hov ? 500 : 400 }}>
      {children}
    </Link>
  );
}

function MegaColumn({ col, gender, activeGender, activeSlug, onNavigate }) {
  return (
    <div style={{ minWidth:145, flex:1 }}>
      <CategoryTitle title={col.title} badge={col.badge}/>
      {col.items?.map(item => {
        const slug = toSlug(item);
        const isActive = activeGender === gender.toUpperCase() && activeSlug === slug;
        return (
          <MenuLink key={item} isActive={isActive}
            to={`/category/${gender.toLowerCase()}/${slug}`} onClick={onNavigate}>
            {item}
          </MenuLink>
        );
      })}
      {col.extra?.map((ex, ei) => (
        <div key={ei} style={{ marginTop:16 }}>
          <CategoryTitle title={ex.title} badge={ex.badge}/>
          {ex.items?.map(item => {
            const slug = toSlug(item);
            const isActive = activeGender === gender.toUpperCase() && activeSlug === slug;
            return (
              <MenuLink key={item} isActive={isActive}
                to={`/category/${gender.toLowerCase()}/${slug}`} onClick={onNavigate}>
                {item}
              </MenuLink>
            );
          })}
        </div>
      ))}
    </div>
  );
}

function IconBtn({ label, children, badge, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2,
        background:'none', border:'none', cursor:'pointer',
        color: hov ? GOLD_DARK : CHARCOAL, transition:'color 0.15s', position:'relative' }}>
      <div style={{ position:'relative' }}>
        {children}
        {badge > 0 && (
          <span style={{ position:'absolute', top:-6, right:-7, backgroundColor:GOLD, color:'#fff',
            fontSize:9, fontWeight:700, width:16, height:16, borderRadius:'50%',
            display:'flex', alignItems:'center', justifyContent:'center' }}>{badge}</span>
        )}
      </div>
      <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.8px' }}>{label}</span>
    </button>
  );
}

export default function Navbar() {
  const { cartCount }  = useCart();
  const { isLoggedIn, user } = useAuth();
  const { likedCount } = useWishlist();
  const isMobile       = useIsMobile();

  // ── Fetch navbar from backend ──────────────────────────────────
  const [navData, setNavData] = useState([]);

  const loadNav = () => {
    fetchNavbar()
      .then(items => setNavData(items))
      .catch(() => setNavData(FALLBACK_NAV));
  };

  useEffect(() => {
    // First load
    loadNav();

    // Jab user tab pe wapas aaye — admin ne kuch change kiya ho sakta hai
    const onFocus   = () => loadNav();
    const onVisible = () => { if (document.visibilityState === 'visible') loadNav(); };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);

    // Har 30 second mein bhi silently refresh (hata sakte ho agar nahi chahiye)
    const interval = setInterval(loadNav, 30000);

    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
      clearInterval(interval);
    };
  }, []);

  // Sort by order, only active
  const navLinks = useMemo(
    () => [...navData].sort((a,b) => a.order - b.order),
    [navData]
  );

  const [activeMenu,   setActiveMenu]   = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery,  setSearchQuery]  = useState('');

  const activeLink = useMemo(
    () => navLinks.find(l => l.name === activeMenu),
    [navLinks, activeMenu]
  );
  const activeMega = useMemo(
    () => activeLink ? itemToMegaLink(activeLink) : null,
    [activeLink]
  );

  const navigate     = useNavigate();
  const params       = useParams();
  const activeGender = (params.gender || '').toUpperCase();
  const activeSlug   = params.subcategory || '';

  const onNavigate = () => { window.scrollTo(0,0); setActiveMenu(null); setIsSearchOpen(false); };

  const handleSearch = e => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false); setSearchQuery(''); window.scrollTo(0,0);
    }
  };

  // Helper: get link for a navbar item
  const getLink = item => {
    if (item.link) return item.link;
    if (item.special || item.name === 'OFFERS') return '/offers';
    return '#';
  };

  // ── MOBILE ─────────────────────────────────────────────────────
  if (isMobile) {
    return (
      <header style={{ width:'100%', backgroundColor:SURFACE, borderBottom:`1px solid ${BORDER}`,
        position:'sticky', top:0, zIndex:1000, boxShadow:'0 2px 12px rgba(0,0,0,0.08)' }}>
        <div style={{ display:'flex', alignItems:'center', height:52, padding:'0 14px' }}>
          <Link to="/" style={{ display:'flex', alignItems:'center', flex:1, textDecoration:'none' }}>
            <img src={logo} alt="RoopVibe" style={{ height:38, objectFit:'contain' }}/>
          </Link>
          <div style={{ display:'flex', alignItems:'center', gap:20 }}>
            <button onClick={() => setIsSearchOpen(s=>!s)}
              style={{ background:'none', border:'none', cursor:'pointer', color:CHARCOAL,
                display:'flex', flexDirection:'column', alignItems:'center', gap:2, padding:0 }}>
              <FiSearch size={20}/>
              <span style={{ fontSize:8, fontWeight:700, letterSpacing:'0.5px', color:MUTED }}>SEARCH</span>
            </button>
            <Link to="/cart" style={{ textDecoration:'none', color:CHARCOAL, display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
              <div style={{ position:'relative' }}>
                <FiShoppingCart size={20}/>
                {cartCount>0 && <span style={{ position:'absolute', top:-6, right:-7, backgroundColor:GOLD, color:'#fff', fontSize:9, fontWeight:700, width:16, height:16, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>{cartCount}</span>}
              </div>
              <span style={{ fontSize:8, fontWeight:700, letterSpacing:'0.5px', color:MUTED }}>CART</span>
            </Link>
            <Link to="/wishlist" style={{ textDecoration:'none', color:CHARCOAL, display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
              <div style={{ position:'relative' }}>
                <FiHeart size={20} color={likedCount>0?'#ff4d4f':CHARCOAL} fill={likedCount>0?'#ff4d4f':'none'}/>
                {likedCount>0 && <span style={{ position:'absolute', top:-6, right:-7, backgroundColor:GOLD, color:'#fff', fontSize:9, fontWeight:700, width:16, height:16, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>{likedCount}</span>}
              </div>
              <span style={{ fontSize:8, fontWeight:700, letterSpacing:'0.5px', color:MUTED }}>WISHLIST</span>
            </Link>
            <Link to="/profile" style={{ textDecoration:'none', color:CHARCOAL, display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
              <FiUser size={20}/>
              <span style={{ fontSize:8, fontWeight:700, letterSpacing:'0.5px', color:MUTED }}>
                {isLoggedIn ? (user?.name?.split(' ')[0]?.slice(0,5).toUpperCase()||'ME') : 'LOGIN'}
              </span>
            </Link>
          </div>
        </div>
        {isSearchOpen && (
          <form onSubmit={handleSearch} style={{ display:'flex', alignItems:'center', backgroundColor:'#fff', borderTop:`1px solid ${BORDER}`, padding:'8px 12px', gap:8 }}>
            <input autoFocus type="text" placeholder="Search products, brands..."
              value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
              style={{ flex:1, border:`1.5px solid ${GOLD}`, outline:'none', borderRadius:8,
                padding:'8px 12px', fontSize:14, color:CHARCOAL, fontFamily:'inherit' }}/>
            <button type="submit" style={{ padding:'8px 14px', backgroundColor:GOLD, color:'#fff',
              border:'none', borderRadius:8, fontWeight:700, fontSize:13, cursor:'pointer' }}>Go</button>
            <button type="button" onClick={() => setIsSearchOpen(false)}
              style={{ background:'none', border:'none', cursor:'pointer', color:MUTED, display:'flex' }}>
              <FiX size={20}/>
            </button>
          </form>
        )}
      </header>
    );
  }

  // ── DESKTOP ────────────────────────────────────────────────────
  return (
    <header style={{ width:'100%', backgroundColor:SURFACE, borderBottom:`1px solid ${BORDER}`,
      position:'sticky', top:0, zIndex:1000, boxShadow:'0 2px 12px rgba(0,0,0,0.08)' }}>
      <div style={{ maxWidth:1400, margin:'0 auto', padding:'0 24px', height:68,
        display:'flex', alignItems:'center', position:'relative' }}>
        <Link to="/" style={{ display:'flex', alignItems:'center', flexShrink:0, marginRight:48 }}>
          <img src={logo} alt="RoopVibe" style={{ height:52, objectFit:'contain' }}/>
        </Link>

        {!isSearchOpen ? (
          <nav style={{ display:'flex', alignItems:'center', height:68, flex:1 }}>
            {navLinks.map(item => (
              <div key={item._id||item.id}
                style={{ height:'100%', display:'flex', alignItems:'center' }}
                onMouseEnter={() => itemToMegaLink(item) && setActiveMenu(item.name)}
                onMouseLeave={() => setActiveMenu(null)}>
                <Link to={getLink(item)}
                  style={{ height:'100%', display:'flex', alignItems:'center',
                    padding:'0 18px', fontSize:13, fontWeight:600, letterSpacing:'0.8px',
                    color: item.special ? '#C0392B' : activeMenu===item.name ? GOLD_DARK : CHARCOAL,
                    borderBottom:`3px solid ${activeMenu===item.name&&!item.special ? GOLD : 'transparent'}`,
                    transition:'color 0.15s', textDecoration:'none', whiteSpace:'nowrap' }}>
                  {item.name}
                </Link>
              </div>
            ))}
          </nav>
        ) : (
          <form onSubmit={handleSearch}
            style={{ flex:1, display:'flex', alignItems:'center', backgroundColor:'#fff',
              borderRadius:8, border:`1.5px solid ${GOLD}`, margin:'0 24px', padding:'0 16px', height:42 }}>
            <input autoFocus type="text" placeholder="Search for products, brands and more..."
              value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
              style={{ flex:1, border:'none', outline:'none', fontSize:14, color:CHARCOAL, background:'transparent' }}/>
            <button type="button" onClick={() => setIsSearchOpen(false)}
              style={{ background:'none', border:'none', cursor:'pointer', color:MUTED, fontSize:18, display:'flex' }}>
              <FiX/>
            </button>
          </form>
        )}

        {/* Mega menu dropdown */}
        {activeMega && activeLink && (
          <div
            onMouseEnter={() => setActiveMenu(activeMenu)}
            onMouseLeave={() => setActiveMenu(null)}
            style={{ position:'absolute', top:'100%', left:24, right:24,
              backgroundColor:'#fff', border:`1px solid ${BORDER}`,
              boxShadow:'0 15px 40px rgba(0,0,0,0.12)', zIndex:100, padding:40,
              borderTop:`3px solid ${GOLD}`, borderRadius:'0 0 8px 8px',
              maxHeight:'75vh', overflowY:'auto' }}>
            <div style={{ display:'grid',
              gridTemplateColumns:`repeat(${activeMega.columns.length},1fr)`, gap:40 }}>
              {activeMega.columns.map((col,ci) => (
                <MegaColumn key={ci} col={col} gender={activeLink.name}
                  activeGender={activeGender} activeSlug={activeSlug} onNavigate={onNavigate}/>
              ))}
            </div>
          </div>
        )}

        {/* Right icons */}
        <div style={{ display:'flex', alignItems:'center', gap:24, flexShrink:0 }}>
          <div onClick={() => isSearchOpen ? handleSearch() : setIsSearchOpen(true)}>
            <IconBtn label="SEARCH"><FiSearch size={20}/></IconBtn>
          </div>
          <Link to="/cart" style={{ textDecoration:'none' }}>
            <IconBtn label="CART" badge={cartCount}><FiShoppingCart size={20}/></IconBtn>
          </Link>
          <Link to="/wishlist" style={{ textDecoration:'none' }}>
            <button style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2,
              background:'none', border:'none', cursor:'pointer', position:'relative' }}>
              <div style={{ position:'relative' }}>
                <FiHeart size={20} color={likedCount>0?'#ff4d4f':CHARCOAL}
                  fill={likedCount>0?'#ff4d4f':'none'} style={{ transition:'all 0.2s ease' }}/>
                {likedCount>0 && <span style={{ position:'absolute', top:-6, right:-7, backgroundColor:GOLD, color:'#fff', fontSize:9, fontWeight:700, width:16, height:16, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>{likedCount}</span>}
              </div>
              <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.8px',
                color:likedCount>0?'#ff4d4f':CHARCOAL }}>WISHLIST</span>
            </button>
          </Link>
          <Link to="/profile" style={{ textDecoration:'none' }}>
            <IconBtn label="PROFILE"><FiUser size={20}/></IconBtn>
          </Link>
        </div>
      </div>
    </header>
  );
}