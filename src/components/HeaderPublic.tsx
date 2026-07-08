import { ArrowRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logo.svg";

export function HeaderPublic() {
  const navigate = useNavigate();
  const location = useLocation();

  // Petite fonction utilitaire pour mettre en valeur le lien de la page active
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* ── NAVIGATION ── */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        {/* Changement : Ajout de w-full et ajustement des espacements globaux */}
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between w-full gap-8">
          
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
              <p className="text-[11px] font-medium text-slate-500">Gestion commerciale</p>
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
          {/* Changement : Ajustement de gap-3 à gap-4 pour donner de l'espace aux boutons */}
          <div className="flex items-center gap-4 shrink-0">
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-2 text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-slate-100 transition cursor-pointer"
            >
              Se connecter
            </button>
            <button
              onClick={() => navigate("/register")}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-emerald-700 transition cursor-pointer shadow-sm shadow-emerald-600/10"
            >
              Inscription gratuite <ArrowRight size={15} />
            </button>
          </div>

        </div>
      </nav>
    </>
  );
}