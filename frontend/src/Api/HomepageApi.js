/**
 * homeAPI.js
 * All API calls for Home page data (banners, categories, products)
 * Used by AdminDataContext.jsx
 */

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function apiFetch(path, opts = {}) {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...opts,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

// ── Public ──────────────────────────────────────────────────
export const fetchActiveBanners            = () => apiFetch("/home/banners").then(d => d.items || []);
export const fetchActiveCategoriesGrouped  = () => apiFetch("/home/categories").then(d => d.categories || {});
export const fetchHomeProducts             = () => apiFetch("/home/products").then(d => d.items || []);

// ── Admin — Banners ─────────────────────────────────────────
export const fetchAllBanners = () => apiFetch("/home/admin/banners").then(d => d.items || []);

export const addBanner = (payload) =>
  apiFetch("/home/admin/banners", { method:"POST", body:JSON.stringify(payload) }).then(d => d.item);

export const updateBanner = (id, payload) =>
  apiFetch(`/home/admin/banners/${id}`, { method:"PUT", body:JSON.stringify(payload) }).then(d => d.item);

export const deleteBanner = (id) =>
  apiFetch(`/home/admin/banners/${id}`, { method:"DELETE" }).then(() => true);

// ── Admin — Categories ──────────────────────────────────────
export const fetchAllCategoriesGrouped = () =>
  apiFetch("/home/admin/categories").then(d => d.categories || {});

export const addCategory = (gender, item) =>
  apiFetch("/home/admin/categories", { method:"POST", body:JSON.stringify({ gender, item }) }).then(d => d.row);

export const updateCategory = (gender, item) =>
  apiFetch("/home/admin/categories", {
    method:"PUT",
    body:JSON.stringify({ gender, id: item.id || item._id, item }),
  }).then(d => d.row);

export const deleteCategory = (gender, id) =>
  apiFetch("/home/admin/categories", {
    method:"DELETE",
    body:JSON.stringify({ gender, id }),
  }).then(() => true);

// ── Admin — Products ────────────────────────────────────────
export const fetchAllProducts = () => apiFetch("/home/admin/products").then(d => d.items || []);

export const addProduct = (payload) =>
  apiFetch("/home/admin/products", { method:"POST", body:JSON.stringify(payload) }).then(d => d.item);

export const updateProduct = (id, payload) =>
  apiFetch(`/home/admin/products/${id}`, { method:"PUT", body:JSON.stringify(payload) }).then(d => d.item);

export const deleteProduct = (id) =>
  apiFetch(`/home/admin/products/${id}`, { method:"DELETE" }).then(() => true);