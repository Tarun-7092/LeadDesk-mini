import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { status } = useAuth();

  if (status === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-grid">
        <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-ink-soft)]">Checking session…</p>
      </div>
    );
  }

  if (status === "guest") {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}
