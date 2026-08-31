import { ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/jb_logo.jpg";

export function HeaderPublic() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Petite fonction utilitaire pour mettre en valeur le lien de la page active
  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { href: "/", label: "Accueil" },
    { href: "/#features", label: "Fonctionnalités" },
    { href: "/#pricing", label: "Tarifs" },
    { href: "/help", label: "Découvrir l'application" },
    { href: "/#faq", label: "FAQ" },
  ];

  return (
    <>
      {/* ── NAVIGATION ── */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        {/* Changement : Ajout de w-full et ajustement des espacements globaux */}
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 flex items-center justify-between w-full gap-4 lg:gap-8">
          
          {/* Bloc 1 : Logo & Marque (Reste groupé à gauche) */}
          <div 
            onClick={() => navigate("/")} 
            className="flex items-center gap-3 cursor-pointer shrink-0"
          >
            <img src={logo} alt="Jokko Business" className="h-9 w-9" />
            <div>
              <p className="text-base font-bold text-slate-900 leading-tight tracking-tight">
                Jokko Business
              </p>
              <p className="hidden text-[11px] font-medium text-slate-500 sm:block">Gestion commerciale</p>
            </div>
          </div>

          {/* Bloc 2 : Liens de redirection (Centrés et plus espacés) */}
          {/* Changement : Passage de gap-6 à gap-8 ou gap-10 pour aérer les options */}
          <div className="hidden lg:flex items-center gap-8 xl:gap-10 mx-auto justify-center">
            <a
              href="/"
              className={`text-sm font-medium transition duration-200 ${
                isActive("/") && !window.location.hash
                  ? "text-emerald-600"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Accueil
            </a>

            <a
              href="/#features"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition duration-200"
            >
              Fonctionnalités
            </a>
            
            <a
              href="/#pricing"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition duration-200"
            >
              Tarifs
            </a>
            
            <a
              href="/help"
              className={`text-sm font-medium transition duration-200 ${
                isActive("/help")
                  ? "text-emerald-600 font-semibold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Découvrir l'application
            </a>
            
            <a
              href="/#faq"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition duration-200"
            >
              FAQ
            </a>
          </div>

          {/* Bloc 3 : Boutons de Call to Action (Poussés à l'extrême droite) */}
          {/* Changement : Ajustement de gap-3 à gap-4 pour donner de l'espace aux boutons, masqués sur mobile pour laisser place au menu */}
          <div className="hidden items-center gap-2 shrink-0 sm:flex sm:gap-4">
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-2 text-slate-700 text-sm font-semibold px-3 py-2.5 rounded-xl hover:bg-slate-100 transition cursor-pointer sm:px-4"
            >
              Se connecter
            </button>
            <button
              onClick={() => navigate("/register")}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white text-sm font-semibold px-3 py-2.5 rounded-xl hover:bg-emerald-700 transition cursor-pointer shadow-sm shadow-emerald-600/10 sm:px-4"
            >
              <span className="hidden md:inline">Inscription gratuite</span>
              <span className="md:hidden">Inscription</span>
              <ArrowRight size={15} />
            </button>
          </div>

          {/* Bloc 4 : Bouton menu mobile (visible en dessous de lg) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-xl p-2 text-slate-700 hover:bg-slate-100 transition lg:hidden"
            aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>

        </div>

        {/* ── MENU MOBILE ── */}
        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-4 lg:hidden">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive(link.href)
                      ? "bg-emerald-50 text-emerald-600"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {link.label}
                </a>
              ))}
            </div>
            <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3 sm:hidden">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/login");
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
              >
                Se connecter
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  navigate("/register");
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition cursor-pointer shadow-sm shadow-emerald-600/10"
              >
                Inscription gratuite <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}