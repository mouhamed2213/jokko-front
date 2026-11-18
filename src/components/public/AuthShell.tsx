import type { ReactNode } from "react";
import { images } from "../../data/publicImages";
import Photo from "./Photo";

const benefits = [
  "Ventes, stock et caisse dans un seul espace",
  "Clients, dettes et fournisseurs sous contrôle",
  "Sur ordinateur, tablette et téléphone",
  "Offre gratuite, sans carte bancaire",
];

/** Pages d'authentification : panneau de marque (≥ lg) + zone de formulaire. */
export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-[calc(100vh-4.5rem)] lg:grid-cols-[0.9fr_1.1fr]">
      <Photo src={images.hero} tone="green" className="hidden text-white lg:block">
        <svg aria-hidden viewBox="0 0 200 200" className="pointer-events-none overflow-visible absolute -bottom-20 -right-24 h-[36rem] w-[36rem] text-white/10">
          <path d="M120 10V120A70 70 0 0 1 50 190H40" fill="none" stroke="currentColor" strokeWidth="46" strokeLinecap="round" />
        </svg>
        <div className="relative flex h-full flex-col justify-end p-12">
          <div className="max-w-md">
            <h2 className="text-4xl font-extrabold leading-[1.08] tracking-[-0.035em]">
              Votre boutique, sous contrôle<span className="text-sun">.</span>
            </h2>
            <ul className="mt-8 space-y-3.5">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm leading-6 text-white/90">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-sun" />
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Photo>
      <div className="flex items-center justify-center bg-cream px-4 py-10 sm:px-8">{children}</div>
    </div>
  );
}
