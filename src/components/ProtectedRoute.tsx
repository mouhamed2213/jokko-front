import { useEffect, useState } from "react";
import type { ReactElement } from "react";

import { Navigate } from "react-router-dom";
import { SuperAdminContext, type SuperAdminProfile } from "../hooks/useSuperAdmin";
import { getSuperAdminMe } from "../services";
import { getStoredUser } from "../types/auth";
type Props = {
  children: React.ReactNode;
};

export default function ProtectedRoute({
  children,
}: {
  children: ReactElement;
}) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
}


type SessionState = "checking" | "valid" | "invalid" | "error";

export function SuperAdminGuard({ children }: Props) {
  const hasToken = !!localStorage.getItem("sa_user");
  const [state, setState] = useState<SessionState>(
    hasToken ? "checking" : "invalid",
  );
  const [attempt, setAttempt] = useState(0);
  const [admin, setAdmin] = useState<SuperAdminProfile | null>(null);

  useEffect(() => {
    if (!hasToken) return;

    let cancelled = false;
    setState("checking");

    getSuperAdminMe()
      .then((profile) => {
        if (cancelled) return;
        setAdmin(profile);
        setState("valid");
      })
      .catch((error) => {
        if (cancelled) return;
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          // Token falsifié, expiré ou compte supprimé : on nettoie la session
          localStorage.removeItem("sa_user");
          setState("invalid");
        } else {
          // Réseau / serveur indisponible : on ne déconnecte pas
          setState("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, [hasToken, attempt]);

  if (!hasToken || state === "invalid") {
    return <Navigate to="/super-admin/login" replace />;
  }

  if (state === "checking") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-sm text-gray-400">
        Vérification de la session...
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-slate-50 text-sm text-gray-500">
        <p>Impossible de vérifier la session. Vérifiez votre connexion.</p>
        <button
          type="button"
          onClick={() => setAttempt((n) => n + 1)}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:opacity-90"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <SuperAdminContext.Provider value={admin}>{children}</SuperAdminContext.Provider>
  );
}

export function SubscriptionGuard({ children }: Props) {
  const user = getStoredUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
