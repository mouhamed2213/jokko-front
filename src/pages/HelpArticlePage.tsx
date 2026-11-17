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
    <div className="min-h-screen bg-slate-50">
      <section className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-5 py-10 sm:px-8">
          <Link to="/help" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-emerald-700">
            <ArrowLeft size={16} /> Retour au centre d'aide
          </Link>
          <div className="mt-8 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
              <Icon size={24} />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-700">Guide d'utilisation</p>
              <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">{module.title}</h1>
              <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">{module.shortDescription}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-5xl gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,1fr)_260px]">
        <main className="min-w-0">
          <article className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
              <BookOpen size={16} /> Présentation
            </div>
            <p className="mt-4 text-base leading-8 text-slate-700">{module.description}</p>

            <div className="mt-9 border-t border-slate-100 pt-7">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">Ce que vous pouvez faire</h2>
              <ul className="mt-5 space-y-4">
                {module.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-3 text-sm leading-7 text-slate-700">
                    <CheckCircle2 size={18} className="mt-1 shrink-0 text-emerald-600" />
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>

          <nav aria-label="Navigation entre les rubriques" className="mt-6 grid gap-3 sm:grid-cols-2">
            {previous ? (
              <Link to={`/help/${previous.id}`} className="rounded-xl border border-slate-200 bg-white p-4 transition hover:border-emerald-300 hover:bg-emerald-50/40">
                <span className="flex items-center gap-2 text-xs font-semibold text-slate-500"><ArrowLeft size={14} /> Rubrique précédente</span>
                <span className="mt-2 block font-semibold text-slate-900">{previous.title}</span>
              </Link>
            ) : <span />}
            {next && (
              <Link to={`/help/${next.id}`} className="rounded-xl border border-slate-200 bg-white p-4 text-left transition hover:border-emerald-300 hover:bg-emerald-50/40 sm:text-right">
                <span className="flex items-center justify-end gap-2 text-xs font-semibold text-slate-500">Rubrique suivante <ArrowRight size={14} /></span>
                <span className="mt-2 block font-semibold text-slate-900">{next.title}</span>
              </Link>
            )}
          </nav>
        </main>

        <aside className="h-fit rounded-2xl border border-slate-200 bg-white p-5 lg:sticky lg:top-28">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Toutes les rubriques</h2>
          <nav aria-label="Rubriques du centre d'aide" className="mt-3 space-y-1">
            {helpModules.map((item) => {
              const ItemIcon = item.icon;
              const active = item.id === module.id;
              return (
                <Link key={item.id} to={`/help/${item.id}`} aria-current={active ? "page" : undefined}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${active ? "bg-emerald-50 text-emerald-800" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"}`}>
                  <ItemIcon size={17} className="shrink-0" />
                  <span>{item.title}</span>
                </Link>
              );
            })}
          </nav>
          <div className="mt-6 border-t border-slate-100 pt-5">
            <p className="text-sm font-semibold text-slate-900">Une question ?</p>
            <p className="mt-1 text-xs leading-5 text-slate-500">Notre équipe peut vous aider si vous ne trouvez pas la réponse.</p>
            <Link to="/contact" className="mt-3 inline-flex text-sm font-semibold text-emerald-700 hover:text-emerald-800">Contacter le support <ArrowRight size={14} className="ml-1" /></Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
