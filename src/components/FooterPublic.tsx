import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { SUPPORT_EMAIL } from "../services";
import Logo from "./public/Logo";

const link = "transition hover:text-sun";

export default function FooterPublic() {
  return (
    <footer className="relative overflow-hidden bg-jokko text-white">
      {/* Grande courbe de la marque en filigrane */}
      <svg aria-hidden viewBox="0 0 200 200" className="pointer-events-none overflow-visible absolute -right-16 -top-10 h-[34rem] w-[34rem] text-white/[0.07]">
        <path d="M120 10V120A70 70 0 0 1 50 190H40" fill="none" stroke="currentColor" strokeWidth="46" strokeLinecap="round" />
      </svg>
      <div className="relative mx-auto grid max-w-7xl gap-12 px-5 py-16 sm:px-8 lg:grid-cols-[1.6fr_1fr_1fr_1.3fr] lg:py-20">
        <div>
          <Link to="/" aria-label="Jokko Business — accueil"><Logo variant="sur-vert" className="h-14 w-auto" /></Link>
          <p className="mt-6 max-w-sm text-sm leading-7 text-white/80">
            Ventes, stock, caisse, clients et fournisseurs : l'essentiel pour piloter une boutique au quotidien.
          </p>
        </div>

        <nav aria-label="Découvrir">
          <h2 className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-sun">Découvrir</h2>
          <ul className="space-y-3 text-sm text-white/85">
            <li><Link className={link} to="/">Accueil</Link></li>
            <li><Link className={link} to="/#features">Fonctionnalités</Link></li>
            <li><Link className={link} to="/tarifs">Tarifs</Link></li>
            <li><Link className={link} to="/help">Guide d'utilisation</Link></li>
          </ul>
        </nav>

        <nav aria-label="Votre espace">
          <h2 className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-sun">Votre espace</h2>
          <ul className="space-y-3 text-sm text-white/85">
            <li><Link className={link} to="/register">Créer un compte</Link></li>
            <li><Link className={link} to="/login">Se connecter</Link></li>
            <li><Link className={link} to="/contact">Contacter l'équipe</Link></li>
          </ul>
        </nav>

        <div>
          <h2 className="mb-5 text-xs font-extrabold uppercase tracking-[0.18em] text-sun">Nous contacter</h2>
          <ul className="space-y-4 text-sm text-white/85">
            <li className="flex items-start gap-3"><Phone size={17} className="mt-0.5 shrink-0 text-sun" /><a href="tel:+221783333838" className={link}>+221 78 333 38 38</a></li>
            <li className="flex items-start gap-3"><Mail size={17} className="mt-0.5 shrink-0 text-sun" /><a href={`mailto:${SUPPORT_EMAIL}`} className={`break-all ${link}`}>{SUPPORT_EMAIL}</a></li>
            <li className="flex items-start gap-3"><MapPin size={17} className="mt-0.5 shrink-0 text-sun" /><span>Dakar, Sénégal</span></li>
          </ul>
        </div>
      </div>
      <div className="relative border-t border-white/15">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-5 py-6 text-xs text-white/65 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <span>© {new Date().getFullYear()} Jokko Business. Tous droits réservés.</span>
          <span className="inline-flex items-center gap-1">Une gestion plus claire, chaque jour <ArrowUpRight size={13} /></span>
        </div>
      </div>
    </footer>
  );
}
