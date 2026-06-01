/**
 * Offersadmin.jsx  — UPDATED
 * Changes:
 *  - Flash Deals section REMOVED
 *  - Promo Banners: bg color removed, admin uploads image from device (FileReader → base64)
 *  - Banner links to a product — admin selects which product the offer is for
 *    (product name shown on banner card as "Offer on: <product>")
 *
 * Sections:
 *  1. Promo Banners  — device image upload + product link + title/subtitle/CTA
 *  2. Coupon Codes   — unchanged
 *  3. Shop by Category — unchanged (circle icons, device image upload added here too)
 */

import { useState, useRef } from "react";
import {
  FiPlus, FiEdit2, FiTrash2, FiX, FiCheck, FiCopy,
  FiTag, FiImage, FiGrid, FiChevronDown, FiChevronUp,
  FiPercent, FiDollarSign, FiCalendar, FiUpload, FiPackage,
} from "react-icons/fi";

// ── Design tokens ────────────────────────────────────────────────
const GOLD       = "#C9A96E";
const GOLD_DARK  = "#A07840";
const GOLD_LIGHT = "#F5EDD9";
const CHARCOAL   = "#1A1A1A";
const MUTED      = "#6B6560";
const SURFACE    = "#FAF7F2";
const BORDER     = "#EDE8E0";
const WHITE      = "#FFFFFF";
const DANGER     = "#C0392B";
const SUCCESS    = "#27AE60";

// ── Mock products list (replace with useAdminData().products in real app) ──
const MOCK_PRODUCTS = [
  { id:"p1", title:"Silk Anarkali Set" },
  { id:"p2", title:"Zari Dupatta" },
  { id:"p3", title:"Chanderi Kurta" },
  { id:"p4", title:"Embroidered Lehenga" },
  { id:"p5", title:"Banarasi Saree" },
  { id:"p6", title:"Palazzo Set" },
  { id:"p7", title:"Cotton Kurti" },
  { id:"p8", title:"Mirror Work Skirt" },
  { id:"p9", title:"Georgette Saree" },
];

// ── Initial Data ─────────────────────────────────────────────────
const INIT_BANNERS = [
  { id:1, tag:"Limited Time", title:"MEGA SALE",    subtitle:"Up to 80% Off",  cta:"Shop Now", ctaLink:"/sale",  image:"", productId:"p1", active:true },
  { id:2, tag:"Today Only",   title:"FLASH DEALS",  subtitle:"Starting ₹159",  cta:"Grab Now", ctaLink:"/flash", image:"", productId:"p3", active:true },
  { id:3, tag:"New This Month", title:"NEW ARRIVALS", subtitle:"Extra 10% Off", cta:"Explore",  ctaLink:"/new",   image:"", productId:"p5", active:true },
];

const INIT_COUPONS = [
  { id:1, code:"FIRST750",  type:"flat",    value:750,  description:"First Order Discount — Flat ₹750 off on your first order above ₹999", minOrder:999,  expiry:"31 Dec 2025", active:true },
  { id:2, code:"SAVE200",   type:"flat",    value:200,  description:"Flat ₹200 Off — On orders above ₹799, valid today only",              minOrder:799,  expiry:"Today only",  active:true },
  { id:3, code:"UPIEXTRA",  type:"percent", value:5,    description:"UPI Extra 5% Off — Save 5% extra on UPI payment, max ₹100 cashback",  minOrder:0,    expiry:"30 Jun 2025", active:true },
  { id:4, code:"SUMMER35",  type:"percent", value:35,   description:"Summer Special — 35% off on all ethnic wear collection",               minOrder:1499, expiry:"15 Jun 2025", active:false },
];

const INIT_CATEGORIES = [
  { id:1, label:"Ethnic Wear",  link:"/category/women/ethnic",  image:"", active:true },
  { id:2, label:"Western Wear", link:"/category/women/western", image:"", active:true },
  { id:3, label:"Men Fashion",  link:"/category/men",           image:"", active:true },
  { id:4, label:"Footwear",     link:"/category/footwear",      image:"", active:true },
  { id:5, label:"Jewellery",    link:"/category/jewellery",     image:"", active:true },
  { id:6, label:"Kids",         link:"/category/kids",          image:"", active:true },
];

// ── Reusable helpers ─────────────────────────────────────────────
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

function Btn({ children, onClick, variant="default", style:sx={} }) {
  const base = { display:"inline-flex", alignItems:"center", gap:6, borderRadius:8,
    cursor:"pointer", fontFamily:"inherit", fontWeight:600, fontSize:12,
    padding:"7px 14px", border:"none", transition:"all 0.15s" };
  const variants = {
    default: { background:WHITE, color:CHARCOAL, border:`1px solid ${BORDER}` },
    primary: { background:`linear-gradient(to right,${GOLD_DARK},${GOLD})`, color:WHITE },
    danger:  { background:"#FDECEA", color:DANGER, border:`1px solid #F5C6C6` },
  };
  return <button onClick={onClick} style={{ ...base, ...variants[variant], ...sx }}>{children}</button>;
}

function Field({ label, children, hint }) {
  return (
    <div style={{ marginBottom:12 }}>
      <label style={{ display:"block", fontSize:11, color:MUTED, marginBottom:4, fontWeight:600 }}>{label}</label>
      {children}
      {hint && <p style={{ fontSize:10, color:MUTED, marginTop:3 }}>{hint}</p>}
    </div>
  );
}

function Input({ value, onChange, placeholder, type="text", style:sx={} }) {
  return (
    <input value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} type={type}
      style={{ width:"100%", padding:"7px 10px", borderRadius:8, border:`1px solid ${BORDER}`,
        fontSize:12, color:CHARCOAL, fontFamily:"inherit", outline:"none",
        background:WHITE, boxSizing:"border-box", ...sx }}
      onFocus={e=>e.target.style.borderColor=GOLD}
      onBlur={e=>e.target.style.borderColor=BORDER}/>
  );
}

// Device image upload → base64
function ImageUploadBox({ value, onChange, label="Banner Image", aspect="wide" }) {
  const ref = useRef();
  const h   = aspect === "wide" ? 90 : 56;

  const handleFile = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => onChange(ev.target.result);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label style={{ display:"block", fontSize:11, color:MUTED, marginBottom:4, fontWeight:600 }}>{label}</label>
      <div
        onClick={() => ref.current.click()}
        style={{ height:h, borderRadius:8, border:`2px dashed ${value ? GOLD : BORDER}`,
          background: value ? "transparent" : SURFACE, cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center",
          overflow:"hidden", position:"relative", transition:"border-color 0.15s" }}>
        {value
          ? <img src={value} alt="preview" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
          : (
            <div style={{ textAlign:"center", color:MUTED }}>
              <FiUpload size={18} style={{ display:"block", margin:"0 auto 4px" }}/>
              <span style={{ fontSize:11 }}>Click to upload from device</span>
            </div>
          )
        }
        {value && (
          <button
            onClick={e => { e.stopPropagation(); onChange(""); }}
            style={{ position:"absolute", top:6, right:6, width:22, height:22, borderRadius:"50%",
              background:"rgba(0,0,0,0.55)", border:"none", cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center", color:WHITE }}>
            <FiX size={11}/>
          </button>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" style={{ display:"none" }} onChange={handleFile}/>
      {value && (
        <p style={{ fontSize:10, color:MUTED, marginTop:3 }}>
          ✓ Image loaded from device &nbsp;·&nbsp;
          <span style={{ color:GOLD_DARK, cursor:"pointer", textDecoration:"underline" }}
            onClick={() => ref.current.click()}>Change</span>
        </p>
      )}
    </div>
  );
}

function SectionCard({ title, icon, count, children, action }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ background:WHITE, border:`1px solid ${BORDER}`, borderRadius:12,
      overflow:"hidden", marginBottom:16 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"14px 20px", borderBottom: open ? `1px solid ${BORDER}` : "none",
        cursor:"pointer" }} onClick={() => setOpen(o=>!o)}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ color:GOLD }}>{icon}</span>
          <h3 style={{ fontSize:14, fontWeight:700, color:CHARCOAL, margin:0 }}>{title}</h3>
          {count !== undefined && (
            <span style={{ fontSize:10, padding:"2px 8px", borderRadius:10, background:GOLD_LIGHT,
              color:GOLD_DARK, fontWeight:700 }}>{count}</span>
          )}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          {action && <div onClick={e=>e.stopPropagation()}>{action}</div>}
          {open ? <FiChevronUp size={14} color={MUTED}/> : <FiChevronDown size={14} color={MUTED}/>}
        </div>
      </div>
      {open && children}
    </div>
  );
}

function Toast({ msg, onDone }) {
  useState(() => { const t = setTimeout(onDone, 2200); return () => clearTimeout(t); });
  return (
    <div style={{ position:"fixed", bottom:24, right:24, zIndex:3000,
      background:WHITE, border:`1px solid ${BORDER}`, borderLeft:`3px solid ${GOLD}`,
      borderRadius:8, padding:"10px 16px", fontSize:12, color:CHARCOAL,
      boxShadow:"0 4px 20px rgba(0,0,0,0.1)", display:"flex", alignItems:"center", gap:8 }}>
      <FiCheck size={13} color={SUCCESS}/> {msg}
    </div>
  );
}

function Modal({ title, onClose, children, footer }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.38)", zIndex:2000,
      display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}
      onClick={e=>e.target===e.currentTarget && onClose()}>
      <div style={{ background:WHITE, borderRadius:12, width:500, maxWidth:"100%",
        border:`1px solid ${BORDER}`, boxShadow:"0 20px 60px rgba(0,0,0,0.14)",
        maxHeight:"92vh", display:"flex", flexDirection:"column" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between",
          padding:"14px 20px", borderBottom:`1px solid ${BORDER}`, flexShrink:0 }}>
          <h3 style={{ fontSize:14, fontWeight:700, color:CHARCOAL, margin:0 }}>{title}</h3>
          <button onClick={onClose} style={{ background:"none", border:"none", cursor:"pointer", color:MUTED }}>
            <FiX size={18}/>
          </button>
        </div>
        <div style={{ padding:20, overflowY:"auto" }}>{children}</div>
        {footer && (
          <div style={{ display:"flex", gap:8, justifyContent:"flex-end",
            padding:"12px 20px", borderTop:`1px solid ${BORDER}`, flexShrink:0 }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION 1 — PROMO BANNERS (device upload + product select)
// ═══════════════════════════════════════════════════════════════
function BannersSection() {
  const [banners, setBanners] = useState(INIT_BANNERS);
  const [modal, setModal]     = useState(false);
  const [toast, setToast]     = useState("");

  const empty = { id:null, tag:"", title:"", subtitle:"", cta:"Shop Now", ctaLink:"", image:"", productId:"", active:true };
  const [form, setForm] = useState(empty);
  const f = k => v => setForm(p => ({ ...p, [k]:v }));

  const openAdd  = () => { setForm(empty); setModal(true); };
  const openEdit = b  => { setForm({ ...b }); setModal(true); };

  const save = () => {
    if (!form.title.trim()) return;
    if (form.id) {
      setBanners(p => p.map(b => b.id===form.id ? { ...form } : b));
      setToast("Banner updated!");
    } else {
      setBanners(p => [...p, { ...form, id: Date.now() }]);
      setToast("Banner added!");
    }
    setModal(false);
  };

  const remove = id => { setBanners(p => p.filter(b=>b.id!==id)); setToast("Banner deleted."); };
  const toggle = id => setBanners(p => p.map(b => b.id===id ? { ...b, active:!b.active } : b));

  const productName = id => MOCK_PRODUCTS.find(p=>p.id===id)?.title || "—";

  return (
    <SectionCard
      title="Promo Banners" icon={<FiImage size={15}/>}
      count={banners.filter(b=>b.active).length + " active"}
      action={<Btn variant="primary" onClick={openAdd}><FiPlus size={12}/> Add Banner</Btn>}>

      {banners.map(b => (
        <div key={b.id} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 20px",
          borderBottom:`1px solid ${BORDER}`, opacity: b.active ? 1 : 0.5 }}>

          {/* Image preview */}
          <div style={{ width:90, height:52, borderRadius:8, overflow:"hidden", flexShrink:0,
            background:SURFACE, border:`1px solid ${BORDER}`,
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            {b.image
              ? <img src={b.image} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
              : <FiImage size={20} color={BORDER}/>
            }
          </div>

          {/* Info */}
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:2 }}>
              {b.tag && (
                <span style={{ fontSize:9, fontWeight:700, color:GOLD_DARK,
                  background:GOLD_LIGHT, padding:"1px 6px", borderRadius:3 }}>{b.tag}</span>
              )}
              <p style={{ fontSize:13, fontWeight:700, color:CHARCOAL, margin:0 }}>{b.title}</p>
            </div>
            <p style={{ fontSize:11, color:MUTED, margin:0 }}>{b.subtitle}</p>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginTop:3 }}>
              <span style={{ fontSize:10, color:MUTED, display:"flex", alignItems:"center", gap:3 }}>
                <FiPackage size={9}/> {productName(b.productId)}
              </span>
              <span style={{ fontSize:10, color:MUTED }}>· CTA: "{b.cta}"</span>
            </div>
          </div>

          <Toggle value={b.active} onChange={() => toggle(b.id)}/>
          <Btn onClick={() => openEdit(b)}><FiEdit2 size={12}/></Btn>
          <Btn variant="danger" onClick={() => remove(b.id)}><FiTrash2 size={12}/></Btn>
        </div>
      ))}

      {banners.length === 0 && (
        <div style={{ padding:36, textAlign:"center", color:MUTED, fontSize:13 }}>No banners yet</div>
      )}

      {modal && (
        <Modal title={form.id ? "Edit Banner" : "Add Banner"} onClose={() => setModal(false)}
          footer={<><Btn onClick={() => setModal(false)}>Cancel</Btn><Btn variant="primary" onClick={save}>Save Banner</Btn></>}>

          {/* Image upload */}
          <div style={{ marginBottom:14 }}>
            <ImageUploadBox value={form.image} onChange={f("image")} label="Banner Image (from device)" aspect="wide"/>
          </div>

          {/* Product this offer is for */}
          <Field label="Offer is for which Product?" hint="This product will be shown / linked on the banner">
            <select value={form.productId} onChange={e=>f("productId")(e.target.value)}
              style={{ width:"100%", padding:"7px 10px", borderRadius:8, border:`1px solid ${BORDER}`,
                fontSize:12, color:CHARCOAL, fontFamily:"inherit", background:WHITE, outline:"none" }}
              onFocus={e=>e.target.style.borderColor=GOLD}
              onBlur={e=>e.target.style.borderColor=BORDER}>
              <option value="">— Select product —</option>
              {MOCK_PRODUCTS.map(p => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </Field>

          <Field label="Tag line (small text above title)">
            <Input value={form.tag} onChange={f("tag")} placeholder="e.g. LIMITED TIME"/>
          </Field>
          <Field label="Title *">
            <Input value={form.title} onChange={f("title")} placeholder="e.g. MEGA SALE"/>
          </Field>
          <Field label="Subtitle">
            <Input value={form.subtitle} onChange={f("subtitle")} placeholder="e.g. Up to 80% Off"/>
          </Field>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <Field label="CTA Button Text">
              <Input value={form.cta} onChange={f("cta")} placeholder="Shop Now"/>
            </Field>
            <Field label="CTA Link">
              <Input value={form.ctaLink} onChange={f("ctaLink")} placeholder="/sale"/>
            </Field>
          </div>
          <Field label="Active">
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <Toggle value={form.active} onChange={v=>f("active")(v)}/>
              <span style={{ fontSize:12, color:MUTED }}>{form.active ? "Visible on Offers page" : "Hidden"}</span>
            </div>
          </Field>

          {/* Live mini-preview */}
          {(form.image || form.title) && (
            <div style={{ marginTop:4 }}>
              <p style={{ fontSize:10, color:MUTED, marginBottom:6, fontWeight:600 }}>PREVIEW</p>
              <div style={{ borderRadius:8, overflow:"hidden", height:60, position:"relative",
                background: form.image ? "transparent" : "#444",
                border:`1px solid ${BORDER}` }}>
                {form.image && (
                  <img src={form.image} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", position:"absolute", inset:0 }}/>
                )}
                <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.38)",
                  display:"flex", alignItems:"center", padding:"0 14px", gap:16 }}>
                  <div>
                    {form.tag && <p style={{ fontSize:8, color:"rgba(255,255,255,0.75)", margin:0, fontWeight:700 }}>{form.tag}</p>}
                    <p style={{ fontSize:14, fontWeight:800, color:"#fff", margin:0 }}>{form.title || "TITLE"}</p>
                    <p style={{ fontSize:10, color:"rgba(255,255,255,0.8)", margin:0 }}>{form.subtitle}</p>
                  </div>
                  <div style={{ marginLeft:"auto", background:"rgba(255,255,255,0.22)", borderRadius:4,
                    padding:"4px 10px", fontSize:10, color:"#fff", fontWeight:700, whiteSpace:"nowrap" }}>
                    {form.cta || "CTA"}
                  </div>
                </div>
              </div>
            </div>
          )}
        </Modal>
      )}

      {toast && <Toast msg={toast} onDone={() => setToast("")}/>}
    </SectionCard>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION 2 — COUPON CODES
// ═══════════════════════════════════════════════════════════════
function CouponsSection() {
  const [coupons, setCoupons] = useState(INIT_COUPONS);
  const [modal, setModal]     = useState(false);
  const [copied, setCopied]   = useState("");
  const [toast, setToast]     = useState("");

  const empty = { id:null, code:"", type:"flat", value:"", description:"", minOrder:"", expiry:"", active:true };
  const [form, setForm] = useState(empty);
  const f = k => v => setForm(p => ({ ...p, [k]:v }));

  const openAdd  = () => { setForm(empty); setModal(true); };
  const openEdit = c  => { setForm({ ...c, value:String(c.value), minOrder:String(c.minOrder) }); setModal(true); };

  const save = () => {
    if (!form.code.trim() || !form.value) return;
    const entry = { ...form, value:Number(form.value), minOrder:Number(form.minOrder||0),
      code: form.code.toUpperCase() };
    if (form.id) {
      setCoupons(p => p.map(c => c.id===form.id ? { ...entry } : c));
      setToast("Coupon updated!");
    } else {
      setCoupons(p => [...p, { ...entry, id: Date.now() }]);
      setToast("Coupon added!");
    }
    setModal(false);
  };

  const remove = id => { setCoupons(p => p.filter(c=>c.id!==id)); setToast("Coupon deleted."); };
  const toggle = id => setCoupons(p => p.map(c => c.id===id ? { ...c, active:!c.active } : c));
  const copyCode = code => {
    navigator.clipboard?.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(""), 1500);
  };

  return (
    <SectionCard title="Coupon Codes" icon={<FiTag size={15}/>}
      count={coupons.filter(c=>c.active).length + " active"}
      action={<Btn variant="primary" onClick={openAdd}><FiPlus size={12}/> Add Coupon</Btn>}>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr" }}>
        {coupons.map((c, idx) => (
          <div key={c.id} style={{ padding:"14px 18px",
            borderRight: idx%2===0 ? `1px solid ${BORDER}` : "none",
            borderBottom:`1px solid ${BORDER}`,
            opacity: c.active ? 1 : 0.45,
            background: c.active ? WHITE : SURFACE }}>

            <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", marginBottom:8 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                <span style={{ fontSize:13, fontWeight:800,
                  color: c.type==="flat" ? "#1565C0" : GOLD_DARK,
                  background: c.type==="flat" ? "#E3F2FD" : GOLD_LIGHT,
                  border:`1.5px dashed ${c.type==="flat" ? "#90CAF9" : GOLD}`,
                  padding:"3px 10px", borderRadius:4, letterSpacing:0.5 }}>
                  {c.code}
                </span>
                <button onClick={() => copyCode(c.code)}
                  style={{ background:"none", border:"none", cursor:"pointer",
                    color: copied===c.code ? SUCCESS : MUTED }}>
                  {copied===c.code ? <FiCheck size={12}/> : <FiCopy size={12}/>}
                </button>
              </div>
              <Toggle value={c.active} onChange={() => toggle(c.id)}/>
            </div>

            <p style={{ fontSize:12, color:CHARCOAL, margin:"0 0 4px", lineHeight:1.5 }}>{c.description}</p>
            <div style={{ display:"flex", alignItems:"center", gap:10, fontSize:10, color:MUTED }}>
              <span style={{ display:"flex", alignItems:"center", gap:3 }}>
                {c.type==="flat" ? <FiDollarSign size={9}/> : <FiPercent size={9}/>}
                {c.type==="flat" ? `₹${c.value} off` : `${c.value}% off`}
              </span>
              {c.minOrder > 0 && <span>Min ₹{c.minOrder}</span>}
              <span style={{ display:"flex", alignItems:"center", gap:3 }}>
                <FiCalendar size={9}/> {c.expiry}
              </span>
            </div>
            <div style={{ display:"flex", gap:6, marginTop:10 }}>
              <Btn onClick={() => openEdit(c)} style={{ fontSize:11, padding:"4px 10px" }}><FiEdit2 size={10}/> Edit</Btn>
              <Btn variant="danger" onClick={() => remove(c.id)} style={{ fontSize:11, padding:"4px 10px" }}><FiTrash2 size={10}/></Btn>
            </div>
          </div>
        ))}
      </div>

      {coupons.length === 0 && (
        <div style={{ padding:36, textAlign:"center", color:MUTED, fontSize:13 }}>No coupons yet</div>
      )}

      {modal && (
        <Modal title={form.id ? "Edit Coupon" : "Add Coupon"} onClose={() => setModal(false)}
          footer={<><Btn onClick={() => setModal(false)}>Cancel</Btn><Btn variant="primary" onClick={save}>Save Coupon</Btn></>}>
          <Field label="Coupon Code *" hint="Auto-uppercased">
            <Input value={form.code} onChange={f("code")} placeholder="e.g. SUMMER35"/>
          </Field>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <Field label="Discount Type">
              <select value={form.type} onChange={e=>f("type")(e.target.value)}
                style={{ width:"100%", padding:"7px 10px", borderRadius:8, border:`1px solid ${BORDER}`,
                  fontSize:12, color:CHARCOAL, fontFamily:"inherit", background:WHITE, outline:"none" }}>
                <option value="flat">Flat (₹ amount)</option>
                <option value="percent">Percent (%)</option>
              </select>
            </Field>
            <Field label={form.type==="flat" ? "Amount (₹) *" : "Percent (%) *"}>
              <Input value={form.value} onChange={f("value")} placeholder={form.type==="flat"?"200":"35"} type="number"/>
            </Field>
          </div>
          <Field label="Description (shown to customers)">
            <textarea value={form.description} onChange={e=>f("description")(e.target.value)}
              placeholder="Short description…" rows={2}
              style={{ width:"100%", padding:"7px 10px", borderRadius:8, border:`1px solid ${BORDER}`,
                fontSize:12, color:CHARCOAL, fontFamily:"inherit", background:WHITE,
                outline:"none", resize:"vertical", boxSizing:"border-box" }}
              onFocus={e=>e.target.style.borderColor=GOLD}
              onBlur={e=>e.target.style.borderColor=BORDER}/>
          </Field>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
            <Field label="Minimum Order (₹)">
              <Input value={form.minOrder} onChange={f("minOrder")} placeholder="0 = no minimum" type="number"/>
            </Field>
            <Field label="Expiry Date / Text">
              <Input value={form.expiry} onChange={f("expiry")} placeholder="31 Dec 2025"/>
            </Field>
          </div>
          <Field label="Active">
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <Toggle value={form.active} onChange={v=>f("active")(v)}/>
              <span style={{ fontSize:12, color:MUTED }}>{form.active ? "Visible on Offers page" : "Hidden"}</span>
            </div>
          </Field>
        </Modal>
      )}

      {toast && <Toast msg={toast} onDone={() => setToast("")}/>}
    </SectionCard>
  );
}

// ═══════════════════════════════════════════════════════════════
// SECTION 3 — SHOP BY CATEGORY (device image upload)
// ═══════════════════════════════════════════════════════════════
function CategoriesSection() {
  const [cats, setCats]   = useState(INIT_CATEGORIES);
  const [modal, setModal] = useState(false);
  const [toast, setToast] = useState("");

  const empty = { id:null, label:"", link:"", image:"", active:true };
  const [form, setForm] = useState(empty);
  const f = k => v => setForm(p => ({ ...p, [k]:v }));

  const openAdd  = () => { setForm(empty); setModal(true); };
  const openEdit = c  => { setForm({ ...c }); setModal(true); };

  const save = () => {
    if (!form.label.trim()) return;
    if (form.id) {
      setCats(p => p.map(c => c.id===form.id ? { ...form } : c));
      setToast("Category updated!");
    } else {
      setCats(p => [...p, { ...form, id: Date.now() }]);
      setToast("Category added!");
    }
    setModal(false);
  };

  const remove = id => { setCats(p => p.filter(c=>c.id!==id)); setToast("Removed."); };
  const toggle = id => setCats(p => p.map(c => c.id===id ? { ...c, active:!c.active } : c));

  return (
    <SectionCard title="Shop by Category" icon={<FiGrid size={15}/>} count={cats.length}
      action={<Btn variant="primary" onClick={openAdd}><FiPlus size={12}/> Add Category</Btn>}>

      <div style={{ padding:"16px 20px" }}>
        {/* Circle preview strip */}
        <div style={{ display:"flex", gap:16, flexWrap:"wrap", marginBottom:16,
          padding:"12px 16px", background:SURFACE, borderRadius:8, border:`1px solid ${BORDER}` }}>
          {cats.filter(c=>c.active).map(c => (
            <div key={c.id} style={{ textAlign:"center" }}>
              <div style={{ width:52, height:52, borderRadius:"50%", background:GOLD_LIGHT,
                border:`2px solid ${BORDER}`, overflow:"hidden", margin:"0 auto 4px",
                display:"flex", alignItems:"center", justifyContent:"center" }}>
                {c.image
                  ? <img src={c.image} alt={c.label} style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>e.target.style.display="none"}/>
                  : <FiImage size={16} color={GOLD}/>
                }
              </div>
              <p style={{ fontSize:9, color:CHARCOAL, margin:0, fontWeight:600,
                width:60, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{c.label}</p>
            </div>
          ))}
          {cats.filter(c=>c.active).length === 0 && (
            <p style={{ fontSize:12, color:MUTED, margin:0 }}>No active categories</p>
          )}
        </div>

        {cats.map((c, idx) => (
          <div key={c.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"9px 0",
            borderBottom: idx<cats.length-1 ? `1px solid ${BORDER}` : "none",
            opacity: c.active ? 1 : 0.5 }}>
            <div style={{ width:36, height:36, borderRadius:"50%", background:GOLD_LIGHT,
              overflow:"hidden", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
              {c.image
                ? <img src={c.image} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} onError={e=>e.target.style.display="none"}/>
                : <FiImage size={13} color={GOLD}/>
              }
            </div>
            <div style={{ flex:1 }}>
              <p style={{ fontSize:13, fontWeight:600, color:CHARCOAL, margin:0 }}>{c.label}</p>
              <p style={{ fontSize:11, color:MUTED, margin:0 }}>{c.link}</p>
            </div>
            <Toggle value={c.active} onChange={() => toggle(c.id)}/>
            <Btn onClick={() => openEdit(c)}><FiEdit2 size={11}/></Btn>
            <Btn variant="danger" onClick={() => remove(c.id)}><FiTrash2 size={11}/></Btn>
          </div>
        ))}
      </div>

      {modal && (
        <Modal title={form.id ? "Edit Category" : "Add Category"} onClose={() => setModal(false)}
          footer={<><Btn onClick={() => setModal(false)}>Cancel</Btn><Btn variant="primary" onClick={save}>Save</Btn></>}>
          <div style={{ marginBottom:14 }}>
            <ImageUploadBox value={form.image} onChange={f("image")} label="Category Circle Image (from device)" aspect="square"/>
          </div>
          <Field label="Category Label *">
            <Input value={form.label} onChange={f("label")} placeholder="e.g. Ethnic Wear"/>
          </Field>
          <Field label="Link / URL">
            <Input value={form.link} onChange={f("link")} placeholder="/category/women/ethnic"/>
          </Field>
          <Field label="Active">
            <div style={{ display:"flex", alignItems:"center", gap:8 }}>
              <Toggle value={form.active} onChange={v=>f("active")(v)}/>
              <span style={{ fontSize:12, color:MUTED }}>{form.active ? "Visible" : "Hidden"}</span>
            </div>
          </Field>
        </Modal>
      )}

      {toast && <Toast msg={toast} onDone={() => setToast("")}/>}
    </SectionCard>
  );
}

// ═══════════════════════════════════════════════════════════════
// MAIN EXPORT
// ═══════════════════════════════════════════════════════════════
export default function OffersAdminPage() {
  return (
    <>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}*{box-sizing:border-box}`}</style>
      <div style={{ animation:"fadeUp 0.25s ease" }}>
        <div style={{ marginBottom:24 }}>
          <h2 style={{ fontSize:20, fontWeight:700, color:CHARCOAL, margin:0 }}>Offers & Deals</h2>
          <p style={{ fontSize:13, color:MUTED, marginTop:4 }}>
            Manage the{" "}
            <code style={{ background:GOLD_LIGHT, color:GOLD_DARK, padding:"1px 6px", borderRadius:4, fontSize:11 }}>/offers</code>
            {" "}page — banners, coupons, categories
          </p>
        </div>
        <BannersSection/>
        <CouponsSection/>
        <CategoriesSection/>
      </div>
    </>
  );
}