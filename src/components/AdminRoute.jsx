import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router";

export default function AdminRoute({ children }) {
  const [checking, setChecking] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);
  const location = useLocation();

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const res = await fetch("/api/admin/me", {
          credentials: "include",
        });
        if (!active) return;
        setIsAuthed(res.ok);
      } catch {
        if (!active) return;
        setIsAuthed(false);
      } finally {
        if (active) setChecking(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  if (checking) return null; // o uno spinner se vuoi

  if (!isAuthed) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  return children;
}
