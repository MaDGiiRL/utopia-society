// src/api/client.js
import axios from "axios";

const baseURL = import.meta.env.VITE_ADMIN_API_URL;

export const api = axios.create({
    baseURL,
    withCredentials: true, // 👈 per i cookie admin_token
});
