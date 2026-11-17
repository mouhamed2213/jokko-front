import { ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/jb_logo.jpg";

const links = [
  { to: "/", label: "Accueil" },
  { to: "/#features", label: "Fonctionnalités" },
  { to: "/#pricing", label: "Tarifs" },
  { to: "/help", label: "Guide d'utilisation" },
  { to: "/contact", label: "Contact" },
];

export function HeaderPublic() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const goTo = (to: string) => {
    setMenuOpen(false);
    if (to.includes("#")) {
      const [path, hash] = to.split("#");
      if (location.pathname !== (path || "/")) {
        navigate(to);
      } else {
        document.getElementById(hash)?.scrollIntoView({ behavior: "smooth" });
      }
      return;
    }
    navigate(to);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl">
      <nav aria-label="Navigation principale" className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-3.5 sm:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-3" onClick={() => setMenuOpen(false)}>
          <img src={logo} alt="" className="h-10 w-10 rounded-xl object-contain" />
          <span className="leading-tight">
            <span className="block text-base font-extrabold tracking-tight text-slate-950">Jokko Business</span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Gestion commerciale</span>
          </span>
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <button key={link.to} type="button" onClick={() => goTo(link.to)}
              className={`text-sm font-semibold transition-colors ${location.pathname === link.to ? "text-emerald-700" : "text-slate-600 hover:text-slate-950"}`}>
              {link.label}
            </button>
          ))}
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <button type="button" onClick={() => navigate("/login")} className="rounded-full px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:bg-slate-100">Connexion</button>
          <button type="button" onClick={() => navigate("/register")} className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/15 transition hover:bg-emerald-700">
            Créer un compte <ArrowRight size={16} />
          </button>
        </div>

        <button type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen}
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-800 transition hover:bg-slate-50 lg:hidden">
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </nav>

      {menuOpen && (
        <div className="border-t border-slate-100 bg-white px-5 py-4 shadow-xl lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {links.map((link) => (
              <button key={link.to} type="button" onClick={() => goTo(link.to)}
                className="rounded-xl px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
                {link.label}
              </button>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 sm:hidden">
              <button type="button" onClick={() => { setMenuOpen(false); navigate("/login"); }} className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-bold text-slate-700">Connexion</button>
              <button type="button" onClick={() => { setMenuOpen(false); navigate("/register"); }} className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-bold text-white">Inscription</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
