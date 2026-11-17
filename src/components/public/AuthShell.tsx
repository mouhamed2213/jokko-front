import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { bgImage, images } from "../../data/publicImages";

const benefits = [
  "Ventes, stock et caisse dans un seul espace",
  "Suivi des clients, de leurs dettes et de vos fournisseurs",
  "Accessible sur ordinateur, tablette et téléphone",
  "Offre gratuite disponible, sans carte bancaire",
];

/** Mise en page des pages d'authentification : panneau visuel (≥ lg) + zone de formulaire. */
export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-[calc(100vh-4.5rem)] lg:grid-cols-[1fr_1.1fr]">
      <aside className="relative isolate hidden overflow-hidden bg-slate-950 text-white lg:flex lg:items-end">
        <div className="absolute inset-0 -z-20 bg-cover bg-center" style={{ backgroundImage: bgImage(images.hero) }} />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40" />
        <div className="max-w-md p-12">
          <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-emerald-300">Jokko Business</p>
          <h2 className="mt-4 text-4xl font-black leading-tight tracking-tight">Votre boutique, sous contrôle.</h2>
          <ul className="mt-8 space-y-4">
            {benefits.map((b) => (
              <li key={b} className="flex items-start gap-3 text-sm leading-6 text-slate-200">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/25 text-emerald-300"><Check size={13} strokeWidth={3} /></span>
                {b}
              </li>
            ))}
          </ul>
        </div>
      </aside>
      <div className="flex items-center justify-center bg-slate-50 px-4 py-10 sm:px-8">{children}</div>
    </div>
  );
}
