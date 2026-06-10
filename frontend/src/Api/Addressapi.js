// frontend/src/Api/Addressapi.js
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const ADDR_URL = `${BASE_URL}/address`;   // ✅ /api already in BASE_URL

async function apiReq(method, path = "", body = null) {
  const token = localStorage.getItem("roopvibe_token") || "";
  const res = await fetch(`${ADDR_URL}${path}`, {
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

export function fetchAddresses()        { return apiReq("GET"); }
export function fetchAddress(id)        { return apiReq("GET",    `/${id}`); }
export function createAddress(data)     { return apiReq("POST",   "",        data); }
export function updateAddress(id, data) { return apiReq("PUT",    `/${id}`,  data); }
export function deleteAddress(id)       { return apiReq("DELETE", `/${id}`); }
export function setDefaultAddress(id)   { return apiReq("PATCH",  `/${id}/default`); }