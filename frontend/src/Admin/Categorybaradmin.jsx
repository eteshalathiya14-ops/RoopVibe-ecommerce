import { useState } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiMenu, FiSave, FiUpload, FiImage, FiChevronDown } from "react-icons/fi";
import { useAdminData } from "./context/Admindatacontext";
import {
  Btn, Modal, FormGroup, Input, Toggle, Toast,
  PageHeader, Section, RowItem, Badge,
  GOLD, GOLD_DARK, GOLD_LIGHT, CHARCOAL, MUTED, BORDER, WHITE, SURFACE,
} from "./Adminshared";

// Navbar structure — same as your NavbarAdmin initial data
// This gives dropdown options for link selection
const NAVBAR_STRUCTURE = [
  {
    name: "WOMEN",
    columns: [
      { title: "Ethnic Wear",        items: ["Kurta Kurtis","Sarees","Ethnic Sets","Lehengas And Blouse","Ethnic Dresses","Skirts","Shawls & Dupattas"] },
      { title: "Western Wear",       items: ["Dresses","Tops","Tunics","T-Shirts","Jeans & Jeggings","Trousers","Co Ord Set","Shorts"] },
      { title: "Sports & Activewear",items: ["Swim Wear","Tights","Track Pants","Sports Bra"] },
      { title: "Lingerie & Sleepwear",items: ["Bra","Panties","Lingerie Sets","Sleepwear"] },
      { title: "Jewellery",          items: ["Imitation Jewellery","Earrings","Necklace & Pendants","Rings & Bangles"] },
    ],
  },
  {
    name: "MEN",
    columns: [
      { title: "Top Wear",    items: ["Casual Shirts","Formal Shirts","T-Shirts","Polo T Shirts","Suits & Blazers"] },
      { title: "Bottom Wear", items: ["Cargos","Jeans","Joggers","Shorts","Formal Trousers"] },
      { title: "Ethnic Wear", items: ["Kurtas","Nehru Jackets","Waist Coat","Ethnic Sets"] },
    ],
  },
  {
    name: "KIDS",
    columns: [
      { title: "Boys",     items: ["T-Shirts","Shirts","Bottom Wear","Ethnic Wear","Coats & Jackets"] },
      { title: "Girls",    items: ["Dresses & Frocks","Tees & Tops","Ethnic Wear","Party Gowns"] },
      { title: "Footwear", items: ["Sandals","Casual Shoes","Sports Shoes"] },
    ],
  },
  {
    name: "HOME",
    columns: [
      { title: "Bedding", items: ["Bed Sheets","Pillow Covers","Blankets","Comforters"] },
      { title: "Decor",   items: ["Wall Art","Cushions","Candles","Photo Frames"] },
      { title: "Kitchen", items: ["Cookware","Storage","Serveware"] },
    ],
  },
];

const DEFAULT_GENDERS = ["WOMEN", "MEN", "GIRLS", "BOYS"];
const EMPTY_CAT = { label: "", img: "", imgName: "", link: "", active: true, isMy: false };

// ── Link Selector Dropdown ──────────────────────────────────
function LinkSelector({ value, onChange }) {
  const [open, setOpen]       = useState(false);
  const [selNav, setSelNav]   = useState(null);  // selected navbar item
  const [selCol, setSelCol]   = useState(null);  // selected column

  const navItem  = NAVBAR_STRUCTURE.find(n => n.name === selNav);
  const colItem  = navItem?.columns.find(c => c.title === selCol);

  const selectSubItem = (subItem) => {
    // Build path: /category/navName/colName/subItem  (all lowercase, spaces → hyphens)
    const path = [selNav, selCol, subItem]
      .map(s => s.toLowerCase().replace(/\s+/g, "-").replace(/[&]/g, "").replace(/--+/g, "-"))
      .join("/");
    onChange("/" + path);
    setOpen(false);
  };

  const selectCol = (colTitle) => {
    const path = [selNav, colTitle]
      .map(s => s.toLowerCase().replace(/\s+/g, "-").replace(/[&]/g, "").replace(/--+/g, "-"))
      .join("/");
    onChange("/" + path);
    setSelCol(colTitle);
    // don't close — let them pick sub item too
  };

  const selectNav = (navName) => {
    const path = navName.toLowerCase();
    onChange("/" + path);
    setSelNav(navName);
    setSelCol(null);
  };

  return (
    <div style={{ position: "relative" }}>
      {/* Trigger button */}
      <div
        onClick={() => setOpen(o => !o)}
        style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "8px 12px", borderRadius: 8, border: `1px solid ${open ? GOLD : BORDER}`,
          background: WHITE, cursor: "pointer", fontSize: 13, color: value ? CHARCOAL : MUTED,
          userSelect: "none",
        }}
      >
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {value || "Select link from navbar structure…"}
        </span>
        <FiChevronDown size={14} color={MUTED} style={{ flexShrink: 0, marginLeft: 6, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </div>

      {/* Dropdown panel */}
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 999,
          background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 10,
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)", overflow: "hidden",
        }}>
          <div style={{ display: "grid", gridTemplateColumns: selNav ? (selCol ? "1fr 1fr 1fr" : "1fr 1fr") : "1fr" }}>

            {/* Level 1: Navbar items */}
            <div style={{ borderRight: selNav ? `1px solid ${BORDER}` : "none" }}>
              <div style={{ padding: "8px 12px 4px", fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: "0.8px" }}>NAVBAR</div>
              {NAVBAR_STRUCTURE.map(n => (
                <div
                  key={n.name}
                  onClick={() => selectNav(n.name)}
                  style={{
                    padding: "9px 14px", fontSize: 13, cursor: "pointer",
                    fontWeight: selNav === n.name ? 700 : 400,
                    color: selNav === n.name ? GOLD_DARK : CHARCOAL,
                    background: selNav === n.name ? GOLD_LIGHT : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                  }}
                >
                  {n.name}
                  {selNav === n.name && <FiChevronDown size={12} style={{ transform: "rotate(-90deg)" }} />}
                </div>
              ))}
            </div>

            {/* Level 2: Columns */}
            {selNav && navItem && (
              <div style={{ borderRight: selCol ? `1px solid ${BORDER}` : "none" }}>
                <div style={{ padding: "8px 12px 4px", fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: "0.8px" }}>CATEGORY</div>
                {navItem.columns.map(col => (
                  <div
                    key={col.title}
                    onClick={() => selectCol(col.title)}
                    style={{
                      padding: "9px 14px", fontSize: 12, cursor: "pointer",
                      fontWeight: selCol === col.title ? 700 : 400,
                      color: selCol === col.title ? GOLD_DARK : CHARCOAL,
                      background: selCol === col.title ? GOLD_LIGHT : "transparent",
                      display: "flex", alignItems: "center", justifyContent: "space-between",
                    }}
                  >
                    {col.title}
                    {selCol === col.title && <FiChevronDown size={12} style={{ transform: "rotate(-90deg)" }} />}
                  </div>
                ))}
              </div>
            )}

            {/* Level 3: Sub items */}
            {selCol && colItem && (
              <div>
                <div style={{ padding: "8px 12px 4px", fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: "0.8px" }}>SUB-CATEGORY</div>
                {colItem.items.map(item => (
                  <div
                    key={item}
                    onClick={() => selectSubItem(item)}
                    style={{
                      padding: "9px 14px", fontSize: 12, cursor: "pointer",
                      color: CHARCOAL,
                      background: value?.endsWith(item.toLowerCase().replace(/\s+/g, "-")) ? GOLD_LIGHT : "transparent",
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Manual input + close */}
          <div style={{ borderTop: `1px solid ${BORDER}`, padding: "8px 12px", display: "flex", gap: 8, alignItems: "center" }}>
            <input
              value={value}
              onChange={e => onChange(e.target.value)}
              placeholder="Or type path manually…"
              style={{
                flex: 1, padding: "6px 10px", border: `1px solid ${BORDER}`, borderRadius: 7,
                fontSize: 12, fontFamily: "inherit", outline: "none", color: CHARCOAL,
              }}
            />
            <Btn size="sm" onClick={() => setOpen(false)}>Done</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Component ──────────────────────────────────────────
export default function CategoryBarAdmin() {
  const { categories, addCategory, updateCategory, deleteCategory } = useAdminData();
  const [selectedGender, setSelectedGender] = useState("WOMEN");
  const [modal, setModal] = useState(null);
  const [form,  setForm]  = useState(EMPTY_CAT);
  const [toast, setToast] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const genders = Object.keys(categories).length ? Object.keys(categories) : DEFAULT_GENDERS;
  const items   = [...(categories[selectedGender] || [])].sort((a, b) => a.order - b.order);

  const openAdd  = ()    => { setForm(EMPTY_CAT); setModal("add"); };
  const openEdit = cat   => { setForm({ ...cat }); setModal(cat); };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      set("img", ev.target.result);
      set("imgName", file.name);
    };
    reader.readAsDataURL(file);
  };

  const save = () => {
    if (!form.label.trim()) return alert("Label is required!");
    if (modal === "add") addCategory(selectedGender, form);
    else updateCategory(selectedGender, { ...modal, ...form });
    setModal(null);
    setToast(modal === "add" ? "Category added!" : "Updated!");
  };

  const remove = id => {
    if (!window.confirm("Delete this category?")) return;
    deleteCategory(selectedGender, id);
    setToast("Deleted!");
  };

  const totalActive = items.filter(x => x.active).length;

  return (
    <div>
      <PageHeader title="Category Bar" sub="Homepage arch categories — upload images from device & set links from navbar" />

      {/* Gender tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {genders.map(g => (
          <button key={g} onClick={() => setSelectedGender(g)}
            style={{
              padding: "6px 18px", borderRadius: 20, fontSize: 12, fontWeight: 600,
              cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
              background: selectedGender === g ? GOLD : WHITE,
              color: selectedGender === g ? WHITE : MUTED,
              border: `1px solid ${selectedGender === g ? GOLD : BORDER}`,
            }}>
            {g}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
        {[["Total items", items.length], ["Active", totalActive], ["Hidden", items.length - totalActive]].map(([l, v]) => (
          <div key={l} style={{ background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "12px 16px" }}>
            <div style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>{l}</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: CHARCOAL }}>{v}</div>
          </div>
        ))}
      </div>

      {/* List */}
      <Section
        title={`${selectedGender} — arch items`}
        action={<Btn variant="primary" size="sm" onClick={openAdd}><FiPlus size={14} /> Add item</Btn>}
      >
        {items.map((cat, idx) => (
          <RowItem key={cat.id} last={idx === items.length - 1}
            left={
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <FiMenu size={16} color={BORDER} style={{ cursor: "grab" }} />
                {cat.isMy ? (
                  <div style={{
                    width: 44, height: 54, borderRadius: "22px 22px 6px 6px",
                    background: `linear-gradient(135deg,${GOLD_LIGHT},${GOLD}22)`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: `1.5px solid ${GOLD}`, flexShrink: 0,
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: GOLD_DARK }}>MY</span>
                  </div>
                ) : (
                  <div style={{
                    width: 44, height: 54, borderRadius: "22px 22px 6px 6px",
                    overflow: "hidden", flexShrink: 0,
                    border: `1.5px solid ${BORDER}`, background: SURFACE,
                  }}>
                    {cat.img
                      ? <img src={cat.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                      : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <FiImage size={16} color={BORDER} />
                        </div>
                    }
                  </div>
                )}
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: CHARCOAL }}>{cat.label}</div>
                  {cat.link && <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>{cat.link}</div>}
                  {cat.isMy && <Badge>MY FEED</Badge>}
                  {!cat.active && <Badge color="#FDECEA" text="#C0392B">HIDDEN</Badge>}
                </div>
              </div>
            }
            right={<>
              <Toggle value={cat.active} onChange={v => updateCategory(selectedGender, { ...cat, active: v })} />
              <Btn size="sm" onClick={() => openEdit(cat)}><FiEdit2 size={13} /></Btn>
              {!cat.isMy && <Btn size="sm" variant="danger" onClick={() => remove(cat.id)}><FiTrash2 size={13} /></Btn>}
            </>}
          />
        ))}
        {!items.length && (
          <div style={{ padding: 32, textAlign: "center", color: MUTED, fontSize: 13 }}>
            No items. Click "Add item" to create one.
          </div>
        )}
      </Section>

      {/* Add / Edit Modal */}
      {modal && (
        <Modal
          title={modal === "add" ? "New category item" : `Edit: ${modal.label}`}
          onClose={() => setModal(null)}
          footer={<>
            <Btn onClick={() => setModal(null)}>Cancel</Btn>
            <Btn variant="primary" onClick={save}><FiSave size={14} /> Save</Btn>
          </>}
        >
          {/* Label */}
          <FormGroup label="Label (e.g. SAREES)">
            <Input value={form.label} onChange={v => set("label", v.toUpperCase())} placeholder="SAREES" />
          </FormGroup>

          {/* Image upload from device */}
          <FormGroup label="Category Image — upload from your device">
            <label style={{
              display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
              padding: "10px 14px", border: `1.5px dashed ${form.img ? GOLD : BORDER}`,
              borderRadius: 10, background: form.img ? "#fffdf5" : "#fafafa",
              fontSize: 13, color: MUTED, transition: "border-color 0.2s",
            }}>
              {form.img ? <FiImage size={16} color={GOLD} /> : <FiUpload size={16} />}
              <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {form.imgName || "Click to choose image from device"}
              </span>
              {form.img && (
                <span style={{ fontSize: 11, color: "#27ae60", fontWeight: 700, background: "#eafaf1", padding: "2px 8px", borderRadius: 20 }}>
                  ✓ Selected
                </span>
              )}
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageUpload} />
            </label>

            {/* Image preview — arch shape */}
            {form.img && (
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
                <div style={{
                  width: 60, height: 74, borderRadius: "30px 30px 6px 6px",
                  overflow: "hidden", border: `1.5px solid ${GOLD}`, flexShrink: 0,
                }}>
                  <img src={form.img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: CHARCOAL, fontWeight: 600 }}>{form.imgName}</div>
                  <button
                    onClick={() => { set("img", ""); set("imgName", ""); }}
                    style={{ fontSize: 11, color: "#C0392B", background: "none", border: "none", cursor: "pointer", padding: 0, marginTop: 4 }}
                  >
                    × Remove image
                  </button>
                </div>
              </div>
            )}
          </FormGroup>

          {/* Link selector */}
          <FormGroup label="Link — select from navbar structure">
            <LinkSelector value={form.link} onChange={v => set("link", v)} />
            {form.link && (
              <div style={{ marginTop: 6, fontSize: 11, color: GOLD_DARK, background: GOLD_LIGHT, padding: "5px 10px", borderRadius: 6 }}>
                Path: <strong>{form.link}</strong>
              </div>
            )}
          </FormGroup>

          {/* Order */}
          <FormGroup label="Order number">
            <Input value={form.order || 0} onChange={v => set("order", parseInt(v) || 0)} type="number" />
          </FormGroup>
        </Modal>
      )}

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}