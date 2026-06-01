import { useState } from "react";
import { FiPlus, FiTrash2, FiMenu, FiSave, FiUpload, FiImage } from "react-icons/fi";
import { useAdminData } from "./context/Admindatacontext";
import {
  Btn, Modal, FormGroup, Toggle, Toast,
  PageHeader, Section, MetricCard, RowItem, Badge,
  GOLD, CHARCOAL, MUTED, BORDER,
} from "./Adminshared";

const EMPTY_FORM = { img: "", imgName: "", active: true };

export default function BannerAdmin() {
  const { banners, addBanner, updateBanner, deleteBanner } = useAdminData();
  const [modal, setModal] = useState(null);
  const [form,  setForm]  = useState(EMPTY_FORM);
  const [toast, setToast] = useState(null);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const openAdd = () => { setForm(EMPTY_FORM); setModal("add"); };

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
    if (!form.img) return alert("Please select a banner image first!");
    addBanner({ ...form, title: form.imgName || "Banner" });
    setModal(null);
    setToast("Banner slide added!");
  };

  const remove = id => {
    if (!window.confirm("Delete this banner slide?")) return;
    deleteBanner(id);
    setToast("Deleted!");
  };

  const sorted = [...banners].sort((a, b) => a.order - b.order);

  return (
    <div>
      <PageHeader
        title="Banner Slides"
        sub="Upload ready-made banner images for the homepage carousel"
      />

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:12, marginBottom:24 }}>
        <MetricCard label="Total slides" value={banners.length} />
        <MetricCard label="Active"       value={banners.filter(b=>b.active).length} />
        <MetricCard label="Hidden"       value={banners.filter(b=>!b.active).length} />
      </div>

      <Section
        title="All Slides"
        action={
          <Btn variant="primary" size="sm" onClick={openAdd}>
            <FiPlus size={14}/> Add Slide
          </Btn>
        }
      >
        {sorted.map((b, idx) => (
          <RowItem
            key={b.id}
            last={idx === sorted.length - 1}
            left={
              <div style={{ display:"flex", alignItems:"center", gap:12 }}>
                <FiMenu size={16} color={BORDER} style={{ cursor:"grab" }} />
                {/* Banner thumbnail */}
                <div style={{
                  width: 100, height: 56, borderRadius: 6,
                  overflow: "hidden", flexShrink: 0,
                  border: `1px solid ${BORDER}`, background: "#f0f0f0"
                }}>
                  <img
                    src={b.img} alt="banner"
                    style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top" }}
                    onError={e => e.target.style.display="none"}
                  />
                </div>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:CHARCOAL }}>
                    {b.imgName || b.title || "Banner Slide"}
                  </div>
                  <div style={{ fontSize:11, color:MUTED, marginTop:2 }}>
                    Slide #{idx + 1}
                  </div>
                </div>
                {!b.active && <Badge color="#FDECEA" text="#C0392B">HIDDEN</Badge>}
              </div>
            }
            right={<>
              <Toggle value={b.active} onChange={v => updateBanner({ ...b, active:v })} />
              <Btn size="sm" variant="danger" onClick={() => remove(b.id)}>
                <FiTrash2 size={13}/>
              </Btn>
            </>}
          />
        ))}
        {!banners.length && (
          <div style={{ padding:32, textAlign:"center", color:MUTED, fontSize:13 }}>
            No slides yet. Click "Add Slide" to upload a banner.
          </div>
        )}
      </Section>

      {modal && (
        <Modal
          title="Add New Banner Slide"
          onClose={() => setModal(null)}
          wide
          footer={<>
            <Btn onClick={() => setModal(null)}>Cancel</Btn>
            <Btn variant="primary" onClick={save}>
              <FiSave size={14}/> Save Slide
            </Btn>
          </>}
        >
          <div style={{ maxWidth: 480, margin: "0 auto" }}>

            {/* Upload area */}
            <FormGroup label="Select Banner Image from Your Device">
              <label style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 10,
                cursor: "pointer",
                padding: "32px 20px",
                border: `2px dashed ${form.img ? GOLD : BORDER}`,
                borderRadius: 10,
                background: form.img ? "#fffdf5" : "#fafafa",
                transition: "all 0.2s",
              }}>
                {form.img
                  ? <FiImage size={28} color={GOLD} />
                  : <FiUpload size={28} color={MUTED} />
                }
                <div style={{ textAlign:"center" }}>
                  <div style={{ fontSize:14, fontWeight:600, color: form.img ? GOLD : CHARCOAL }}>
                    {form.imgName || "Click to choose a banner image"}
                  </div>
                  <div style={{ fontSize:12, color:MUTED, marginTop:4 }}>
                    {form.img ? "Click to change image" : "JPG, PNG, WEBP supported"}
                  </div>
                </div>
                {form.img && (
                  <span style={{
                    fontSize: 11, color: "#27ae60", fontWeight: 700,
                    background: "#eafaf1", padding: "3px 10px", borderRadius: 20
                  }}>
                    ✓ Image Selected
                  </span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display:"none" }}
                  onChange={handleImageUpload}
                />
              </label>
            </FormGroup>

            {/* Full preview */}
            {form.img && (
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize:12, fontWeight:600, color:MUTED, marginBottom:6, textTransform:"uppercase", letterSpacing:"0.5px" }}>
                  Preview
                </div>
                <div style={{ position:"relative", borderRadius:10, overflow:"hidden", border:`1px solid ${BORDER}` }}>
                  <img
                    src={form.img}
                    alt="banner preview"
                    style={{ width:"100%", display:"block", maxHeight:220, objectFit:"cover", objectPosition:"top" }}
                  />
                  <button
                    onClick={() => { set("img",""); set("imgName",""); }}
                    style={{
                      position:"absolute", top:8, right:8,
                      background:"rgba(0,0,0,0.55)", border:"none",
                      borderRadius:"50%", width:26, height:26,
                      color:"#fff", fontSize:15, cursor:"pointer",
                      display:"flex", alignItems:"center", justifyContent:"center",
                    }}
                    title="Remove image"
                  >×</button>
                </div>
              </div>
            )}

          </div>
        </Modal>
      )}

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}