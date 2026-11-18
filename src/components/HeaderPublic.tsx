import { ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Logo from "./public/Logo";

const links = [
  { to: "/", label: "Accueil" },
  { to: "/#features", label: "Fonctionnalités" },
  { to: "/tarifs", label: "Tarifs" },
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
    <header className="sticky top-0 z-50 border-b border-ink/10 bg-cream/85 backdrop-blur-xl">
      <nav aria-label="Navigation principale" className="mx-auto flex max-w-7xl items-center justify-between gap-5 px-5 py-3.5 sm:px-8">
        <Link to="/" className="flex shrink-0 items-center" aria-label="Jokko Business — accueil" onClick={() => setMenuOpen(false)}>
          <Logo className="h-11 w-auto sm:h-14" />
        </Link>

        <div className="hidden items-center gap-8 lg:flex">
          {links.map((link) => (
            <button key={link.to} type="button" onClick={() => goTo(link.to)}
              className={`text-sm font-semibold transition-colors ${location.pathname === link.to ? "text-jokko-deep" : "text-ink/70 hover:text-ink"}`}>
              {link.label}
            </button>
          ))}
        </div>

        <div className="hidden items-center gap-2 sm:flex">
          <button type="button" onClick={() => navigate("/login")} className="rounded-full px-4 py-2.5 text-sm font-bold text-ink/75 transition hover:bg-ink/5">Connexion</button>
          <button type="button" onClick={() => navigate("/register")} className="inline-flex items-center gap-2 rounded-full bg-jokko px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-jokko-deep/15 transition hover:bg-jokko-deep">
            Créer un compte <ArrowRight size={16} />
          </button>
        </div>

        <button type="button" onClick={() => setMenuOpen((open) => !open)} aria-expanded={menuOpen}
          aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl border border-ink/10 text-ink/80 transition hover:bg-cream lg:hidden">
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </nav>

      {menuOpen && (
        <div className="border-t border-ink/10 bg-paper px-5 py-4 shadow-xl lg:hidden">
          <div className="mx-auto flex max-w-7xl flex-col gap-1">
            {links.map((link) => (
              <button key={link.to} type="button" onClick={() => goTo(link.to)}
                className="rounded-xl px-4 py-3 text-left text-sm font-semibold text-ink/75 transition hover:bg-cream">
                {link.label}
              </button>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-2 border-t border-ink/10 pt-3 sm:hidden">
              <button type="button" onClick={() => { setMenuOpen(false); navigate("/login"); }} className="rounded-xl border border-ink/10 px-4 py-3 text-sm font-bold text-ink/75">Connexion</button>
              <button type="button" onClick={() => { setMenuOpen(false); navigate("/register"); }} className="rounded-xl bg-jokko px-4 py-3 text-sm font-bold text-white">Inscription</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
