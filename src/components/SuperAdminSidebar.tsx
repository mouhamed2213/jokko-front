import { BarChart3, Building2, ChevronDown, Clock, CreditCard, KeyRound, LogOut, Menu, Settings, UserRound, X, Users, Wrench } from "lucide-react";
import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import Logo from "./public/Logo";
import { logoutSuperAdmin } from "../utils/superAdminAuth";

const superAdminLinks = [
  { name: "Tableau de bord", path: "/admin/dash", icon: BarChart3 },
  { name: "Boutiques", path: "/admin/shops", icon: Building2 },
  { name: "Propriétaires", path: "/admin/owners", icon: UserRound },
  { name: "Abonnements", path: "/admin/subscriptions", icon: CreditCard },
];

const settingsLinks = [
  { name: "Vue générale", path: "/admin/settings" },
  { name: "Maintenance", path: "/admin/settings/maintenance", icon: Wrench },
  { name: "Période de grâce", path: "/admin/settings/subscription-grace-period", icon: Clock },
  { name: "Utilisateurs", path: "/admin/settings/users", icon: Users },
  { name: "Sécurité du compte", path: "/admin/security", icon: KeyRound },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [manualSettingsOpen, setManualSettingsOpen] = useState<boolean | null>(null);
  const childIsActive = settingsLinks.some(
    (item) => item.path !== "/admin/settings" && (location.pathname === item.path || location.pathname.startsWith(`${item.path}/`)),
  );
  const settingsOpen = manualSettingsOpen ?? (childIsActive || location.pathname === "/admin/settings");
  const logout = () => logoutSuperAdmin(navigate);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-ink text-white">
      <div className="shrink-0 flex items-start justify-between gap-3 border-b border-white/10 px-5 pb-5 pt-6">
        <div>
          <Logo variant="sur-encre" className="h-11 w-auto" />
          <p className="mt-3 inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.2em] text-sun">
            <span className="h-2 w-2 rounded-full bg-sun" /> Super admin
          </p>
        </div>
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Fermer le menu" className="rounded-lg p-2 text-white/80 hover:bg-white/10 md:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="flex-1 min-h-0 space-y-0.5 overflow-y-auto px-3 py-3">
        {superAdminLinks.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={onClose}
              end={link.path === "/admin/dash"}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  isActive ? "bg-white/10 text-white" : "text-white/65 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Icon size={17} />
              <span>{link.name}</span>
            </NavLink>
          );
        })}

        <div className="pt-1">
          <div className="flex items-center rounded-xl transition">
            <NavLink
              to="/admin/settings"
              onClick={() => {
                setManualSettingsOpen(!settingsOpen);
                onClose?.();
              }}
              aria-expanded={settingsOpen}
              className={({ isActive }) =>
                `group flex flex-1 items-center gap-3 rounded-l-xl px-3 py-2 text-sm font-medium transition ${
                  isActive || childIsActive
                    ? "bg-white/10 text-white"
                    : "text-white/65 hover:bg-white/5 hover:text-white"
                }`
              }
            >
              <Settings size={17} />
              <span>Paramètres</span>
            </NavLink>
            <button
              type="button"
              onClick={() => setManualSettingsOpen(!settingsOpen)}
              aria-label={settingsOpen ? "Fermer les paramètres" : "Ouvrir les paramètres"}
              aria-expanded={settingsOpen}
              className={`rounded-r-xl px-3 py-2 transition ${
                childIsActive || location.pathname === "/admin/settings"
                  ? "bg-white/10 text-white"
                  : "text-white/65 hover:bg-white/5 hover:text-white"
              }`}
            >
              <ChevronDown size={15} className={`transition-transform ${settingsOpen ? "rotate-180" : ""}`} />
            </button>
          </div>

          {settingsOpen && (
            <div className="ml-5 mt-1 space-y-0.5 border-l border-white/15 pl-3">
              {settingsLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/admin/settings"}
                    onClick={onClose}
                    className={({ isActive }) =>
                      `flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition ${
                        isActive ? "bg-white/10 text-sun" : "text-white/55 hover:bg-white/5 hover:text-white"
                      }`
                    }
                  >
                    {Icon && <Icon size={14} />}
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      <div className="shrink-0 border-t border-white/10 p-3">
        <button type="button" onClick={logout} className="flex w-full items-center gap-3 rounded-xl border border-white/20 px-3 py-2.5 text-sm font-semibold text-white/85 transition hover:border-white/40 hover:bg-white/10 hover:text-white">
          <LogOut size={16} />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
}

export default function SuperAdminSidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      <button type="button" aria-label="Ouvrir le menu" onClick={() => setMobileOpen(true)} className="fixed left-4 top-4 z-40 rounded-xl bg-ink p-3 text-white shadow-lg md:hidden">
        <Menu size={20} />
      </button>

      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 overflow-hidden md:flex">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute left-0 top-0 h-screen w-64 overflow-hidden shadow-xl">
            <SidebarContent onClose={() => setMobileOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
