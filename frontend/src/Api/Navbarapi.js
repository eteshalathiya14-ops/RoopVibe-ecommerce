// src/Api/Navbarapi.js
// All navbar API functions — used by NavbarAdminPage AND FilterAdmin

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export async function fetchNavbar() {
  const res = await fetch(`${BASE}/navbar`);
  const data = await res.json();
  return data.items || [];
}

export async function fetchAllNavbar() {
  const res = await fetch(`${BASE}/navbar/all`);
  const data = await res.json();
  return data.items || [];
}

export async function addNavItem(payload) {
  const res = await fetch(`${BASE}/navbar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.item;
}

export async function updateNavItem(id, payload) {
  const res = await fetch(`${BASE}/navbar/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.item;
}

export async function deleteNavItem(id) {
  const res = await fetch(`${BASE}/navbar/${id}`, { method: "DELETE" });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data;
}

export async function saveColumns(id, columns) {
  const res = await fetch(`${BASE}/navbar/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ columns }),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message);
  return data.item;
}