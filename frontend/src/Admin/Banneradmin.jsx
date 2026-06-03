/**
 * BannerAdmin.jsx — BACKEND CONNECTED
 * Supports two modes:
 *  1. Upload-only (image fills entire banner)
 *  2. Full banner (image + title + tag + CTA text)
 */
import { useState } from "react";
import { FiPlus, FiTrash2, FiEdit2, FiMenu, FiSave, FiUpload, FiImage } from "react-icons/fi";
import { useAdminData } from "./context/Admindatacontext";
import {
  Btn, Modal, FormGroup, Input, Toggle, Toast,
  PageHeader, Section, MetricCard, RowItem, Badge,
  GOLD, CHARCOAL, MUTED, BORDER,
} from "./Adminshared";

const EMPTY_FORM = {
  img: "", imgName: "",
  tag: "", title: "", sub: "", cta: "", ctaLink: "",
  bg: "linear-gradient(120deg,#2C1A0E 0%,#5C3A1E 55%,#8B5E2E 100%)",
  active: true,
};

function resolveImg(img) {
  if (!img) return "";
  if (typeof img === "string") return img;
  if (typeof img === "object") return img.src || img.url || "";
  return "";
}

export default function BannerAdmin() {
  const { banners, addBanner, updateBanner, deleteBanner, loading } = useAdminData();
  const [modal,     setModal]     = useState(null); // null | "add" | banner_object
  const [form,      setForm]      = useState(EMPTY_FORM);
  const [toast,     setToast]     = useState(null);
  const [showFull,  setShowFull]  = useState(false); // toggle advanced fields

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openAdd  = () => { setForm(EMPTY_FORM); setShowFull(false); setModal("add"); };
  const openEdit = (b) => {
    setForm({ ...EMPTY_FORM, ...b });
    setShowFull(!!(b.tag || b.title || b.cta));
    setModal(b);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { set("img", ev.target.result); set("imgName", file.name); };
    reader.readAsDataURL(file);
  };

  const save = () => {
    if (!form.img) return alert("Please select a banner image first!");
    if (modal === "add") {
      addBanner({ ...form, title: form.title || form.imgName || "Banner" });
    } else {
      updateBanner({ ...(modal || {}), ...form, title: form.title || form.imgName || "Banner" });
    }
    setModal(null);
    setToast(modal === "add" ? "Banner slide added!" : "Banner updated!");
  };

  const remove = (id) => {
    if (!window.confirm("Delete this banner slide?")) return;
    deleteBanner(id);
    setToast("Deleted!");
  };

  const sorted = [...banners].sort((a, b) => a.order - b.order);

  return (
    <div>
      <PageHeader
        title="Banner Slides"
        sub="Upload banner images — optionally add title, tag & CTA for split-layout banners"
      />

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:24 }}>
        <MetricCard label="Total slides" value={banners.length} />
        <MetricCard label="Active"       value={banners.filter(b=>b.active).length} />
        <MetricCard label="Hidden"       value={banners.filter(b=>!b.active).length} />
      </div>

      <Section
        title="All Slides"
        action={<Btn variant="primary" size="sm" onClick={openAdd}><FiPlus size={14}/> Add Slide</Btn>}
      >
        {loading && !sorted.length && (
          <div style={{ padding:32, textAlign:"center", color:MUTED, fontSize:13 }}>Loading…</div>
        )}
        {sorted.map((b, idx) => {
          const imgSrc = resolveImg(b.img);
          return (
            <RowItem key={b.id || b._id} last={idx === sorted.length - 1}
              left={
                <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                  <FiMenu size={16} color={BORDER} style={{ cursor:"grab" }} />
                  <div style={{ width:100, height:56, borderRadius:6, overflow:"hidden",
                    flexShrink:0, border:`1px solid ${BORDER}`, background:"#f0f0f0" }}>
                    {imgSrc
                      ? <img src={imgSrc} alt="banner"
                          style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center" }}
                          onError={e => e.target.style.display="none"} />
                      : <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center",
                          justifyContent:"center" }}><FiImage size={20} color={BORDER}/></div>
                    }
                  </div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:CHARCOAL }}>
                      {b.title && !/\.(jpe?g|png|webp)$/i.test(b.title)
                        ? b.title
                        : b.imgName || "Banner Slide"}
                    </div>
                    <div style={{ fontSize:11, color:MUTED, marginTop:2 }}>
                      Slide #{idx + 1}
                      {b.tag && <span style={{ marginLeft:6, color:GOLD, fontWeight:600 }}>{b.tag}</span>}
                    </div>
                  </div>
                  {!b.active && <Badge color="#FDECEA" text="#C0392B">HIDDEN</Badge>}
                </div>
              }
              right={<>
                <Toggle value={b.active} onChange={v => updateBanner({ ...b, active:v })} />
                <Btn size="sm" onClick={() => openEdit(b)}><FiEdit2 size={13}/></Btn>
                <Btn size="sm" variant="danger" onClick={() => remove(b.id || b._id)}>
                  <FiTrash2 size={13}/>
                </Btn>
              </>}
            />
          );
        })}
        {!loading && !banners.length && (
          <div style={{ padding:32, textAlign:"center", color:MUTED, fontSize:13 }}>
            No slides yet. Click "Add Slide" to upload a banner.
          </div>
        )}
      </Section>

      {/* Add / Edit Modal */}
      {modal !== null && (
        <Modal
          title={modal === "add" ? "Add New Banner Slide" : "Edit Banner Slide"}
          onClose={() => setModal(null)}
          wide
          footer={<>
            <Btn onClick={() => setModal(null)}>Cancel</Btn>
            <Btn variant="primary" onClick={save}><FiSave size={14}/> Save Slide</Btn>
          </>}
        >
          <div style={{ maxWidth: 520, margin: "0 auto" }}>

            {/* Upload */}
            <FormGroup label="Banner Image (required)">
              <label style={{
                display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center",
                gap:10, cursor:"pointer", padding:"28px 20px",
                border:`2px dashed ${form.img ? GOLD : BORDER}`,
                borderRadius:10, background: form.img ? "#fffdf5" : "#fafafa", transition:"all 0.2s",
              }}>
                {form.img ? <FiImage size={28} color={GOLD}/> : <FiUpload size={28} color={MUTED}/>}
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:14, fontWeight:600, color: form.img ? GOLD : CHARCOAL }}>
                    {form.imgName || "Click to choose a banner image"}
                  </div>
                  <div style={{ fontSize:12, color:MUTED, marginTop:4 }}>
                    {form.img ? "Click to change image" : "JPG, PNG, WEBP supported"}
                  </div>
                </div>
                {form.img && (
                  <span style={{ fontSize:11, color:"#27ae60", fontWeight:700,
                    background:"#eafaf1", padding:"3px 10px", borderRadius:20 }}>✓ Image Selected</span>
                )}
                <input type="file" accept="image/*" style={{ display:"none" }} onChange={handleImageUpload} />
              </label>
            </FormGroup>

            {/* Preview */}
            {form.img && (
              <div style={{ marginTop:12, marginBottom:16 }}>
                <div style={{ fontSize:12, fontWeight:600, color:MUTED, marginBottom:6,
                  textTransform:"uppercase", letterSpacing:"0.5px" }}>Preview</div>
                <div style={{ position:"relative", borderRadius:10, overflow:"hidden",
                  border:`1px solid ${BORDER}` }}>
                  <img src={form.img} alt="preview"
                    style={{ width:"100%", display:"block", maxHeight:200,
                      objectFit:"cover", objectPosition:"center" }} />
                  <button onClick={() => { set("img",""); set("imgName",""); }}
                    style={{ position:"absolute", top:8, right:8, background:"rgba(0,0,0,0.55)",
                      border:"none", borderRadius:"50%", width:26, height:26, color:"#fff",
                      fontSize:15, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
                </div>
              </div>
            )}

            {/* Toggle advanced fields */}
            <div style={{ marginBottom:16 }}>
              <button onClick={() => setShowFull(f => !f)}
                style={{ fontSize:12, color:GOLD, fontWeight:700, background:"none",
                  border:`1px solid ${GOLD}`, borderRadius:20, padding:"5px 14px",
                  cursor:"pointer", fontFamily:"inherit" }}>
                {showFull ? "▲ Hide text fields" : "▼ Add title / tag / CTA (optional)"}
              </button>
              <div style={{ fontSize:11, color:MUTED, marginTop:4 }}>
                Leave empty for a full-width image banner
              </div>
            </div>

            {showFull && (
              <div style={{ border:`1px solid ${BORDER}`, borderRadius:10, padding:16,
                background:"#fafafa", display:"flex", flexDirection:"column", gap:4 }}>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <FormGroup label="Tag (e.g. NEW ARRIVALS)">
                    <Input value={form.tag} onChange={v => set("tag", v.toUpperCase())} placeholder="NEW ARRIVALS" />
                  </FormGroup>
                  <FormGroup label="Sub text (e.g. UP TO 85% OFF)">
                    <Input value={form.sub} onChange={v => set("sub", v)} placeholder="UP TO 85% OFF" />
                  </FormGroup>
                </div>
                <FormGroup label="Title (press Enter for new line)">
                  <textarea value={form.title} onChange={e => set("title", e.target.value)}
                    placeholder={"Summer Wedding\nLooks"} rows={2}
                    style={{ width:"100%", padding:"8px 12px", borderRadius:8, resize:"vertical",
                      border:`1px solid ${BORDER}`, fontSize:13, fontFamily:"inherit",
                      outline:"none", boxSizing:"border-box" }}/>
                </FormGroup>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <FormGroup label="CTA Button Text">
                    <Input value={form.cta} onChange={v => set("cta", v)} placeholder="Shop Now" />
                  </FormGroup>
                  <FormGroup label="CTA Link">
                    <Input value={form.ctaLink} onChange={v => set("ctaLink", v)} placeholder="/category/women/sarees" />
                  </FormGroup>
                </div>
                <FormGroup label="Background gradient (CSS)">
                  <Input value={form.bg} onChange={v => set("bg", v)}
                    placeholder="linear-gradient(120deg,#2C1A0E 0%,#5C3A1E 100%)" />
                </FormGroup>
              </div>
            )}
          </div>
        </Modal>
      )}

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}