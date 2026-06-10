// src/component/Navbar.jsx — with Search Suggestions

import { useMemo, useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import logo from '../assets/logo.png';
import { toSlug } from '../utils/slug';
import { useCart } from '../context/CartContext';
import { FiSearch, FiShoppingCart, FiUser, FiX, FiHeart, FiPackage, FiGrid } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';
import { useAdminData } from '../Admin/context/Admindatacontext';
import { fetchNavbar } from '../Api/Navbarapi';

const GOLD       = '#C9A96E';
const GOLD_LIGHT = '#F5EDD9';
const GOLD_DARK  = '#A07840';
const CHARCOAL   = '#1A1A1A';
const MUTED      = '#6B6560';
const SURFACE    = '#FAF7F2';
const BORDER     = '#EDE8E0';
const WHITE      = '#FFFFFF';

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

// ── Search Suggestions Dropdown ───────────────────────────────
function SearchSuggestions({ query, products, navLinks, onSelect, onClose }) {
  if (!query || query.trim().length < 2) return null;

  const q = query.toLowerCase().trim();

  // ✅ Products match — active check flexible, max 5
  const matchedProducts = products
    .filter(p => {
      // active field nahi hai ya true hai tab show karo
      if (p.active === false) return false;
      return (
        p.title?.toLowerCase().includes(q)       ||
        p.brand?.toLowerCase().includes(q)       ||
        p.colTitle?.toLowerCase().includes(q)    ||
        p.navName?.toLowerCase().includes(q)     ||
        p.fabric?.toLowerCase().includes(q)      ||
        p.pattern?.toLowerCase().includes(q)     ||
        p.occasion?.toLowerCase().includes(q)
      );
    })
    .slice(0, 5);

  // ✅ Categories — navLinks columns se + common category keywords
  const matchedCategories = [];

  // navLinks columns se
  navLinks.forEach(nav => {
    if (!nav.columns || nav.columns.length === 0) return;
    nav.columns.forEach(col => {
      (col.items || []).forEach(item => {
        if (item.toLowerCase().includes(q) && matchedCategories.length < 4) {
          matchedCategories.push({
            label: item,
            gender: nav.name,
            slug: toSlug(item),
          });
        }
      });
      (col.extra || []).forEach(ex => {
        (ex.items || []).forEach(item => {
          if (item.toLowerCase().includes(q) && matchedCategories.length < 4) {
            matchedCategories.push({
              label: item,
              gender: nav.name,
              slug: toSlug(item),
            });
          }
        });
      });
    });
  });

  // ✅ Fallback: products ke navName + colTitle se categories bhi suggest karo
  if (matchedCategories.length === 0) {
    const seen = new Set();
    products.forEach(p => {
      if (p.active === false) return;
      const colTitle = p.colTitle || '';
      const navName  = p.navName  || '';
      if (colTitle && colTitle.toLowerCase().includes(q) && !seen.has(colTitle)) {
        seen.add(colTitle);
        if (matchedCategories.length < 4) {
          matchedCategories.push({
            label:  colTitle,
            gender: navName || 'WOMEN',
            slug:   toSlug(colTitle),
          });
        }
      }
    });
  }

  if (matchedProducts.length === 0 && matchedCategories.length === 0) {
    return (
      <div style={{ position:'absolute', top:'calc(100% + 6px)', left:0, right:0, background:WHITE, border:`1px solid ${BORDER}`, borderRadius:10, boxShadow:'0 8px 32px rgba(0,0,0,0.12)', zIndex:2000, padding:'14px 16px' }}>
        <p style={{ fontSize:13, color:MUTED, textAlign:'center' }}>No results for "{query}"</p>
      </div>
    );
  }

  return (
    <div style={{ position:'absolute', top:'calc(100% + 6px)', left:0, right:0, background:WHITE, border:`1px solid ${BORDER}`, borderRadius:10, boxShadow:'0 8px 32px rgba(0,0,0,0.12)', zIndex:2000, overflow:'hidden' }}>

      {/* Categories */}
      {matchedCategories.length > 0 && (
        <div>
          <p style={{ fontSize:10, fontWeight:700, color:MUTED, letterSpacing:'1px', padding:'10px 16px 6px', borderBottom:`1px solid ${BORDER}` }}>CATEGORIES</p>
          {matchedCategories.map((cat, i) => (
            <div key={i}
              onClick={() => onSelect(`/category/${cat.gender.toLowerCase()}/${cat.slug}`)}
              style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 16px', cursor:'pointer', transition:'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = GOLD_LIGHT}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
              <div style={{ width:28, height:28, borderRadius:6, background:GOLD_LIGHT, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                <FiGrid size={13} color={GOLD_DARK}/>
              </div>
              <div>
                <p style={{ fontSize:13, fontWeight:600, color:CHARCOAL, margin:0 }}>{cat.label}</p>
                <p style={{ fontSize:11, color:MUTED, margin:0 }}>{cat.gender}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Products */}
      {matchedProducts.length > 0 && (
        <div>
          <p style={{ fontSize:10, fontWeight:700, color:MUTED, letterSpacing:'1px', padding:'10px 16px 6px', borderBottom:`1px solid ${BORDER}` }}>PRODUCTS</p>
          {matchedProducts.map(p => {
            const pid = String(p._id || p.id || '');
            const img = p.colorVariants?.[0]?.images?.[0];
            const imgSrc = img ? (typeof img === 'string' ? img : img.src || img.url || '') : (p.img || '');
            return (
              <div key={pid}
                onClick={() => onSelect(`/product/${pid}`)}
                style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 16px', cursor:'pointer', transition:'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = GOLD_LIGHT}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                {imgSrc ? (
                  <img src={imgSrc} alt={p.title}
                    style={{ width:36, height:44, objectFit:'cover', borderRadius:6, border:`1px solid ${BORDER}`, flexShrink:0 }}
                    onError={e => e.target.style.display='none'}/>
                ) : (
                  <div style={{ width:36, height:44, borderRadius:6, background:GOLD_LIGHT, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                    <FiPackage size={14} color={GOLD_DARK}/>
                  </div>
                )}
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:13, fontWeight:600, color:CHARCOAL, margin:0, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.title}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View all */}
      <div
        onClick={() => onSelect(`/search?q=${encodeURIComponent(query.trim())}`)}
        style={{ padding:'10px 16px', borderTop:`1px solid ${BORDER}`, display:'flex', alignItems:'center', gap:6, cursor:'pointer', background:SURFACE }}
        onMouseEnter={e => e.currentTarget.style.background = GOLD_LIGHT}
        onMouseLeave={e => e.currentTarget.style.background = SURFACE}>
        <FiSearch size={13} color={GOLD_DARK}/>
        <span style={{ fontSize:13, fontWeight:700, color:GOLD_DARK }}>
          View all results for "{query}"
        </span>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
export default function Navbar() {
  const { cartCount }  = useCart();
  const { isLoggedIn, user } = useAuth();
  const { likedCount } = useWishlist();
  const isMobile       = useIsMobile();
  const { products }   = useAdminData();

  const [navData, setNavData] = useState([]);
  const loadNav = () => {
    fetchNavbar()
      .then(items => setNavData(items))
      .catch(() => setNavData(FALLBACK_NAV));
  };

  useEffect(() => {
    loadNav();
    const onFocus   = () => loadNav();
    const onVisible = () => { if (document.visibilityState === 'visible') loadNav(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);
    const interval = setInterval(loadNav, 30000);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
      clearInterval(interval);
    };
  }, []);

  const navLinks = useMemo(
    () => [...navData].sort((a,b) => a.order - b.order),
    [navData]
  );

  const [activeMenu,   setActiveMenu]   = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const searchRef = useRef(null);

  // Click outside se suggestions band karo
  useEffect(() => {
    const handler = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
      setIsSearchOpen(false);
      setSearchQuery('');
      setShowSuggestions(false);
      window.scrollTo(0,0);
    }
  };

  // Suggestion select — direct navigate
  const handleSuggestionSelect = (path) => {
    navigate(path);
    setIsSearchOpen(false);
    setSearchQuery('');
    setShowSuggestions(false);
    window.scrollTo(0,0);
  };

  const getLink = item => {
    if (item.link) return item.link;
    if (item.special || item.name === 'OFFERS') return '/offers';
    return '#';
  };

  // ── MOBILE ──────────────────────────────────────────────────
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

        {/* Mobile search with suggestions */}
        {isSearchOpen && (
          <div ref={searchRef} style={{ position:'relative' }}>
            <form onSubmit={handleSearch}
              style={{ display:'flex', alignItems:'center', backgroundColor:WHITE, borderTop:`1px solid ${BORDER}`, padding:'8px 12px', gap:8 }}>
              <input autoFocus type="text" placeholder="Search products, brands..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowSuggestions(e.target.value.length >= 2); }}
                onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                style={{ flex:1, border:`1.5px solid ${GOLD}`, outline:'none', borderRadius:8,
                  padding:'8px 12px', fontSize:14, color:CHARCOAL, fontFamily:'inherit' }}/>
              <button type="submit" style={{ padding:'8px 14px', backgroundColor:GOLD, color:WHITE,
                border:'none', borderRadius:8, fontWeight:700, fontSize:13, cursor:'pointer' }}>Go</button>
              <button type="button" onClick={() => { setIsSearchOpen(false); setShowSuggestions(false); setSearchQuery(''); }}
                style={{ background:'none', border:'none', cursor:'pointer', color:MUTED, display:'flex' }}>
                <FiX size={20}/>
              </button>
            </form>

            {showSuggestions && (
              <div style={{ position:'absolute', left:12, right:12, zIndex:2000 }}>
                <SearchSuggestions
                  query={searchQuery}
                  products={products}
                  navLinks={navLinks}
                  onSelect={handleSuggestionSelect}
                  onClose={() => setShowSuggestions(false)}
                />
              </div>
            )}
          </div>
        )}
      </header>
    );
  }

  // ── DESKTOP ─────────────────────────────────────────────────
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
          // Desktop search bar with suggestions
          <div ref={searchRef} style={{ flex:1, margin:'0 24px', position:'relative' }}>
            <form onSubmit={handleSearch}
              style={{ display:'flex', alignItems:'center', backgroundColor:WHITE,
                borderRadius:8, border:`1.5px solid ${GOLD}`, padding:'0 16px', height:42 }}>
              <FiSearch size={15} color={GOLD_DARK} style={{ marginRight:8, flexShrink:0 }}/>
              <input autoFocus type="text" placeholder="Search for products, brands and more..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowSuggestions(e.target.value.length >= 2); }}
                onFocus={() => searchQuery.length >= 2 && setShowSuggestions(true)}
                style={{ flex:1, border:'none', outline:'none', fontSize:14, color:CHARCOAL, background:'transparent', fontFamily:'inherit' }}/>
              <button type="button" onClick={() => { setIsSearchOpen(false); setShowSuggestions(false); setSearchQuery(''); }}
                style={{ background:'none', border:'none', cursor:'pointer', color:MUTED, display:'flex', padding:0 }}>
                <FiX size={18}/>
              </button>
            </form>

            {showSuggestions && (
              <SearchSuggestions
                query={searchQuery}
                products={products}
                navLinks={navLinks}
                onSelect={handleSuggestionSelect}
                onClose={() => setShowSuggestions(false)}
              />
            )}
          </div>
        )}

        {/* Mega menu */}
        {activeMega && activeLink && !isSearchOpen && (
          <div
            onMouseEnter={() => setActiveMenu(activeMenu)}
            onMouseLeave={() => setActiveMenu(null)}
            style={{ position:'absolute', top:'100%', left:24, right:24,
              backgroundColor:WHITE, border:`1px solid ${BORDER}`,
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