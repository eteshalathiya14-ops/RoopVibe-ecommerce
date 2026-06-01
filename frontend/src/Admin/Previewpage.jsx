import { useState } from "react";
import { useAdminData } from "./context/Admindatacontext";
import {
  GOLD, GOLD_DARK, GOLD_LIGHT, CHARCOAL, MUTED, BORDER, WHITE, SURFACE,
  PageHeader,
} from "./Adminshared";

export default function PreviewPage() {
  const { banners, categories, products } = useAdminData();
  const [hoverBanner, setHoverBanner]   = useState(0);
  const [activeGender, setActiveGender] = useState("WOMEN");

  const activeBanners = banners.filter(b=>b.active).sort((a,b)=>a.order-b.order);
  const slide         = activeBanners[hoverBanner % Math.max(activeBanners.length,1)];
  const catItems      = (categories[activeGender]||[]).filter(x=>x.active).sort((a,b)=>a.order-b.order);
  const homeProducts  = products.filter(p=>p.active&&p.showOnHome).slice(0,8);

  return (
    <div>
      <PageHeader title="Preview" sub="How the frontend will look with current admin data" />

      {/* Banner preview */}
      <div style={{ marginBottom:24 }}>
        <h3 style={{ fontSize:14, fontWeight:600, color:CHARCOAL, marginBottom:12 }}>Hero Banner</h3>
        {slide ? (
          <>
            <div style={{ height:140, borderRadius:10, background:slide.bg, position:"relative",
              overflow:"hidden", border:`1px solid ${BORDER}` }}>
              <img src={slide.img} alt="" style={{ position:"absolute", right:0, top:0,
                width:"40%", height:"100%", objectFit:"cover", objectPosition:"top" }}
                onError={e=>e.target.style.display="none"} />
              <div style={{ position:"absolute", left:20, top:20 }}>
                <div style={{ fontSize:8, fontWeight:800, color:GOLD, letterSpacing:"1px", marginBottom:6 }}>{slide.tag}</div>
                <div style={{ fontSize:16, fontWeight:800, color:"#fff", lineHeight:1.2,
                  whiteSpace:"pre-line", fontFamily:"Georgia,serif" }}>{slide.title}</div>
                <div style={{ fontSize:9, color:GOLD, fontWeight:700, marginTop:6 }}>{slide.sub}</div>
                <div style={{ marginTop:8, padding:"4px 12px", border:`1.5px solid ${GOLD}`, color:GOLD,
                  fontSize:9, fontWeight:800, borderRadius:4, display:"inline-block" }}>{slide.cta} →</div>
              </div>
            </div>
            <div style={{ display:"flex", justifyContent:"center", gap:8, marginTop:8 }}>
              {activeBanners.map((_,i) => (
                <button key={i} onClick={() => setHoverBanner(i)}
                  style={{ padding:0, border:"none", background:"none", cursor:"pointer" }}>
                  <div style={{ width:i===hoverBanner?18:6, height:6, borderRadius:4,
                    background:i===hoverBanner?GOLD:BORDER, transition:"all 0.3s" }}/>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div style={{ padding:24, border:`1px dashed ${BORDER}`, borderRadius:8,
            textAlign:"center", color:MUTED, fontSize:13 }}>
            No active banners. Add one from Banner admin.
          </div>
        )}
      </div>

      {/* Category bar preview */}
      <div style={{ marginBottom:24 }}>
        <h3 style={{ fontSize:14, fontWeight:600, color:CHARCOAL, marginBottom:12 }}>Category Bar</h3>
        <div style={{ background:SURFACE, borderRadius:10, border:`1px solid ${BORDER}`, overflow:"hidden" }}>
          <div style={{ display:"flex", borderBottom:`1px solid ${BORDER}` }}>
            {Object.keys(categories).map(g => (
              <button key={g} onClick={() => setActiveGender(g)}
                style={{ padding:"8px 16px", fontSize:11, fontWeight:600, cursor:"pointer",
                  color: activeGender===g ? GOLD_DARK : MUTED, background:"none", border:"none",
                  borderBottom:`2px solid ${activeGender===g ? GOLD : "transparent"}`,
                  fontFamily:"inherit" }}>
                {g}
              </button>
            ))}
          </div>
          <div style={{ display:"flex", gap:8, padding:"12px 16px", overflowX:"auto", scrollbarWidth:"none" }}>
            {catItems.map(cat => (
              <div key={cat.id} style={{ display:"flex", flexDirection:"column", alignItems:"center", minWidth:72 }}>
                <div style={{ width:56, height:68, borderRadius:"28px 28px 6px 6px", overflow:"hidden",
                  border:`1.5px solid ${BORDER}`, background: cat.isMy ? GOLD_LIGHT : "#F2EBE0", marginBottom:4 }}>
                  {cat.isMy
                    ? <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center",
                        justifyContent:"center", fontSize:12, fontWeight:800, color:GOLD_DARK }}>MY</div>
                    : <img src={cat.img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"top" }}
                        onError={e=>e.target.parentElement.style.background=GOLD_LIGHT} />
                  }
                </div>
                <span style={{ fontSize:8, fontWeight:600, color:MUTED, textAlign:"center", whiteSpace:"nowrap" }}>
                  {cat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Products preview */}
      <div>
        <h3 style={{ fontSize:14, fontWeight:600, color:CHARCOAL, marginBottom:12 }}>
          Homepage Products ({homeProducts.length})
        </h3>
        {homeProducts.length ? (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
            {homeProducts.map(p => {
              const thumb = p.colorVariants?.[0]?.images?.[0] || "";
              const disc  = Math.round((1 - p.price/p.mrp)*100);
              return (
                <div key={p.id} style={{ background:WHITE, borderRadius:8, overflow:"hidden", border:`1px solid ${BORDER}` }}>
                  <div style={{ height:120, background:SURFACE }}>
                    <img src={thumb} alt={p.title} style={{ width:"100%", height:"100%",
                      objectFit:"cover", objectPosition:"top" }}
                      onError={e=>e.target.style.display="none"} />
                  </div>
                  <div style={{ padding:"8px 10px" }}>
                    <div style={{ fontSize:11, fontWeight:600, color:CHARCOAL, marginBottom:4,
                      whiteSpace:"nowrap", overflow:"hidden", textOverflow:"ellipsis" }}>{p.title}</div>
                    <div style={{ display:"flex", alignItems:"center", gap:4 }}>
                      <span style={{ fontSize:12, fontWeight:700, color:CHARCOAL }}>₹{p.price}</span>
                      <span style={{ fontSize:10, color:MUTED, textDecoration:"line-through" }}>₹{p.mrp}</span>
                      <span style={{ fontSize:9, fontWeight:700, color:"#2E7D32",
                        background:"#E8F5E9", padding:"1px 4px", borderRadius:3 }}>{disc}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div style={{ padding:24, border:`1px dashed ${BORDER}`, borderRadius:8,
            textAlign:"center", color:MUTED, fontSize:13 }}>
            No products with "Show on Home" enabled. Toggle from Product admin.
          </div>
        )}
      </div>
    </div>
  );
}