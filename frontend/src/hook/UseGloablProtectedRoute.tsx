import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/session-check", {
          method: "GET",
          credentials: "include",
        });

        setLoggedIn(res.status === 200);
      } catch {
        setLoggedIn(false);
      } finally {
        setLoading(false);
      }
    }

    checkSession();
  }, []);

  if (loading) return null;

  return isLoggedIn ? children : <Navigate to="/login" replace />;
}
