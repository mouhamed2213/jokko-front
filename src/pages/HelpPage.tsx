import { ArrowRight, BookOpen, Headphones } from "lucide-react";
import { Link } from "react-router-dom";
import { helpModules } from "../data/helpModules";

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-emerald-700 text-white">
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-medium text-emerald-50">
            <BookOpen size={16} /> Documentation Jokko Business
          </div>
          <h1 className="mt-5 max-w-3xl text-3xl font-bold tracking-tight sm:text-4xl">Comment utiliser Jokko Business ?</h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-emerald-50">
            Retrouvez les guides des différentes fonctionnalités de votre espace de gestion et consultez directement la rubrique qui vous intéresse.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-12 sm:px-8">
        <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-emerald-700">Centre d'aide</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Parcourir les rubriques</h2>
          </div>
          <p className="text-sm text-slate-500">{helpModules.length} guides disponibles</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {helpModules.map((module) => {
            const Icon = module.icon;
            return (
              <Link key={module.id} to={`/help/${module.id}`}
                className="group flex min-h-48 flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <Icon size={22} />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">{module.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-slate-600">{module.shortDescription}</p>
                <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-emerald-700">
                  Consulter le guide <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>

        <div className="mt-10 flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-7">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <Headphones size={20} />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Vous avez besoin d'aide ?</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">Si vous ne trouvez pas la réponse à votre question, contactez notre équipe.</p>
            </div>
          </div>
          <Link to="/contact" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700">
            Contacter le support <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
