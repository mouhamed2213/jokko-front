import { LayoutDashboard, Package, UserCog, X } from "lucide-react";
import Settings from "../pages/Settings";
import Users from "../pages/Users";


const allLinks = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },

  { name: "Utilisateurs", path: "/users", icon: UserCog },
  { name: "Boutiques", path: "/clients", icon: Users, },
  { name: "Abonnment", path: "/products", icon: Package},
  { name: "Paramètres", path: "/settings", icon: Settings},
];


export function SuperAdminSidebar() {
  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-900 text-white">
      <div className="shrink-0 border-b border-white/10 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
            //   src={shopLogo || logo}
            //   alt={shopName}
              className="h-10 w-10 rounded-xl bg-white object-contain p-1"
            />
            <div>
              <h1 className="text-base font-bold truncate max-w-32.5">
                Administrateur
              </h1>
              <p className="text-xs text-white/50">Gestion commerciale</p>
            </div>
          </div>
            <button
              type="button"
              className="rounded-lg p-2 text-white/80 hover:bg-white/10 md:hidden"
            >
              <X size={18} />
            </button>
        </div>
      </div>
    </div>



  );
}
