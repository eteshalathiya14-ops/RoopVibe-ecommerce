// frontend/src/Api/Supportapi.js
const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function req(method, path, body = null, isAdmin = false) {
  const tokenKey = isAdmin ? "roopvibe_admin_token" : "roopvibe_token";
  const token    = localStorage.getItem(tokenKey) || "";
  const res = await fetch(`${BASE}/support${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.message || "API error");
  return json.data;
}

// User
export const submitSupportMessage = (data) => req("POST", "", data);

// Admin
export const adminGetSupportMessages = (params = {}) => {
  const qs = new URLSearchParams(params).toString();
  return req("GET", `/admin/all${qs ? "?" + qs : ""}`, null, true);
};
export const adminGetSupportMetrics  = ()              => req("GET",    "/admin/metrics",  null,   true);
export const adminUpdateSupport      = (id, data)      => req("PATCH",  `/admin/${id}`,    data,   true);
export const adminDeleteSupport      = (id)            => req("DELETE", `/admin/${id}`,    null,   true);