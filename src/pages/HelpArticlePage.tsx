import { ArrowLeft, ArrowRight, BookOpen } from "lucide-react";
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
    <div className="min-h-screen bg-paper">
      <section className="border-b border-ink/10 bg-cream">
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
          <Link
            to="/help"
            className="inline-flex items-center gap-2 text-sm font-semibold text-ink/70 transition hover:text-jokko-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-jokko focus-visible:ring-offset-4"
          >
            <ArrowLeft size={16} aria-hidden="true" /> Tous les guides
          </Link>
          <div className="mt-8 flex max-w-4xl items-start gap-4 sm:mt-10 sm:gap-5">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-jokko/15 text-jokko-deep sm:h-14 sm:w-14">
              <Icon size={25} aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-jokko-deep">Guide d'utilisation</p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
                {module.title}
              </h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-ink/70">
                {module.shortDescription}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-7xl gap-10 px-5 py-10 sm:px-8 sm:py-14 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-16">
        <main className="min-w-0">
          <article>
            <div className="flex items-center gap-2 text-sm font-semibold text-jokko-deep">
              <BookOpen size={17} aria-hidden="true" />
              Présentation
            </div>
            <p className="mt-4 max-w-3xl text-base leading-8 text-ink/75">
              {module.description}
            </p>

            <section className="mt-10 border-t border-ink/10 pt-8">
              <p className="text-sm font-semibold text-jokko-deep">Dans cette rubrique</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink">
                Ce que vous pouvez faire
              </h2>
              <ul className="mt-6 divide-y divide-ink/10 border-y border-ink/10">
                {module.highlights.map((highlight, index) => (
                  <li key={highlight} className="flex items-start gap-4 py-5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-jokko/10 text-xs font-bold text-jokko-deep">
                      {index + 1}
                    </span>
                    <p className="pt-0.5 text-sm leading-7 text-ink/75">{highlight}</p>
                  </li>
                ))}
              </ul>
            </section>
          </article>

          <nav aria-label="Navigation entre les rubriques" className="mt-10 grid gap-3 sm:grid-cols-2">
            {previous ? (
              <Link
                to={`/help/${previous.id}`}
                className="group rounded-xl border border-ink/10 p-4 transition hover:border-sun hover:bg-jokko/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-jokko"
              >
                <span className="flex items-center gap-2 text-xs font-semibold text-ink/60">
                  <ArrowLeft size={14} aria-hidden="true" /> Guide précédent
                </span>
                <span className="mt-2 block font-bold text-ink group-hover:text-jokko-deep">
                  {previous.title}
                </span>
              </Link>
            ) : <span />}
            {next && (
              <Link
                to={`/help/${next.id}`}
                className="group rounded-xl border border-ink/10 p-4 text-left transition hover:border-sun hover:bg-jokko/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-jokko sm:text-right"
              >
                <span className="flex items-center justify-end gap-2 text-xs font-semibold text-ink/60">
                  Guide suivant <ArrowRight size={14} aria-hidden="true" />
                </span>
                <span className="mt-2 block font-bold text-ink group-hover:text-jokko-deep">
                  {next.title}
                </span>
              </Link>
            )}
          </nav>
        </main>

        <aside className="h-fit border-t border-ink/10 pt-6 lg:sticky lg:top-28 lg:border-t-0 lg:border-l lg:pl-7 lg:pt-0">
          <h2 className="text-xs font-bold uppercase tracking-[0.14em] text-ink/60">
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
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-jokko ${active ? "bg-jokko/10 text-jokko-deep" : "text-ink/70 hover:bg-cream hover:text-ink"}`}
                >
                  <ItemIcon size={17} className="shrink-0" aria-hidden="true" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-7 border-t border-ink/10 pt-6">
            <p className="font-bold text-ink">Une question sur ce guide ?</p>
            <p className="mt-2 text-sm leading-6 text-ink/70">
              Contactez l'équipe si vous avez besoin d'une précision.
            </p>
            <Link
              to="/contact"
              className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-jokko-deep transition hover:text-jokko-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-jokko focus-visible:ring-offset-4"
            >
              Contacter le support <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
