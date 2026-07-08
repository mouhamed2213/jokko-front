import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";

export function HeaderPublic() {
    const navigate = useNavigate()

  return (

    <>
      {/* ── NAVIGATION ── */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Jokko Business" className="h-9 w-9" />
            <div>
              <p className="text-base font-semibold text-slate-900 leading-tight">
                Jokko Business
              </p>
              <p className="text-xs text-slate-500">Gestion commerciale</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a
              href="/home"
              className="text-sm text-slate-600 hover:text-slate-900 transition"
            >
              Acceuille
            </a>

            <a
              href="#features"
              className="text-sm text-slate-600 hover:text-slate-900 transition"
            >
              Fonctionnalités
            </a>
            <a
              href="#pricing"
              className="text-sm text-slate-600 hover:text-slate-900 transition"
            >
              Tarifs
            </a>
            <a
              href="/help"
              className="text-sm text-slate-600 hover:text-slate-900 transition"
            >
              Decourir jokko bussiness
            </a>
            <a
              href="#faq"
              className="text-sm text-slate-600 hover:text-slate-900 transition"
            >
              FAQ
            </a>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-emerald-700 transition cursor-pointer"
            >
              Se connecter <ArrowRight size={15} />
            </button>
            <button
              onClick={() => navigate("/register")}
              className="inline-flex items-center gap-2 bg-white text-black text-sm font-medium px-4 py-2 rounded-lg hover:bg-emerald-700 transition hover:text-white cursor-pointer border"
            >
              Inscription gratuit <ArrowRight size={15} />
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}
