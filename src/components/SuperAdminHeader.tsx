import { LogOut } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { getStoredUser } from "../types/auth";

const pageConfig: Record<
  string,
  { title: string; description: string }
> = {
  "/admin": {
    title: "Tableau de bord Super Admin",
    description: "Vue d'ensemble de votre plateforme.",
  },
  "/admin/shops": {
    title: "Boutiques",
    description: "Gérez toutes les boutiques de votre plateforme.",
  },
  "/admin/shops/:id": {
    title: "Détail boutique",
    description: "Consultez les informations détaillées d'une boutique.",
  },
  "/admin/audit-log": {
    title: "Journal d'audit",
    description: "Consultez l'historique des actions effectuées.",
  },
  "/admin/settings": {
    title: "Paramètres",
    description: "Gérez les paramètres de la plateforme.",
  },
};

export default function SuperAdminHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const user = getStoredUser();

  const currentPage = pageConfig[location.pathname] || {
    title: "Jokko Business Super Admin",
    description: "Gestion de plateforme.",
  };

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
    <header className="rounded-2xl bg-white px-6 py-4 shadow-sm flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
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
            Super Admin • <span className="font-medium text-slate-600">Plateforme</span>
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
    </header>
  );
}

