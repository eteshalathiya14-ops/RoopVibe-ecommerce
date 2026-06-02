// src/api/navbarApi.js
// Navbar ke liye saare API calls — frontend se backend connect karta hai

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ── Public: active navbar items fetch (Navbar.jsx use karega) ──
export async function fetchNavbar() {
  const res = await fetch(`${BASE}/navbar`);
  if (!res.ok) throw new Error("Failed to fetch navbar");
  const data = await res.json();
  return data.items; // [{ name, order, special, active, link, columns }]
}

// ── Admin: all navbar items (active + inactive) ─────────────────
export async function fetchAllNavbar() {
  const res = await fetch(`${BASE}/navbar/all`);
  if (!res.ok) throw new Error("Failed to fetch all navbar items");
  const data = await res.json();
  return data.items;
}

// ── Admin: add new navbar item ──────────────────────────────────
export async function addNavItem(payload) {
  const res = await fetch(`${BASE}/navbar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to add nav item");
  return (await res.json()).item;
}

// ── Admin: update navbar item (name/order/special/link/active) ──
export async function updateNavItem(id, payload) {
  const res = await fetch(`${BASE}/navbar/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update nav item");
  return (await res.json()).item;
}

// ── Admin: delete navbar item ───────────────────────────────────
export async function deleteNavItem(id) {
  const res = await fetch(`${BASE}/navbar/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete nav item");
  return true;
}

// ── Admin: full columns replace (save entire columns array) ─────
// Navbar item ka poora columns array ek saath update karta hai
export async function saveColumns(id, columns) {
  const res = await fetch(`${BASE}/navbar/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ columns }),
  });
  if (!res.ok) throw new Error("Failed to save columns");
  return (await res.json()).item;
}

// ── Admin: add column to navbar item ────────────────────────────
export async function addColumn(id, title) {
  const res = await fetch(`${BASE}/navbar/${id}/add-column`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title }),
  });
  if (!res.ok) throw new Error("Failed to add column");
  return (await res.json()).item;
}

// ── Admin: update column
export async function updateColumn(navId, colId, payload) {
  const res = await fetch(`${BASE}/navbar/${navId}/update-column/${colId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update column");
  return (await res.json()).item;
}

// ── Admin: delete column
export async function deleteColumn(navId, colId) {
  const res = await fetch(`${BASE}/navbar/${navId}/delete-column/${colId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete column");
  return true;
}
