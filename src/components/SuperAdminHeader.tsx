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
  { path: "/admin/subscriptions", end: true, info: { title: "Abonnements", description: "Suivi des abonnements des boutiques principales." } },
  { path: "/admin/settings", end: true, info: { title: "Paramètres", description: "Configuration de la plateforme Jokko Business." } },
  { path: "/admin/settings/maintenance", info: { title: "Mode maintenance", description: "Rendre la plateforme temporairement inaccessible." } },
  { path: "/admin/settings/subscription-grace-period", info: { title: "Période de grâce", description: "Délai de conservation du forfait après expiration." } },
  { path: "/admin/settings/users", info: { title: "Utilisateurs", description: "Accès à l'administration de la plateforme." } },
  { path: "/admin/security", info: { title: "Sécurité du compte", description: "Mot de passe et vérification de votre compte." } },
  {
    path: "/admin/dash",
    info: {
      title: "Tableau de bord",
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
        error?.response?.data?.message || "Impossible d'envoyer le lien pour le moment.",
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
    <header className="flex flex-col gap-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-ink/55 first-letter:uppercase">{currentDate}</p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-[-0.03em] sm:text-4xl">
            {currentPage.title}
            <span className="-ml-[0.04em] text-sun">.</span>
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-ink/65">{currentPage.description}</p>
        </div>

        <div className="flex items-center gap-3 self-start lg:self-auto">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-extrabold">{user?.name}</p>
            <p className="text-xs text-ink/55">Super admin · Plateforme</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-jokko text-sm font-extrabold text-white">
            {user?.name?.charAt(0).toUpperCase() || "A"}
          </div>
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-full border border-ink/20 px-4 py-2 text-sm font-bold transition hover:border-ink hover:bg-ink hover:text-white"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Déconnexion</span>
          </button>
        </div>
      </div>

      {emailStatus && !emailStatus.emailVerifiedAt && (
        <div className="flex flex-col gap-3 rounded-2xl border border-sun/60 bg-sun/15 px-5 py-4 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Mail size={19} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-extrabold">L'adresse e-mail du Super Admin n'est pas vérifiée.</p>
              <p className="mt-1 text-ink/75">Confirmez {emailStatus.email} pour sécuriser ce compte.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={resendingVerification}
            className="shrink-0 rounded-full bg-ink px-5 py-2 font-bold text-white transition hover:bg-jokko-deep disabled:opacity-60"
          >
            {resendingVerification ? "Envoi..." : "Renvoyer le lien"}
          </button>
        </div>
      )}
    </header>
  );
}
