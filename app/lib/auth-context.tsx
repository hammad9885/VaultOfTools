"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { api } from "./api";

type AuthUser = {
  id?: string;
  email?: string;
  displayName?: string;
  photoURL?: string | null;
  role?: string;
  status?: string;
  [key: string]: any;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  setSession: (user: AuthUser | null, token?: string | null) => void;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  signOut: async () => {},
  refresh: async () => {},
  setSession: () => {},
});

async function firebaseSignOutSafe() {
  try {
    const { signOut: authSignOut } = await import("./auth");
    await authSignOut();
  } catch {}
}

export async function signOut(): Promise<void> {
  api.clearToken();
  await firebaseSignOutSafe();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const setSession = useCallback((next: AuthUser | null, token?: string | null) => {
    if (token) api.setToken(token);
    if (next === null && token === null) api.clearToken();
    setUser(next);
    setLoading(false);
  }, []);

  const loadFromToken = useCallback(async () => {
    const token = api.getToken();
    if (!token) {
      setUser(null);
      return null;
    }
    try {
      const res = await api.getMe();
      setUser(res.user);
      return res.user;
    } catch (err: any) {
      if (err?.status === 401) api.clearToken();
      setUser(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let alive = true;
    let unsub = () => {};
    // Never leave /auth stuck on spinner if /me hangs (Mongo down, etc.)
    const safety = window.setTimeout(() => {
      if (alive) setLoading(false);
    }, 4000);

    (async () => {
      try {
        await loadFromToken();
      } finally {
        if (alive) {
          window.clearTimeout(safety);
          setLoading(false);
        }
      }

      try {
        const { subscribeToAuthState, syncAppSession } = await import("./auth");
        if (!alive) return;
        unsub = subscribeToAuthState(async (fbUser) => {
          if (!alive || !fbUser) return;
          try {
            if (!api.getToken()) {
              await syncAppSession(fbUser);
              if (alive) await loadFromToken();
            }
          } catch {
            // ignore background sync errors
          }
        });
      } catch {
        // Firebase optional
      }
    })();

    return () => {
      alive = false;
      window.clearTimeout(safety);
      unsub();
    };
  }, [loadFromToken]);

  const ctxRefresh = useCallback(async () => {
    await loadFromToken();
    setLoading(false);
  }, [loadFromToken]);

  const ctxSignOut = useCallback(async () => {
    api.clearToken();
    setUser(null);
    setLoading(false);
    await firebaseSignOutSafe();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, refresh: ctxRefresh, signOut: ctxSignOut, setSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}
