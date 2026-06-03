/**
 * CategoryBarAdmin.jsx — BACKEND CONNECTED
 * Admin can manage arch categories for WOMEN / MEN / GIRLS / BOYS + any custom gender
 * Images uploaded from device, stored as base64 in MongoDB
 * FIX 1: Admin can add new gender tabs dynamically
 * FIX 2: Links stored without /category prefix — frontend adds it
 */
import { useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiMenu, FiSave, FiUpload, FiImage, FiChevronDown, FiX } from "react-icons/fi";
import { useAdminData } from "./context/Admindatacontext";
import {
  Btn, Modal, FormGroup, Input, Toggle, Toast,
  PageHeader, Section, RowItem, Badge,
  GOLD, GOLD_DARK, GOLD_LIGHT, CHARCOAL, MUTED, BORDER, WHITE, SURFACE,
} from "./Adminshared";

const NAVBAR_STRUCTURE = [
  { name: "WOMEN", columns: [
    { title: "Ethnic Wear",          items: ["Kurta Kurtis","Sarees","Ethnic Sets","Lehengas And Blouse","Ethnic Dresses","Skirts","Shawls & Dupattas"] },
    { title: "Western Wear",         items: ["Dresses","Tops","Tunics","T-Shirts","Jeans & Jeggings","Trousers","Co Ord Set","Shorts"] },
    { title: "Sports & Activewear",  items: ["Swim Wear","Tights","Track Pants","Sports Bra"] },
    { title: "Lingerie & Sleepwear", items: ["Bra","Panties","Lingerie Sets","Sleepwear"] },
    { title: "Jewellery",            items: ["Imitation Jewellery","Earrings","Necklace & Pendants","Rings & Bangles"] },
    { title: "Footwear",             items: ["Heels","Flats","Sandals","Boots","Sports Shoes"] },
  ]},
  { name: "MEN", columns: [
    { title: "Top Wear",    items: ["Casual Shirts","Formal Shirts","T-Shirts","Polo T Shirts","Suits & Blazers"] },
    { title: "Bottom Wear", items: ["Cargos","Jeans","Joggers","Shorts","Formal Trousers"] },
    { title: "Ethnic Wear", items: ["Kurtas","Nehru Jackets","Waist Coat","Ethnic Sets"] },
    { title: "Footwear",    items: ["Casual Shoes","Formal Shoes","Sandals","Sports Shoes","Slippers"] },
  ]},
  { name: "KIDS", columns: [
    { title: "Boys",     items: ["T-Shirts","Shirts","Bottom Wear","Ethnic Wear","Coats & Jackets"] },
    { title: "Girls",    items: ["Dresses & Frocks","Tees & Tops","Ethnic Wear","Party Gowns"] },
    { title: "Footwear", items: ["Sandals","Casual Shoes","Sports Shoes"] },
  ]},
  { name: "HOME", columns: [
    { title: "Bedding", items: ["Bed Sheets","Pillow Covers","Blankets","Comforters"] },
    { title: "Decor",   items: ["Wall Art","Cushions","Candles","Photo Frames"] },
    { title: "Kitchen", items: ["Cookware","Storage","Serveware"] },
  ]},
];

// ── Link Selector ─────────────────────────────────────────────
function LinkSelector({ value, onChange }) {
  const [open, setOpen]     = useState(false);
  const [selNav, setSelNav] = useState(null);
  const [selCol, setSelCol] = useState(null);

  const navItem = NAVBAR_STRUCTURE.find(n => n.name === selNav);
  const colItem = navItem?.columns.find(c => c.title === selCol);

  const toSlug = s => s.toLowerCase().replace(/\s+/g,"-").replace(/[&]/g,"").replace(/--+/g,"-");

  // FIX: Links now include /category prefix so React Router can match them
  const selectSubItem = (sub) => {
    const gender = selNav.toLowerCase();
    const cat    = toSlug(selCol);
    const subCat = toSlug(sub);
    onChange(`/category/${gender}/${subCat}`);
    setOpen(false);
  };
  const selectCol = (col) => {
    const gender = selNav.toLowerCase();
    const cat    = toSlug(col);
    onChange(`/category/${gender}/${cat}`);
    setSelCol(col);
  };
  const selectNav = (nav) => {
    onChange(`/category/${nav.toLowerCase()}`);
    setSelNav(nav);
    setSelCol(null);
  };

  return (
    <div style={{ position:"relative" }}>
      <div onClick={() => setOpen(o => !o)} style={{
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"8px 12px", borderRadius:8, border:`1px solid ${open ? GOLD : BORDER}`,
        background:WHITE, cursor:"pointer", fontSize:13, color: value ? CHARCOAL : MUTED,
        userSelect:"none",
      }}>
        <span style={{ flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
          {value || "Select link from navbar…"}
        </span>
        <FiChevronDown size={14} color={MUTED} style={{ flexShrink:0, marginLeft:6,
          transform:open?"rotate(180deg)":"none", transition:"transform 0.2s" }}/>
      </div>

      {open && (
        <div style={{ position:"absolute", top:"calc(100% + 6px)", left:0, right:0, zIndex:999,
          background:WHITE, border:`1px solid ${BORDER}`, borderRadius:10,
          boxShadow:"0 8px 30px rgba(0,0,0,0.12)", overflow:"hidden" }}>
          <div style={{ display:"grid",
            gridTemplateColumns: selNav ? (selCol ? "1fr 1fr 1fr" : "1fr 1fr") : "1fr" }}>

            <div style={{ borderRight: selNav ? `1px solid ${BORDER}` : "none" }}>
              <div style={{ padding:"8px 12px 4px", fontSize:10, fontWeight:700, color:MUTED, letterSpacing:"0.8px" }}>NAVBAR</div>
              {NAVBAR_STRUCTURE.map(n => (
                <div key={n.name} onClick={() => selectNav(n.name)} style={{
                  padding:"9px 14px", fontSize:13, cursor:"pointer",
                  fontWeight: selNav===n.name ? 700 : 400,
                  color: selNav===n.name ? GOLD_DARK : CHARCOAL,
                  background: selNav===n.name ? GOLD_LIGHT : "transparent",
                  display:"flex", alignItems:"center", justifyContent:"space-between",
                }}>
                  {n.name}
                  {selNav===n.name && <FiChevronDown size={12} style={{ transform:"rotate(-90deg)" }}/>}
                </div>
              ))}
            </div>

            {selNav && navItem && (
              <div style={{ borderRight: selCol ? `1px solid ${BORDER}` : "none" }}>
                <div style={{ padding:"8px 12px 4px", fontSize:10, fontWeight:700, color:MUTED, letterSpacing:"0.8px" }}>CATEGORY</div>
                {navItem.columns.map(col => (
                  <div key={col.title} onClick={() => selectCol(col.title)} style={{
                    padding:"9px 14px", fontSize:12, cursor:"pointer",
                    fontWeight: selCol===col.title ? 700 : 400,
                    color: selCol===col.title ? GOLD_DARK : CHARCOAL,
                    background: selCol===col.title ? GOLD_LIGHT : "transparent",
                    display:"flex", alignItems:"center", justifyContent:"space-between",
                  }}>
                    {col.title}
                    {selCol===col.title && <FiChevronDown size={12} style={{ transform:"rotate(-90deg)" }}/>}
                  </div>
                ))}
              </div>
            )}

            {selCol && colItem && (
              <div>
                <div style={{ padding:"8px 12px 4px", fontSize:10, fontWeight:700, color:MUTED, letterSpacing:"0.8px" }}>SUB-CATEGORY</div>
                {colItem.items.map(item => (
                  <div key={item} onClick={() => selectSubItem(item)} style={{
                    padding:"9px 14px", fontSize:12, cursor:"pointer",
                    color: value?.includes(item.toLowerCase().replace(/\s+/g,"-")) ? GOLD_DARK : CHARCOAL,
                    background: value?.includes(item.toLowerCase().replace(/\s+/g,"-")) ? GOLD_LIGHT : "transparent",
                  }}>
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ borderTop:`1px solid ${BORDER}`, padding:"8px 12px",
            display:"flex", gap:8, alignItems:"center" }}>
            <input value={value} onChange={e => onChange(e.target.value)}
              placeholder="Or type path manually… e.g. /category/women/sarees"
              style={{ flex:1, padding:"6px 10px", border:`1px solid ${BORDER}`, borderRadius:7,
                fontSize:12, fontFamily:"inherit", outline:"none", color:CHARCOAL }}/>
            <Btn size="sm" onClick={() => setOpen(false)}>Done</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Add New Gender Tab Modal ──────────────────────────────────
function AddGenderModal({ onClose, onAdd, existingGenders }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");

  const handleAdd = () => {
    const upper = value.trim().toUpperCase();
    if (!upper) { setError("Please enter a name"); return; }
    if (existingGenders.includes(upper)) { setError("This tab already exists"); return; }
    onAdd(upper);
    onClose();
  };

  return (
    <Modal
      title="Add New Gender / Category Tab"
      onClose={onClose}
      footer={<>
        <Btn onClick={onClose}>Cancel</Btn>
        <Btn variant="primary" onClick={handleAdd}><FiPlus size={14}/> Add Tab</Btn>
      </>}
    >
      <FormGroup label="Tab name (e.g. ACCESSORIES, PLUS SIZE, BEAUTY)">
        <Input
          value={value}
          onChange={v => { setValue(v.toUpperCase()); setError(""); }}
          placeholder="PLUS SIZE"
        />
        {error && <div style={{ fontSize:12, color:"#C0392B", marginTop:6 }}>{error}</div>}
      </FormGroup>
      <div style={{ fontSize:12, color:MUTED, marginTop:8, lineHeight:1.6 }}>
        This creates a new gender/section tab on the homepage category bar.
        You can add category images to it after creating the tab.
      </div>
    </Modal>
  );
}

// ── Main ──────────────────────────────────────────────────────
const EMPTY_CAT = { label:"", img:"", imgName:"", link:"", active:true, isMy:false, order:0 };

export default function CategoryBarAdmin() {
  const { categories, addCategory, updateCategory, deleteCategory, loading } = useAdminData();
  const [selectedGender, setSelectedGender] = useState("WOMEN");
  const [modal, setModal]         = useState(null);
  const [showAddGender, setShowAddGender] = useState(false);
  const [form,  setForm]          = useState(EMPTY_CAT);
  const [toast, setToast]         = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // All genders: from DB + ensure WOMEN/MEN/GIRLS/BOYS always present in UI
  const DEFAULT_GENDERS = ["WOMEN", "MEN", "GIRLS", "BOYS"];
  const dbGenders = Object.keys(categories || {}).map(g => g.toUpperCase());
  const allGenders = [...new Set([...DEFAULT_GENDERS, ...dbGenders])];

  const items = [...(categories?.[selectedGender] || [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const totalActive = items.filter(x => x.active).length;

  const openAdd  = ()    => { setForm({ ...EMPTY_CAT, order: items.length }); setModal("add"); };
  const openEdit = (cat) => { setForm({ ...cat }); setModal(cat); };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { set("img", ev.target.result); set("imgName", file.name); };
    reader.readAsDataURL(file);
  };

  const save = () => {
    if (!form.label.trim()) return alert("Label is required!");
    if (modal === "add") {
      addCategory(selectedGender, form);
      setToast("Category added!");
    } else {
      updateCategory(selectedGender, { ...(typeof modal === "object" ? modal : {}), ...form });
      setToast("Updated!");
    }
    setModal(null);
  };

  const remove = (id) => {
    if (!window.confirm("Delete this category?")) return;
    deleteCategory(selectedGender, id);
    setToast("Deleted!");
  };

  const handleAddGender = (newGender) => {
    // Adding a new gender tab — it will appear once we add a category to it
    // For now just switch to it and open add modal
    setSelectedGender(newGender);
    setToast(`Tab "${newGender}" created! Add your first item.`);
    setForm({ ...EMPTY_CAT, order: 0 });
    setModal("add");
  };

  return (
    <div>
      <PageHeader title="Category Bar"
        sub="Homepage arch categories — upload images from device & set links from navbar" />

      {/* Gender tabs + Add tab button */}
      <div style={{ display:"flex", gap:8, marginBottom:20, flexWrap:"wrap", alignItems:"center" }}>
        {allGenders.map(g => (
          <button key={g} onClick={() => setSelectedGender(g)} style={{
            padding:"6px 18px", borderRadius:20, fontSize:12, fontWeight:600,
            cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s",
            background: selectedGender===g ? GOLD : WHITE,
            color: selectedGender===g ? WHITE : MUTED,
            border:`1px solid ${selectedGender===g ? GOLD : BORDER}`,
          }}>
            {g}
            {/* Show item count badge */}
            {(categories?.[g]?.length > 0) && (
              <span style={{
                marginLeft:6, fontSize:10, background: selectedGender===g ? "rgba(255,255,255,0.3)" : GOLD_LIGHT,
                color: selectedGender===g ? WHITE : GOLD_DARK,
                padding:"1px 6px", borderRadius:10,
              }}>
                {categories[g].length}
              </span>
            )}
          </button>
        ))}

        {/* Add new gender tab button */}
        <button onClick={() => setShowAddGender(true)} style={{
          padding:"6px 14px", borderRadius:20, fontSize:12, fontWeight:600,
          cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s",
          background:"transparent", color:MUTED,
          border:`1.5px dashed ${BORDER}`,
          display:"flex", alignItems:"center", gap:6,
        }}>
          <FiPlus size={13}/> Add Tab
        </button>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:20 }}>
        {[["Total items", items.length], ["Active", totalActive], ["Hidden", items.length - totalActive]].map(([l,v]) => (
          <div key={l} style={{ background:WHITE, border:`1px solid ${BORDER}`, borderRadius:10, padding:"12px 16px" }}>
            <div style={{ fontSize:11, color:MUTED, marginBottom:4 }}>{l}</div>
            <div style={{ fontSize:22, fontWeight:700, color:CHARCOAL }}>{v}</div>
          </div>
        ))}
      </div>

      <Section
        title={`${selectedGender} — arch items`}
        action={<Btn variant="primary" size="sm" onClick={openAdd}><FiPlus size={14}/> Add item</Btn>}
      >
        {loading && !items.length && (
          <div style={{ padding:32, textAlign:"center", color:MUTED, fontSize:13 }}>Loading…</div>
        )}

        {items.map((cat, idx) => {
          const imgSrc = typeof cat.img === "string" ? cat.img : cat.img?.src || "";
          const catId  = cat.id || cat._id;
          return (
            <RowItem key={catId} last={idx === items.length - 1}
              left={
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <FiMenu size={16} color={BORDER} style={{ cursor:"grab" }}/>
                  {cat.isMy ? (
                    <div style={{ width:44, height:54, borderRadius:"22px 22px 6px 6px",
                      background:`linear-gradient(135deg,${GOLD_LIGHT},${GOLD}22)`,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      border:`1.5px solid ${GOLD}`, flexShrink:0 }}>
                      <span style={{ fontSize:11, fontWeight:800, color:GOLD_DARK }}>MY</span>
                    </div>
                  ) : (
                    <div style={{ width:44, height:54, borderRadius:"22px 22px 6px 6px",
                      overflow:"hidden", flexShrink:0, border:`1.5px solid ${BORDER}`, background:SURFACE }}>
                      {imgSrc
                        ? <img src={imgSrc} alt="" style={{ width:"100%", height:"100%",
                            objectFit:"cover", objectPosition:"top" }}
                            onError={e => e.target.style.opacity="0"} />
                        : <div style={{ width:"100%", height:"100%", display:"flex",
                            alignItems:"center", justifyContent:"center" }}>
                            <FiImage size={16} color={BORDER}/>
                          </div>
                      }
                    </div>
                  )}
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:CHARCOAL }}>{cat.label}</div>
                    {cat.link && (
                      <div style={{ fontSize:11, color:MUTED, marginTop:2 }}>
                        {cat.link}
                      </div>
                    )}
                    {cat.isMy && <Badge>MY FEED</Badge>}
                    {!cat.active && <Badge color="#FDECEA" text="#C0392B">HIDDEN</Badge>}
                  </div>
                </div>
              }
              right={<>
                <Toggle value={cat.active}
                  onChange={v => updateCategory(selectedGender, { ...cat, id: catId, active:v })} />
                <Btn size="sm" onClick={() => openEdit(cat)}><FiEdit2 size={13}/></Btn>
                {!cat.isMy && (
                  <Btn size="sm" variant="danger" onClick={() => remove(catId)}>
                    <FiTrash2 size={13}/>
                  </Btn>
                )}
              </>}
            />
          );
        })}
        {!loading && !items.length && (
          <div style={{ padding:32, textAlign:"center", color:MUTED, fontSize:13 }}>
            No items for {selectedGender}. Click "Add item" to create one.
          </div>
        )}
      </Section>

      {/* Add / Edit Modal */}
      {modal !== null && (
        <Modal
          title={modal === "add" ? `New ${selectedGender} category item` : `Edit: ${modal.label || ""}`}
          onClose={() => setModal(null)}
          footer={<>
            <Btn onClick={() => setModal(null)}>Cancel</Btn>
            <Btn variant="primary" onClick={save}><FiSave size={14}/> Save</Btn>
          </>}
        >
          <FormGroup label="Label (e.g. SAREES)">
            <Input value={form.label} onChange={v => set("label", v.toUpperCase())} placeholder="SAREES" />
          </FormGroup>

          <FormGroup label="Category Image — upload from your device">
            <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer",
              padding:"10px 14px", border:`1.5px dashed ${form.img ? GOLD : BORDER}`,
              borderRadius:10, background: form.img ? "#fffdf5" : "#fafafa",
              fontSize:13, color:MUTED, transition:"border-color 0.2s" }}>
              {form.img ? <FiImage size={16} color={GOLD}/> : <FiUpload size={16}/>}
              <span style={{ flex:1, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {form.imgName || "Click to choose image from device"}
              </span>
              {form.img && (
                <span style={{ fontSize:11, color:"#27ae60", fontWeight:700,
                  background:"#eafaf1", padding:"2px 8px", borderRadius:20 }}>✓ Selected</span>
              )}
              <input type="file" accept="image/*" style={{ display:"none" }} onChange={handleImageUpload} />
            </label>

            {form.img && (
              <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:10 }}>
                <div style={{ width:60, height:74, borderRadius:"30px 30px 6px 6px",
                  overflow:"hidden", border:`1.5px solid ${GOLD}`, flexShrink:0 }}>
                  <img src={form.img} alt="" style={{ width:"100%", height:"100%",
                    objectFit:"cover", objectPosition:"top" }}/>
                </div>
                <div>
                  <div style={{ fontSize:12, color:CHARCOAL, fontWeight:600 }}>{form.imgName}</div>
                  <button onClick={() => { set("img",""); set("imgName",""); }}
                    style={{ fontSize:11, color:"#C0392B", background:"none", border:"none",
                      cursor:"pointer", padding:0, marginTop:4 }}>× Remove image</button>
                </div>
              </div>
            )}
          </FormGroup>

          <FormGroup label="Link — select from navbar structure">
            <LinkSelector value={form.link} onChange={v => set("link", v)} />
            {form.link && (
              <div style={{ marginTop:6, fontSize:11, color:GOLD_DARK, background:GOLD_LIGHT,
                padding:"5px 10px", borderRadius:6 }}>
                Path: <strong>{form.link}</strong>
              </div>
            )}
          </FormGroup>

          <FormGroup label="Order number">
            <Input value={form.order ?? 0} onChange={v => set("order", parseInt(v)||0)} type="number" />
          </FormGroup>

          <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:4 }}>
            <Toggle value={form.active} onChange={v => set("active", v)} />
            <span style={{ fontSize:13, color:CHARCOAL }}>Active (visible on homepage)</span>
          </div>
        </Modal>
      )}

      {/* Add Gender Tab Modal */}
      {showAddGender && (
        <AddGenderModal
          onClose={() => setShowAddGender(false)}
          onAdd={handleAddGender}
          existingGenders={allGenders}
        />
      )}

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}