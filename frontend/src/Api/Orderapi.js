// frontend/src/Api/Orderapi.js
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const ORDER_URL = `${BASE_URL}/orders`;

// ── Generic request helper ─────────────────────────────────────
async function apiReq(method, path = "", body = null, isAdmin = false) {
  // User token stored under 'roopvibe_token'
  // Admin token stored under 'roopvibe_admin_token'
  const tokenKey = isAdmin ? "roopvibe_admin_token" : "roopvibe_token";
  const token = localStorage.getItem(tokenKey) || "";

  const res = await fetch(`${ORDER_URL}${path}`, {
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

// ── User APIs (use user token) ────────────────────────────────
export function placeOrder(data)        { return apiReq("POST",  "",                  data); }
export function getMyOrders()           { return apiReq("GET",   "/my"); }
export function getMyOrderById(id)      { return apiReq("GET",   `/my/${id}`); }
export function requestReturn(id, data) { return apiReq("POST",  `/my/${id}/return`,  data); }
export function cancelOrder(id)         { return apiReq("POST",  `/my/${id}/cancel`); }

// ── Admin APIs (use admin token) ──────────────────────────────
export function adminGetAllOrders(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiReq("GET", `/admin/all${qs ? "?" + qs : ""}`, null, true);
}
export function adminGetMetrics()                    { return apiReq("GET",   "/admin/metrics",              null, true); }
export function adminGetOrder(id)                    { return apiReq("GET",   `/admin/${id}`,                null, true); }
export function adminUpdateStatus(id, status, note)  { return apiReq("PATCH", `/admin/${id}/status`,        { status, note }, true); }
export function adminReturnAction(id, action)        { return apiReq("PATCH", `/admin/${id}/return-action`, { action }, true); }