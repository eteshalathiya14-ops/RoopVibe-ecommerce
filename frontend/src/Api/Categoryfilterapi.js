// src/Api/Categoryfilterapi.js
// NOTE: filename lowercase to match existing imports in FilterAdmin and CategoryPage

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ── PUBLIC: fetch active filters for a navbar section ─────────
export async function fetchFilters(navName) {
  try {
    const res = await fetch(`${BASE}/category-filters/${encodeURIComponent(navName.toUpperCase())}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Failed to fetch filters");
    return data.filterGroups || [];
  } catch (err) {
    console.error("fetchFilters error:", err);
    return []; // return empty so fallback filters show
  }
}

// ── PUBLIC: fetch products for a category path ────────────────
export async function fetchCategoryProducts(navName, colTitle, subItem) {
  try {
    const params = new URLSearchParams();
    if (navName)  params.set("navName",  navName);
    if (colTitle) params.set("colTitle", colTitle);
    if (subItem)  params.set("subItem",  subItem);

    const res = await fetch(`${BASE}/category-filters/products/search?${params.toString()}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.message || "Failed to fetch products");
    return data.products || [];
  } catch (err) {
    console.error("fetchCategoryProducts error:", err);
    return [];
  }
}

// ── ADMIN: fetch all filters (including hidden) ───────────────
export async function fetchFiltersAdmin(navName) {
  const res = await fetch(`${BASE}/category-filters/admin/${encodeURIComponent(navName.toUpperCase())}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Failed to fetch admin filters");
  return { filterGroups: data.filterGroups || [], isDefault: data.isDefault };
}

// ── ADMIN: save entire filter config for a navName ────────────
export async function saveFilters(navName, filterGroups) {
  const res = await fetch(`${BASE}/category-filters/admin/${encodeURIComponent(navName.toUpperCase())}/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filterGroups }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Save failed");
  return data;
}

// ── ADMIN: reset to defaults ──────────────────────────────────
export async function resetFilters(navName) {
  const res = await fetch(`${BASE}/category-filters/admin/${encodeURIComponent(navName.toUpperCase())}/reset`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Reset failed");
  return data;
}

// ── ADMIN: add a filter group ─────────────────────────────────
export async function addFilterGroup(navName, group) {
  const res = await fetch(`${BASE}/category-filters/admin/${encodeURIComponent(navName.toUpperCase())}/group`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(group),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Add failed");
  return data;
}

// ── ADMIN: update a filter group ──────────────────────────────
export async function updateFilterGroup(navName, groupId, updates) {
  const res = await fetch(`${BASE}/category-filters/admin/${encodeURIComponent(navName.toUpperCase())}/group/${groupId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Update failed");
  return data;
}

// ── ADMIN: delete a filter group ──────────────────────────────
export async function deleteFilterGroup(navName, groupId) {
  const res = await fetch(`${BASE}/category-filters/admin/${encodeURIComponent(navName.toUpperCase())}/group/${groupId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || "Delete failed");
  return data;
}