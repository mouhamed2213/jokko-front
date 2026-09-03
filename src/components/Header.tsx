import { AlertTriangle, Clock, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getSubscription } from "../services";
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
    title: "Stock",
    description: "Enregistrez les entrees et sorties de stock.",
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
}

function getSubscriptionAlert(endDate: Date | null): SubscriptionAlert | null {
  if (!endDate) return null;

  const now = new Date();
  const diff = new Date(endDate).getTime() - now.getTime();
  const daysRemaining = Math.ceil(diff / (1000 * 60 * 60 * 24));

  if (daysRemaining <= 0) {
    return {
      text: "Reabonnez-vous pour debloquer toutes les fonctionnalites.",
      type: "danger",
    };
  } 
  
  if (daysRemaining <= 7) {
    return {
      text: `Attention : Il ne vous reste plus que ${daysRemaining} ${daysRemaining === 1 ? 'jour' : 'jours'} d'abonnement. Pensez a renouveler votre forfait pour eviter toute interruption.`,
      type: "warning",
    };
  }

  return null;
}

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getStoredUser();
   const [subscription  , setSubscription ] = useState<SubscriptionInfo>();

  
    useEffect(() => {
      getSubscription().then(data => {
        setSubscription(data)
      });
    }, []);
  

  const currentPage = pageConfig[location.pathname] || {
    title: "Jokko Business",
    description: "Gestion commerciale intelligente.",
  };

  const endDate = new Date(subscription?.endDate as Date);

  const alertConfig = getSubscriptionAlert(endDate);

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
              <b>{alertConfig.type === "danger" ? "Abonnement à expiré !" : "Renouvellement requis :"}</b>{" "}
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