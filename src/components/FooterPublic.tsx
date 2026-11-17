import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { SUPPORT_EMAIL } from "../services";
import logo from "../assets/jb_logo.jpg";

export default function FooterPublic() {
  return (
    <footer className="bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] lg:py-16">
        <div>
          <Link to="/" className="mb-5 inline-flex items-center gap-3">
            <img src={logo} alt="" className="h-11 w-11 rounded-xl bg-white object-contain p-1" />
            <span className="text-lg font-extrabold tracking-tight text-white">Jokko Business</span>
          </Link>
          <p className="max-w-sm text-sm leading-7 text-slate-400">
            Une solution de gestion commerciale pour organiser vos ventes, suivre vos stocks et piloter votre boutique au quotidien.
          </p>
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">Pensé pour les commerces d'ici</p>
        </div>

        <div>
          <h2 className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-white">Découvrir</h2>
          <ul className="space-y-3 text-sm">
            <li><Link className="transition hover:text-white" to="/">Accueil</Link></li>
            <li><Link className="transition hover:text-white" to="/#features">Fonctionnalités</Link></li>
            <li><Link className="transition hover:text-white" to="/#pricing">Abonnements</Link></li>
            <li><Link className="transition hover:text-white" to="/help">Guide d'utilisation</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-white">Votre espace</h2>
          <ul className="space-y-3 text-sm">
            <li><Link className="transition hover:text-white" to="/register">Créer un compte</Link></li>
            <li><Link className="transition hover:text-white" to="/login">Se connecter</Link></li>
            <li><Link className="transition hover:text-white" to="/contact">Contacter l'équipe</Link></li>
          </ul>
        </div>

        <div>
          <h2 className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-white">Nous contacter</h2>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3"><Phone size={17} className="mt-0.5 shrink-0 text-emerald-400" /><a href="tel:+221783333838" className="transition hover:text-white">+221 78 333 38 38</a></li>
            <li className="flex items-start gap-3"><Mail size={17} className="mt-0.5 shrink-0 text-emerald-400" /><a href={`mailto:${SUPPORT_EMAIL}`} className="break-all transition hover:text-white">{SUPPORT_EMAIL}</a></li>
            <li className="flex items-start gap-3"><MapPin size={17} className="mt-0.5 shrink-0 text-emerald-400" /><span>Dakar, Sénégal</span></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>© {new Date().getFullYear()} Jokko Business. Tous droits réservés.</span>
          <span className="inline-flex items-center gap-1">Une gestion plus claire, chaque jour <ArrowUpRight size={13} /></span>
        </div>
      </div>
    </footer>
  );
}
