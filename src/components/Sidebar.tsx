import {
  Boxes,
  ChevronRight,
  Crown,
  FileText,
  LayoutDashboard,
  Lock,
  Menu,
  Package,
  Settings,
  ShoppingCart,
  Truck,
  UserCog,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/logo.svg";

const allLinks = [
  {
    name: "Tableau de bord",
    path: "/dashboard",
    icon: LayoutDashboard,
    adminOnly: false,
  },
  { name: "Caisse", path: "/cash", icon: Wallet, adminOnly: false },
  { name: "Produits", path: "/products", icon: Package, adminOnly: false },
  { name: "Clients", path: "/clients", icon: Users, adminOnly: false },
  {
    name: "Fournisseurs",
    path: "/suppliers",
    icon: Truck,
    adminOnly: false,
    premium: true,
  }, // Marqué comme premium
  { name: "Stock", path: "/stock", icon: Boxes, adminOnly: false },
  { name: "Ventes", path: "/sales", icon: ShoppingCart, adminOnly: false },
  { name: "Factures", path: "/invoices", icon: FileText, adminOnly: false },
  { name: "Utilisateurs", path: "/users", icon: UserCog, adminOnly: true },
  { name: "Paramètres", path: "/settings", icon: Settings, adminOnly: true },
];
const notAllowedPlan = ["BASIC", "FREE"];

function SidebarContent({
  onClose,
  onUpgradeClick,
}: {
  onClose?: () => void;
  onUpgradeClick: () => void;
}) {
  // const navigate = useNavigate();
  const role = JSON.parse(localStorage.getItem("user") || "{}").role;
  const plan = JSON.parse(localStorage.getItem("user") || "{}").plan;

  const links = allLinks.filter((l) => !l.adminOnly || role === "ADMIN");

  const [shopLogo, setShopLogo] = useState<string>(
    localStorage.getItem("shopLogo") || "",
  );
  const shopName =
    JSON.parse(localStorage.getItem("user") || "{}").shopName ||
    "Jokko Business";

  useEffect(() => {
    const handler = () => setShopLogo(localStorage.getItem("shopLogo") || "");
    window.addEventListener("shopLogoUpdated", handler);
    return () => window.removeEventListener("shopLogoUpdated", handler);
  }, []);

  return (
    <div className="flex h-full flex-col bg-slate-900 text-white">
      <div className="border-b border-white/10 px-5 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={shopLogo || logo}
              alt={shopName}
              className="h-10 w-10 rounded-xl bg-white object-contain p-1"
            />
            <div>
              <h1 className="text-lg font-bold truncate max-w-32.5">
                {shopName}
              </h1>
              <p className="text-xs text-white/50">Gestion commerciale</p>
            </div>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-white/80 hover:bg-white/10 md:hidden"
            >
              <X size={18} />
            </button>
          )}
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3 py-4 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isLocked = link.premium && notAllowedPlan.includes(plan);

          // Si la route est bloquée pour le plan FREE, on utilise un bouton au lieu d'un NavLink
          if (isLocked) {
            return (
              <button
                key={link.path}
                type="button"
                onClick={() => {
                  if (onClose) onClose();
                  onUpgradeClick(); // Ouvre directement le modal
                }}
                className="group flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition text-amber-400/80 hover:bg-amber-500/10 hover:text-amber-400"
              >
                <div className="flex items-center gap-3">
                  <Icon size={17} />
                  <span>{link.name}</span>
                  <span className="rounded-md bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    Pro
                  </span>
                </div>
                <Lock size={13} className="opacity-60" />
              </button>
            );
          }

          return (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={onClose}
              end={link.path === "/dashboard"}
              className={({ isActive }) =>
                `group flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-white text-slate-900"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon size={17} />
                <span>{link.name}</span>
              </div>
              <ChevronRight
                size={14}
                className="opacity-30 group-hover:opacity-60"
              />
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="rounded-xl bg-white/5 px-4 py-3">
          <p className="text-xs font-semibold text-white/80">v1.0</p>
          <p className="text-xs text-white/40">Jokko Business SaaS</p>
        </div>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-xl bg-slate-900 p-3 text-white shadow-lg md:hidden"
      >
        <Menu size={20} />
      </button>

      <aside className="hidden min-h-screen w-64 shrink-0 md:flex">
        <SidebarContent onUpgradeClick={() => setIsUpgradeModalOpen(true)} />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-64 shadow-xl">
            <SidebarContent
              onClose={() => setMobileOpen(false)}
              onUpgradeClick={() => setIsUpgradeModalOpen(true)}
            />
          </div>
        </div>
      )}

      {/* MODAL DE CONVERSION FOURNISSEURS */}
      {isUpgradeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl animate-in fade-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                <Crown size={24} />
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Gestion des Fournisseurs Premium
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Le répertoire et le suivi complet de vos relations et dettes fournisseurs sont réservés aux abonnés du Plan Basic.
              </p>
            </div>

            {/* Avantages */}
            <div className="my-5 rounded-xl bg-slate-50 p-4 text-left">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Débloquez le Plan Basic pour centraliser vos achats :
              </p>
              <ul className="space-y-2 text-sm text-slate-700">
                <li className="flex items-center gap-2">
                  🤝 Gestion et fiches détaillées de tous vos **Fournisseurs**
                </li>
                <li className="flex items-center gap-2">
                  📉 Suivi en temps réel de vos **Dettes Fournisseurs** et échéances
                </li>
                <li className="flex items-center gap-2">
                  📦 Alertes de ruptures et gestion complète de votre chaîne de stock
                </li>
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={() => setIsUpgradeModalOpen(false)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 sm:w-auto"
              >
                Plus tard
              </button>
              <button
                onClick={() => {
                  setIsUpgradeModalOpen(false);
                  // Mets ici ta redirection ou ta logique de toast
                }}
                className="w-full rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 shadow-sm transition sm:w-auto"
              >
                Découvrir les plans
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}