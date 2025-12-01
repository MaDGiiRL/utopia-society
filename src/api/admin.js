// src/api/admin.js
import { api } from "./client";

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

/**
 * Lista soci (dati decriptati) per la tab admin
 */
export async function fetchMembers() {
  const res = await api.get("/api/admin/members");
  return res.data; // { ok: true, members: [...] }
}

/**
 * Dettaglio singolo socio (scheda)
 */
export async function fetchMemberById(id) {
  const res = await api.get(`/api/admin/members/${id}`);
  return res.data; // { ok: true, member: {...} }
}

/**
 * Lista messaggi contatti (dati decriptati)
 */
export async function fetchContactMessages() {
  const res = await api.get("/api/admin/contact-messages");
  return res.data; // { ok: true, messages: [...] }
}
