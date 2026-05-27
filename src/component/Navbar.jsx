// src/component/Navbar.jsx
import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import logo from '../assets/logo.png';
import { navLinks } from '../Data/Navdata';
import { toSlug } from '../utils/slug';
import { useCart } from '../context/CartContext';
import { FiSearch, FiShoppingCart, FiUser, FiX, FiMenu } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

const GOLD       = '#C9A96E';
const GOLD_LIGHT = '#F5EDD9';
const GOLD_DARK  = '#A07840';
const CHARCOAL   = '#1A1A1A';
const MUTED      = '#6B6560';
const SURFACE    = '#FAF7F2';
const BORDER     = '#EDE8E0';

const LANGUAGES = [
  { code: 'en', label: 'English',  native: 'ENG' },
  { code: 'hi', label: 'Hindi',    native: 'हिन्दी' },
  { code: 'gu', label: 'Gujarati', native: 'ગુજ' },
];

// ── simple mobile hook ──────────────────────────────────
function useIsMobile() {
  const [m, setM] = useState(window.innerWidth <= 768);
  useState(() => {
    const fn = () => setM(window.innerWidth <= 768);
    window.addEventListener('resize', fn);
    return () => window.removeEventListener('resize', fn);
  });
  return m;
}

function CategoryTitle({ title, badge }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
      <h3 style={{ fontSize:12, fontWeight:700, color:CHARCOAL, backgroundColor:GOLD_LIGHT, padding:'2px 8px', borderRadius:4, letterSpacing:'0.3px' }}>{title}</h3>
      {badge && <span style={{ fontSize:10, fontWeight:700, backgroundColor:GOLD, color:'#fff', padding:'2px 8px', borderRadius:20 }}>{badge}</span>}
    </div>
  );
}

function MenuLink({ children, isActive, to, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <Link to={to} onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ display:'block', fontSize:13, color: isActive ? GOLD_DARK : hov ? GOLD_DARK : MUTED, padding:'3px 0', transition:'color 0.15s', textDecoration:'none', fontWeight: isActive ? 700 : hov ? 500 : 400 }}>
      {children}
    </Link>
  );
}

function MegaColumn({ col, gender, activeGender, activeSlug, onNavigate }) {
  return (
    <div style={{ minWidth:145, flex:1 }}>
      <CategoryTitle title={col.title} badge={col.badge} />
      {col.items?.map(item => {
        const slug = toSlug(item);
        const isActive = activeGender===gender.toUpperCase() && activeSlug===slug;
        return <MenuLink key={item} isActive={isActive} to={`/category/${gender.toLowerCase()}/${slug}`} onClick={onNavigate}>{item}</MenuLink>;
      })}
      {col.extra?.map((ex,ei) => (
        <div key={ei} style={{ marginTop:16 }}>
          <CategoryTitle title={ex.title} badge={ex.badge} />
          {ex.items?.map(item => {
            const slug = toSlug(item);
            const isActive = activeGender===gender.toUpperCase() && activeSlug===slug;
            return <MenuLink key={item} isActive={isActive} to={`/category/${gender.toLowerCase()}/${slug}`} onClick={onNavigate}>{item}</MenuLink>;
          })}
        </div>
      ))}
    </div>
  );
}

function IconBtn({ label, children, badge, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, background:'none', border:'none', cursor:'pointer', color: hov ? GOLD_DARK : CHARCOAL, transition:'color 0.15s', position:'relative' }}>
      <div style={{ position:'relative' }}>
        {children}
        {badge > 0 && (
          <span style={{ position:'absolute', top:-6, right:-7, backgroundColor:GOLD, color:'#fff', fontSize:9, fontWeight:700, width:16, height:16, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>{badge}</span>
        )}
      </div>
      <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.8px' }}>{label}</span>
    </button>
  );
}

// ── MOBILE DRAWER ────────────────────────────────────────
function MobileDrawer({ open, onClose, navLinks, navigate }) {
  if (!open) return null;
  const [openSection, setOpenSection] = useState(null);

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position:'fixed', inset:0, backgroundColor:'rgba(0,0,0,0.45)', zIndex:1200 }} />

      {/* Drawer */}
      <div style={{ position:'fixed', top:0, left:0, bottom:0, width:'78%', maxWidth:300, backgroundColor:'#fff', zIndex:1300, overflowY:'auto', boxShadow:'4px 0 24px rgba(0,0,0,0.15)' }}>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 20px', borderBottom:`1px solid ${BORDER}`, backgroundColor:SURFACE }}>
          <Link to="/" onClick={onClose} style={{ display:'flex', alignItems:'center' }}>
            <img src={logo} alt="RoopVibe" style={{ height:40, objectFit:'contain' }} />
          </Link>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:CHARCOAL, display:'flex' }}>
            <FiX size={22} />
          </button>
        </div>

        {/* Nav sections */}
        <div style={{ padding:'8px 0' }}>
          {navLinks.map(link => (
            <div key={link.name}>
              <button
                onClick={() => {
                  if (!link.mega) { navigate(link.name==='OFFERS' ? '/offers' : '/'); onClose(); }
                  else setOpenSection(s => s===link.name ? null : link.name);
                }}
                style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 20px', background:'none', border:'none', cursor:'pointer', fontSize:13, fontWeight:700, letterSpacing:'0.6px', color: link.special ? '#C0392B' : CHARCOAL, borderBottom:`1px solid ${BORDER}` }}
              >
                {link.name}
                {link.mega && (
                  <span style={{ fontSize:16, color:MUTED, transform: openSection===link.name ? 'rotate(90deg)':'none', transition:'transform 0.2s' }}>›</span>
                )}
              </button>

              {/* Sub-items */}
              {link.mega && openSection===link.name && (
                <div style={{ backgroundColor:GOLD_LIGHT, padding:'12px 20px', borderBottom:`1px solid ${BORDER}` }}>
                  {link.mega.columns.slice(0,1).map(col =>
                    col.items?.slice(0,8).map(item => (
                      <Link
                        key={item}
                        to={`/category/${link.name.toLowerCase()}/${toSlug(item)}`}
                        onClick={onClose}
                        style={{ display:'block', padding:'7px 0', fontSize:13, color:CHARCOAL, textDecoration:'none', borderBottom:`1px solid ${BORDER}33` }}
                      >
                        {item}
                      </Link>
                    ))
                  )}
                  <Link to={`/category/${link.name.toLowerCase()}/all`} onClick={onClose}
                    style={{ display:'block', marginTop:8, fontSize:12, fontWeight:700, color:GOLD_DARK, textDecoration:'none' }}>
                    View All {link.name} →
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom links */}
        <div style={{ padding:'16px 20px', borderTop:`1px solid ${BORDER}`, marginTop:8 }}>
          {['ORDERS','RETURN & REPLACEMENT','CUSTOMER SUPPORT'].map(item => (
            <Link key={item} to="/login" onClick={onClose}
              style={{ display:'block', padding:'10px 0', fontSize:12, fontWeight:600, color:MUTED, textDecoration:'none', borderBottom:`1px solid ${BORDER}33` }}>
              {item}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}

// ── MAIN NAVBAR ──────────────────────────────────────────
export default function Navbar() {
  const { cartCount } = useCart();
  const { isLoggedIn, user, logout } = useAuth();
  const { language, changeLanguage } = useLanguage();
  const isMobile = useIsMobile();

  const [activeMenu, setActiveMenu]       = useState(null);
  const [isSearchOpen, setIsSearchOpen]   = useState(false);
  const [searchQuery, setSearchQuery]     = useState('');
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [drawerOpen, setDrawerOpen]       = useState(false);

  const activeLink = useMemo(() => navLinks.find(l=>l.name===activeMenu), [activeMenu]);
  const navigate   = useNavigate();
  const params     = useParams();
  const activeGender = (params.gender||'').toUpperCase();
  const activeSlug   = params.subcategory||'';

  const onNavigate = () => { window.scrollTo(0,0); setActiveMenu(null); setIsSearchOpen(false); };

  const handleSearch = e => {
    if (e) e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false); setSearchQuery(''); window.scrollTo(0,0);
    }
  };

  // ── MOBILE NAVBAR ──────────────────────────────────────
  if (isMobile) {
    return (
      <>
        <header style={{ width:'100%', backgroundColor:SURFACE, borderBottom:`1px solid ${BORDER}`, position:'sticky', top:0, zIndex:1000, boxShadow:'0 2px 12px rgba(0,0,0,0.08)' }}>
          <div style={{ display:'flex', alignItems:'center', height:56, padding:'0 12px', gap:0 }}>

            {/* Hamburger */}
            <button onClick={()=>setDrawerOpen(true)} style={{ background:'none', border:'none', cursor:'pointer', color:CHARCOAL, display:'flex', alignItems:'center', padding:'8px 8px 8px 0', marginRight:4 }}>
              <FiMenu size={22} />
            </button>

            {/* Logo */}
            <Link to="/" style={{ flex:1, display:'flex', alignItems:'center' }}>
              <img src={logo} alt="RoopVibe" style={{ height:40, objectFit:'contain' }} />
            </Link>

            {/* Icons */}
            <div style={{ display:'flex', alignItems:'center', gap:16 }}>
              <button onClick={()=>setIsSearchOpen(s=>!s)} style={{ background:'none', border:'none', cursor:'pointer', color:CHARCOAL, display:'flex', flexDirection:'column', alignItems:'center', gap:2 }}>
                <FiSearch size={20} />
                <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.6px' }}>SEARCH</span>
              </button>

              <Link to="/cart" style={{ textDecoration:'none', display:'flex', flexDirection:'column', alignItems:'center', gap:2, color:CHARCOAL, position:'relative' }}>
                <div style={{ position:'relative' }}>
                  <FiShoppingCart size={20} />
                  {cartCount>0 && <span style={{ position:'absolute', top:-6, right:-7, backgroundColor:GOLD, color:'#fff', fontSize:9, fontWeight:700, width:16, height:16, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center' }}>{cartCount}</span>}
                </div>
                <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.6px' }}>CART</span>
              </Link>

              <Link to="/login" style={{ textDecoration:'none', display:'flex', flexDirection:'column', alignItems:'center', gap:2, color:CHARCOAL }}>
                <FiUser size={20} />
                <span style={{ fontSize:9, fontWeight:700, letterSpacing:'0.6px' }}>PROFILE</span>
              </Link>
            </div>
          </div>

          {/* Mobile search bar */}
          {isSearchOpen && (
            <form onSubmit={handleSearch} style={{ display:'flex', alignItems:'center', backgroundColor:'#fff', borderTop:`1px solid ${BORDER}`, padding:'8px 12px', gap:8 }}>
              <input autoFocus type="text" placeholder="Search products, brands..."
                value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
                style={{ flex:1, border:`1.5px solid ${GOLD}`, outline:'none', borderRadius:8, padding:'8px 12px', fontSize:14, color:CHARCOAL }} />
              <button type="submit" style={{ padding:'8px 14px', backgroundColor:GOLD, color:'#fff', border:'none', borderRadius:8, fontWeight:700, fontSize:13, cursor:'pointer' }}>Go</button>
              <button type="button" onClick={()=>setIsSearchOpen(false)} style={{ background:'none', border:'none', cursor:'pointer', color:MUTED, display:'flex' }}><FiX size={20}/></button>
            </form>
          )}
        </header>

        <MobileDrawer open={drawerOpen} onClose={()=>setDrawerOpen(false)} navLinks={navLinks} navigate={navigate} />
      </>
    );
  }

  // ── DESKTOP NAVBAR ─────────────────────────────────────
  return (
    <header style={{ width:'100%', backgroundColor:SURFACE, borderBottom:`1px solid ${BORDER}`, position:'sticky', top:0, zIndex:1000, boxShadow:'0 2px 12px rgba(0,0,0,0.08)' }}>
      <div style={{ maxWidth:1400, margin:'0 auto', padding:'0 24px', height:68, display:'flex', alignItems:'center', position:'relative' }}>

        <Link to="/" style={{ display:'flex', alignItems:'center', flexShrink:0, marginRight:48 }}>
          <img src={logo} alt="RoopVibe" style={{ height:52, objectFit:'contain' }} />
        </Link>

        {!isSearchOpen ? (
          <nav style={{ display:'flex', alignItems:'center', height:68, flex:1 }}>
            {navLinks.map(link => (
              <div key={link.name} style={{ height:'100%', display:'flex', alignItems:'center' }}
                onMouseEnter={() => link.mega && setActiveMenu(link.name)}
                onMouseLeave={() => setActiveMenu(null)}>
                <div style={{ height:'100%', display:'flex', alignItems:'center', position:'relative' }}>
                  <Link
                    to={link.special||link.name==='OFFERS' ? '/offers' : '#'}
                    style={{ height:'100%', display:'flex', alignItems:'center', padding:'0 18px', fontSize:13, fontWeight:600, letterSpacing:'0.8px', color: link.special ? '#C0392B' : activeMenu===link.name ? GOLD_DARK : CHARCOAL, borderBottom:`3px solid ${activeMenu===link.name && !link.special ? GOLD : 'transparent'}`, transition:'color 0.15s', textDecoration:'none', whiteSpace:'nowrap' }}>
                    {link.name}
                  </Link>
                </div>
              </div>
            ))}
          </nav>
        ) : (
          <form onSubmit={handleSearch} style={{ flex:1, display:'flex', alignItems:'center', backgroundColor:'#fff', borderRadius:8, border:`1.5px solid ${GOLD}`, margin:'0 24px', padding:'0 16px', height:42 }}>
            <input autoFocus type="text" placeholder="Search for products, brands and more..."
              value={searchQuery} onChange={e=>setSearchQuery(e.target.value)}
              style={{ flex:1, border:'none', outline:'none', fontSize:14, color:CHARCOAL, background:'transparent' }} />
            <button type="button" onClick={()=>setIsSearchOpen(false)} style={{ background:'none', border:'none', cursor:'pointer', color:MUTED, fontSize:18, display:'flex' }}><FiX/></button>
          </form>
        )}

        {/* Mega menu */}
        {activeLink?.mega && (
          <div onMouseEnter={()=>setActiveMenu(activeMenu)} onMouseLeave={()=>setActiveMenu(null)}
            style={{ position:'absolute', top:'100%', left:24, right:24, backgroundColor:'#fff', border:`1px solid ${BORDER}`, boxShadow:'0 15px 40px rgba(0,0,0,0.12)', zIndex:100, padding:40, borderTop:`3px solid ${GOLD}`, borderRadius:'0 0 8px 8px', maxHeight:'75vh', overflowY:'auto' }}>
            <div style={{ display:'grid', gridTemplateColumns:`repeat(${activeLink.mega.columns.length},1fr)`, gap:40 }}>
              {activeLink.mega.columns.map((col,ci) => (
                <MegaColumn key={ci} col={col} gender={activeLink.name} activeGender={activeGender} activeSlug={activeSlug} onNavigate={onNavigate} />
              ))}
            </div>
          </div>
        )}

        <div style={{ display:'flex', alignItems:'center', gap:24, flexShrink:0 }}>
          <div onClick={()=>isSearchOpen ? handleSearch() : setIsSearchOpen(true)}>
            <IconBtn label="SEARCH"><FiSearch size={20}/></IconBtn>
          </div>

          <Link to="/cart" style={{ textDecoration:'none' }}>
            <IconBtn label="CART" badge={cartCount}><FiShoppingCart size={20}/></IconBtn>
          </Link>

          <div style={{ position:'relative' }} onMouseEnter={()=>setShowProfileMenu(true)} onMouseLeave={()=>setShowProfileMenu(false)}>
            <IconBtn label="PROFILE"><FiUser size={20}/></IconBtn>

            {showProfileMenu && (
              <div style={{ position:'absolute', top:'100%', right:-10, width:260, backgroundColor:'#fff', boxShadow:'0 10px 40px rgba(0,0,0,0.15)', zIndex:200, borderTop:`3px solid ${GOLD}`, borderRadius:'0 0 8px 8px' }}>
                <div style={{ padding:24 }}>
                  {!isLoggedIn ? (
                    <>
                      <h4 style={{ fontSize:13, fontWeight:800, color:CHARCOAL, marginBottom:4 }}>WELCOME!</h4>
                      <p style={{ fontSize:11, color:MUTED, marginBottom:16 }}>To view account details</p>
                      <button onClick={()=>{navigate('/login');setShowProfileMenu(false);}}
                        style={{ width:'100%', padding:10, background:`linear-gradient(to right,${GOLD_DARK},${GOLD},${GOLD_DARK})`, color:'#fff', border:'none', borderRadius:4, fontWeight:800, fontSize:12, cursor:'pointer', marginBottom:16 }}>
                        LOGIN
                      </button>
                    </>
                  ) : (
                    <>
                      <h4 style={{ fontSize:13, fontWeight:800, color:CHARCOAL, marginBottom:4 }}>Hello, {user?.name||'User'}</h4>
                      <p style={{ fontSize:11, color:MUTED, marginBottom:16 }}>{user?.email}</p>
                      <button onClick={logout} style={{ width:'100%', padding:10, background:`linear-gradient(to right,${GOLD_DARK},${GOLD},${GOLD_DARK})`, color:CHARCOAL, border:`1px solid ${BORDER}`, borderRadius:4, fontWeight:700, fontSize:12, cursor:'pointer', marginBottom:16 }}>
                        LOGOUT
                      </button>
                    </>
                  )}

                  <div style={{ borderTop:`1px solid ${BORDER}`, paddingTop:16, display:'flex', flexDirection:'column', gap:12 }}>
                    {['ORDERS','RETURN REPLACEMENT','LR CREDITS'].map(item=>(
                      <Link key={item} to="/login" style={{ fontSize:10, fontWeight:700, color:CHARCOAL, textDecoration:'none', letterSpacing:'0.5px' }}>{item}</Link>
                    ))}
                  </div>

                  <div style={{ borderTop:`1px solid ${BORDER}`, marginTop:16, paddingTop:16, display:'flex', flexDirection:'column', gap:12 }}>
                    {['CUSTOMER SUPPORT','FAQ & HELP'].map(item=>(
                      <Link key={item} to="#" style={{ fontSize:10, fontWeight:700, color:CHARCOAL, textDecoration:'none', letterSpacing:'0.5px' }}>{item}</Link>
                    ))}
                  </div>

                  <div style={{ borderTop:`1px solid ${BORDER}`, marginTop:16, paddingTop:16 }}>
                    <p style={{ fontSize:10, fontWeight:700, color:MUTED, letterSpacing:'0.8px', marginBottom:10 }}>LANGUAGE</p>
                    <div style={{ display:'flex', gap:8 }}>
                      {LANGUAGES.map(lang=>{
                        const sel = language===lang.code;
                        return (
                          <button key={lang.code} onClick={()=>changeLanguage(lang.code)}
                            style={{ flex:1, padding:'8px 4px', borderRadius:6, border:`1.5px solid ${sel?GOLD:BORDER}`, backgroundColor: sel?GOLD_LIGHT:'#fff', color: sel?GOLD_DARK:MUTED, fontWeight: sel?800:600, fontSize:11, cursor:'pointer', transition:'all 0.15s' }}>
                            {lang.native}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}