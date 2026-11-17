import { ArrowRight, Check, HelpCircle, MessageCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const plans = [
  {
    id: "free",
    name: "Gratuit",
    eyebrow: "Pour commencer",
    price: "0",
    period: "FCFA",
    summary: "Découvrez Jokko Business et organisez les opérations essentielles de votre boutique.",
    features: [
      "Gestion des produits et des ventes",
      "Suivi des clients et de leurs dettes",
      "Caisse journalière",
      "Tickets de caisse",
    ],
    action: "Créer mon compte",
    highlighted: false,
  },
  {
    id: "starter",
    name: "Starter",
    eyebrow: "Pour structurer son activité",
    price: "6 500",
    period: "FCFA / mois",
    summary: "Structurez la gestion quotidienne de votre boutique et gagnez en visibilité.",
    features: [
      "Tout le nécessaire pour gérer les ventes et les produits",
      "Alertes de stock faible et de rupture",
      "Factures et exports PDF / Excel",
      "Suivi des fournisseurs",
      "Gestion d'une équipe",
    ],
    action: "Choisir Starter",
    highlighted: true,
  },
  {
    id: "pro",
    name: "Pro",
    eyebrow: "Pour accompagner la croissance",
    price: "14 000",
    period: "FCFA / mois",
    summary: "Accompagnez le développement de votre commerce et de vos points de vente.",
    features: [
      "Les fonctionnalités de Starter",
      "Rapports et statistiques avancés",
      "Gestion de plusieurs boutiques",
      "Équipe élargie",
      "Gestion des fournisseurs",
    ],
    action: "Choisir Pro",
    highlighted: false,
  },
  {
    id: "premium",
    name: "Premium",
    eyebrow: "Pour les organisations établies",
    price: "22 000",
    period: "FCFA / mois",
    summary: "Une formule destinée aux structures qui pilotent plusieurs boutiques et des équipes plus larges.",
    features: [
      "Les fonctionnalités de Pro",
      "Gestion de plusieurs boutiques",
      "Une capacité d’équipe adaptée aux structures plus importantes",
    ],
    action: "Choisir Premium",
    highlighted: false,
  },
];

const questions = [
  {
    question: "Puis-je commencer gratuitement ?",
    answer: "Oui. L'offre Gratuit permet de commencer à utiliser Jokko Business sans abonnement payant.",
  },
  {
    question: "Les offres payantes proposent-elles une période d'essai ?",
    answer: "Oui. Une période d'essai de 14 jours est prévue pour les abonnements payants.",
  },
  {
    question: "Les prix sont-ils mensuels ?",
    answer: "Les montants affichés pour Starter, Pro et Premium correspondent au tarif mensuel en FCFA.",
  },
  {
    question: "Puis-je changer de formule plus tard ?",
    answer: "Vous pouvez choisir une formule adaptée à l'évolution de votre activité. Pour une situation particulière, contactez notre équipe.",
  },
];

export default function PricingPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-white text-slate-800">
      <section className="border-b border-slate-200 bg-slate-50 px-5 pb-12 pt-16 sm:px-8 sm:pb-16 sm:pt-20">
        <div className="mx-auto max-w-5xl text-center">
          <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
            Tarifs Jokko Business
          </p>
          <h1 className="mx-auto mt-5 max-w-4xl text-4xl font-bold leading-tight tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-6xl">
            Choisissez la formule qui vous ressemble.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-slate-600">
            Des outils pour organiser votre commerce au quotidien. Commencez gratuitement et faites évoluer votre formule selon vos besoins.
          </p>
          <p className="mt-6 text-sm font-semibold text-emerald-700">
            14 jours d'essai sur les formules payantes
          </p>
        </div>
      </section>

      <section className="px-5 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Nos formules</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950">Un tarif clair, sans détour</h2>
            </div>
            <p className="text-xs font-medium text-slate-500">Tarifs mensuels en francs CFA (FCFA)</p>
          </div>

          <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan) => (
              <article
                key={plan.id}
                className={`relative flex min-w-0 flex-col border p-5 sm:p-6 ${plan.highlighted
                  ? "border-emerald-600 bg-emerald-50/60"
                  : "border-slate-200 bg-white"}`}
              >
                {plan.highlighted && (
                  <span className="absolute right-4 top-0 -translate-y-1/2 bg-emerald-600 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                    Mise en avant
                  </span>
                )}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-emerald-700">{plan.eyebrow}</p>
                  <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-950">{plan.name}</h3>
                  <p className="mt-3 min-h-[4.5rem] text-sm leading-6 text-slate-600">{plan.summary}</p>
                </div>

                <div className="mt-5 border-y border-slate-200 py-5">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-3xl font-bold tracking-[-0.04em] text-slate-950">{plan.price}</span>
                    <span className="text-xs font-semibold text-slate-500">{plan.period}</span>
                  </div>
                  <p className="mt-2 text-xs font-medium text-emerald-700">
                    {plan.id === "free" ? "Gratuit" : "14 jours d'essai gratuit"}
                  </p>
                </div>

                <p className="mb-4 mt-5 text-[11px] font-bold uppercase tracking-[0.14em] text-slate-500">Inclus dans la formule</p>
                <ul className="mb-7 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm leading-6 text-slate-600">
                      <Check size={16} strokeWidth={2.5} className="mt-1 shrink-0 text-emerald-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => navigate(`/register?plan=${plan.id}`)}
                  className={`mt-auto inline-flex min-h-12 w-full items-center justify-center gap-2 px-4 py-3 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 ${plan.highlighted
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : "border border-slate-300 bg-white text-slate-800 hover:border-emerald-600 hover:bg-emerald-50"}`}
                >
                  {plan.action} <ArrowRight size={15} />
                </button>
              </article>
            ))}
          </div>
          <p className="mt-5 text-xs leading-6 text-slate-500">
            Les fonctionnalités présentées résument les différences entre les formules. Les droits et capacités applicables sont ceux associés à l'abonnement actif de votre boutique.
          </p>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 px-5 py-6 sm:px-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm font-medium text-slate-600">
          <span className="inline-flex items-center gap-2"><Check size={16} className="text-emerald-600" /> Une formule gratuite disponible</span>
          <span className="inline-flex items-center gap-2"><Check size={16} className="text-emerald-600" /> Tarifs affichés en FCFA</span>
          <span className="inline-flex items-center gap-2"><Check size={16} className="text-emerald-600" /> Essai de 14 jours sur les offres payantes</span>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Questions fréquentes</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Toutes vos questions. Des réponses claires.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              Vous souhaitez en savoir plus sur une formule ou discuter de votre organisation ?
            </p>
            <Link
              to="/contact?subject=Question%20sur%20les%20formules%20Jokko%20Business"
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-emerald-700 underline-offset-4 hover:underline"
            >
              <MessageCircle size={16} /> Contacter notre équipe <ArrowRight size={15} />
            </Link>
            <p className="mt-4 text-xs text-slate-500">
              Vous pouvez aussi consulter notre <Link to="/help" className="font-semibold text-emerald-700 underline-offset-4 hover:underline">guide d'utilisation</Link>.
            </p>
          </div>
          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {questions.map((item) => (
              <details key={item.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-semibold text-slate-900 marker:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">
                  <span className="flex items-start gap-3">
                    <HelpCircle size={17} className="mt-0.5 shrink-0 text-emerald-600" />
                    {item.question}
                  </span>
                  <span aria-hidden="true" className="text-xl font-normal leading-none text-emerald-700 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 pl-8 text-sm leading-7 text-slate-600">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
