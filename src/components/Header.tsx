import { AlertTriangle, Clock, LogOut, Mail } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { getAccountEmailStatus, getSubscription, resendAccountVerification, type AccountEmailStatus } from "../services";
import type { SubscriptionInfo } from "../types";
import { getStoredUser } from "../types/auth";
import NotificationBell from "./NotificationBell";

const pageConfig: Record<string, { title: string; description: string }> = {
  "/dashboard": {
    title: "Tableau de bord",
    description: "Vue d'ensemble de votre activité.",
  },
  "/products": {
    title: "Produits",
    description: "Gérez vos produits et alertes de stock.",
  },
  "/clients": {
    title: "Clients",
    description: "Gérez vos clients et suivez leurs comptes.",
  },
  "/suppliers": {
    title: "Fournisseurs",
    description: "Gérez vos fournisseurs et dettes.",
  },
  "/stock": {
    title: "Mouvements de stock",
    description: "Historique complet des entrées, sorties et ventes.",
  },
  "/sales": {
    title: "Ventes",
    description: "Enregistrez et suivez vos ventes.",
  },
  "/invoices": {
    title: "Factures",
    description: "Consultez, recherchez et gérez vos factures.",
  },
  "/cash": { title: "Caisse", description: "Gérez votre caisse journalière." },
  "/users": {
    title: "Utilisateurs",
    description: "Gérez les comptes de votre boutique.",
  },
  "/analytics": { title: "Analytics", description: "Analysez vos ventes et vos performances." },
  "/sales/history": { title: "Historique des ventes", description: "Retrouvez toutes les ventes enregistrées." },
  "/account/security": { title: "Sécurité du compte", description: "Mot de passe et vérification de votre compte." },
  "/settings": {
    title: "Paramètres",
    description: "Gérez les informations et le logo de votre boutique.",
  },
};


// Interface pour typer le retour de l'alerte d'abonnement
interface SubscriptionAlert {
  text: string;
  type: "warning" | "danger";
  title: string;
}

function getSubscriptionAlert(
  subscription?: SubscriptionInfo,
): SubscriptionAlert | null {
  if (!subscription) return null;

  if (subscription.status === "GRACE_PERIOD") {
    const days = subscription.gracePeriodDaysRemaining ?? 0;
    return {
      title: "Votre abonnement est en période de grâce :",
      text: `Votre formule ${subscription.plan.name} a expiré. Vous conservez toutes ses fonctionnalités pendant encore ${days} jour${days > 1 ? "s" : ""}. Renouvelez avant la fin de ce délai pour éviter le passage au forfait gratuit.`,
      type: "warning",
    };
  }

  if (subscription.status === "TRIAL_EXPIRED") {
    return {
      title: "Votre période d'essai est terminée :",
      text: "Votre boutique fonctionne désormais avec le forfait gratuit. Choisissez un forfait payant pour retrouver les fonctionnalités correspondantes.",
      type: "danger",
    };
  }

  if (subscription.status === "EXPIRED") {
    return {
      title: "Votre abonnement payant est terminé :",
      text: "Votre boutique fonctionne désormais avec le forfait gratuit. Choisissez un forfait payant pour retrouver les fonctionnalités correspondantes.",
      type: "danger",
    };
  }

  if (!subscription.endDate) return null;

  const now = new Date();
  const diff = new Date(subscription.endDate).getTime() - now.getTime();
  if (Number.isNaN(diff)) return null;
  const daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (daysRemaining <= 0) {
    return {
      title: "Abonnement arrivé à échéance :",
      text: "La période de grâce est terminée. Votre boutique utilise maintenant le forfait gratuit.",
      type: "danger",
    };
  }

  if (daysRemaining <= 7) {
    return {
      title: "Renouvellement à prévoir :",
      text: `Il vous reste ${daysRemaining} ${daysRemaining === 1 ? "jour" : "jours"} d'abonnement. Renouvelez votre offre pour éviter une interruption.`,
      type: "warning",
    };
  }
  return null;
}

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getStoredUser();
   const [subscription, setSubscription] = useState<SubscriptionInfo>();
   const [emailStatus, setEmailStatus] = useState<AccountEmailStatus | null>(null);
   const [resendingVerification, setResendingVerification] = useState(false);

  
    useEffect(() => {
      getSubscription().then(setSubscription).catch(() => undefined);
      getAccountEmailStatus().then(setEmailStatus).catch(() => undefined);
    }, []);

    const emailVerifiedAt = emailStatus ? emailStatus.emailVerifiedAt : user?.emailVerifiedAt ?? null;

    const handleResendVerification = async () => {
      setResendingVerification(true);
      try {
        const result = await resendAccountVerification();
        toast.success(result.message);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Impossible d'envoyer le lien pour le moment.");
      } finally {
        setResendingVerification(false);
      }
    };
  

  const currentPage = pageConfig[location.pathname] || {
    title: "Jokko Business",
    description: "Gestion commerciale intelligente.",
  };

  const alertConfig = getSubscriptionAlert(subscription);

  const currentDate = new Date().toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

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
            <p className="text-xs text-ink/55">
              {user?.role === "ADMIN" ? "Administrateur" : "Employé"} · {user?.shopName}
            </p>
          </div>

          <NotificationBell />

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-jokko text-sm font-extrabold text-white">
            {user?.name?.charAt(0).toUpperCase() || "U"}
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

      {!emailVerifiedAt && (
        <div className="flex flex-col gap-3 rounded-2xl border border-sun/60 bg-sun/20 px-5 py-4 text-sm text-ink sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Mail size={19} className="mt-0.5 shrink-0 text-ink" />
            <div>
              <p className="font-semibold">Votre adresse email n'est pas encore vérifiée.</p>
              <p className="mt-1 text-ink">Confirmez {emailStatus?.email || user?.email || "votre adresse"} pour sécuriser votre compte.</p>
            </div>
          </div>
          <button type="button" onClick={handleResendVerification} disabled={resendingVerification} className="shrink-0 rounded-full bg-sun px-4 py-2 font-semibold text-white hover:bg-sun disabled:cursor-not-allowed disabled:opacity-60">
            {resendingVerification ? "Envoi..." : "Renvoyer le lien"}
          </button>
        </div>
      )}

      {/* SECTION 2 : Bandeau d'alerte d'abonnement conditionnel */}
      {alertConfig && (
        <div
          className={`flex items-start gap-3 rounded-2xl border px-5 py-3.5 text-sm transition-all duration-300 animate-in fade-in slide-in-from-top-2 ${
            alertConfig.type === "danger"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-sun/60 bg-sun/20 text-ink"
          }`}
        >
          {alertConfig.type === "danger" ? (
            <AlertTriangle size={18} className="text-red-600 mt-0.5 shrink-0" />
          ) : (
            <Clock size={18} className="text-ink mt-0.5 shrink-0" />
          )}
          
          <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <p className="leading-relaxed">
              <b>{alertConfig.title}</b>{" "}
              {alertConfig.text}
            </p>
            <button
              type="button"
              onClick={() => navigate("/settings")} // Ou redirection vers ta page de tarification/modal
              className={`text-xs font-bold uppercase tracking-wider  shrink-0 whitespace-nowrap self-end sm:self-center cursor-pointer  text-black ${
                alertConfig.type === "danger"
                  ? "text-red-950 hover:text-red-900"
                  : "text-ink hover:text-ink"
              }`}
            >
              Renouveler mon offre
            </button>
          </div>
        </div>
      )}
    </header>
  );
}