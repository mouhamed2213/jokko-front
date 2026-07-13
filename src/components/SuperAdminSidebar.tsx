import {
  BarChart3,
  Building2,
  FileText,
  LogOut,
  Menu,
  Settings,
  X,
} from "lucide-react";
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";

const superAdminLinks = [
  {
    name: "Tableau de bord",
    path: "/admin",
    icon: BarChart3,
  },
  {
    name: "Boutiques",
    path: "/admin/shops",
    icon: Building2,
  },
  {
    name: "Audit Log",
    path: "/admin/audit-log",
    icon: FileText,
  },
  {
    name: "Paramètres",
    path: "/admin/settings",
    icon: Settings,
  },
];

function SuperAdminSidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <>
      {/* Mobile menu button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 inline-flex items-center gap-2 rounded-lg bg-emerald-600 p-2 text-white md:hidden"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar backdrop (mobile) */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 text-white shadow-lg transition-transform md:relative md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo section */}
          <div className="flex items-center justify-center gap-3 border-b border-slate-700 px-4 py-6">
            <img src={logo} alt="Jokko" className="h-8 w-8" />
            <div>
              <p className="text-lg font-bold text-white">Jokko</p>
              <p className="text-xs text-slate-400">Super Admin</p>
            </div>
          </div>

          {/* Navigation links */}
          <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
            {superAdminLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                      isActive
                        ? "bg-emerald-600 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`
                  }
                >
                  <Icon size={18} />
                  <span>{link.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Logout button */}
          <div className="border-t border-slate-700 px-4 py-4">
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-lg bg-red-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-red-700"
            >
              <LogOut size={18} />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export default SuperAdminSidebar;
