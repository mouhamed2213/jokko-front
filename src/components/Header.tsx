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
    description: "Gerez vos produits et alertes de stock.",
  },
  "/clients": {
    title: "Clients",
    description: "Gerez vos clients et suivez leurs comptes.",
  },
  "/suppliers": {
    title: "Fournisseurs",
    description: "Gerez vos fournisseurs et dettes.",
  },
  "/stock": {
    title: "Mouvements de stock",
    description: "Historique complet des entrees, sorties et ventes.",
  },
  "/sales": {
    title: "Ventes",
    description: "Enregistrez et suivez vos ventes.",
  },
  "/invoices": {
    title: "Factures",
    description: "Consultez, recherchez et gerez vos factures.",
  },
  "/cash": { title: "Caisse", description: "Gerez votre caisse journaliere." },
  "/users": {
    title: "Utilisateurs",
    description: "Gerez les comptes de votre boutique.",
  },
  "/settings": {
    title: "Parametres",
    description: "Gerez les informations et le logo de votre boutique.",
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
      text: `Votre formule ${subscription.plan.name} a expiré. Vous conservez toutes ses fonctionnalités pendant encore ${days} jour${days > 1 ? "s" : ""}. Renouvelez avant la fin de ce délai pour éviter le passage au forfait Essentielle.`,
      type: "warning",
    };
  }

  if (
    subscription.status === "EXPIRED" ||
    subscription.status === "TRIAL_EXPIRED"
  ) {
    return {
      title: "Votre abonnement payant est terminé :",
      text: "Votre boutique fonctionne désormais avec le forfait Essentielle. Choisissez un forfait payant pour retrouver les fonctionnalités correspondantes.",
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
      text: "La période de grâce est terminée. Votre boutique utilise maintenant le forfait Essentielle.",
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
    <header className="flex flex-col gap-4">
      {/* SECTION 1 : Infos de la page et profil utilisateur */}
      <div className="rounded-2xl bg-slate-900 text-white px-6 py-4 shadow-sm flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">
            {currentPage.title}
          </h2>
          <p className="mt-0.5 text-sm text-gray-400">
            {currentPage.description}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900">{user?.name}</p>
            <p className="text-xs text-gray-400">
              {user?.role === "ADMIN" ? "Administrateur" : "Employe"} •{" "}
              <span className="font-medium text-slate-600">{user?.shopName}</span>
            </p>
            <p className="text-xs capitalize text-gray-400">{currentDate}</p>
          </div>
          
          <NotificationBell />
          
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white shadow-inner">
            {user?.name?.charAt(0).toUpperCase() || "U"}
          </div>
          
          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-3 py-2 text-sm font-medium text-white hover:bg-red-600 transition shadow-sm"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Deconnexion</span>
          </button>
        </div>
      </div>

      {!emailVerifiedAt && (
        <div className="flex flex-col gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-3">
            <Mail size={19} className="mt-0.5 shrink-0 text-amber-700" />
            <div>
              <p className="font-semibold">Votre adresse email n'est pas encore vérifiée.</p>
              <p className="mt-1 text-amber-800">Confirmez {emailStatus?.email || user?.email || "votre adresse"} pour sécuriser votre compte.</p>
            </div>
          </div>
          <button type="button" onClick={handleResendVerification} disabled={resendingVerification} className="shrink-0 rounded-lg bg-amber-900 px-4 py-2 font-semibold text-white hover:bg-amber-800 disabled:cursor-not-allowed disabled:opacity-60">
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
              : "border-amber-200 bg-amber-50 text-amber-800"
          }`}
        >
          {alertConfig.type === "danger" ? (
            <AlertTriangle size={18} className="text-red-600 mt-0.5 shrink-0" />
          ) : (
            <Clock size={18} className="text-amber-600 mt-0.5 shrink-0" />
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
                  : "text-amber-950 hover:text-amber-900"
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