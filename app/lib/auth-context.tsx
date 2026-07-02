"use client";

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import { api } from "./api";
import { signOut as authSignOut } from "./auth";

type AuthState = {
  user: any | null;
  loading: boolean;
};

type AuthContextValue = AuthState & {
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true, signOut: async () => {}, refresh: async () => {} });

export async function signOut(): Promise<void> {
  api.clearToken();
  try { await authSignOut(); } catch {}
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const token = api.getToken();

    if (!token) {
      setLoading(false);
      return;
    }

    api.getMe()
      .then((res) => {
        if (!cancelled) { setUser(res.user); setLoading(false); }
      })
      .catch((err) => {
        if (err?.status === 401) {
          api.clearToken();
        }
        if (!cancelled) setLoading(false);
      });

    return () => { cancelled = true; };
  }, []);

  const ctxSignOut = useCallback(async () => {
    api.clearToken();
    setUser(null);
    setLoading(false);
    try { await authSignOut(); } catch {}
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, signOut: ctxSignOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
