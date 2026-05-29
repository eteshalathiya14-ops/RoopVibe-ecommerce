// src/pages/MobileCategoryIndex.jsx
// Sirf mobile pe dikhega — Meesho jaisa category browse page
// Desktop pe ye page exist nahi karta (redirect hoga)

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { navLinks } from '../Data/Navdata';
import { toSlug } from '../utils/slug';
import { FiChevronRight } from 'react-icons/fi';

const GOLD      = '#C9A96E';
const GOLD_DARK = '#A07840';
const GOLD_LIGHT= '#F5EDD9';
const CHARCOAL  = '#1A1A1A';
const MUTED     = '#7A736B';
const BORDER    = '#EDE8E0';
const SURFACE   = '#FAF7F2';

// Gender tab config
const GENDER_TABS = navLinks
  .filter(l => l.mega)
  .map(l => ({ name: l.name, link: l }));

export default function MobileCategoryIndex() {
  const navigate = useNavigate();
  const [activeGender, setActiveGender] = useState(GENDER_TABS[0]?.name || 'WOMEN');

  // Desktop pe home pe redirect
  useEffect(() => {
    if (window.innerWidth > 768) {
      navigate('/', { replace: true });
    }
  }, []);

  const genderLink = GENDER_TABS.find(t => t.name === activeGender)?.link;
  const columns    = genderLink?.mega?.columns || [];

  const handleItemClick = (gender, item) => {
    const slug = toSlug(item);
    navigate(`/category/${gender.toLowerCase()}/${slug}`);
    window.scrollTo(0, 0);
  };

  return (
    <div style={{ backgroundColor: SURFACE, minHeight: '100vh', paddingBottom: 70 }}>

      {/* Page header */}
      <div style={{
        backgroundColor: '#fff',
        borderBottom: `1px solid ${BORDER}`,
        padding: '14px 16px 0',
        position: 'sticky', top: 0, zIndex: 10,
      }}>
        <h1 style={{
          fontSize: 18, fontWeight: 800, color: CHARCOAL,
          marginBottom: 14, letterSpacing: '0.3px',
          fontFamily: "'Playfair Display', Georgia, serif",
        }}>
          Categories
        </h1>

        {/* Gender tabs */}
        <div style={{
          display: 'flex', gap: 0,
          overflowX: 'auto', scrollbarWidth: 'none',
          marginLeft: -16, marginRight: -16,
          paddingLeft: 16,
        }}>
          {GENDER_TABS.map(tab => {
            const active = activeGender === tab.name;
            return (
              <button
                key={tab.name}
                onClick={() => setActiveGender(tab.name)}
                style={{
                  flexShrink: 0,
                  padding: '0 20px 12px',
                  background: 'none', border: 'none',
                  cursor: 'pointer',
                  fontSize: 13, fontWeight: active ? 700 : 500,
                  color: active ? GOLD_DARK : MUTED,
                  borderBottom: active
                    ? `2.5px solid ${GOLD}`
                    : '2.5px solid transparent',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
              >
                {tab.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Two-column layout: left = section titles, right = items */}
      <TwoColumnMenu
        columns={columns}
        gender={activeGender}
        onItemClick={handleItemClick}
      />
    </div>
  );
}

// ── Two-column Meesho-style layout ───────────────────────
function TwoColumnMenu({ columns, gender, onItemClick }) {
  const [activeCol, setActiveCol] = useState(0);

  // Reset when gender changes
  useEffect(() => { setActiveCol(0); }, [gender]);

  const col = columns[activeCol];

  // Flatten all items from selected column (including extras)
  const allItems = [
    ...(col?.items || []),
    ...(col?.extra?.flatMap(ex => [
      { isHeader: true, title: ex.title },
      ...(ex.items || []),
    ]) || []),
  ];

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 120px)', overflow: 'hidden' }}>

      {/* LEFT sidebar — section names */}
      <div style={{
        width: 110, flexShrink: 0,
        backgroundColor: '#F0EBE1',
        overflowY: 'auto', scrollbarWidth: 'none',
      }}>
        {columns.map((col, idx) => {
          const active = activeCol === idx;
          return (
            <button
              key={idx}
              onClick={() => setActiveCol(idx)}
              style={{
                width: '100%',
                padding: '14px 10px',
                background: active ? '#fff' : 'transparent',
                border: 'none',
                borderLeft: active ? `3px solid ${GOLD}` : '3px solid transparent',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: 11,
                fontWeight: active ? 700 : 500,
                color: active ? GOLD_DARK : MUTED,
                lineHeight: 1.35,
                transition: 'all 0.15s',
              }}
            >
              {col.title}
            </button>
          );
        })}
      </div>

      {/* RIGHT panel — items grid */}
      <div style={{
        flex: 1, overflowY: 'auto',
        backgroundColor: '#fff',
        padding: '12px 0',
        scrollbarWidth: 'none',
      }}>
        {allItems.map((item, idx) => {
          if (item.isHeader) {
            return (
              <div key={idx} style={{
                padding: '8px 14px 4px',
                fontSize: 10, fontWeight: 800,
                color: GOLD_DARK, letterSpacing: '0.8px',
                backgroundColor: GOLD_LIGHT,
                marginBottom: 2,
              }}>
                {item.title.toUpperCase()}
              </div>
            );
          }

          return (
            <CategoryItem
              key={idx}
              label={item}
              gender={gender}
              onItemClick={onItemClick}
            />
          );
        })}
      </div>
    </div>
  );
}

// ── Single category item row ─────────────────────────────
const CATEGORY_IMAGES = {
  'Kurta Kurtis':       'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=80&h=80&fit=crop&crop=top',
  'Sarees':             'https://images.unsplash.com/photo-1610030469983-98e550d6193c?w=80&h=80&fit=crop&crop=top',
  'Ethnic Sets':        'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=80&h=80&fit=crop&crop=top',
  'Dresses':            'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=80&h=80&fit=crop&crop=top',
  'Tops':               'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=80&h=80&fit=crop&crop=top',
  'Jeans & Jeggings':   'https://images.unsplash.com/photo-1542272604-787c3835535d?w=80&h=80&fit=crop&crop=top',
  'Co Ord Set':         'https://images.unsplash.com/photo-1581044777550-4cfa60707c03?w=80&h=80&fit=crop&crop=top',
  'T-Shirts':           'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=80&h=80&fit=crop&crop=top',
  'Casual Shirts':      'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=80&h=80&fit=crop&crop=top',
  'Ethnic Wear Sets':   'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=80&h=80&fit=crop&crop=top',
  'Jeans':              'https://images.unsplash.com/photo-1542272604-787c3835535d?w=80&h=80&fit=crop&crop=top',
  'Trousers':           'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=80&h=80&fit=crop&crop=top',
  'Flats':              'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=80&h=80&fit=crop',
  'Heels':              'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=80&h=80&fit=crop',
  'Earrings':           'https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=80&h=80&fit=crop',
  'Bags':               'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=80&h=80&fit=crop',
  'Bra':                'https://images.unsplash.com/photo-1617375407175-baa01a8d69f8?w=80&h=80&fit=crop',
};

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=80&h=80&fit=crop';

function CategoryItem({ label, gender, onItemClick }) {
  const [hov, setHov] = useState(false);
  const img = CATEGORY_IMAGES[label] || FALLBACK_IMG;

  return (
    <button
      onClick={() => onItemClick(gender, label)}
      onMouseDown={() => {}}
      style={{
        width: '100%',
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 14px',
        background: hov ? GOLD_LIGHT : '#fff',
        border: 'none',
        borderBottom: `1px solid ${BORDER}44`,
        cursor: 'pointer',
        textAlign: 'left',
        transition: 'background 0.12s',
      }}
      onTouchStart={() => setHov(true)}
      onTouchEnd={() => { setHov(false); }}
    >
      {/* Thumbnail */}
      <div style={{
        width: 52, height: 52, flexShrink: 0,
        borderRadius: 8,
        overflow: 'hidden',
        border: `1px solid ${BORDER}`,
        backgroundColor: '#F5F0E8',
      }}>
        <img
          src={img}
          alt={label}
          style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top', display: 'block' }}
          onError={e => { e.target.src = FALLBACK_IMG; }}
        />
      </div>

      {/* Label */}
      <span style={{
        flex: 1,
        fontSize: 13, fontWeight: 500,
        color: CHARCOAL,
        lineHeight: 1.35,
      }}>
        {label}
      </span>

      <FiChevronRight size={15} color={MUTED} style={{ flexShrink: 0 }} />
    </button>
  );
}