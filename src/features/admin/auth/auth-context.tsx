"use client";

/**
 * Centralized admin auth state. Single source for token/user, login, logout,
 * and the global 401 handler. Components use `useAuth()` — they never touch
 * localStorage or the HTTP layer directly.
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { clearToken, getToken, setToken, setUnauthorizedHandler } from "@/lib/api";
import type { AuthUser, LoginRequest } from "@/lib/api";
import { login as loginRequest, logout as logoutRequest } from "./admin-auth-api";
import { clearStoredUser, getStoredUser, setStoredUser } from "./auth-storage";

type AuthContextValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  /** True until the token/user have been hydrated from storage on the client. */
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate auth state from storage after mount (client-only). Deferred via rAF
  // so the synchronous-setState-in-effect lint rule is satisfied and SSR markup
  // matches the first client render.
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      if (getToken()) {
        setUser(getStoredUser());
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  // Global 401 → clear session + send to login. Registered with the API client.
  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearStoredUser();
      setUser(null);
      setIsAuthenticated(false);
      router.replace("/admin/login");
    });
    return () => setUnauthorizedHandler(null);
  }, [router]);

  const login = useCallback(async (credentials: LoginRequest) => {
    const res = await loginRequest(credentials);
    const { token, user: authUser } = res.data;
    setToken(token);
    setStoredUser(authUser);
    setUser(authUser);
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(async () => {
    try {
      if (getToken()) await logoutRequest();
    } catch {
      // Best-effort: a failed backend logout must not block local sign-out.
    } finally {
      clearToken();
      clearStoredUser();
      setUser(null);
      setIsAuthenticated(false);
      router.replace("/admin/login");
    }
  }, [router]);

  const value = useMemo(
    () => ({ user, isAuthenticated, isLoading, login, logout }),
    [user, isAuthenticated, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
