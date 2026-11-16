import { LogOut, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { matchPath, useLocation, useNavigate } from "react-router-dom";
import { useSuperAdmin } from "../hooks/useSuperAdmin";
import {
  getSuperAdminEmailStatus,
  resendSuperAdminVerification,
  type AccountEmailStatus,
} from "../services";
import { logoutSuperAdmin } from "../utils/superAdminAuth";

type PageInfo = { title: string; description: string };

// Chemins alignés sur les vraies routes de App.tsx
const pages: { path: string; end?: boolean; info: PageInfo }[] = [
  {
    path: "/admin/dash",
    info: {
      title: "Tableau de bord Super Admin",
      description: "Vue d'ensemble de votre plateforme.",
    },
  },
  {
    path: "/admin/shops",
    end: true,
    info: {
      title: "Boutiques",
      description: "Gérez toutes les boutiques de votre plateforme.",
    },
  },
  {
    path: "/admin/owners",
    end: true,
    info: {
      title: "Propriétaires",
      description: "Retrouvez chaque propriétaire et son réseau de boutiques.",
    },
  },
  {
    path: "/admin/owners/:id",
    info: {
      title: "Réseau du propriétaire",
      description:
        "Vue globale de la boutique principale et de ses boutiques secondaires.",
    },
  },
  {
    path: "/admin/shops/:id",
    info: {
      title: "Détail boutique",
      description: "Consultez les informations détaillées d'une boutique.",
    },
  },
];

export default function SuperAdminHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useSuperAdmin();
  const [emailStatus, setEmailStatus] = useState<AccountEmailStatus | null>(
    null,
  );
  const [resendingVerification, setResendingVerification] = useState(false);

  useEffect(() => {
    getSuperAdminEmailStatus()
      .then(setEmailStatus)
      .catch(() => undefined);
  }, []);

  const handleResendVerification = async () => {
    setResendingVerification(true);
    try {
      const result = await resendSuperAdminVerification();
      toast.success(result.message);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Unable to send the link right now.",
      );
    } finally {
      setResendingVerification(false);
    }
  };

  const currentPage: PageInfo = pages.find((p) =>
    matchPath({ path: p.path, end: p.end ?? true }, location.pathname),
  )?.info || {
    title: "Jokko Business Super Admin",
    description: "Gestion de plateforme.",
  };

  const currentDate = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const logout = () => logoutSuperAdmin(navigate);

  return (
    <header className="flex flex-col gap-4">
      <div className="rounded-2xl bg-white px-6 py-4 shadow-sm flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {currentPage.title}
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">
            {currentPage.description}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
            <p className="text-xs text-gray-400">
              Super Admin •{" "}
              <span className="font-medium text-slate-600">Plateforme</span>
            </p>
            <p className="text-xs capitalize text-gray-400">{currentDate}</p>
          </div>

          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white shadow-inner">
            {user?.name?.charAt(0).toUpperCase() || "A"}
          </div>

          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600 transition shadow-sm"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
        {emailStatus && !emailStatus.emailVerifiedAt && (
          <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3">
              <Mail size={19} className="mt-0.5 shrink-0 text-amber-700" />
              <div>
                <p className="font-semibold">
                  L adresse email du Super Admin n est pas vérifiée.
                </p>
                <p className="mt-1 text-amber-800">
                  Confirmez {emailStatus.email} pour sécuriser ce compte.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={resendingVerification}
              className="shrink-0 rounded-lg bg-amber-900 px-4 py-2 font-semibold text-white hover:bg-amber-800 disabled:opacity-60"
            >
              {resendingVerification ? "Envoi..." : "Renvoyer le lien"}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
