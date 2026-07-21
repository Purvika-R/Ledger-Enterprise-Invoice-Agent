import { createContext, useContext, useEffect, useMemo, useState } from "react";

import { getCurrentUser, login as loginRequest, register as registerRequest } from "../services/auth";
import type { AuthUser } from "../services/auth";

const TOKEN_KEY = "ledger_access_token";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  authenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      setLoading(false);
      return;
    }

    getCurrentUser()
      .then(setUser)
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setLoading(false));
  }, []);

  async function login(email: string, password: string) {
    const response = await loginRequest(email, password);
    localStorage.setItem(TOKEN_KEY, response.access_token);
    setUser(response.user);
  }

  async function register(name: string, email: string, password: string) {
    const response = await registerRequest(name, email, password);
    localStorage.setItem(TOKEN_KEY, response.access_token);
    setUser(response.user);
  }

  function logout() {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }

  const value = useMemo(() => ({ user, loading, authenticated: user !== null, login, register, logout }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
