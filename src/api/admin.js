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
