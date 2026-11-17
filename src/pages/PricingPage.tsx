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
      <section className="relative overflow-hidden border-b border-slate-200 bg-slate-50 px-5 pb-14 pt-16 sm:px-8 sm:pb-20 sm:pt-20">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-32 h-80 w-80 rounded-full border-[44px] border-emerald-100/70" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-36 left-[12%] h-64 w-64 rounded-full border-[34px] border-emerald-50" />
        <div className="relative mx-auto max-w-6xl">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 text-xs font-extrabold uppercase tracking-[0.2em] text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              Les formules Jokko Business
            </p>
            <h1 className="mt-5 text-4xl font-bold leading-tight tracking-[-0.04em] text-slate-950 sm:text-5xl lg:text-[3.5rem]">
              La bonne formule pour faire avancer votre commerce.
            </h1>
            <div className="mt-6 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-xl text-base leading-8 text-slate-600">
                Commencez avec l'essentiel, puis faites évoluer votre formule au rythme de votre activité. Des tarifs clairs, en francs CFA.
              </p>
              <div className="flex shrink-0 items-center gap-3 border-l-2 border-emerald-600 pl-4">
                <span className="text-3xl font-bold tracking-tight text-slate-950">14</span>
                <span className="max-w-28 text-xs font-semibold leading-5 text-slate-600">jours d'essai sur les formules payantes</span>
              </div>
            </div>
          </div>
          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-slate-200 pt-5 text-xs font-medium text-slate-500">
            <span>Prix en FCFA</span>
            <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
            <span>Offre gratuite disponible</span>
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-7xl">
          <div className="mb-9 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Choisissez votre formule</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Comparez avant de vous décider</h2>
            </div>
            <p className="text-sm text-slate-500">Facturation mensuelle pour les offres payantes</p>
          </div>

          <div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan) => (
              <article
                key={plan.id}
                className={`relative flex min-w-0 flex-col border p-6 transition-colors ${plan.highlighted
                  ? "border-emerald-600 bg-emerald-50/50 shadow-[0_12px_35px_rgba(15,118,110,0.10)] xl:-mt-3 xl:mb-3"
                  : "border-slate-200 bg-white hover:border-slate-300"}`}
              >
                {plan.highlighted && (
                  <div className="absolute inset-x-0 top-0 h-1 bg-emerald-600" />
                )}
                <div className="min-h-[7.5rem] pt-1">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xl font-bold tracking-tight text-slate-950">{plan.name}</h3>
                    {plan.highlighted && <span className="whitespace-nowrap bg-emerald-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">Mise en avant</span>}
                  </div>
                  <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-700">{plan.eyebrow}</p>
                  <p className="mt-3 text-sm leading-6 text-slate-600">{plan.summary}</p>
                </div>

                <div className="my-6 border-y border-slate-200/80 py-5">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-3xl font-bold tracking-[-0.04em] text-slate-950">{plan.price}</span>
                    <span className="text-xs font-semibold text-slate-500">{plan.period}</span>
                  </div>
                  <p className="mt-2 min-h-4 text-xs font-medium text-emerald-700">
                    {plan.id === "free" ? "Gratuit, sans abonnement payant" : "14 jours d'essai gratuit"}
                  </p>
                </div>

                <p className="mb-4 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Inclus dans la formule</p>
                <ul className="mb-8 flex-1 space-y-3">
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
          <p className="mt-6 max-w-4xl text-xs leading-6 text-slate-500">
            Les fonctionnalités présentées résument les différences entre les formules. Les droits et capacités applicables sont ceux associés à l'abonnement actif de votre boutique.
          </p>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 px-5 py-14 sm:px-8 sm:py-16">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1fr_19rem] md:items-center">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Un besoin particulier ?</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">Votre organisation a ses propres réalités.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">
              Vous souhaitez discuter de votre organisation ou d'un besoin qui dépasse les formules présentées ? Notre équipe peut vous orienter.
            </p>
          </div>
          <Link
            to="/contact?subject=Demande%20sur%20les%20formules%20Jokko%20Business"
            className="inline-flex min-h-12 items-center justify-center gap-2 bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
          >
            <MessageCircle size={16} /> Parler à notre équipe
          </Link>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Questions fréquentes</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Encore quelques questions ?</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">Retrouvez ici les réponses aux questions les plus courantes sur nos formules et leur fonctionnement.</p>
            <p className="mt-6 text-sm text-slate-600">
              Besoin d'aide ? <Link to="/contact" className="font-semibold text-emerald-700 underline-offset-4 hover:underline">Contactez-nous</Link>.
            </p>
          </div>
          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {questions.map((item) => (
              <article key={item.question} className="py-5">
                <h3 className="flex items-start gap-3 font-semibold text-slate-900">
                  <HelpCircle size={17} className="mt-0.5 shrink-0 text-emerald-600" />
                  {item.question}
                </h3>
                <p className="mt-2 pl-8 text-sm leading-7 text-slate-600">{item.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 sm:px-8 sm:pb-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 bg-emerald-700 px-7 py-9 text-white sm:flex-row sm:items-center sm:justify-between sm:px-10">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-100">Passez à l'action</p>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">Commencez à mieux organiser votre commerce.</h2>
            <p className="mt-3 text-sm leading-7 text-emerald-50">Créez votre compte et découvrez une gestion plus claire au quotidien.</p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/register")}
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 bg-white px-6 py-3 text-sm font-bold text-emerald-800 transition hover:bg-emerald-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-emerald-700"
          >
            Démarrer gratuitement <ArrowRight size={16} />
          </button>
        </div>
      </section>
    </main>
  );
}
