// src/api/admin.js
import { api } from "./client";

// LOGIN / LOGOUT / ME (già esistenti)
export async function adminLogin({ email, password }) {
  const res = await api.post("/api/admin/login", { email, password });
  return res.data;
}

export async function fetchAdminMe() {
  const res = await api.get("/api/admin/me");
  return res.data;
}

export async function adminLogout() {
  const res = await api.post("/api/admin/logout");
  return res.data;
}

// 👇 AGGIUNTO: lista soci (usa /api/admin/members)
export async function fetchMembers() {
  const res = await api.get("/api/admin/members", {
    withCredentials: true,
  });
  return res.data; // { ok, members: [...] } con email decriptata
}

// 👇 AGGIUNTO: dettaglio singolo socio
export async function fetchMemberById(id) {
  const res = await api.get(`/api/admin/members/${id}`, {
    withCredentials: true,
  });
  return res.data; // { ok, member: {...} } con email/phone/fiscal decriptati
}
