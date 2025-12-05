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

// ✅ versione con filtro exported / non_exported / all
export async function fetchMembers(exportFilter = "non_exported") {
  let exportedParam = "false"; // default: solo non esportati

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

/* -------- Eventi (admin + home) -------- */

export async function fetchAdminEvents() {
  const res = await api.get("/api/admin/events");
  return res.data;
}

export async function createAdminEvent(payload) {
  const res = await api.post("/api/admin/events", payload);
  return res.data;
}

export async function updateAdminEvent(id, payload) {
  const res = await api.patch(`/api/admin/events/${id}`, payload);
  return res.data;
}

export async function deleteAdminEvent(id) {
  const res = await api.delete(`/api/admin/events/${id}`);
  return res.data;
}

// endpoint pubblico per homepage (featured + upcoming)
export async function fetchHomeEvents() {
  const res = await api.get("/api/admin/events/home");
  return res.data;
}
