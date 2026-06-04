import { useState, useEffect } from "react";
import { FiMenu, FiImage, FiGrid, FiPackage, FiEye, FiHome, FiX,FiShoppingBag,FiTag,FiFilter   } from "react-icons/fi";
import { Link } from "react-router-dom";

import BannerAdmin      from "./Banneradmin";
import CategoryBarAdmin from "./Categorybaradmin";
import ProductAdmin     from "./Productadmin";
import NavbarAdminPage  from "./Navbaradminpage";
import OrderAdminPage   from "./Orderadmin";
import OffersAdminPage from "./Offersadmin";
import FilterAdmin      from "./Filteradmin";
import PreviewPage      from "./Previewpage";

import { useAdminData } from "./context/Admindatacontext";
import {
  GOLD, CHARCOAL, MUTED, SURFACE, BORDER, WHITE,
} from "./Adminshared";

const NAV = [
  { key:"navbar",    icon:<FiMenu size={16}/>,    label:"Navbar items",  desc:"Top nav WOMEN MEN etc." },
  { key:"banners",   icon:<FiImage size={16}/>,   label:"Banner slides", desc:"Hero carousel" },
  { key:"catbar",    icon:<FiGrid size={16}/>,    label:"Category bar",  desc:"Arch icons row" },
  { key:"products",  icon:<FiPackage size={16}/>, label:"Products",      desc:"Full product CRUD" },
  { key:"orders", icon:<FiShoppingBag size={16}/>, label:"Orders", desc:"Manage all orders" },
  { key:"offers", icon:<FiTag size={16}/>, label:"Offers & Deals", desc:"Banners, coupons, flash" },
  { key:"filters",   icon:<FiFilter  size={16}/>,    label:"Category filters",  desc:"Faceted filters for category pages" },
  { key:"preview",   icon:<FiEye size={16}/>,     label:"Preview",       desc:"Live data preview" },
];

function useIsMobile() {
  const [m, setM] = useState(() => window.innerWidth <= 768);
  useEffect(() => {
    const fn = () => setM(window.innerWidth <= 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return m;
}

export default function AdminPanel() {
  const [page, setPage] = useState("products");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isMobile = useIsMobile();
  const { products, banners, categories } = useAdminData();

  const metrics = {
    navbar:   "–",
    banners:  banners.filter(b=>b.active).length + " active",
    catbar:   Object.values(categories).reduce((s,arr)=>s+arr.length,0) + " items",
    products: products.length + " products",
    orders:   "8 orders", 
    preview:  "–",
  };

  return (
    <div style={{ display:"flex", flexDirection: isMobile ? "column" : "row", height:"100vh", background:SURFACE, fontFamily:"'Segoe UI',system-ui,sans-serif" }}>

      {/* Mobile Header */}
      {isMobile && (
        <div style={{ height:56, background:WHITE, borderBottom:`1px solid ${BORDER}`, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 16px", flexShrink:0, zIndex:1100 }}>
          <div style={{ fontWeight:800, color:CHARCOAL }}>RoopVibe Admin</div>
          <button onClick={() => setSidebarOpen(true)} style={{ background:"none", border:"none", cursor:"pointer", color:CHARCOAL }}>
            <FiMenu size={20}/>
          </button>
        </div>
      )}

      {/* Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:1200 }} />
      )}

      {/* Sidebar */}
      <div style={{
        width:230, background:WHITE, borderRight:`1px solid ${BORDER}`,
        display:"flex", flexDirection:"column", flexShrink:0,
        position: isMobile ? "fixed" : "relative",
        top:0, left: sidebarOpen || !isMobile ? 0 : -230,
        bottom:0, zIndex:1300, transition:"left 0.25s ease"
      }}>

        {isMobile && (
          <div style={{ display:"flex", justifyContent:"flex-end", padding:"12px 12px 0" }}>
            <button onClick={() => setSidebarOpen(false)} style={{ background:"none", border:"none", cursor:"pointer", color:MUTED }}>
              <FiX size={20}/>
            </button>
          </div>
        )}

        <div style={{ padding:"20px 18px 16px", borderBottom:`1px solid ${BORDER}` }}>
          <div style={{ fontSize:17, fontWeight:800, color:CHARCOAL, letterSpacing:"0.5px" }}>RoopVibe</div>
          <div style={{ fontSize:11, color:MUTED, marginTop:2 }}>Admin Dashboard</div>
        </div>

        <nav style={{ padding:"8px 0", flex:1 }}>
          {NAV.map(item => (
            <div key={item.key} onClick={() => { setPage(item.key); if(isMobile) setSidebarOpen(false); }}
              style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 18px",
                fontSize:13, cursor:"pointer", transition:"all 0.15s",
                color: page===item.key ? CHARCOAL : MUTED,
                borderLeft: `2px solid ${page===item.key ? GOLD : "transparent"}`,
                background: page===item.key ? SURFACE : "transparent",
                fontWeight: page===item.key ? 600 : 400 }}>
              <span style={{ color: page===item.key ? GOLD : MUTED }}>{item.icon}</span>
              <div>
                <div>{item.label}</div>
                <div style={{ fontSize:10, color:MUTED, fontWeight:400 }}>{metrics[item.key]}</div>
              </div>
            </div>
          ))}
        </nav>

        <div style={{ padding:"14px 18px", borderTop:`1px solid ${BORDER}` }}>
          <Link to="/" target="_blank"
            style={{ display:"flex", alignItems:"center", gap:6, fontSize:12, color:MUTED, textDecoration:"none" }}>
            <FiHome size={13}/> View live site
          </Link>
          <div style={{ fontSize:11, color:MUTED, marginTop:8, lineHeight:1.6 }}>
            Mock mode — changes stay in memory.<br/>
            Will be saved after connecting to the backend.
          </div>
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex:1, overflowY:"auto", padding: isMobile ? 16 : 32 }}>
        {page === "navbar"   && <NavbarAdminPage />}
        {page === "banners"  && <BannerAdmin />}
        {page === "catbar"   && <CategoryBarAdmin />}
        {page === "products" && <ProductAdmin />}
        {page === "orders" && <OrderAdminPage />}
        {page === "offers" && <OffersAdminPage />}
        {page === "filters" && <FilterAdmin />}
        {page === "preview"  && <PreviewPage />}
      </div>
    </div>
  );
}