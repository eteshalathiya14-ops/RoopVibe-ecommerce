import { useState, useEffect } from "react";
import { FiMenu, FiGrid, FiEye, FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiChevronRight, FiSave, FiAlertCircle } from "react-icons/fi";

// ─── THEME ───────────────────────────────────────────────────
const GOLD       = "#C9A96E";
const GOLD_LIGHT = "#F5EDD9";
const GOLD_DARK  = "#A07840";
const CHARCOAL   = "#1A1A1A";
const MUTED      = "#6B6560";
const SURFACE    = "#FAF7F2";
const BORDER     = "#EDE8E0";
const WHITE      = "#FFFFFF";
const DANGER     = "#C0392B";
const SUCCESS    = "#27AE60";

// ─── INITIAL MOCK DATA ───────────────────────────────────────
const INITIAL_NAV = [
  {
    id: 1, name: "WOMEN", order: 0, special: false, active: true, link: "",
    columns: [
      { id: "c1", title: "Ethnic Wear", items: ["Kurta Kurtis","Sarees","Ethnic Sets","Lehengas And Blouse","Ethnic Dresses","Skirts","Shawls & Dupattas"], extra: [{ id:"e1", title:"Woolen Collection", items:["Woolen Kurta","Unstitched Suits"] }] },
      { id: "c2", title: "Western Wear", items: ["Dresses","Tops","Tunics","T-Shirts","Jeans & Jeggings","Trousers","Co Ord Set","Shorts"], extra: [] },
      { id: "c3", title: "Sports & Activewear", items: ["Swim Wear","Tights","Track Pants","Sports Bra"], extra: [{ id:"e2", title:"Lingerie & Sleepwear", items:["Bra","Panties","Lingerie Sets","Sleepwear"] }] },
      { id: "c4", title: "Jewellery", items: ["Imitation Jewellery","Earrings","Necklace & Pendants","Rings & Bangles"], extra: [] },
      { id: "c5", title: "Brands", items: ["Aurelia","Baggit","Clovia","Cottinfab","Globus","SOCH"], extra: [] },
    ],
  },
  {
    id: 2, name: "MEN", order: 1, special: false, active: true, link: "",
    columns: [
      { id: "c6", title: "Top Wear", items: ["Casual Shirts","Formal Shirts","T-Shirts","Polo T Shirts","Suits & Blazers"], extra: [] },
      { id: "c7", title: "Bottom Wear", items: ["Cargos","Jeans","Joggers","Shorts","Formal Trousers"], extra: [] },
      { id: "c8", title: "Ethnic Wear", items: ["Kurtas","Nehru Jackets","Waist Coat","Ethnic Sets"], extra: [] },
      { id: "c9", title: "Brands", items: ["Linaria","Ketch","RIGO","Duke","Classic Polo"], extra: [] },
    ],
  },
  {
    id: 3, name: "KIDS", order: 2, special: false, active: true, link: "",
    columns: [
      { id: "c10", title: "Boys", items: ["T-Shirts","Shirts","Bottom Wear","Ethnic Wear","Coats & Jackets"], extra: [{ id:"e3", title:"Shop By Age", items:["0-2 Years","2-6 Years","6-12 Years","12-16 Years"] }] },
      { id: "c11", title: "Girls", items: ["Dresses & Frocks","Tees & Tops","Ethnic Wear","Party Gowns"], extra: [{ id:"e4", title:"Shop By Age", items:["0-2 Years","2-6 Years","6-12 Years"] }] },
      { id: "c12", title: "Footwear", items: ["Sandals","Casual Shoes","Sports Shoes"], extra: [] },
    ],
  },
  {
    id: 4, name: "HOME", order: 3, special: false, active: true, link: "",
    columns: [
      { id: "c13", title: "Bedding", items: ["Bed Sheets","Pillow Covers","Blankets","Comforters"], extra: [] },
      { id: "c14", title: "Decor", items: ["Wall Art","Cushions","Candles","Photo Frames"], extra: [] },
      { id: "c15", title: "Kitchen", items: ["Cookware","Storage","Serveware"], extra: [] },
    ],
  },
  { id: 5, name: "OFFERS", order: 4, special: true, active: true, link: "/offers", columns: [] },
];

let _nextId = 100;
const uid = () => `id_${_nextId++}`;

// ─── REUSABLE COMPONENTS ─────────────────────────────────────

function Toggle({ value, onChange }) {
  return (
    <button
      onClick={() => onChange(!value)}
      style={{
        width: 40, height: 22, borderRadius: 11, border: "none", cursor: "pointer",
        background: value ? GOLD : BORDER, position: "relative", transition: "background 0.2s", flexShrink: 0,
      }}
    >
      <span style={{
        position: "absolute", top: 3, left: value ? 20 : 3, width: 16, height: 16,
        borderRadius: "50%", background: WHITE, transition: "left 0.2s",
      }} />
    </button>
  );
}

function Badge({ children, color = GOLD_LIGHT, text = GOLD_DARK }) {
  return (
    <span style={{ fontSize: 10, fontWeight: 700, background: color, color: text, padding: "2px 7px", borderRadius: 20, letterSpacing: "0.4px" }}>
      {children}
    </span>
  );
}

function Btn({ children, onClick, variant = "default", size = "md", style: sx = {}, disabled = false }) {
  const base = {
    display: "inline-flex", alignItems: "center", gap: 6, border: `1px solid ${BORDER}`,
    borderRadius: 8, cursor: disabled ? "not-allowed" : "pointer", fontFamily: "inherit",
    fontWeight: 500, transition: "all 0.15s", opacity: disabled ? 0.5 : 1,
  };
  const sizes = { sm: { padding: "4px 10px", fontSize: 12 }, md: { padding: "8px 16px", fontSize: 13 } };
  const variants = {
    default: { background: WHITE, color: CHARCOAL, borderColor: BORDER },
    primary: { background: GOLD, color: WHITE, borderColor: GOLD },
    danger:  { background: "transparent", color: DANGER, borderColor: "#F5C6C6" },
    ghost:   { background: "transparent", color: MUTED, border: "none" },
  };
  return (
    <button onClick={disabled ? undefined : onClick} style={{ ...base, ...sizes[size], ...variants[variant], ...sx }}>
      {children}
    </button>
  );
}

function Modal({ title, onClose, children, footer }) {
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{
        background: WHITE, borderRadius: 12, width: 440, maxWidth: "95vw",
        border: `1px solid ${BORDER}`, boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", borderBottom: `1px solid ${BORDER}` }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, color: CHARCOAL }}>{title}</h3>
          <Btn variant="ghost" size="sm" onClick={onClose}><FiX size={16} /></Btn>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
        {footer && <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", padding: "14px 20px", borderTop: `1px solid ${BORDER}` }}>{footer}</div>}
      </div>
    </div>
  );
}

function FormGroup({ label, children }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 12, color: MUTED, marginBottom: 5, fontWeight: 500 }}>{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, style: sx = {} }) {
  return (
    <input
      value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{
        width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${BORDER}`,
        fontSize: 13, color: CHARCOAL, fontFamily: "inherit", outline: "none",
        background: WHITE, boxSizing: "border-box", ...sx,
      }}
      onFocus={e => e.target.style.borderColor = GOLD}
      onBlur={e => e.target.style.borderColor = BORDER}
    />
  );
}

function Toast({ message, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t); }, []);
  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 2000,
      background: WHITE, border: `1px solid ${BORDER}`, borderLeft: `3px solid ${GOLD}`,
      borderRadius: 8, padding: "10px 16px", fontSize: 13, color: CHARCOAL,
      boxShadow: "0 4px 20px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: 8,
    }}>
      <FiCheck size={14} color={SUCCESS} /> {message}
    </div>
  );
}

// ─── SIDEBAR ─────────────────────────────────────────────────
function Sidebar({ page, setPage }) {
  const items = [
    { key: "navbar",   icon: <FiMenu size={16} />,   label: "Navbar items" },
    { key: "columns",  icon: <FiGrid size={16} />,   label: "Columns & items" },
    { key: "preview",  icon: <FiEye size={16} />,    label: "Preview" },
  ];
  return (
    <div style={{ width: 220, background: WHITE, borderRight: `1px solid ${BORDER}`, display: "flex", flexDirection: "column", flexShrink: 0 }}>
      <div style={{ padding: "20px 18px 16px", borderBottom: `1px solid ${BORDER}` }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: CHARCOAL, letterSpacing: "0.5px" }}>RoopVibe</div>
        <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>Admin — Navbar Manager</div>
      </div>
      <nav style={{ padding: "8px 0" }}>
        {items.map(it => (
          <div key={it.key} onClick={() => setPage(it.key)} style={{
            display: "flex", alignItems: "center", gap: 10, padding: "10px 18px",
            fontSize: 13, color: page === it.key ? CHARCOAL : MUTED,
            cursor: "pointer", borderLeft: `2px solid ${page === it.key ? GOLD : "transparent"}`,
            background: page === it.key ? SURFACE : "transparent",
            fontWeight: page === it.key ? 600 : 400, transition: "all 0.15s",
          }}>
            {it.icon}{it.label}
          </div>
        ))}
      </nav>
      
    </div>
  );
}

// ─── PAGE: NAVBAR MANAGER ────────────────────────────────────
function NavbarPage({ navItems, setNavItems, toast }) {
  const [modal, setModal] = useState(null); // null | "add" | {item}
  const [form, setForm]   = useState({ name: "", special: false, link: "", order: 0 });

  const openAdd = () => {
    setForm({ name: "", special: false, link: "", order: navItems.length });
    setModal("add");
  };
  const openEdit = item => {
    setForm({ name: item.name, special: item.special, link: item.link || "", order: item.order });
    setModal(item);
  };
  const saveAdd = () => {
    if (!form.name.trim()) return;
    setNavItems(prev => [...prev, { id: uid(), name: form.name.toUpperCase(), order: form.order, special: form.special, link: form.link, active: true, columns: [] }]);
    setModal(null); toast("Item added!");
  };
  const saveEdit = () => {
    setNavItems(prev => prev.map(x => x.id === modal.id ? { ...x, name: form.name.toUpperCase(), special: form.special, link: form.link, order: form.order } : x));
    setModal(null); toast("Saved!");
  };
  const deleteItem = id => {
    if (!window.confirm("Are you sure you want to delete?")) return;
    setNavItems(prev => prev.filter(x => x.id !== id));
    toast("Deleted!");
  };
  const toggleActive = id => {
    setNavItems(prev => prev.map(x => x.id === id ? { ...x, active: !x.active } : x));
    toast("Status updated!");
  };

  const sorted = [...navItems].sort((a, b) => a.order - b.order);
  const totalActive  = navItems.filter(x => x.active).length;
  const totalSpecial = navItems.filter(x => x.special).length;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: CHARCOAL }}>Navbar items</h2>
        <p style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>Manage top-level navigation — add, edit, reorder, and hide items</p>
      </div>

      {/* Metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }}>
        {[["Total items", navItems.length], ["Active", totalActive], ["Special links", totalSpecial]].map(([label, val]) => (
          <div key={label} style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "14px 18px" }}>
            <div style={{ fontSize: 12, color: MUTED, marginBottom: 6 }}>{label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: CHARCOAL }}>{val}</div>
          </div>
        ))}
      </div>

      {/* List */}
      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: `1px solid ${BORDER}` }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: CHARCOAL }}>All items</h3>
          <Btn variant="primary" size="sm" onClick={openAdd}><FiPlus size={14} /> Add item</Btn>
        </div>
        {sorted.map((item, idx) => (
          <div key={item.id} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 20px", borderBottom: idx < sorted.length - 1 ? `1px solid ${BORDER}` : "none",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}> {/* Changed FiGripVertical to FiMenu */}
              <FiMenu size={16} color={BORDER} style={{ cursor: "grab" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: item.active ? CHARCOAL : MUTED, letterSpacing: "0.3px" }}>{item.name}</span>
              {item.special && <Badge>SPECIAL</Badge>}
              {!item.active && <Badge color="#FDECEA" text={DANGER}>HIDDEN</Badge>}
              <span style={{ fontSize: 11, color: MUTED }}>{item.columns.length} columns</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Toggle value={item.active} onChange={() => toggleActive(item.id)} />
              <Btn size="sm" onClick={() => openEdit(item)}><FiEdit2 size={13} /></Btn>
              <Btn size="sm" variant="danger" onClick={() => deleteItem(item.id)}><FiTrash2 size={13} /></Btn>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <Modal
          title={modal === "add" ? "New nav item" : `Edit: ${modal.name}`}
          onClose={() => setModal(null)}
          footer={<>
            <Btn onClick={() => setModal(null)}>Cancel</Btn>
            <Btn variant="primary" onClick={modal === "add" ? saveAdd : saveEdit}><FiSave size={14} /> Save</Btn>
          </>}
        >
          <FormGroup label="Name (e.g. SALE, BEAUTY)">
            <Input value={form.name} onChange={v => setForm(f => ({ ...f, name: v.toUpperCase() }))} placeholder="SALE" />
          </FormGroup>
          <FormGroup label="Order (position number)">
            <Input value={form.order} onChange={v => setForm(f => ({ ...f, order: parseInt(v) || 0 }))} placeholder="0" />
          </FormGroup>
          <FormGroup label="Direct link URL (leave empty if you want a mega menu)">
            <Input value={form.link} onChange={v => setForm(f => ({ ...f, link: v, special: !!v }))} placeholder="/sale" />
          </FormGroup>
          {form.link && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: GOLD_LIGHT, borderRadius: 8, fontSize: 12, color: GOLD_DARK }}>
              <FiAlertCircle size={14} /> Direct link present — mega menu will not be shown
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

// ─── PAGE: COLUMNS & ITEMS ───────────────────────────────────
function ColumnsPage({ navItems, setNavItems, toast }) {
  const [selectedCatId, setSelectedCatId]   = useState(null);
  const [selectedColIdx, setSelectedColIdx] = useState(null);
  const [colModal, setColModal]             = useState(null);  // null | "add" | idx
  const [colName, setColName]               = useState("");
  const [newItem, setNewItem]               = useState("");
  const [subModal, setSubModal]             = useState(null);
  const [subTitle, setSubTitle]             = useState("");
  const [newSubItems, setNewSubItems]       = useState({});

  const cats = navItems.filter(x => !x.special);
  const selCat = cats.find(x => x.id === selectedCatId);
  const selCol = selCat && selectedColIdx !== null ? selCat.columns[selectedColIdx] : null;

  const updateCat = (id, fn) => setNavItems(prev => prev.map(x => x.id === id ? { ...x, columns: fn(x.columns) } : x));

  const addCol = () => {
    if (!colName.trim()) return;
    updateCat(selectedCatId, cols => [...cols, { id: uid(), title: colName, items: [], extra: [] }]);
    setColModal(null); setColName(""); toast("Column added!");
  };
  const renameCol = () => {
    if (!colName.trim()) return;
    updateCat(selectedCatId, cols => cols.map((c, i) => i === colModal ? { ...c, title: colName } : c));
    setColModal(null); setColName(""); toast("Renamed!"); setSelectedColIdx(null);
  };
  const deleteCol = idx => {
    if (!window.confirm("Are you sure you want to delete this column?")) return;
    updateCat(selectedCatId, cols => cols.filter((_, i) => i !== idx));
    setSelectedColIdx(null); toast("Column deleted!");
  };
  const addItem = () => {
    if (!newItem.trim()) return;
    updateCat(selectedCatId, cols => cols.map((c, i) => i === selectedColIdx ? { ...c, items: [...c.items, newItem.trim()] } : c));
    setNewItem(""); toast("Item added!");
  };
  const removeItem = itemIdx => {
    updateCat(selectedCatId, cols => cols.map((c, i) => i === selectedColIdx ? { ...c, items: c.items.filter((_, j) => j !== itemIdx) } : c));
    toast("Removed!");
  };
  const addSubGroup = () => {
    if (!subTitle.trim()) return;
    updateCat(selectedCatId, cols => cols.map((c, i) => i === selectedColIdx ? { ...c, extra: [...(c.extra||[]), { id: uid(), title: subTitle, items: [] }] } : c));
    setSubModal(null); setSubTitle(""); toast("Sub-group added!");
  };
  const deleteSubGroup = exIdx => {
    updateCat(selectedCatId, cols => cols.map((c, i) => i === selectedColIdx ? { ...c, extra: c.extra.filter((_, j) => j !== exIdx) } : c));
    toast("Sub-group deleted!");
  };
  const addSubItem = exIdx => {
    const val = (newSubItems[exIdx] || "").trim();
    if (!val) return;
    updateCat(selectedCatId, cols => cols.map((c, i) => i === selectedColIdx ? { ...c, extra: c.extra.map((ex, j) => j === exIdx ? { ...ex, items: [...ex.items, val] } : ex) } : c));
    setNewSubItems(p => ({ ...p, [exIdx]: "" })); toast("Added!");
  };
  const removeSubItem = (exIdx, itemIdx) => {
    updateCat(selectedCatId, cols => cols.map((c, i) => i === selectedColIdx ? { ...c, extra: c.extra.map((ex, j) => j === exIdx ? { ...ex, items: ex.items.filter((_, k) => k !== itemIdx) } : ex) } : c));
  };

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: CHARCOAL }}>Columns & items</h2>
        <p style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>Select Category → Select Column → Manage Items</p>
      </div>

      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
        {/* Category selector */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, padding: "14px 18px", borderBottom: `1px solid ${BORDER}` }}>
          {cats.map(cat => (
            <button key={cat.id} onClick={() => { setSelectedCatId(cat.id); setSelectedColIdx(null); }}
              style={{
                padding: "5px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600,
                cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                background: selectedCatId === cat.id ? GOLD : "transparent",
                color: selectedCatId === cat.id ? WHITE : MUTED,
                border: `1px solid ${selectedCatId === cat.id ? GOLD : BORDER}`,
              }}>
              {cat.name}
            </button>
          ))}
        </div>

        {/* 2-column layout */}
        <div style={{ display: "grid", gridTemplateColumns: "210px 1fr", minHeight: 320 }}>
          {/* Col list */}
          <div style={{ borderRight: `1px solid ${BORDER}`, padding: 8 }}>
            <div style={{ fontSize: 10, color: MUTED, fontWeight: 700, padding: "4px 10px 8px", letterSpacing: "0.8px" }}>COLUMNS</div>
            {!selCat ? (
              <div style={{ fontSize: 12, color: MUTED, padding: "12px 10px" }}>Select category from above</div>
            ) : selCat.columns.map((col, idx) => (
              <div key={col.id} onClick={() => setSelectedColIdx(idx)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "8px 10px", borderRadius: 8, cursor: "pointer", marginBottom: 2,
                  background: selectedColIdx === idx ? SURFACE : "transparent",
                  color: selectedColIdx === idx ? CHARCOAL : MUTED,
                  fontWeight: selectedColIdx === idx ? 600 : 400, fontSize: 13,
                }}>
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{col.title}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <span style={{ fontSize: 10, background: SURFACE, padding: "1px 5px", borderRadius: 10, color: MUTED }}>{col.items.length}</span>
                  <button onClick={e => { e.stopPropagation(); setColModal(idx); setColName(col.title); }}
                    style={{ border: "none", background: "none", cursor: "pointer", color: MUTED, display: "flex" }}><FiEdit2 size={12} /></button>
                  <button onClick={e => { e.stopPropagation(); deleteCol(idx); }}
                    style={{ border: "none", background: "none", cursor: "pointer", color: DANGER, display: "flex" }}><FiTrash2 size={12} /></button>
                </div>
              </div>
            ))}
            {selCat && (
              <button onClick={() => { setColModal("add"); setColName(""); }}
                style={{ width: "100%", marginTop: 6, padding: "7px", border: `1px dashed ${BORDER}`, borderRadius: 8, background: "transparent", color: MUTED, fontSize: 12, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                <FiPlus size={13} /> Add column
              </button>
            )}
          </div>

          {/* Col detail */}
          <div style={{ padding: "16px 20px" }}>
            {!selCol ? (
              <div style={{ textAlign: "center", color: MUTED, fontSize: 13, paddingTop: 48 }}>
                <FiChevronRight size={24} style={{ display: "block", margin: "0 auto 8px" }} />
                Select a column from the left
              </div>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <h4 style={{ fontSize: 14, fontWeight: 600, color: CHARCOAL }}>{selCol.title} <span style={{ fontSize: 12, fontWeight: 400, color: MUTED }}>({selCol.items.length} items)</span></h4>
                </div>

                {/* Items */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 }}>
                  {selCol.items.map((item, j) => (
                    <span key={j} style={{
                      display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px 4px 12px",
                      background: SURFACE, border: `1px solid ${BORDER}`, borderRadius: 20, fontSize: 12, color: CHARCOAL,
                    }}>
                      {item}
                      <button onClick={() => removeItem(j)} style={{ border: "none", background: "none", cursor: "pointer", color: MUTED, display: "flex", padding: "0 1px" }}>
                        <FiX size={13} />
                      </button>
                    </span>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                  <input
                    value={newItem} onChange={e => setNewItem(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addItem()}
                    placeholder="New item name..."
                    style={{ flex: 1, padding: "7px 12px", borderRadius: 8, border: `1px solid ${BORDER}`, fontSize: 13, color: CHARCOAL, fontFamily: "inherit", outline: "none" }}
                    onFocus={e => e.target.style.borderColor = GOLD}
                    onBlur={e => e.target.style.borderColor = BORDER}
                  />
                  <Btn variant="primary" size="sm" onClick={addItem}><FiPlus size={14} /> Add</Btn>
                </div>

                {/* Sub-groups */}
                {selCol.extra && selCol.extra.length > 0 && (
                  <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 14, marginBottom: 12 }}>
                    <div style={{ fontSize: 11, color: MUTED, fontWeight: 700, letterSpacing: "0.8px", marginBottom: 10 }}>SUB-GROUPS</div>
                    {selCol.extra.map((ex, ei) => (
                      <div key={ex.id} style={{ background: SURFACE, borderRadius: 8, padding: 12, marginBottom: 10 }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: CHARCOAL }}>{ex.title}</span>
                          <Btn size="sm" variant="danger" onClick={() => deleteSubGroup(ei)}><FiTrash2 size={12} /></Btn>
                        </div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 5, marginBottom: 8 }}>
                          {ex.items.map((it, ji) => (
                            <span key={ji} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 8px 3px 10px", background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 20, fontSize: 11, color: CHARCOAL }}>
                              {it}
                              <button onClick={() => removeSubItem(ei, ji)} style={{ border: "none", background: "none", cursor: "pointer", color: MUTED, display: "flex" }}><FiX size={12} /></button>
                            </span>
                          ))}
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          <input
                            value={newSubItems[ei] || ""} onChange={e => setNewSubItems(p => ({ ...p, [ei]: e.target.value }))}
                            onKeyDown={e => e.key === "Enter" && addSubItem(ei)}
                            placeholder="Sub item..."
                            style={{ flex: 1, padding: "5px 10px", borderRadius: 8, border: `1px solid ${BORDER}`, fontSize: 12, color: CHARCOAL, fontFamily: "inherit", outline: "none" }}
                          />
                          <Btn size="sm" variant="primary" onClick={() => addSubItem(ei)}><FiPlus size={13} /></Btn>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Btn size="sm" onClick={() => { setSubModal(true); setSubTitle(""); }}>
                  <FiPlus size={13} /> Add sub-group
                </Btn>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {colModal !== null && (
        <Modal
          title={colModal === "add" ? "Add new column" : "Rename column"}
          onClose={() => setColModal(null)}
          footer={<>
            <Btn onClick={() => setColModal(null)}>Cancel</Btn>
            <Btn variant="primary" onClick={colModal === "add" ? addCol : renameCol}><FiSave size={14} /> Save</Btn>
          </>}
        >
          <FormGroup label="Column title (e.g., Ethnic Wear)">
            <Input value={colName} onChange={setColName} placeholder="Ethnic Wear" />
          </FormGroup>
        </Modal>
      )}
      {subModal && (
        <Modal
          title="Add sub-group"
          onClose={() => setSubModal(null)}
          footer={<>
            <Btn onClick={() => setSubModal(null)}>Cancel</Btn>
            <Btn variant="primary" onClick={addSubGroup}><FiSave size={14} /> Add</Btn>
          </>}
        >
          <FormGroup label="Group title (e.g., Lingerie & Sleepwear)">
            <Input value={subTitle} onChange={setSubTitle} placeholder="Lingerie & Sleepwear" />
          </FormGroup>
        </Modal>
      )}
    </div>
  );
}

// ─── PAGE: PREVIEW ───────────────────────────────────────────
function PreviewPage({ navItems }) {
  const [hovered, setHovered] = useState(null);
  const active = [...navItems].filter(x => x.active).sort((a, b) => a.order - b.order);
  const hovCat = active.find(x => x.id === hovered);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: CHARCOAL }}>Preview</h2>
        <p style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>Hover over a navbar item to see the mega menu preview</p>
      </div>
      <div style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden" }}>
        {/* Navbar bar */}
        <div style={{ display: "flex", alignItems: "center", gap: 0, padding: "0 24px", height: 56, borderBottom: `1px solid ${BORDER}`, background: SURFACE }}>
          <span style={{ fontSize: 16, fontWeight: 800, color: GOLD, marginRight: 32, letterSpacing: "1px" }}>RV</span>
          {active.map(item => (
            <div key={item.id} onMouseEnter={() => setHovered(item.id)} onMouseLeave={() => setHovered(null)}
              style={{
                padding: "0 16px", height: "100%", display: "flex", alignItems: "center",
                fontSize: 12, fontWeight: 700, letterSpacing: "0.6px", cursor: "pointer",
                color: item.special ? DANGER : hovered === item.id ? GOLD_DARK : CHARCOAL,
                borderBottom: `2px solid ${hovered === item.id && !item.special ? GOLD : "transparent"}`,
                transition: "all 0.15s",
              }}>
              {item.name}
            </div>
          ))}
        </div>

        {/* Mega menu */}
        {hovCat && hovCat.columns.length > 0 && (
          <div onMouseEnter={() => setHovered(hovCat.id)} onMouseLeave={() => setHovered(null)}
            style={{ padding: "24px 28px", borderTop: `2px solid ${GOLD}`, background: WHITE }}>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(hovCat.columns.length, 5)}, 1fr)`, gap: 28 }}>
              {hovCat.columns.map(col => (
                <div key={col.id}>
                  <div style={{ fontSize: 11, fontWeight: 700, background: GOLD_LIGHT, color: GOLD_DARK, padding: "2px 8px", borderRadius: 4, display: "inline-block", marginBottom: 10 }}>{col.title}</div>
                  {col.items.slice(0, 7).map((it, i) => (
                    <div key={i} style={{ fontSize: 12, color: MUTED, padding: "3px 0" }}>{it}</div>
                  ))}
                  {col.items.length > 7 && <div style={{ fontSize: 11, color: GOLD }}>+{col.items.length - 7} more</div>}
                  {col.extra && col.extra.map(ex => (
                    <div key={ex.id} style={{ marginTop: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, background: GOLD_LIGHT, color: GOLD_DARK, padding: "2px 8px", borderRadius: 4, display: "inline-block", marginBottom: 6 }}>{ex.title}</div>
                      {ex.items.slice(0, 4).map((it, i) => <div key={i} style={{ fontSize: 12, color: MUTED, padding: "2px 0" }}>{it}</div>)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
        {hovCat && hovCat.columns.length === 0 && (
          <div style={{ padding: 20, fontSize: 13, color: MUTED }}>
            Direct link: <strong>{hovCat.link}</strong>
          </div>
        )}
        {!hovered && (
          <div style={{ padding: "32px", textAlign: "center", fontSize: 13, color: MUTED }}>
            Hover over a navbar item above
          </div>
        )}
      </div>
    </div>
  );
}

// ─── ROOT ────────────────────────────────────────────────────
export default function NavbarAdminPanel() {
  const [page, setPage]         = useState("navbar");
  const [navItems, setNavItems] = useState(INITIAL_NAV);
  const [toastMsg, setToastMsg] = useState(null);

  const toast = msg => setToastMsg(msg);

  return (
    <div style={{ display: "flex", height: "100vh", background: SURFACE, fontFamily: "'Segoe UI', system-ui, sans-serif" }}>
      <Sidebar page={page} setPage={setPage} />
      <div style={{ flex: 1, overflowY: "auto", padding: 32 }}>
        {page === "navbar"  && <NavbarPage  navItems={navItems} setNavItems={setNavItems} toast={toast} />}
        {page === "columns" && <ColumnsPage navItems={navItems} setNavItems={setNavItems} toast={toast} />}
        {page === "preview" && <PreviewPage navItems={navItems} />}
      </div>
      {toastMsg && <Toast message={toastMsg} onDone={() => setToastMsg(null)} />}
    </div>
  );
}