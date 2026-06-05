/**
 * Auth API — login, register, verify, current user
 */

const BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function parseJson(res) {
  return res.json().catch(() => ({}));
}

async function parseResponse(res) {
  const data = await parseJson(res);
  if (!res.ok || data.success === false) {
    const err = new Error(data.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export async function login(email, password) {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = await parseJson(res);

  if (data.needsVerification) {
    const err = new Error(data.message || "Email verification required");
    err.data = data;
    err.needsVerification = true;
    throw err;
  }

  if (!res.ok || data.success === false) {
    const err = new Error(data.message || `HTTP ${res.status}`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export async function register(name, email, password) {
  const res = await fetch(`${BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  return parseResponse(res);
}

export async function verifyEmail(token) {
  const res = await fetch(
    `${BASE}/auth/verify-email?token=${encodeURIComponent(token)}`
  );
  return parseResponse(res);
}

export async function verifyEmailCode(email, code) {
  const res = await fetch(`${BASE}/auth/verify-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  return parseResponse(res);
}

export async function resendVerification(email) {
  const res = await fetch(`${BASE}/auth/resend-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  return parseResponse(res);
}

export async function fetchMe(token) {
  const res = await fetch(`${BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return parseResponse(res);
}

export async function googleLogin(credential) {
  const res = await fetch(`${BASE}/auth/google`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ credential }),
  });
  return parseResponse(res);
}

export async function sendPhoneOtp(phone) {
  const res = await fetch(`${BASE}/auth/phone/send-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  return parseResponse(res);
}

export async function verifyPhoneOtp(phone, code) {
  const res = await fetch(`${BASE}/auth/phone/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, code }),
  });
  return parseResponse(res);
}
