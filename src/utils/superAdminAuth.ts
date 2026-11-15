import type { NavigateFunction } from "react-router-dom";

/**
 * Déconnexion unique du Super Admin.
 * Ne supprime QUE la session Super Admin ("sa_user") : une session boutique
 * ouverte dans le même navigateur ("token" / "user") n'est jamais touchée.
 */
export const logoutSuperAdmin = (navigate: NavigateFunction) => {
  localStorage.removeItem("sa_user");
  navigate("/super-admin/login", { replace: true });
};
