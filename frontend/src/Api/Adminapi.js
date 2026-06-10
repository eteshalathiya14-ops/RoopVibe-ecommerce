// frontend/src/Api/Adminapi.js
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Admin login — email + password
export async function adminLogin(email, password) {
  const res = await fetch(`${BASE_URL}/admin/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Login failed");
  return json; // { token, admin }
}

// Verify stored admin token
export async function adminVerifyToken() {
  const token = localStorage.getItem("roopvibe_admin_token") || "";
  if (!token) throw new Error("No token");

  const res = await fetch(`${BASE_URL}/admin/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Invalid token");
  return json.admin;
}