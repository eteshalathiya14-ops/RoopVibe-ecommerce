/**
 * ProductAdmin.jsx — FIXED
 * 1. Custom dropdown value: inline input field (no alert box)
 * 2. Custom options saved in localStorage per product type + field
 * 3. On edit, previously saved custom options show in dropdown
 * 4. All other logic preserved
 */
import { useState, useRef } from "react";
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiUpload, FiImage, FiChevronDown } from "react-icons/fi";

import { useAdminData } from "./context/Admindatacontext";
import {
  Btn, Modal, FormGroup, Input, TextArea, Select, Toggle, Toast,
  PageHeader, Section, RowItem, Badge, MetricCard,
  GOLD, GOLD_DARK, GOLD_LIGHT, CHARCOAL, MUTED, BORDER, WHITE, SURFACE, DANGER,
} from "./Adminshared";

let _pid = 200;
const genId = () => `pid_${_pid++}`;

// ── Custom options storage (per productType + field) ──────────
const CUSTOM_OPTS_KEY = "rvibe_admin_custom_opts";

function getCustomOpts() {
  try {
    const saved = localStorage.getItem(CUSTOM_OPTS_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch { return {}; }
}

function saveCustomOpt(productType, field, value) {
  const all = getCustomOpts();
  const key = `${productType}__${field}`;
  if (!all[key]) all[key] = [];
  if (!all[key].includes(value)) {
    all[key] = [...all[key], value];
    try { localStorage.setItem(CUSTOM_OPTS_KEY, JSON.stringify(all)); } catch {}
  }
}

function getCustomOptsForField(productType, field) {
  const all = getCustomOpts();
  return all[`${productType}__${field}`] || [];
}

// ── Navbar Structure ───────────────────────────────────────
const NAVBAR_STRUCTURE = [
  {
    name: "WOMEN",
    columns: [
      { title: "Ethnic Wear",          items: ["Kurta Kurtis","Sarees","Ethnic Sets","Lehengas And Blouse","Ethnic Dresses","Skirts","Shawls & Dupattas"] },
      { title: "Western Wear",         items: ["Dresses","Tops","Tunics","T-Shirts","Jeans & Jeggings","Trousers","Co Ord Set","Shorts"] },
      { title: "Sports & Activewear",  items: ["Swim Wear","Tights","Track Pants","Sports Bra"] },
      { title: "Lingerie & Sleepwear", items: ["Bra","Panties","Lingerie Sets","Sleepwear"] },
      { title: "Jewellery",            items: ["Imitation Jewellery","Earrings","Necklace & Pendants","Rings & Bangles"] },
      { title: "Footwear",             items: ["Heels","Flats","Sandals","Boots","Sports Shoes"] },
    ],
  },
  {
    name: "MEN",
    columns: [
      { title: "Top Wear",    items: ["Casual Shirts","Formal Shirts","T-Shirts","Polo T Shirts","Suits & Blazers"] },
      { title: "Bottom Wear", items: ["Cargos","Jeans","Joggers","Shorts","Formal Trousers"] },
      { title: "Ethnic Wear", items: ["Kurtas","Nehru Jackets","Waist Coat","Ethnic Sets"] },
      { title: "Footwear",    items: ["Casual Shoes","Formal Shoes","Sandals","Sports Shoes","Slippers"] },
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

// ── Product Type Detection ─────────────────────────────────
function getProductType(navName, colTitle, subItem) {
  const s = `${navName} ${colTitle} ${subItem}`.toLowerCase();
  if (s.includes("footwear") || s.includes("shoes") || s.includes("heels") || s.includes("sandals") || s.includes("boots") || s.includes("slippers") || s.includes("flats")) return "footwear";
  if (s.includes("jewellery") || s.includes("earring") || s.includes("necklace") || s.includes("ring") || s.includes("bangle") || s.includes("imitation")) return "jewellery";
  if (s.includes("bedding") || s.includes("bed sheet") || s.includes("pillow") || s.includes("blanket") || s.includes("comforter")) return "bedding";
  if (s.includes("decor") || s.includes("wall art") || s.includes("cushion") || s.includes("candle") || s.includes("photo frame")) return "decor";
  if (s.includes("kitchen") || s.includes("cookware") || s.includes("storage") || s.includes("serveware")) return "kitchen";
  if (s.includes("lingerie") || s.includes("bra") || s.includes("panties") || s.includes("sleepwear")) return "lingerie";
  if (s.includes("sports") || s.includes("activewear") || s.includes("swim") || s.includes("track") || s.includes("tights")) return "sports";
  if (s.includes("saree")) return "saree";
  if (s.includes("lehenga")) return "lehenga";
  if (s.includes("kurta") || s.includes("ethnic wear") || s.includes("ethnic sets") || s.includes("ethnic dress") || s.includes("skirt") || s.includes("dupatta") || s.includes("shawl") || s.includes("nehru") || s.includes("waist coat")) return "ethnic";
  if (s.includes("jeans") || s.includes("trousers") || s.includes("cargos") || s.includes("joggers") || s.includes("shorts") || s.includes("bottom wear")) return "bottom";
  if (s.includes("shirt") || s.includes("t-shirt") || s.includes("top") || s.includes("tunic") || s.includes("dress") || s.includes("co ord") || s.includes("suit") || s.includes("blazer") || s.includes("polo")) return "top";
  if (s.includes("kids") || s.includes("boys") || s.includes("girls")) return "kids_clothing";
  return "clothing";
}

// ── Size Sets ──────────────────────────────────────────────
const SIZE_SETS = {
  clothing:      ["XS","S","M","L","XL","XXL","XXXL","Free Size"],
  ethnic:        ["XS","S","M","L","XL","XXL","XXXL","Free Size"],
  top:           ["XS","S","M","L","XL","XXL","XXXL","Free Size"],
  bottom:        ["28","30","32","34","36","38","40","Free Size"],
  saree:         ["Free Size"],
  lehenga:       ["XS","S","M","L","XL","XXL","Free Size"],
  lingerie:      ["28B","30B","32B","34B","36B","38B","XS","S","M","L","XL"],
  sports:        ["XS","S","M","L","XL","XXL","Free Size"],
  footwear:      ["3","4","5","6","7","8","9","10","11","12"],
  jewellery:     ["Free Size"],
  bedding:       ["Single","Double","Queen","King"],
  decor:         [],
  kitchen:       [],
  kids_clothing: ["0-2 Yrs","2-6 Yrs","6-12 Yrs","12-16 Yrs"],
};

// ── Details Config per product type ───────────────────────
const DETAILS_CONFIG = {
  ethnic: {
    fields: ["fabric","pattern","occasion","fit","washCare","description"],
    fabric:   ["Cotton","Silk","Georgette","Chiffon","Rayon","Linen","Polyester","Cotton Blend","Chanderi","Crepe","Net","Velvet"],
    pattern:  ["Printed","Embroidered","Solid","Bandhani","Chikankari","Block Print","Woven","Zari Work","Mirror Work"],
    occasion: ["Casual","Festive","Party","Wedding","Office","Daily Wear","Casual / Festive"],
    fit:      ["Regular Fit","Straight Fit","Flared","Loose","Free Size"],
    washCare: ["Dry Clean Only","Hand Wash Cold","Machine Wash Gentle","Do Not Bleach"],
  },
  saree: {
    fields: ["fabric","pattern","occasion","blouseIncluded","sareeLength","washCare","description"],
    fabric:   ["Silk","Cotton","Georgette","Chiffon","Banarasi","Kanjivaram","Chanderi","Linen","Crepe","Net","Organza"],
    pattern:  ["Printed","Embroidered","Woven","Solid","Bandhani","Zari Work","Block Print","Handloom","Ikkat"],
    occasion: ["Casual","Festive","Party","Wedding","Office","Daily Wear"],
    blouseIncluded: ["Yes — Blouse Piece Included","No — Blouse Not Included","Stitched Blouse Included"],
    sareeLength: ["5.5 Metres","6 Metres","6.3 Metres","6.5 Metres","8 Metres","9 Metres"],
    washCare: ["Dry Clean Only","Hand Wash Cold","Gentle Machine Wash","Do Not Bleach"],
  },
  lehenga: {
    fields: ["fabric","pattern","occasion","setIncludes","washCare","description"],
    fabric:   ["Net","Georgette","Silk","Velvet","Crepe","Brocade","Cotton"],
    pattern:  ["Embroidered","Printed","Solid","Zari Work","Mirror Work","Sequin Work"],
    occasion: ["Wedding","Festive","Party","Sangeet","Mehndi"],
    setIncludes: ["Lehenga + Choli + Dupatta","Lehenga + Choli","Lehenga Only"],
    washCare: ["Dry Clean Only","Hand Wash Cold","Do Not Bleach"],
  },
  top: {
    fields: ["fabric","pattern","neckType","sleeveType","occasion","fit","washCare","description"],
    fabric:   ["Cotton","Polyester","Rayon","Linen","Georgette","Chiffon","Denim","Knit","Blend"],
    pattern:  ["Printed","Solid","Striped","Checkered","Floral","Abstract","Embroidered"],
    neckType: ["Round Neck","V-Neck","Collar Neck","Boat Neck","Halter Neck","Off Shoulder","Turtle Neck","Mandarin Collar"],
    sleeveType: ["Full Sleeve","Half Sleeve","Sleeveless","3/4 Sleeve","Cap Sleeve","Bell Sleeve"],
    occasion: ["Casual","Party","Office","Daily Wear","Festive"],
    fit:      ["Regular Fit","Slim Fit","Oversized","Relaxed Fit","Cropped"],
    washCare: ["Machine Wash Cold","Hand Wash","Dry Clean Only","Do Not Bleach"],
  },
  bottom: {
    fields: ["fabric","pattern","rise","closure","occasion","fit","washCare","description"],
    fabric:   ["Denim","Cotton","Polyester","Linen","Rayon","Stretchable","Corduroy","Cargo"],
    pattern:  ["Solid","Printed","Striped","Checkered","Washed","Distressed"],
    rise:     ["High Rise","Mid Rise","Low Rise"],
    closure:  ["Button & Zip","Elastic Waist","Drawstring","Hook & Zip"],
    occasion: ["Casual","Office","Party","Daily Wear","Sports"],
    fit:      ["Regular Fit","Slim Fit","Straight Fit","Wide Leg","Skinny","Relaxed Fit","Jogger"],
    washCare: ["Machine Wash Cold","Hand Wash","Do Not Bleach","Tumble Dry Low"],
  },
  sports: {
    fields: ["fabric","pattern","activity","fit","washCare","description"],
    fabric:   ["Polyester","Spandex","Cotton Blend","Nylon","Dry-Fit","Compression Fabric"],
    pattern:  ["Solid","Printed","Striped","Color Block"],
    activity: ["Running","Yoga","Gym & Fitness","Swimming","Cycling","Cricket","Football","Basketball"],
    fit:      ["Regular Fit","Slim Fit","Compression Fit","Relaxed Fit","Racerback"],
    washCare: ["Machine Wash Cold","Hand Wash","Do Not Tumble Dry","Do Not Bleach"],
  },
  lingerie: {
    fields: ["fabric","padding","wiretype","washCare","description"],
    fabric:   ["Cotton","Lace","Satin","Nylon","Spandex","Cotton Blend","Net"],
    padding:  ["Padded","Non-Padded","Lightly Padded","Heavily Padded"],
    wiretype: ["Wired","Non-Wired","Underwired"],
    washCare: ["Hand Wash Only","Machine Wash Gentle","Do Not Bleach","Air Dry"],
  },
  footwear: {
    fields: ["material","sole","closure","occasion","heelHeight","washCare","description"],
    material: ["Synthetic","Leather","Faux Leather","Canvas","Mesh","Rubber","Suede","Fabric"],
    sole:     ["Rubber Sole","TPR Sole","EVA Sole","PU Sole","Leather Sole"],
    closure:  ["Slip-On","Lace-Up","Velcro","Buckle","Zip","Ankle Strap"],
    occasion: ["Casual","Formal","Sports","Party","Daily Wear","Festive","Beach"],
    heelHeight: ["Flat (0-1 cm)","Low Heel (1-3 cm)","Mid Heel (3-5 cm)","High Heel (5-8 cm)","Stiletto (8+ cm)"],
    washCare: ["Wipe with Damp Cloth","Do Not Machine Wash","Air Dry Only"],
  },
  jewellery: {
    fields: ["material","plating","stoneType","occasion","description"],
    material: ["Brass","Copper","Alloy","Sterling Silver","Gold Plated","Oxidised Silver","Fabric","Wood","Beads"],
    plating:  ["Gold Plated","Silver Plated","Rose Gold Plated","Rhodium Plated","Antique Finish","Oxidised"],
    stoneType:["No Stone","Cubic Zirconia","Pearl","Kundan","Meenakari","Semi-Precious","Glass","Crystal"],
    occasion: ["Casual","Festive","Wedding","Party","Daily Wear","Office"],
  },
  bedding: {
    fields: ["fabric","threadCount","sets","washCare","description"],
    fabric:   ["Cotton","Microfiber","Poly-Cotton","Satin","Flannel","Bamboo","Linen"],
    threadCount: ["100 TC","200 TC","300 TC","400 TC","500 TC","600 TC+"],
    sets:     ["Single Piece","2-Piece Set (Sheet + 1 Pillow)","3-Piece Set (Sheet + 2 Pillows)","4-Piece Set","Complete Bedding Set"],
    washCare: ["Machine Wash Cold","Tumble Dry Low","Do Not Bleach","Iron on Low Heat"],
  },
  decor: {
    fields: ["material","dimensions","color","occasion","description"],
    material: ["Wood","Metal","Fabric","Ceramic","Glass","Plastic","Jute","Resin","Bamboo"],
    color:    ["Multicolor","Gold","Silver","Brown","White","Black","Beige","Blue","Green","Red"],
    occasion: ["Everyday","Festive","Diwali Decor","Christmas","Wedding Decor","Gift"],
    dimensions: [],
  },
  kitchen: {
    fields: ["material","capacity","safeFor","description"],
    material: ["Stainless Steel","Aluminum","Cast Iron","Non-Stick Coated","Copper","Ceramic","Glass","Plastic"],
    capacity: ["500 ml","1 Litre","1.5 Litre","2 Litre","3 Litre","5 Litre","Set of Multiple Sizes"],
    safeFor:  ["Gas Stove","Induction","Oven Safe","Microwave Safe","Dishwasher Safe"],
  },
  kids_clothing: {
    fields: ["fabric","pattern","occasion","washCare","description"],
    fabric:   ["Cotton","Cotton Blend","Polyester","Fleece","Denim","Knit"],
    pattern:  ["Printed","Solid","Striped","Checkered","Cartoon Print","Embroidered"],
    occasion: ["Casual","School","Party","Festive","Daily Wear"],
    washCare: ["Machine Wash Cold","Hand Wash","Gentle Cycle","Do Not Bleach"],
  },
  clothing: {
    fields: ["fabric","pattern","occasion","fit","washCare","description"],
    fabric:   ["Cotton","Polyester","Rayon","Linen","Blend"],
    pattern:  ["Printed","Solid","Striped","Embroidered"],
    occasion: ["Casual","Party","Office","Daily Wear","Festive"],
    fit:      ["Regular Fit","Slim Fit","Loose","Free Size"],
    washCare: ["Machine Wash Cold","Hand Wash","Dry Clean Only"],
  },
};

const FIELD_LABELS = {
  fabric:"Fabric / Material", pattern:"Pattern / Style", occasion:"Occasion",
  fit:"Fit Type", washCare:"Wash / Care", description:"Product Description",
  blouseIncluded:"Blouse", sareeLength:"Saree Length", setIncludes:"Set Includes",
  neckType:"Neck Type", sleeveType:"Sleeve Type", rise:"Rise", closure:"Closure Type",
  activity:"Activity / Sport", padding:"Padding", wiretype:"Wire Type",
  material:"Material", sole:"Sole Type", heelHeight:"Heel Height",
  plating:"Plating / Finish", stoneType:"Stone Type", threadCount:"Thread Count",
  sets:"Set Includes", color:"Color", dimensions:"Dimensions / Size",
  capacity:"Capacity", safeFor:"Safe For",
};

const EMPTY_PRODUCT = {
  title: "", price: "", mrp: "",
  navName: "", colTitle: "", subItem: "",
  details: {},
  sizes: [],
  inStock: true, active: true, showOnHome: true,
  colorVariants: [{ id: genId(), colorName: "", hex: "#C9A96E", images: [] }],
  highlights: [""],
};

// ── Category Selector ──────────────────────────────────────
function CategorySelector({ navName, colTitle, subItem, onChange }) {
  const [open, setOpen] = useState(false);
  const [selNav, setSelNav] = useState(navName || null);
  const [selCol, setSelCol] = useState(colTitle || null);

  const navItem = NAVBAR_STRUCTURE.find(n => n.name === selNav);
  const colItem = navItem?.columns.find(c => c.title === selCol);
  const displayVal = subItem ? `${navName} › ${colTitle} › ${subItem}` : colTitle ? `${navName} › ${colTitle}` : navName || "";

  const pickNav = (n) => { setSelNav(n); setSelCol(null); onChange(n, "", ""); };
  const pickCol = (c) => { setSelCol(c); onChange(selNav, c, ""); };
  const pickSub = (s) => { onChange(selNav, selCol, s); setOpen(false); };

  return (
    <div style={{ position: "relative" }}>
      <div onClick={() => setOpen(o => !o)} style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "8px 12px", borderRadius: 8, border: `1px solid ${open ? GOLD : BORDER}`,
        background: WHITE, cursor: "pointer", fontSize: 13, color: displayVal ? CHARCOAL : MUTED,
      }}>
        <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {displayVal || "Select category path…"}
        </span>
        <FiChevronDown size={14} color={MUTED} style={{ flexShrink: 0, marginLeft: 6, transform: open ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
      </div>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 999,
          background: WHITE, border: `1px solid ${BORDER}`, borderRadius: 10,
          boxShadow: "0 8px 30px rgba(0,0,0,0.12)", overflow: "hidden",
        }}>
          <div style={{ display: "grid", gridTemplateColumns: selNav ? (selCol ? "1fr 1fr 1fr" : "1fr 1fr") : "1fr", maxHeight: 280, overflow: "auto" }}>
            <div style={{ borderRight: selNav ? `1px solid ${BORDER}` : "none" }}>
              <div style={{ padding: "8px 12px 4px", fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: "0.8px" }}>NAVBAR</div>
              {NAVBAR_STRUCTURE.map(n => (
                <div key={n.name} onClick={() => pickNav(n.name)} style={{ padding: "9px 14px", fontSize: 13, cursor: "pointer", fontWeight: selNav === n.name ? 700 : 400, color: selNav === n.name ? GOLD_DARK : CHARCOAL, background: selNav === n.name ? GOLD_LIGHT : "transparent" }}>{n.name}</div>
              ))}
            </div>
            {selNav && navItem && (
              <div style={{ borderRight: selCol ? `1px solid ${BORDER}` : "none" }}>
                <div style={{ padding: "8px 12px 4px", fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: "0.8px" }}>CATEGORY</div>
                {navItem.columns.map(col => (
                  <div key={col.title} onClick={() => pickCol(col.title)} style={{ padding: "9px 14px", fontSize: 12, cursor: "pointer", fontWeight: selCol === col.title ? 700 : 400, color: selCol === col.title ? GOLD_DARK : CHARCOAL, background: selCol === col.title ? GOLD_LIGHT : "transparent" }}>{col.title}</div>
                ))}
              </div>
            )}
            {selCol && colItem && (
              <div>
                <div style={{ padding: "8px 12px 4px", fontSize: 10, fontWeight: 700, color: MUTED, letterSpacing: "0.8px" }}>SUB-CATEGORY</div>
                {colItem.items.map(it => (
                  <div key={it} onClick={() => pickSub(it)} style={{ padding: "9px 14px", fontSize: 12, cursor: "pointer", color: subItem === it ? GOLD_DARK : CHARCOAL, background: subItem === it ? GOLD_LIGHT : "transparent", fontWeight: subItem === it ? 700 : 400 }}>{it}</div>
                ))}
              </div>
            )}
          </div>
          <div style={{ borderTop: `1px solid ${BORDER}`, padding: "8px 12px", display: "flex", justifyContent: "flex-end" }}>
            <Btn size="sm" onClick={() => setOpen(false)}>Done</Btn>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Size Selector ──────────────────────────────────────────
function SizeSelector({ sizes, productType, onChange }) {
  const options = SIZE_SETS[productType] ?? SIZE_SETS.clothing;
  if (!options.length) return <div style={{ fontSize: 12, color: MUTED, padding: "6px 0" }}>No size selection for this category.</div>;
  if (productType === "jewellery" || productType === "saree") return <div style={{ fontSize: 12, color: "#27ae60", background: "#eafaf1", padding: "6px 12px", borderRadius: 6, fontWeight: 600 }}>✓ Free Size — auto applied</div>;
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map(s => {
        const sel = sizes.includes(s);
        return (
          <button key={s} onClick={() => onChange(sel ? sizes.filter(x => x !== s) : [...sizes, s])}
            style={{ padding: "5px 12px", borderRadius: 6, border: `1.5px solid ${sel ? GOLD : BORDER}`, background: sel ? GOLD_LIGHT : WHITE, color: sel ? GOLD_DARK : MUTED, fontSize: 12, fontWeight: sel ? 700 : 400, cursor: "pointer", fontFamily: "inherit" }}>
            {s}
          </button>
        );
      })}
    </div>
  );
}

// ── Inline Custom Dropdown — NO alert box ──────────────────
function CustomDropdown({ field, productType, options, value, onChange }) {
  const [showInput, setShowInput] = useState(false);
  const [customVal, setCustomVal] = useState("");
  const inputRef = useRef(null);

  // Merge base options + previously saved custom options
  const customSaved = getCustomOptsForField(productType, field);
  const allOptions = [...options, ...customSaved.filter(c => !options.includes(c))];

  // Current selected values (array for multi, string for single)
  const selectedArr = Array.isArray(value) ? value : (value ? [value] : []);

  const handleSelect = (v) => {
    // Toggle in array
    if (selectedArr.includes(v)) {
      const filtered = selectedArr.filter(x => x !== v);
      onChange(filtered.length > 0 ? filtered : "");
    } else {
      onChange([...selectedArr, v]);
    }
  };

  const handleAddCustom = () => {
    const trimmed = customVal.trim();
    if (!trimmed) return;
    // Save to localStorage
    saveCustomOpt(productType, field, trimmed);
    // Add to selection
    onChange([...selectedArr, trimmed]);
    setCustomVal("");
    setShowInput(false);
  };

  const removeSelected = (v) => {
    const filtered = selectedArr.filter(x => x !== v);
    onChange(filtered.length > 0 ? filtered : "");
  };

  return (
    <div>
      {/* Dropdown select */}
      <div style={{ border: `1px solid ${BORDER}`, borderRadius: 8, background: WHITE, overflow: "hidden" }}>
        <div style={{ maxHeight: 140, overflowY: "auto" }}>
          {allOptions.map(opt => {
            const isSelected = selectedArr.includes(opt);
            return (
              <div key={opt} onClick={() => handleSelect(opt)}
                style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 12px", cursor: "pointer", background: isSelected ? GOLD_LIGHT : "transparent", borderBottom: `1px solid ${BORDER}`, fontSize: 12, color: isSelected ? GOLD_DARK : CHARCOAL, fontWeight: isSelected ? 600 : 400 }}>
                <div style={{ width: 14, height: 14, borderRadius: 3, border: `1.5px solid ${isSelected ? GOLD : BORDER}`, background: isSelected ? GOLD : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {isSelected && <svg width="9" height="9" viewBox="0 0 12 12"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="1.8" fill="none" strokeLinecap="round"/></svg>}
                </div>
                {opt}
              </div>
            );
          })}
        </div>

        {/* Add custom option inline */}
        {showInput ? (
          <div style={{ display: "flex", gap: 6, padding: "8px 10px", borderTop: `1px solid ${BORDER}`, background: SURFACE }}>
            <input
              ref={inputRef}
              autoFocus
              value={customVal}
              onChange={e => setCustomVal(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleAddCustom(); if (e.key === "Escape") { setShowInput(false); setCustomVal(""); } }}
              placeholder="Type custom value, press Enter…"
              style={{ flex: 1, padding: "6px 10px", border: `1px solid ${GOLD}`, borderRadius: 6, fontSize: 12, fontFamily: "inherit", outline: "none", color: CHARCOAL }}
            />
            <button onClick={handleAddCustom}
              style={{ padding: "6px 12px", background: GOLD, color: "#fff", border: "none", borderRadius: 6, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
              Add
            </button>
            <button onClick={() => { setShowInput(false); setCustomVal(""); }}
              style={{ padding: "6px 8px", background: "none", border: `1px solid ${BORDER}`, borderRadius: 6, fontSize: 11, cursor: "pointer", color: MUTED }}>
              <FiX size={12}/>
            </button>
          </div>
        ) : (
          <div onClick={() => { setShowInput(true); setTimeout(() => inputRef.current?.focus(), 50); }}
            style={{ padding: "8px 12px", cursor: "pointer", fontSize: 12, color: GOLD_DARK, fontWeight: 600, borderTop: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 6, background: "#fffdf8" }}>
            <FiPlus size={12}/> Add custom value
          </div>
        )}
      </div>

      {/* Selected tags */}
      {selectedArr.length > 0 && (
        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {selectedArr.map((val, i) => (
            <span key={i} style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, border: `1px solid ${GOLD}`, background: GOLD_LIGHT, color: GOLD_DARK, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 5 }}>
              {String(val)}
              <button onClick={() => removeSelected(val)}
                style={{ border: "none", background: "none", cursor: "pointer", color: MUTED, fontSize: 13, lineHeight: 1, padding: 0, display: "flex", alignItems: "center" }}>
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Dynamic Details Form ───────────────────────────────────
function DetailsForm({ productType, details, onChange }) {
  const config = DETAILS_CONFIG[productType] || DETAILS_CONFIG.clothing;
  const set = (k, v) => onChange({ ...details, [k]: v });

  if (!productType) return (
    <div style={{ textAlign: "center", padding: "32px 0", color: MUTED, fontSize: 13 }}>
      Please select a category first (in Basic tab) to see relevant detail fields.
    </div>
  );

  return (
    <div>
      <div style={{ marginBottom: 16, display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 12px", background: GOLD_LIGHT, borderRadius: 20, fontSize: 12, color: GOLD_DARK, fontWeight: 700 }}>
        Fields for: {productType.replace(/_/g, " ").toUpperCase()}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {config.fields.filter(f => f !== "description" && f !== "washCare" && f !== "dimensions").map(field => {
          const options = config[field];
          const label   = FIELD_LABELS[field] || field;
          if (!options) return null;

          // Free text fields
          if (options.length === 0) return (
            <FormGroup key={field} label={label}>
              <Input value={details[field] || ""} onChange={v => set(field, v)} placeholder={`Enter ${label.toLowerCase()}…`} />
            </FormGroup>
          );

          return (
            <FormGroup key={field} label={label}>
              <CustomDropdown
                field={field}
                productType={productType}
                options={options}
                value={details[field] || ""}
                onChange={v => set(field, v)}
              />
            </FormGroup>
          );
        })}
      </div>

      {/* Wash Care — full width */}
      {config.fields.includes("washCare") && (
        <FormGroup label="Wash / Care Instructions">
          <Select value={details.washCare || config.washCare?.[0] || ""} onChange={v => set("washCare", v)} options={config.washCare || []} />
        </FormGroup>
      )}

      {/* Dimensions — free text full width */}
      {config.fields.includes("dimensions") && (
        <FormGroup label="Dimensions / Size (e.g. 30x45 cm)">
          <Input value={details.dimensions || ""} onChange={v => set("dimensions", v)} placeholder="e.g. 30x45 cm, Set of 2" />
        </FormGroup>
      )}

      {/* Description — always full width last */}
      {config.fields.includes("description") && (
        <FormGroup label="Product Description">
          <TextArea value={details.description || ""} onChange={v => set("description", v)} placeholder="Describe the product in detail…" rows={4} />
        </FormGroup>
      )}
    </div>
  );
}

// ── Color + Image upload ───────────────────────────────────
function ColorVariantEditor({ variants, onChange }) {
  const addVariant    = ()          => onChange([...variants, { id: genId(), colorName: "", hex: "#C9A96E", images: [] }]);
  const removeVariant = idx         => onChange(variants.filter((_, i) => i !== idx));
  const updateVariant = (idx, k, v) => onChange(variants.map((vv, i) => i === idx ? { ...vv, [k]: v } : vv));

  const handleImageUpload = (vi, e) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        onChange(variants.map((v, i) => i === vi ? { ...v, images: [...v.images, { src: ev.target.result, name: file.name }] } : v));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImg = (vi, ii) => onChange(variants.map((v, i) => i === vi ? { ...v, images: v.images.filter((_, j) => j !== ii) } : v));

  return (
    <div>
      {variants.map((v, vi) => (
        <div key={v.id} style={{ border: `1px solid ${BORDER}`, borderRadius: 10, padding: 14, marginBottom: 12, background: SURFACE }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: v.hex, border: `2px solid ${BORDER}`, flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
              <Input value={v.colorName} onChange={val => updateVariant(vi, "colorName", val)} placeholder="Color name (e.g. Red, Navy Blue)" />
            </div>
            <input type="color" value={v.hex} onChange={e => updateVariant(vi, "hex", e.target.value)}
              style={{ width: 36, height: 32, padding: 2, borderRadius: 6, border: `1px solid ${BORDER}`, cursor: "pointer" }} />
            {variants.length > 1 && (
              <button onClick={() => removeVariant(vi)} style={{ border: "none", background: "none", cursor: "pointer", color: DANGER, display: "flex" }}>
                <FiX size={16} />
              </button>
            )}
          </div>

          <div style={{ fontSize: 11, color: MUTED, fontWeight: 600, marginBottom: 8, letterSpacing: "0.4px" }}>
            IMAGES ({v.images.length}) — upload from device
          </div>

          {v.images.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
              {v.images.map((img, ii) => (
                <div key={ii} style={{ position: "relative" }}>
                  <img src={img.src} alt="" style={{ width: 60, height: 76, objectFit: "cover", objectPosition: "top", borderRadius: 6, border: `1.5px solid ${BORDER}`, display: "block" }} />
                  <button onClick={() => removeImg(vi, ii)} style={{ position: "absolute", top: -6, right: -6, width: 18, height: 18, borderRadius: "50%", background: DANGER, border: "none", color: WHITE, fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                </div>
              ))}
            </div>
          )}

          <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", padding: "7px 14px", border: `1.5px dashed ${BORDER}`, borderRadius: 8, background: "#fafafa", fontSize: 12, color: MUTED }}>
            <FiUpload size={14} /> Add images from device (select multiple)
            <input type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => handleImageUpload(vi, e)} />
          </label>
        </div>
      ))}
      <Btn size="sm" onClick={addVariant}><FiPlus size={13} /> Add color variant</Btn>
    </div>
  );
}

// ── Highlights ─────────────────────────────────────────────
function HighlightsEditor({ highlights, onChange }) {
  const add    = ()       => onChange([...highlights, ""]);
  const remove = idx      => onChange(highlights.filter((_, i) => i !== idx));
  const update = (idx, v) => onChange(highlights.map((h, i) => i === idx ? v : h));
  return (
    <div>
      {highlights.map((h, i) => (
        <div key={i} style={{ display: "flex", gap: 6, marginBottom: 6 }}>
          <Input value={h} onChange={v => update(i, v)} placeholder="e.g. Pure Cotton fabric, Handcrafted" />
          {highlights.length > 1 && (
            <button onClick={() => remove(i)} style={{ border: "none", background: "none", cursor: "pointer", color: MUTED, display: "flex" }}>
              <FiX size={14} />
            </button>
          )}
        </div>
      ))}
      <Btn size="sm" onClick={add}><FiPlus size={12} /> Add highlight</Btn>
    </div>
  );
}

// ── Product Form with Tabs ─────────────────────────────────
function ProductForm({ form, setForm }) {
  const [tab, setTab] = useState("basic");
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const productType = getProductType(form.navName, form.colTitle, form.subItem);
  const disc = form.price && form.mrp ? Math.round((1 - parseFloat(form.price) / parseFloat(form.mrp)) * 100) : 0;

  const handleCategoryChange = (navName, colTitle, subItem) => {
    const pt = getProductType(navName, colTitle, subItem);
    const autoSizes = (pt === "jewellery" || pt === "saree") ? ["Free Size"] : [];
    setForm(f => ({ ...f, navName, colTitle, subItem, sizes: autoSizes, details: {} }));
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 0, borderBottom: `1px solid ${BORDER}`, marginBottom: 16 }}>
        {["basic", "images", "details", "highlights"].map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{ padding: "8px 16px", fontSize: 12, fontWeight: 600, cursor: "pointer", color: tab === t ? GOLD_DARK : MUTED, background: "none", border: "none", borderBottom: `2px solid ${tab === t ? GOLD : "transparent"}`, marginBottom: -1, textTransform: "uppercase", fontFamily: "inherit" }}>
            {t}
          </button>
        ))}
      </div>

      {/* BASIC */}
      {tab === "basic" && (
        <div>
          <FormGroup label="Category Path * (Navbar → Category → Sub-category)">
            <CategorySelector navName={form.navName} colTitle={form.colTitle} subItem={form.subItem} onChange={handleCategoryChange} />
            {form.navName && (
              <div style={{ marginTop: 6, fontSize: 11, color: GOLD_DARK, background: GOLD_LIGHT, padding: "4px 10px", borderRadius: 6 }}>
                Will appear under: <strong>{form.navName}{form.colTitle ? ` › ${form.colTitle}` : ""}{form.subItem ? ` › ${form.subItem}` : ""}</strong>
              </div>
            )}
          </FormGroup>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <FormGroup label="Product Title *">
              <Input value={form.title} onChange={v => set("title", v)} placeholder="e.g. Printed Anarkali Kurta" />
            </FormGroup>
            <FormGroup label="Brand Name">
              <Input value={form.brand || ""} onChange={v => set("brand", v)} placeholder="e.g. RoopVibe, W, Zara" />
            </FormGroup>
            <FormGroup label="Selling Price (₹) *">
              <Input value={form.price} onChange={v => set("price", v)} placeholder="899" type="number" />
            </FormGroup>
            <FormGroup label="MRP / Original Price (₹) *">
              <Input value={form.mrp} onChange={v => set("mrp", v)} placeholder="2499" type="number" />
            </FormGroup>
          </div>

          {disc > 0 && (
            <div style={{ marginBottom: 14, fontSize: 12, color: "#2E7D32", background: "#E8F5E9", padding: "5px 12px", borderRadius: 6, display: "inline-block", fontWeight: 600 }}>
              {disc}% discount will show on product
            </div>
          )}

          {form.navName && (
            <FormGroup label={`Sizes — ${productType.replace(/_/g, " ")}`}>
              <SizeSelector sizes={form.sizes} productType={productType} onChange={v => set("sizes", v)} />
            </FormGroup>
          )}

          <div style={{ display: "flex", gap: 20, marginTop: 8, flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: CHARCOAL, cursor: "pointer" }}>
              <Toggle value={form.inStock}    onChange={v => set("inStock", v)} /> In Stock
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: CHARCOAL, cursor: "pointer" }}>
              <Toggle value={form.active}     onChange={v => set("active", v)} /> Active
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: CHARCOAL, cursor: "pointer" }}>
              <Toggle value={form.showOnHome} onChange={v => set("showOnHome", v)} /> Show on Homepage
            </label>
          </div>
        </div>
      )}

      {/* IMAGES */}
      {tab === "images" && (
        <div>
          <p style={{ fontSize: 12, color: MUTED, marginBottom: 12 }}>
            Add images per color variant. First image of first color = homepage thumbnail. Select multiple at once.
          </p>
          <ColorVariantEditor variants={form.colorVariants} onChange={v => set("colorVariants", v)} />
        </div>
      )}

      {/* DETAILS */}
      {tab === "details" && (
        <DetailsForm
          productType={form.navName ? productType : null}
          details={form.details || {}}
          onChange={v => set("details", v)}
        />
      )}

      {/* HIGHLIGHTS */}
      {tab === "highlights" && (
        <div>
          <p style={{ fontSize: 12, color: MUTED, marginBottom: 10 }}>
            Bullet points shown on product page (e.g. "Pure cotton", "Handcrafted in Jaipur").
          </p>
          <FormGroup label="Product highlights">
            <HighlightsEditor highlights={form.highlights} onChange={v => set("highlights", v)} />
          </FormGroup>
        </div>
      )}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────
export default function ProductAdmin() {
  const { products, addProduct, updateProduct, deleteProduct } = useAdminData();
  const [modal,  setModal]  = useState(null);
  const [form,   setForm]   = useState(EMPTY_PRODUCT);
  const [toast,  setToast]  = useState(null);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const openAdd  = () => { setForm({ ...EMPTY_PRODUCT, colorVariants: [{ id: genId(), colorName: "", hex: "#C9A96E", images: [] }] }); setModal("add"); };
  const openEdit = p => { setForm({ ...p }); setModal(p); };

  const save = () => {
    if (!form.title.trim() || !form.price || !form.mrp) return alert("Title, price and MRP are required!");
    if (!form.navName) return alert("Please select a category path!");
    const prod = { ...form, price: parseFloat(form.price), mrp: parseFloat(form.mrp) };
    if (modal === "add") addProduct(prod);
    else updateProduct(prod);
    setModal(null);
    setToast(modal === "add" ? "Product added!" : "Updated!");
  };

  const remove = id => { if (!window.confirm("Delete this product?")) return; deleteProduct(id); setToast("Deleted!"); };
  const disc   = p  => Math.round((1 - p.price / p.mrp) * 100);

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    if (q && !p.title.toLowerCase().includes(q)) return false;
    if (filter === "home"   && !p.showOnHome) return false;
    if (filter === "hidden" && p.active)      return false;
    return true;
  });

  return (
    <div>
      <PageHeader title="Products" sub="Add products — category path drives where they appear on site" />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
        <MetricCard label="Total"    value={products.length} />
        <MetricCard label="Active"   value={products.filter(p => p.active).length} />
        <MetricCard label="On Home"  value={products.filter(p => p.showOnHome).length} />
        <MetricCard label="In Stock" value={products.filter(p => p.inStock).length} />
      </div>

      <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center" }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by title…"
          style={{ flex: 1, padding: "8px 14px", borderRadius: 8, border: `1px solid ${BORDER}`, fontSize: 13, color: CHARCOAL, fontFamily: "inherit", outline: "none" }} />
        {["all","home","hidden"].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{ padding: "6px 14px", borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", background: filter === f ? GOLD : WHITE, color: filter === f ? WHITE : MUTED, border: `1px solid ${filter === f ? GOLD : BORDER}` }}>
            {f === "all" ? "All" : f === "home" ? "On Home" : "Hidden"}
          </button>
        ))}
        <Btn variant="primary" onClick={openAdd}><FiPlus size={14} /> Add product</Btn>
      </div>

      <Section title={`${filtered.length} product(s)`}>
        {filtered.map((p, idx) => {
          const thumb = p.colorVariants?.[0]?.images?.[0]?.src || "";
          return (
            <RowItem key={p.id} last={idx === filtered.length - 1}
              left={
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 44, height: 56, borderRadius: 6, overflow: "hidden", background: SURFACE, border: `1px solid ${BORDER}`, flexShrink: 0 }}>
                    {thumb ? <img src={thumb} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} />
                           : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}><FiImage size={16} color={BORDER} /></div>}
                  </div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: CHARCOAL }}>{p.title}</span>
                      {!p.active    && <Badge color="#FDECEA" text={DANGER}>HIDDEN</Badge>}
                      {p.showOnHome && <Badge>HOME</Badge>}
                      {!p.inStock   && <Badge color="#FFF8E1" text="#F57F17">OUT OF STOCK</Badge>}
                    </div>
                    <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>
                      ₹{p.price} <span style={{ textDecoration: "line-through" }}>₹{p.mrp}</span>{" "}
                      <span style={{ color: "#2E7D32", fontWeight: 600 }}>{disc(p)}% off</span>
                      {p.brand && <span> · {p.brand}</span>}
                      {" · "}{p.colorVariants?.length || 0} colors
                      {p.navName && <span> · {p.navName}{p.colTitle ? ` › ${p.colTitle}` : ""}{p.subItem ? ` › ${p.subItem}` : ""}</span>}
                    </div>
                  </div>
                </div>
              }
              right={<>
                <Toggle value={p.active} onChange={v => updateProduct({ ...p, active: v })} />
                <Btn size="sm" onClick={() => openEdit(p)}><FiEdit2 size={13} /></Btn>
                <Btn size="sm" variant="danger" onClick={() => remove(p.id)}><FiTrash2 size={13} /></Btn>
              </>}
            />
          );
        })}
        {!filtered.length && <div style={{ padding: 32, textAlign: "center", color: MUTED, fontSize: 13 }}>No products found.</div>}
      </Section>

      {modal && (
        <Modal title={modal === "add" ? "Add new product" : `Edit: ${modal.title}`} onClose={() => setModal(null)} wide
          footer={<><Btn onClick={() => setModal(null)}>Cancel</Btn><Btn variant="primary" onClick={save}><FiSave size={14} /> Save product</Btn></>}>
          <ProductForm form={form} setForm={setForm} />
        </Modal>
      )}

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}