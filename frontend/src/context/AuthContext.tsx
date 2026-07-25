import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, ApiRequestError } from "../api/client";
import type { AdminUser } from "../types";

interface AuthContextValue {
  user: AdminUser | null;
  status: "checking" | "authed" | "guest";
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [status, setStatus] = useState<"checking" | "authed" | "guest">("checking");

  useEffect(() => {
    api
      .get<AdminUser>("/auth/me")
      .then((u) => {
        setUser(u);
        setStatus("authed");
      })
      .catch(() => setStatus("guest"));
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const u = await api.post<AdminUser>("/auth/login", { email, password });
    setUser(u);
    setStatus("authed");
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post("/auth/logout");
    } catch {
      // clear client state even if the network call fails
    }
    setUser(null);
    setStatus("guest");
  }, []);

  return <AuthContext.Provider value={{ user, status, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export { ApiRequestError };
