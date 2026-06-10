// frontend/src/Api/Offersapi.js
// All Offers API calls — mirrors backend/routes/offers.routes.js

const BASE_RAW = import.meta.env.VITE_API_URL || "http://localhost:5000";
// Normalize so we never end up with /api/api/offers
const BASE = BASE_RAW.replace(/\/+$/, "").replace(/\/api\/$/, "").replace(/\/api$/, "");
const ROOT = `${BASE}/api/offers`;

// ── Generic request helper ────────────────────────────────────
async function request(method, path, body) {
  const token = localStorage.getItem("token") || "";

  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };

  if (body !== undefined) options.body = JSON.stringify(body);

  const res  = await fetch(`${ROOT}${path}`, options);
  const json = await res.json();

  if (!json.success) throw new Error(json.message || "Something went wrong");
  return json.data;
}

const get   = (path)       => request("GET",    path);
const post  = (path, body) => request("POST",   path, body);
const put   = (path, body) => request("PUT",    path, body);
const del   = (path)       => request("DELETE", path);
const patch = (path, body) => request("PATCH",  path, body);

// ══════════════════════════════════════════════════════════════
//  PUBLIC — user-facing /offers page (single fast call)
// ══════════════════════════════════════════════════════════════
export const fetchAllOffers = () => get("/");
// Returns: { banners: [], coupons: [], categories: [] }  (active only)

// ══════════════════════════════════════════════════════════════
//  BANNERS  (admin)
// ══════════════════════════════════════════════════════════════
export const fetchBanners = ()          => get("/banners");        // all (incl inactive)
export const createBanner = (data)      => post("/banners", data);
export const updateBanner = (id, data)  => put(`/banners/${id}`, data);
export const deleteBanner = (id)        => del(`/banners/${id}`);
export const toggleBanner = (id)        => patch(`/banners/${id}/toggle`);

// ══════════════════════════════════════════════════════════════
//  COUPONS  (admin + public validate)
// ══════════════════════════════════════════════════════════════
export const fetchCoupons   = ()                   => get("/coupons");
export const validateCoupon = (code, orderAmount)  =>
  get(`/coupons/validate?code=${encodeURIComponent(code)}&orderAmount=${orderAmount}`);
export const applyCoupon    = (code)               => post("/coupons/apply", { code });
export const createCoupon   = (data)               => post("/coupons", data);
export const updateCoupon   = (id, data)           => put(`/coupons/${id}`, data);
export const deleteCoupon   = (id)                 => del(`/coupons/${id}`);
export const toggleCoupon   = (id)                 => patch(`/coupons/${id}/toggle`);

// ══════════════════════════════════════════════════════════════
//  CATEGORY DEALS  (admin)
// ══════════════════════════════════════════════════════════════
export const fetchCategories  = ()         => get("/categories");
export const createCategory   = (data)     => post("/categories", data);
export const updateCategory   = (id, data) => put(`/categories/${id}`, data);
export const deleteCategory   = (id)       => del(`/categories/${id}`);
export const toggleCategory   = (id)       => patch(`/categories/${id}/toggle`);

// ══════════════════════════════════════════════════════════════
//  SEED  (admin — run once)
// ══════════════════════════════════════════════════════════════
export const seedOffers = () => post("/seed");