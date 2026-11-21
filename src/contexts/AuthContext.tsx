import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { invalidateSubscriptionCache } from "../hooks/useSubscription";
import { getStoredUser, type AuthUser } from "../types/auth";

export const AUTH_USER_UPDATED_EVENT = "authUserUpdated";

interface AuthContextValue {
  user: AuthUser | null;
  isAdmin: boolean;
  isEmployee: boolean;
  isSuperAdmin: boolean;
  refreshUser: () => void;
  updateUser: (patch: Partial<AuthUser>) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function notifyAuthUserUpdated() {
  window.dispatchEvent(new Event(AUTH_USER_UPDATED_EVENT));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());

  const refreshUser = useCallback(() => {
    setUser(getStoredUser());
  }, []);

  const updateUser = useCallback((patch: Partial<AuthUser>) => {
    setUser((prev) => {
      const base = prev ?? getStoredUser();
      if (!base) return null;
      const next = { ...base, ...patch };
      localStorage.setItem("user", JSON.stringify(next));
      return next;
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("shopLogo");
    localStorage.removeItem("shopName");
    invalidateSubscriptionCache();
    setUser(null);
  }, []);

  useEffect(() => {
    const sync = () => setUser(getStoredUser());
    window.addEventListener("storage", sync);
    window.addEventListener(AUTH_USER_UPDATED_EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(AUTH_USER_UPDATED_EVENT, sync);
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAdmin: user?.role === "ADMIN",
      isEmployee: user?.role === "EMPLOYEE",
      isSuperAdmin: user?.role === "SUPER_ADMIN",
      refreshUser,
      updateUser,
      logout,
    }),
    [user, refreshUser, updateUser, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (ctx) return ctx;
  // Fallback sûr si un composant est rendu hors AuthProvider
  const user = getStoredUser();
  return {
    user,
    isAdmin: user?.role === "ADMIN",
    isEmployee: user?.role === "EMPLOYEE",
    isSuperAdmin: user?.role === "SUPER_ADMIN",
    refreshUser: () => undefined,
    updateUser: () => undefined,
    logout: () => undefined,
  };
}
