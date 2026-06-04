// src/Api/CategoryFilterApi.js
// Frontend API functions for category filters and category products

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ── PUBLIC: fetch active filters for a navbar section ─────────
export async function fetchFilters(navName) {
  const res = await fetch(`${BASE}/category-filters/${encodeURIComponent(navName)}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.filterGroups || [];
}

// ── PUBLIC: fetch products for a category path ────────────────
// navName = "WOMEN", colTitle = "Ethnic Wear", subItem = "Sarees" (optional)
export async function fetchCategoryProducts(navName, colTitle, subItem) {
  const params = new URLSearchParams();
  if (navName)  params.set("navName", navName);
  if (colTitle) params.set("colTitle", colTitle);
  if (subItem)  params.set("subItem", subItem);

  const res = await fetch(`${BASE}/category-filters/products/search?${params.toString()}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.products || [];
}

// ── ADMIN: fetch all filters (including hidden) ───────────────
export async function fetchFiltersAdmin(navName) {
  const res = await fetch(`${BASE}/category-filters/admin/${encodeURIComponent(navName)}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return { filterGroups: data.filterGroups || [], isDefault: data.isDefault };
}

// ── ADMIN: save entire filter config for a navName ────────────
export async function saveFilters(navName, filterGroups) {
  const res = await fetch(`${BASE}/category-filters/admin/${encodeURIComponent(navName)}/save`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filterGroups }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data;
}

// ── ADMIN: add a filter group ─────────────────────────────────
export async function addFilterGroup(navName, group) {
  const res = await fetch(`${BASE}/category-filters/admin/${encodeURIComponent(navName)}/group`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(group),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data;
}

// ── ADMIN: update a filter group ──────────────────────────────
export async function updateFilterGroup(navName, groupId, updates) {
  const res = await fetch(`${BASE}/category-filters/admin/${encodeURIComponent(navName)}/group/${groupId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data;
}

// ── ADMIN: delete a filter group ──────────────────────────────
export async function deleteFilterGroup(navName, groupId) {
  const res = await fetch(`${BASE}/category-filters/admin/${encodeURIComponent(navName)}/group/${groupId}`, {
    method: "DELETE",
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data;
}

// ── ADMIN: reset to defaults ──────────────────────────────────
export async function resetFilters(navName) {
  const res = await fetch(`${BASE}/category-filters/admin/${encodeURIComponent(navName)}/reset`, {
    method: "POST",
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data;
}