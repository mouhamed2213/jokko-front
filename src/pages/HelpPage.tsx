import { ArrowRight, Headphones, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { helpModules } from "../data/helpModules";
import PageHero from "../components/public/PageHero";
import { images } from "../data/publicImages";

export default function HelpPage() {
  const [query, setQuery] = useState("");
  const filteredModules = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("fr");
    if (!normalizedQuery) return helpModules;

    return helpModules.filter((module) =>
      [module.title, module.shortDescription, module.description]
        .join(" ")
        .toLocaleLowerCase("fr")
        .includes(normalizedQuery),
    );
  }, [query]);

  return (
    <div className="min-h-screen bg-white">
      <PageHero
        image={images.help}
        eyebrow="Centre d'aide Jokko Business"
        title="Les bons repères pour gérer votre boutique."
        subtitle="Retrouvez les explications des principales rubriques de Jokko Business. Choisissez un sujet pour consulter son guide étape par étape."
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <label htmlFor="help-search" className="block w-full max-w-xl">
            <span className="mb-2 block text-sm font-semibold text-white">Que recherchez-vous ?</span>
            <span className="flex items-center gap-3 rounded-xl border border-white/20 bg-white px-4 py-3.5 transition focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/30">
              <Search size={19} className="shrink-0 text-slate-400" aria-hidden="true" />
              <input
                id="help-search"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ex. : caisse, produits, factures…"
                className="min-w-0 flex-1 bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
            </span>
          </label>
          <aside className="max-w-xs border-l-2 border-emerald-400 pl-5">
            <p className="text-sm font-semibold text-white">Besoin d'un échange direct ?</p>
            <p className="mt-2 text-sm leading-6 text-slate-300">Si un guide ne répond pas à votre question, notre équipe reste joignable.</p>
            <Link to="/contact" className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-emerald-300 transition hover:text-emerald-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400">
              Contacter l'équipe <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </aside>
        </div>
      </PageHero>

      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="flex flex-col gap-2 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-700">Documentation</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
              Parcourir les rubriques
            </h2>
          </div>
          <p className="text-sm text-slate-500" aria-live="polite">
            {filteredModules.length} {filteredModules.length > 1 ? "rubriques" : "rubrique"}
            {query.trim() ? " trouvée(s)" : " disponibles"}
          </p>
        </div>

        {filteredModules.length > 0 ? (
          <div className="mt-7 grid gap-x-8 gap-y-0 sm:grid-cols-2 lg:grid-cols-3">
            {filteredModules.map((module, index) => {
              const Icon = module.icon;
              return (
                <Link
                  key={module.id}
                  to={`/help/${module.id}`}
                  className={`group flex min-h-48 flex-col border-b border-slate-200 py-6 transition-colors hover:bg-slate-50/70 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-emerald-600 ${index % 3 === 0 ? "lg:pl-0" : ""}`}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <ArrowRight
                      size={18}
                      className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-emerald-700"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="mt-5 text-lg font-bold text-slate-950">{module.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">
                    {module.shortDescription}
                  </p>
                  <span className="mt-4 text-xs font-bold uppercase tracking-wide text-emerald-700">
                    Lire le guide
                  </span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center">
            <Search size={24} className="mx-auto text-slate-400" aria-hidden="true" />
            <h3 className="mt-4 font-bold text-slate-900">Aucune rubrique trouvée</h3>
            <p className="mt-2 text-sm text-slate-600">
              Essayez un autre mot-clé ou parcourez toutes les rubriques.
            </p>
            <button
              type="button"
              onClick={() => setQuery("")}
              className="mt-5 text-sm font-bold text-emerald-700 underline underline-offset-4 hover:text-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
            >
              Effacer la recherche
            </button>
          </div>
        )}

        <div className="mt-14 flex flex-col gap-5 border-t border-slate-200 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
              <Headphones size={21} aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-bold text-slate-950">Vous n'avez pas trouvé votre réponse ?</h2>
              <p className="mt-1 max-w-xl text-sm leading-6 text-slate-600">
                Décrivez-nous votre besoin depuis la page de contact.
              </p>
            </div>
          </div>
          <Link
            to="/contact"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            Contacter le support <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </section>
    </div>
  );
}
