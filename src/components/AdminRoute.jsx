// src/components/AdminRoute.jsx
import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router";
import { fetchAdminMe } from "../api/admin"; // 👈 usa il client API

export default function AdminRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        // 👇 chiama il backend (Render) tramite axios client
        await fetchAdminMe();
        if (!active) return;
        setIsAuthed(true);
      } catch (err) {
        if (!active) return;
        // se 401/403 o errore di rete, consideriamo non autenticato
        setIsAuthed(false);
      } finally {
        if (active) setChecking(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  if (checking) return null; // qui puoi mettere uno spinner se vuoi

  if (!isAuthed) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return children;
}
