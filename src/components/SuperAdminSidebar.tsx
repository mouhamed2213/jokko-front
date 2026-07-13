import { BarChart3, Building2, FileText, LogOut, Menu, Settings, X } from "lucide-react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";

const superAdminLinks = [
  { name: "Tableau de bord", path: "/admin/dash", icon: BarChart3 },
  { name: "Boutiques", path: "/admin/shops", icon: Building2 },
  { name: "Audit Log", path: "/admin/audit-log", icon: FileText },
  { name: "Paramètres", path: "/admin/settings", icon: Settings },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("sa_user");
    navigate("/super-admin/login");
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-slate-900 text-white">
      <div className="shrink-0 flex items-center gap-3 border-b border-white/10 px-5 py-4">
        <img src={logo} alt="Jokko" className="h-9 w-9 rounded-lg bg-white object-contain p-1" />
        <div>
          <p className="text-base font-bold">Jokko</p>
          <p className="text-xs text-white/50">Super Admin</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="ml-auto rounded-lg p-2 text-white/80 hover:bg-white/10 md:hidden"
          >
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
                `group flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? "bg-white text-slate-900"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon size={17} />
              <span>{link.name}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="shrink-0 border-t border-white/10 p-3">
        <button
          type="button"
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-xl bg-red-500/90 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-red-600"
        >
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
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 rounded-xl bg-slate-900 p-3 text-white shadow-lg md:hidden"
      >
        <Menu size={20} />
      </button>

      {/* Sticky on desktop — pinned regardless of page content height */}
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