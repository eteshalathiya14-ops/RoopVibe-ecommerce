// frontend/src/admin/AdminPanel.jsx
import { useState, useEffect } from "react";
import { FiMenu, FiImage, FiGrid, FiPackage, FiHome, FiX, FiShoppingBag, FiTag, FiFilter, FiLogOut, FiHeadphones} from "react-icons/fi";
import { Link, useNavigate } from "react-router-dom";

import BannerAdmin      from "./Banneradmin";
import CategoryBarAdmin from "./Categorybaradmin";
import ProductAdmin     from "./Productadmin";
import NavbarAdminPage  from "./Navbaradminpage";
import OrderAdminPage   from "./Orderadmin";
import OffersAdminPage  from "./Offersadmin";
import FilterAdmin      from "./Filteradmin";
import SupportAdmin     from "./supportAdmin";

import { adminVerifyToken } from "../Api/Adminapi";
import { useAdminData } from "./context/Admindatacontext";
import { GOLD, CHARCOAL, MUTED, SURFACE, BORDER, WHITE } from "./Adminshared";

const NAV = [
  { key: "navbar",   icon: <FiMenu size={16} />,        label: "Navbar items",     desc: "Top nav WOMEN MEN etc." },
  { key: "banners",  icon: <FiImage size={16} />,       label: "Banner slides",    desc: "Hero carousel" },
  { key: "catbar",   icon: <FiGrid size={16} />,        label: "Category bar",     desc: "Arch icons row" },
  { key: "products", icon: <FiPackage size={16} />,     label: "Products",         desc: "Full product CRUD" },
  { key: "orders",   icon: <FiShoppingBag size={16} />, label: "Orders",           desc: "Manage all orders" },
  { key: "offers",   icon: <FiTag size={16} />,         label: "Offers & Deals",   desc: "Banners, coupons, flash" },
  { key: "support",  icon: <FiHeadphones size={16} />,  label: "Support",          desc: "Customer support" },
  { key: "filters",  icon: <FiFilter size={16} />,      label: "Category filters", desc: "Faceted filters" },
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

function AuthCheckScreen() {
  return (
    <div style={{ minHeight: "100vh", background: SURFACE, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 28, height: 28, border: `3px solid ${GOLD}30`, borderTopColor: GOLD, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default function AdminPanel() {
  const [page, setPage]               = useState("products");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [authChecking, setChecking]   = useState(true);
  const [isAuthed, setIsAuthed]       = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const { products, banners, categories } = useAdminData();

  useEffect(() => {
    const token = localStorage.getItem("roopvibe_admin_token");
    if (!token) {
      navigate("/login", { replace: true });
      return;
    }
    adminVerifyToken()
      .then(() => setIsAuthed(true))
      .catch(() => {
        localStorage.removeItem("roopvibe_admin_token");
        navigate("/login", { replace: true });
      })
      .finally(() => setChecking(false));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("roopvibe_admin_token");
    navigate("/login", { replace: true });
  };

  if (authChecking) return <AuthCheckScreen />;
  if (!isAuthed)    return null;

  const metrics = {
    navbar:   "–",
    banners:  banners.filter(b => b.active).length + " active",
    catbar:   Object.values(categories).reduce((s, arr) => s + arr.length, 0) + " items",
    products: products.length + " products",
    orders:   "Live",
  };

  return (
    <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", height: "100vh", background: SURFACE, fontFamily: "'Segoe UI',system-ui,sans-serif" }}>

      {isMobile && (
        <div style={{ height: 56, background: WHITE, borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", flexShrink: 0, zIndex: 1100 }}>
          <div style={{ fontWeight: 800, color: CHARCOAL }}>RoopVibe Admin</div>
          <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", color: CHARCOAL }}>
            <FiMenu size={20} />
          </button>
        </div>
      )}

      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 1200 }} />
      )}

      <div style={{
        width: 230, background: WHITE, borderRight: `1px solid ${BORDER}`,
        display: "flex", flexDirection: "column", flexShrink: 0,
        position: isMobile ? "fixed" : "relative",
        top: 0, left: sidebarOpen || !isMobile ? 0 : -230,
        bottom: 0, zIndex: 1300, transition: "left 0.25s ease",
      }}>
        {isMobile && (
          <div style={{ display: "flex", justifyContent: "flex-end", padding: "12px 12px 0" }}>
            <button onClick={() => setSidebarOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: MUTED }}>
              <FiX size={20} />
            </button>
          </div>
        )}

        <div style={{ padding: "20px 18px 16px", borderBottom: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: 17, fontWeight: 800, color: CHARCOAL, letterSpacing: "0.5px" }}>RoopVibe</div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 2 }}>Admin Dashboard</div>
        </div>

        <nav style={{ padding: "8px 0", flex: 1 }}>
          {NAV.map(item => (
            <div key={item.key} onClick={() => { setPage(item.key); if (isMobile) setSidebarOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 10, padding: "10px 18px",
                fontSize: 13, cursor: "pointer", transition: "all 0.15s",
                color: page === item.key ? CHARCOAL : MUTED,
                borderLeft: `2px solid ${page === item.key ? GOLD : "transparent"}`,
                background: page === item.key ? SURFACE : "transparent",
                fontWeight: page === item.key ? 600 : 400,
              }}>
              <span style={{ color: page === item.key ? GOLD : MUTED }}>{item.icon}</span>
              <div>
                <div>{item.label}</div>
                <div style={{ fontSize: 10, color: MUTED, fontWeight: 400 }}>{metrics[item.key]}</div>
              </div>
            </div>
          ))}
        </nav>

        <div style={{ padding: "14px 18px", borderTop: `1px solid ${BORDER}` }}>
          <Link to="/" target="_blank"
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: MUTED, textDecoration: "none", marginBottom: 10 }}>
            <FiHome size={13} /> View live site
          </Link>
          <button onClick={handleLogout}
            style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: MUTED, background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit", width: "100%" }}>
            <FiLogOut size={13} /> Logout
          </button>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: isMobile ? 16 : 32 }}>
        {page === "navbar"   && <NavbarAdminPage />}
        {page === "banners"  && <BannerAdmin />}
        {page === "catbar"   && <CategoryBarAdmin />}
        {page === "products" && <ProductAdmin />}
        {page === "orders"   && <OrderAdminPage />}
        {page === "offers"   && <OffersAdminPage />}
        {page === "filters"  && <FilterAdmin />}
        {page === "support"  && <SupportAdmin />}
      </div>
    </div>
  );
}