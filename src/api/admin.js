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
 * fetchMembers
 *
 * exportFilter può essere:
 *  - "non_exported" (default) → exported=false
 *  - "exported"               → exported=true
 *  - "all"                    → exported=all
 *
 * Il backend deve leggere req.query.exported e filtrare di conseguenza.
 */
export async function fetchMembers(exportFilter = "non_exported") {
  let exportedParam = "false";

  if (exportFilter === "exported") {
    exportedParam = "true";
  } else if (exportFilter === "all") {
    exportedParam = "all";
  }

  const res = await api.get("/api/admin/members", {
    params: { exported: exportedParam },
  });

  return res.data;
}

export async function fetchMemberById(id) {
  const res = await api.get(`/api/admin/members/${id}`);
  return res.data;
}

export async function fetchContactMessages() {
  const res = await api.get("/api/admin/contact-messages");
  return res.data;
}

// 👇 usata dal ContactSection
export async function sendContactMessage(payload) {
  const res = await api.post("/api/admin/contact", payload);
  return res.data;
}
