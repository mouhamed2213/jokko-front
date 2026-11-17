import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2 } from "lucide-react";
import { Link, Navigate, useParams } from "react-router-dom";
import { helpModules } from "../data/helpModules";

export default function HelpArticlePage() {
  const { moduleId } = useParams();
  const currentIndex = helpModules.findIndex((module) => module.id === moduleId);

  if (currentIndex === -1) {
    return <Navigate to="/help" replace />;
  }

  const module = helpModules[currentIndex];
  const Icon = module.icon;
  const previous = helpModules[currentIndex - 1];
  const next = helpModules[currentIndex + 1];

  return (
    <div className="min-h-screen bg-white">
      <section className="border-b border-slate-200 bg-slate-50">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
          <Link
            to="/help"
            className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-4"
          >
            <ArrowLeft size={16} aria-hidden="true" /> Tous les guides
          </Link>
          <div className="mt-8 flex max-w-4xl items-start gap-4 sm:mt-10 sm:gap-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 sm:h-14 sm:w-14">
              <Icon size={25} aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-emerald-700">Guide d'utilisation</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                {module.title}
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
                {module.shortDescription}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-16">
        <main className="min-w-0">
          <article>
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
              <BookOpen size={17} aria-hidden="true" />
              Présentation
            </div>
            <p className="mt-4 max-w-3xl text-base leading-8 text-slate-700">
              {module.description}
            </p>

            <section className="mt-10 border-t border-slate-200 pt-8">
              <p className="text-sm font-semibold text-emerald-700">Dans cette rubrique</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
                Ce que vous pouvez faire
              </h2>
              <ul className="mt-6 divide-y divide-slate-100 border-y border-slate-100">
                {module.highlights.map((highlight, index) => (
                  <li key={highlight} className="flex items-start gap-4 py-5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-800">
                      {index + 1}
                    </span>
                    <p className="pt-0.5 text-sm leading-7 text-slate-700">{highlight}</p>
                  </li>
                ))}
              </ul>
            </section>
          </article>

          <nav aria-label="Navigation entre les rubriques" className="mt-10 grid gap-3 sm:grid-cols-2">
            {previous ? (
              <Link
                to={`/help/${previous.id}`}
                className="group rounded-xl border border-slate-200 p-4 transition hover:border-emerald-300 hover:bg-emerald-50/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
              >
                <span className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <ArrowLeft size={14} aria-hidden="true" /> Guide précédent
                </span>
                <span className="mt-2 block font-bold text-slate-900 group-hover:text-emerald-800">
                  {previous.title}
                </span>
              </Link>
            ) : <span />}
            {next && (
              <Link
                to={`/help/${next.id}`}
                className="group rounded-xl border border-slate-200 p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 sm:text-right"
              >
                <span className="flex items-center justify-end gap-2 text-xs font-semibold text-slate-500">
                  Guide suivant <ArrowRight size={14} aria-hidden="true" />
                </span>
                <span className="mt-2 block font-bold text-slate-900 group-hover:text-emerald-800">
                  {next.title}
                </span>
              </Link>
            )}
          </nav>
        </main>

        <aside className="h-fit border-t border-slate-200 pt-6 lg:sticky lg:top-28 lg:border-t-0 lg:border-l lg:pl-7 lg:pt-0">
          <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
            Toutes les rubriques
          </h2>
          <nav aria-label="Rubriques du centre d'aide" className="mt-4 space-y-1">
            {helpModules.map((item) => {
              const ItemIcon = item.icon;
              const active = item.id === module.id;
              return (
                <Link
                  key={item.id}
                  to={`/help/${item.id}`}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${active ? "bg-emerald-50 text-emerald-800" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}
                >
                  <ItemIcon size={17} className="shrink-0" aria-hidden="true" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-7 border-t border-slate-200 pt-6">
            <p className="font-bold text-slate-950">Une question sur ce guide ?</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Contactez l'équipe si vous avez besoin d'une précision.
            </p>
            <Link
              to="/contact"
              className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-emerald-700 transition hover:text-emerald-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-4"
            >
              Contacter le support <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
