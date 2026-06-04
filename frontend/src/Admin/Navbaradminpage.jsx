import { useState, useEffect, useCallback } from "react";
import {
  FiMenu, FiGrid, FiEye, FiPlus, FiEdit2, FiTrash2,
  FiX, FiCheck, FiChevronRight, FiSave, FiAlertCircle,
  FiRefreshCw, FiLoader,
} from "react-icons/fi";
import {
  fetchAllNavbar, addNavItem, updateNavItem,
  deleteNavItem, saveColumns,
} from "../Api/Navbarapi";

// ── Theme ────────────────────────────────────────────────────────
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

let _uid = 1;
const uid = () => `tmp_${_uid++}`;

// ── Reusable components (same as before) ─────────────────────────
function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)}
      style={{ width:40, height:22, borderRadius:11, border:"none", cursor:"pointer",
        background:value ? GOLD : BORDER, position:"relative", transition:"background 0.2s", flexShrink:0 }}>
      <span style={{ position:"absolute", top:3, left:value?20:3, width:16, height:16,
        borderRadius:"50%", background:WHITE, transition:"left 0.2s" }}/>
    </button>
  );
}

function Badge({ children, color=GOLD_LIGHT, text=GOLD_DARK }) {
  return (
    <span style={{ fontSize:10, fontWeight:700, background:color, color:text,
      padding:"2px 7px", borderRadius:20, letterSpacing:"0.4px" }}>
      {children}
    </span>
  );
}

function Btn({ children, onClick, variant="default", size="md", style:sx={}, disabled=false }) {
  const base = { display:"inline-flex", alignItems:"center", gap:6, border:`1px solid ${BORDER}`,
    borderRadius:8, cursor:disabled?"not-allowed":"pointer", fontFamily:"inherit",
    fontWeight:500, transition:"all 0.15s", opacity:disabled?0.5:1 };
  const sizes = { sm:{ padding:"4px 10px", fontSize:12 }, md:{ padding:"8px 16px", fontSize:13 } };
  const variants = {
    default: { background:WHITE,       color:CHARCOAL, borderColor:BORDER },
    primary: { background:GOLD,        color:WHITE,    borderColor:GOLD },
    danger:  { background:"transparent", color:DANGER, borderColor:"#F5C6C6" },
    ghost:   { background:"transparent", color:MUTED,  border:"none" },
  };
  return (
    <button onClick={disabled?undefined:onClick}
      style={{ ...base, ...sizes[size], ...variants[variant], ...sx }}>
      {children}
    </button>
  );
}

function Modal({ title, onClose, children, footer }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.35)", zIndex:1000,
      display:"flex", alignItems:"center", justifyContent:"center" }}
      onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{ background:WHITE, borderRadius:12, width:440, maxWidth:"95vw",
        border:`1px solid ${BORDER}`, boxShadow:"0 20px 60px rgba(0,0,0,0.15)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"16px 20px", borderBottom:`1px solid ${BORDER}` }}>
          <h3 style={{ fontSize:15, fontWeight:600, color:CHARCOAL }}>{title}</h3>
          <Btn variant="ghost" size="sm" onClick={onClose}><FiX size={16}/></Btn>
        </div>
        <div style={{ padding:20 }}>{children}</div>
        {footer && (
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end",
            padding:"14px 20px", borderTop:`1px solid ${BORDER}` }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

function FormGroup({ label, children }) {
  return (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:"block", fontSize:12, color:MUTED, marginBottom:5, fontWeight:500 }}>{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, style:sx={} }) {
  return (
    <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder}
      style={{ width:"100%", padding:"8px 12px", borderRadius:8, border:`1px solid ${BORDER}`,
        fontSize:13, color:CHARCOAL, fontFamily:"inherit", outline:"none",
        background:WHITE, boxSizing:"border-box", ...sx }}
      onFocus={e=>e.target.style.borderColor=GOLD}
      onBlur={e=>e.target.style.borderColor=BORDER}/>
  );
}

function Toast({ message, type="success", onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2500); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position:"fixed", bottom:24, right:24, zIndex:2000,
      background:WHITE, border:`1px solid ${BORDER}`,
      borderLeft:`3px solid ${type==="error" ? DANGER : GOLD}`,
      borderRadius:8, padding:"10px 16px", fontSize:13, color:CHARCOAL,
      boxShadow:"0 4px 20px rgba(0,0,0,0.1)", display:"flex", alignItems:"center", gap:8 }}>
      {type==="error"
        ? <FiAlertCircle size={14} color={DANGER}/>
        : <FiCheck size={14} color={SUCCESS}/>
      }
      {message}
    </div>
  );
}

// Spinner
function Spinner() {
  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", padding:48 }}>
      <div style={{ width:28, height:28, borderRadius:"50%",
        border:`3px solid ${BORDER}`, borderTopColor:GOLD, animation:"spin 0.8s linear infinite" }}/>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── PAGE: NAVBAR MANAGER ─────────────────────────────────────────
function NavbarPage({ navItems, setNavItems, toast, loading, reload }) {
  const [modal, setModal] = useState(null);
  const [form, setForm]   = useState({ name:"", special:false, link:"", order:0 });
  const [saving, setSaving] = useState(false);

  const openAdd = () => {
    setForm({ name:"", special:false, link:"", order:navItems.length });
    setModal("add");
  };
  const openEdit = item => {
    setForm({ name:item.name, special:item.special, link:item.link||"", order:item.order });
    setModal(item);
  };

  const saveAdd = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      const newItem = await addNavItem({
        name:    form.name.toUpperCase(),
        order:   form.order,
        special: !!form.link || form.special,
        link:    form.link,
        active:  true,
        columns: [],
      });
      setNavItems(prev => [...prev, newItem]);
      setModal(null);
      toast("Item added!");
    } catch {
      toast("Failed to add item", "error");
    } finally { setSaving(false); }
  };

  const saveEdit = async () => {
    setSaving(true);
    try {
      const updated = await updateNavItem(modal._id, {
        name:    form.name.toUpperCase(),
        order:   form.order,
        special: !!form.link || form.special,
        link:    form.link,
      });
      setNavItems(prev => prev.map(x => x._id===modal._id ? updated : x));
      setModal(null);
      toast("Saved!");
    } catch {
      toast("Failed to save", "error");
    } finally { setSaving(false); }
  };

  const handleDelete = async id => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await deleteNavItem(id);
      setNavItems(prev => prev.filter(x => x._id!==id));
      toast("Deleted!");
    } catch {
      toast("Failed to delete", "error");
    }
  };

  const handleToggle = async (id, current) => {
    try {
      const updated = await updateNavItem(id, { active:!current });
      setNavItems(prev => prev.map(x => x._id===id ? updated : x));
      toast("Status updated!");
    } catch {
      toast("Failed to update", "error");
    }
  };

  const sorted = [...navItems].sort((a,b) => a.order - b.order);

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <h2 style={{ fontSize:20, fontWeight:700, color:CHARCOAL }}>Navbar items</h2>
            <p style={{ fontSize:13, color:MUTED, marginTop:4 }}>Changes save directly to database — live on site instantly</p>
          </div>
          <Btn size="sm" onClick={reload} style={{ gap:6 }}>
            <FiRefreshCw size={12}/> Refresh
          </Btn>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:24 }}>
        {[
          ["Total items",   navItems.length],
          ["Active",        navItems.filter(x=>x.active).length],
          ["Special links", navItems.filter(x=>x.special).length],
        ].map(([label, val]) => (
          <div key={label} style={{ background:WHITE, border:`1px solid ${BORDER}`, borderRadius:10, padding:"14px 18px" }}>
            <div style={{ fontSize:12, color:MUTED, marginBottom:6 }}>{label}</div>
            <div style={{ fontSize:26, fontWeight:700, color:CHARCOAL }}>{val}</div>
          </div>
        ))}
      </div>

      <div style={{ background:WHITE, border:`1px solid ${BORDER}`, borderRadius:12, overflow:"hidden" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"14px 20px", borderBottom:`1px solid ${BORDER}` }}>
          <h3 style={{ fontSize:14, fontWeight:600, color:CHARCOAL }}>All items</h3>
          <Btn variant="primary" size="sm" onClick={openAdd}><FiPlus size={14}/> Add item</Btn>
        </div>

        {loading ? <Spinner/> : sorted.map((item, idx) => (
          <div key={item._id}
            style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"12px 20px", borderBottom:idx<sorted.length-1?`1px solid ${BORDER}`:"none" }}>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <FiMenu size={16} color={BORDER} style={{ cursor:"grab" }}/>
              <span style={{ fontSize:13, fontWeight:600,
                color:item.active ? CHARCOAL : MUTED, letterSpacing:"0.3px" }}>
                {item.name}
              </span>
              {item.special && <Badge>SPECIAL</Badge>}
              {!item.active && <Badge color="#FDECEA" text={DANGER}>HIDDEN</Badge>}
              <span style={{ fontSize:11, color:MUTED }}>{item.columns?.length||0} columns</span>
            </div>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <Toggle value={item.active} onChange={() => handleToggle(item._id, item.active)}/>
              <Btn size="sm" onClick={() => openEdit(item)}><FiEdit2 size={13}/></Btn>
              <Btn size="sm" variant="danger" onClick={() => handleDelete(item._id)}><FiTrash2 size={13}/></Btn>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <Modal
          title={modal==="add" ? "New nav item" : `Edit: ${modal.name}`}
          onClose={() => setModal(null)}
          footer={<>
            <Btn onClick={() => setModal(null)}>Cancel</Btn>
            <Btn variant="primary" disabled={saving}
              onClick={modal==="add" ? saveAdd : saveEdit}>
              {saving ? <FiLoader size={14}/> : <FiSave size={14}/>} Save
            </Btn>
          </>}>
          <FormGroup label="Name (e.g. SALE, BEAUTY)">
            <Input value={form.name}
              onChange={v => setForm(f=>({...f, name:v.toUpperCase()}))}
              placeholder="SALE"/>
          </FormGroup>
          <FormGroup label="Order (position number)">
            <Input value={form.order}
              onChange={v => setForm(f=>({...f, order:parseInt(v)||0}))}
              placeholder="0"/>
          </FormGroup>
          <FormGroup label="Direct link URL (leave empty for mega menu)">
            <Input value={form.link}
              onChange={v => setForm(f=>({...f, link:v, special:!!v}))}
              placeholder="/sale"/>
          </FormGroup>
          {form.link && (
            <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px",
              background:GOLD_LIGHT, borderRadius:8, fontSize:12, color:GOLD_DARK }}>
              <FiAlertCircle size={14}/> Direct link — mega menu will not be shown
            </div>
          )}
        </Modal>
      )}
    </div>
  );
}

// ── PAGE: COLUMNS & ITEMS ────────────────────────────────────────
function ColumnsPage({ navItems, setNavItems, toast }) {
  const [selectedCatId,  setSelectedCatId]  = useState(null);
  const [selectedColIdx, setSelectedColIdx] = useState(null);
  const [colModal,       setColModal]       = useState(null);
  const [colName,        setColName]        = useState("");
  const [newItem,        setNewItem]        = useState("");
  const [subModal,       setSubModal]       = useState(false);
  const [subTitle,       setSubTitle]       = useState("");
  const [newSubItems,    setNewSubItems]    = useState({});
  const [saving,         setSaving]         = useState(false);

  const cats   = navItems.filter(x => !x.special);
  const selCat = cats.find(x => x._id === selectedCatId);
  const selCol = selCat && selectedColIdx!==null ? selCat.columns[selectedColIdx] : null;

  // After each column change: persist full columns array to backend
  const persist = useCallback(async (catId, newColumns) => {
    setSaving(true);
    try {
      const updated = await saveColumns(catId, newColumns);
      setNavItems(prev => prev.map(x => x._id===catId ? updated : x));
      toast("Saved to database ✓");
    } catch {
      toast("Save failed — retrying…", "error");
    } finally { setSaving(false); }
  }, [setNavItems, toast]);

  const updateCat = (fn) => {
    const newCols = fn(selCat.columns);
    // optimistic update
    setNavItems(prev => prev.map(x => x._id===selectedCatId ? { ...x, columns:newCols } : x));
    persist(selectedCatId, newCols);
    return newCols;
  };

  const addCol = () => {
    if (!colName.trim()) return;
    updateCat(cols => [...cols, { id:uid(), title:colName, items:[], extra:[] }]);
    setColModal(null); setColName("");
  };
  const renameCol = () => {
    if (!colName.trim()) return;
    updateCat(cols => cols.map((c,i) => i===colModal ? {...c, title:colName} : c));
    setColModal(null); setColName(""); setSelectedColIdx(null);
  };
  const deleteCol = idx => {
    if (!window.confirm("Delete this column?")) return;
    updateCat(cols => cols.filter((_,i) => i!==idx));
    setSelectedColIdx(null);
  };
  const addItem = () => {
    if (!newItem.trim()) return;
    updateCat(cols => cols.map((c,i) => i===selectedColIdx ? {...c, items:[...c.items, newItem.trim()]} : c));
    setNewItem("");
  };
  const removeItem = itemIdx => {
    updateCat(cols => cols.map((c,i) => i===selectedColIdx ? {...c, items:c.items.filter((_,j)=>j!==itemIdx)} : c));
  };
  const addSubGroup = () => {
    if (!subTitle.trim()) return;
    updateCat(cols => cols.map((c,i) => i===selectedColIdx ? {...c, extra:[...(c.extra||[]), {id:uid(), title:subTitle, items:[]}]} : c));
    setSubModal(false); setSubTitle("");
  };
  const deleteSubGroup = exIdx => {
    updateCat(cols => cols.map((c,i) => i===selectedColIdx ? {...c, extra:c.extra.filter((_,j)=>j!==exIdx)} : c));
  };
  const addSubItem = exIdx => {
    const val = (newSubItems[exIdx]||"").trim();
    if (!val) return;
    updateCat(cols => cols.map((c,i) => i===selectedColIdx
      ? {...c, extra:c.extra.map((ex,j) => j===exIdx ? {...ex, items:[...ex.items, val]} : ex)}
      : c));
    setNewSubItems(p => ({...p, [exIdx]:""}));
  };
  const removeSubItem = (exIdx, itemIdx) => {
    updateCat(cols => cols.map((c,i) => i===selectedColIdx
      ? {...c, extra:c.extra.map((ex,j) => j===exIdx ? {...ex, items:ex.items.filter((_,k)=>k!==itemIdx)} : ex)}
      : c));
  };

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <h2 style={{ fontSize:20, fontWeight:700, color:CHARCOAL }}>Columns & items</h2>
            <p style={{ fontSize:13, color:MUTED, marginTop:4 }}>
              Select Category → Select Column → Manage Items · Auto-saves to DB
            </p>
          </div>
          {saving && (
            <div style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:GOLD_DARK }}>
              <FiLoader size={13}/> Saving…
            </div>
          )}
        </div>
      </div>

      <div style={{ background:WHITE, border:`1px solid ${BORDER}`, borderRadius:12, overflow:"hidden" }}>
        {/* Category tabs */}
        <div style={{ display:"flex", flexWrap:"wrap", gap:8, padding:"14px 18px", borderBottom:`1px solid ${BORDER}` }}>
          {cats.map(cat => (
            <button key={cat._id}
              onClick={() => { setSelectedCatId(cat._id); setSelectedColIdx(null); }}
              style={{ padding:"5px 14px", borderRadius:20, fontSize:12, fontWeight:600,
                cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s",
                background:selectedCatId===cat._id ? GOLD : "transparent",
                color:selectedCatId===cat._id ? WHITE : MUTED,
                border:`1px solid ${selectedCatId===cat._id ? GOLD : BORDER}` }}>
              {cat.name}
            </button>
          ))}
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"210px 1fr", minHeight:320 }}>
          {/* Column list */}
          <div style={{ borderRight:`1px solid ${BORDER}`, padding:8 }}>
            <div style={{ fontSize:10, color:MUTED, fontWeight:700,
              padding:"4px 10px 8px", letterSpacing:"0.8px" }}>COLUMNS</div>
            {!selCat
              ? <div style={{ fontSize:12, color:MUTED, padding:"12px 10px" }}>Select category above</div>
              : selCat.columns.map((col, idx) => (
                <div key={col._id||col.id||idx}
                  onClick={() => setSelectedColIdx(idx)}
                  style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
                    padding:"8px 10px", borderRadius:8, cursor:"pointer", marginBottom:2,
                    background:selectedColIdx===idx ? SURFACE : "transparent",
                    color:selectedColIdx===idx ? CHARCOAL : MUTED,
                    fontWeight:selectedColIdx===idx ? 600 : 400, fontSize:13 }}>
                  <span style={{ flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{col.title}</span>
                  <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                    <span style={{ fontSize:10, background:SURFACE, padding:"1px 5px", borderRadius:10, color:MUTED }}>
                      {col.items?.length||0}
                    </span>
                    <button onClick={e=>{e.stopPropagation();setColModal(idx);setColName(col.title);}}
                      style={{ border:"none", background:"none", cursor:"pointer", color:MUTED, display:"flex" }}>
                      <FiEdit2 size={12}/>
                    </button>
                    <button onClick={e=>{e.stopPropagation();deleteCol(idx);}}
                      style={{ border:"none", background:"none", cursor:"pointer", color:DANGER, display:"flex" }}>
                      <FiTrash2 size={12}/>
                    </button>
                  </div>
                </div>
              ))
            }
            {selCat && (
              <button onClick={() => { setColModal("add"); setColName(""); }}
                style={{ width:"100%", marginTop:6, padding:"7px",
                  border:`1px dashed ${BORDER}`, borderRadius:8, background:"transparent",
                  color:MUTED, fontSize:12, cursor:"pointer", fontFamily:"inherit",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:4 }}>
                <FiPlus size={13}/> Add column
              </button>
            )}
          </div>

          {/* Column detail */}
          <div style={{ padding:"16px 20px" }}>
            {!selCol
              ? <div style={{ textAlign:"center", color:MUTED, fontSize:13, paddingTop:48 }}>
                  <FiChevronRight size={24} style={{ display:"block", margin:"0 auto 8px" }}/>
                  Select a column from the left
                </div>
              : <>
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
                    <h4 style={{ fontSize:14, fontWeight:600, color:CHARCOAL }}>
                      {selCol.title}{" "}
                      <span style={{ fontSize:12, fontWeight:400, color:MUTED }}>({selCol.items?.length||0} items)</span>
                    </h4>
                  </div>

                  {/* Items chips */}
                  <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:12 }}>
                    {(selCol.items||[]).map((item,j) => (
                      <span key={j} style={{ display:"inline-flex", alignItems:"center", gap:5,
                        padding:"4px 10px 4px 12px", background:SURFACE,
                        border:`1px solid ${BORDER}`, borderRadius:20, fontSize:12, color:CHARCOAL }}>
                        {item}
                        <button onClick={() => removeItem(j)}
                          style={{ border:"none", background:"none", cursor:"pointer", color:MUTED, display:"flex" }}>
                          <FiX size={13}/>
                        </button>
                      </span>
                    ))}
                  </div>
                  <div style={{ display:"flex", gap:8, marginBottom:20 }}>
                    <input value={newItem} onChange={e=>setNewItem(e.target.value)}
                      onKeyDown={e=>e.key==="Enter"&&addItem()}
                      placeholder="New item name…"
                      style={{ flex:1, padding:"7px 12px", borderRadius:8, border:`1px solid ${BORDER}`,
                        fontSize:13, color:CHARCOAL, fontFamily:"inherit", outline:"none" }}
                      onFocus={e=>e.target.style.borderColor=GOLD}
                      onBlur={e=>e.target.style.borderColor=BORDER}/>
                    <Btn variant="primary" size="sm" onClick={addItem}><FiPlus size={14}/> Add</Btn>
                  </div>

                  {/* Sub-groups */}
                  {(selCol.extra||[]).length > 0 && (
                    <div style={{ borderTop:`1px solid ${BORDER}`, paddingTop:14, marginBottom:12 }}>
                      <div style={{ fontSize:11, color:MUTED, fontWeight:700, letterSpacing:"0.8px", marginBottom:10 }}>SUB-GROUPS</div>
                      {(selCol.extra||[]).map((ex, ei) => (
                        <div key={ex.id||ei} style={{ background:SURFACE, borderRadius:8, padding:12, marginBottom:10 }}>
                          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:8 }}>
                            <span style={{ fontSize:12, fontWeight:600, color:CHARCOAL }}>{ex.title}</span>
                            <Btn size="sm" variant="danger" onClick={() => deleteSubGroup(ei)}><FiTrash2 size={12}/></Btn>
                          </div>
                          <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:8 }}>
                            {(ex.items||[]).map((it,ji) => (
                              <span key={ji} style={{ display:"inline-flex", alignItems:"center", gap:4,
                                padding:"3px 8px 3px 10px", background:WHITE,
                                border:`1px solid ${BORDER}`, borderRadius:20, fontSize:11, color:CHARCOAL }}>
                                {it}
                                <button onClick={() => removeSubItem(ei,ji)}
                                  style={{ border:"none", background:"none", cursor:"pointer", color:MUTED, display:"flex" }}>
                                  <FiX size={12}/>
                                </button>
                              </span>
                            ))}
                          </div>
                          <div style={{ display:"flex", gap:6 }}>
                            <input value={newSubItems[ei]||""}
                              onChange={e=>setNewSubItems(p=>({...p,[ei]:e.target.value}))}
                              onKeyDown={e=>e.key==="Enter"&&addSubItem(ei)}
                              placeholder="Sub item…"
                              style={{ flex:1, padding:"5px 10px", borderRadius:8, border:`1px solid ${BORDER}`,
                                fontSize:12, color:CHARCOAL, fontFamily:"inherit", outline:"none" }}/>
                            <Btn size="sm" variant="primary" onClick={() => addSubItem(ei)}><FiPlus size={13}/></Btn>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <Btn size="sm" onClick={() => { setSubModal(true); setSubTitle(""); }}>
                    <FiPlus size={13}/> Add sub-group
                  </Btn>
                </>
            }
          </div>
        </div>
      </div>

      {/* Modals */}
      {colModal!==null && (
        <Modal title={colModal==="add" ? "Add new column" : "Rename column"} onClose={() => setColModal(null)}
          footer={<>
            <Btn onClick={() => setColModal(null)}>Cancel</Btn>
            <Btn variant="primary" onClick={colModal==="add" ? addCol : renameCol}><FiSave size={14}/> Save</Btn>
          </>}>
          <FormGroup label="Column title">
            <Input value={colName} onChange={setColName} placeholder="Ethnic Wear"/>
          </FormGroup>
        </Modal>
      )}
      {subModal && (
        <Modal title="Add sub-group" onClose={() => setSubModal(false)}
          footer={<>
            <Btn onClick={() => setSubModal(false)}>Cancel</Btn>
            <Btn variant="primary" onClick={addSubGroup}><FiSave size={14}/> Add</Btn>
          </>}>
          <FormGroup label="Group title">
            <Input value={subTitle} onChange={setSubTitle} placeholder="Lingerie & Sleepwear"/>
          </FormGroup>
        </Modal>
      )}
    </div>
  );
}

// ── PAGE: PREVIEW ────────────────────────────────────────────────
function PreviewPage({ navItems }) {
  const [hovered, setHovered] = useState(null);
  const active   = [...navItems].filter(x=>x.active).sort((a,b)=>a.order-b.order);
  const hovCat   = active.find(x=>x._id===hovered||x.id===hovered);

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h2 style={{ fontSize:20, fontWeight:700, color:CHARCOAL }}>Preview</h2>
        <p style={{ fontSize:13, color:MUTED, marginTop:4 }}>Live preview — reflects current database state</p>
      </div>
      <div style={{ background:WHITE, border:`1px solid ${BORDER}`, borderRadius:12, overflow:"hidden" }}>
        <div style={{ display:"flex", alignItems:"center", gap:0, padding:"0 24px",
          height:56, borderBottom:`1px solid ${BORDER}`, background:SURFACE }}>
          <span style={{ fontSize:16, fontWeight:800, color:GOLD, marginRight:32, letterSpacing:"1px" }}>RV</span>
          {active.map(item => (
            <div key={item._id||item.id}
              onMouseEnter={() => setHovered(item._id||item.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ padding:"0 16px", height:"100%", display:"flex", alignItems:"center",
                fontSize:12, fontWeight:700, letterSpacing:"0.6px", cursor:"pointer",
                color:item.special ? DANGER : hovered===(item._id||item.id) ? GOLD_DARK : CHARCOAL,
                borderBottom:`2px solid ${hovered===(item._id||item.id)&&!item.special ? GOLD : "transparent"}`,
                transition:"all 0.15s" }}>
              {item.name}
            </div>
          ))}
        </div>
        {hovCat && hovCat.columns?.length > 0 && (
          <div onMouseEnter={() => setHovered(hovCat._id||hovCat.id)} onMouseLeave={() => setHovered(null)}
            style={{ padding:"24px 28px", borderTop:`2px solid ${GOLD}`, background:WHITE }}>
            <div style={{ display:"grid", gridTemplateColumns:`repeat(${Math.min(hovCat.columns.length,5)},1fr)`, gap:28 }}>
              {hovCat.columns.map((col,ci) => (
                <div key={col._id||col.id||ci}>
                  <div style={{ fontSize:11, fontWeight:700, background:GOLD_LIGHT, color:GOLD_DARK,
                    padding:"2px 8px", borderRadius:4, display:"inline-block", marginBottom:10 }}>{col.title}</div>
                  {(col.items||[]).slice(0,7).map((it,i) => (
                    <div key={i} style={{ fontSize:12, color:MUTED, padding:"3px 0" }}>{it}</div>
                  ))}
                  {(col.items||[]).length>7 && <div style={{ fontSize:11, color:GOLD }}>+{col.items.length-7} more</div>}
                  {(col.extra||[]).map((ex,ei) => (
                    <div key={ei} style={{ marginTop:12 }}>
                      <div style={{ fontSize:11, fontWeight:700, background:GOLD_LIGHT, color:GOLD_DARK,
                        padding:"2px 8px", borderRadius:4, display:"inline-block", marginBottom:6 }}>{ex.title}</div>
                      {(ex.items||[]).slice(0,4).map((it,i) => <div key={i} style={{ fontSize:12, color:MUTED, padding:"2px 0" }}>{it}</div>)}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
        {hovCat && (!hovCat.columns||hovCat.columns.length===0) && (
          <div style={{ padding:20, fontSize:13, color:MUTED }}>Direct link: <strong>{hovCat.link}</strong></div>
        )}
        {!hovered && (
          <div style={{ padding:32, textAlign:"center", fontSize:13, color:MUTED }}>
            Hover over a navbar item above
          </div>
        )}
      </div>
    </div>
  );
}

// ── ROOT COMPONENT ───────────────────────────────────────────────
export default function NavbarAdminPage() {
  const [page,     setPage]     = useState("navbar");
  const [navItems, setNavItems] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [toast,    setToast]    = useState(null); // { msg, type }

  const showToast = (msg, type="success") => setToast({ msg, type });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const items = await fetchAllNavbar();
      setNavItems(items);
    } catch {
      showToast("Failed to load navbar data", "error");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const navLinks = [
    { key:"navbar",  icon:<FiMenu size={16}/>,  label:"Navbar items" },
    { key:"columns", icon:<FiGrid size={16}/>,  label:"Columns & items" },
    { key:"preview", icon:<FiEye size={16}/>,   label:"Preview" },
  ];

  return (
    <div>
      {/* Tab nav inside admin content area */}
      <div style={{ display:"flex", gap:4, marginBottom:24, borderBottom:`1px solid ${BORDER}`, paddingBottom:0 }}>
        {navLinks.map(n => (
          <button key={n.key} onClick={() => setPage(n.key)}
            style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 16px",
              background:"none", border:"none", cursor:"pointer", fontFamily:"inherit",
              fontSize:13, fontWeight:page===n.key?700:400,
              color:page===n.key ? GOLD_DARK : MUTED,
              borderBottom:`2.5px solid ${page===n.key ? GOLD : "transparent"}`,
              marginBottom:-1, transition:"all 0.15s" }}>
            {n.icon} {n.label}
          </button>
        ))}
      </div>

      {page==="navbar"  && <NavbarPage  navItems={navItems} setNavItems={setNavItems} toast={showToast} loading={loading} reload={loadData}/>}
      {page==="columns" && <ColumnsPage navItems={navItems} setNavItems={setNavItems} toast={showToast}/>}
      {page==="preview" && <PreviewPage navItems={navItems}/>}

      {toast && <Toast message={toast.msg} type={toast.type} onDone={() => setToast(null)}/>}
    </div>
  );
}