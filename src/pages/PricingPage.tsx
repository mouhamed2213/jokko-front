import { ArrowRight, Check, HelpCircle, MessageCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const plans = [
  {
    id: "free",
    name: "Gratuit",
    price: "0",
    period: "pour toujours",
    summary: "Pour découvrir Jokko Business et organiser les opérations essentielles de votre boutique.",
    features: [
      "Gestion des produits et des ventes",
      "Suivi des clients et de leurs dettes",
      "Caisse journalière",
      "Tickets de caisse",
    ],
    action: "Commencer gratuitement",
    highlighted: false,
  },
  {
    id: "starter",
    name: "Starter",
    price: "6 500",
    period: "FCFA / mois",
    summary: "Pour une boutique qui souhaite structurer davantage sa gestion quotidienne.",
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
    price: "14 000",
    period: "FCFA / mois",
    summary: "Pour les commerces en croissance qui ont besoin de gérer plusieurs points de vente.",
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
    price: "22 000",
    period: "FCFA / mois",
    summary: "Pour les structures qui pilotent plusieurs boutiques et des équipes plus larges.",
    features: [
      "Les fonctionnalités de Pro",
      "Gestion de plusieurs boutiques",
      "Utilisateurs sans limite annoncée",
      "Support prioritaire",
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
      <section className="border-b border-slate-200 bg-slate-50 px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-700">Tarification</p>
          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_19rem] lg:items-end">
            <div>
              <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">Choisissez la formule qui accompagne votre commerce</h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-slate-600">Des outils pour suivre vos ventes, organiser vos stocks et mieux gérer votre activité. Commencez avec l'offre gratuite et faites évoluer votre formule selon vos besoins.</p>
            </div>
            <div className="border-l-2 border-emerald-600 pl-5">
              <p className="text-2xl font-bold text-slate-950">14 jours</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">de période d'essai sur les formules payantes</p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-9 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-950">Comparez les formules</h2>
              <p className="mt-2 text-sm text-slate-500">Les tarifs sont indiqués en francs CFA (FCFA).</p>
            </div>
            <p className="text-xs text-slate-500">Facturation mensuelle pour les offres payantes</p>
          </div>

          <div className="grid items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan) => (
              <article key={plan.id} className={`flex flex-col border bg-white p-6 ${plan.highlighted ? "border-emerald-600 ring-1 ring-emerald-600" : "border-slate-200"}`}>
                <div className="min-h-32">
                  {plan.highlighted && <span className="mb-3 inline-flex text-[11px] font-bold uppercase tracking-wide text-emerald-700">Pour une boutique en croissance</span>}
                  <h3 className="text-xl font-bold text-slate-950">{plan.name}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{plan.summary}</p>
                </div>
                <div className="my-6 border-y border-slate-100 py-5">
                  <p className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-3xl font-bold tracking-tight text-slate-950">{plan.price}</span>
                    <span className="text-xs font-semibold text-slate-500">{plan.period}</span>
                  </p>
                  {plan.id !== "free" && <p className="mt-2 text-xs font-medium text-emerald-700">14 jours d'essai gratuit</p>}
                </div>
                <ul className="mb-8 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm leading-6 text-slate-600">
                      <Check size={16} className="mt-1 shrink-0 text-emerald-600" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <button type="button" onClick={() => navigate(`/register?plan=${plan.id}`)} className={`mt-auto inline-flex min-h-11 w-full items-center justify-center gap-2 px-4 py-3 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2 ${plan.highlighted ? "bg-emerald-600 text-white hover:bg-emerald-700" : "border border-slate-300 text-slate-800 hover:border-emerald-600 hover:bg-emerald-50"}`}>
                  {plan.action} <ArrowRight size={15} />
                </button>
              </article>
            ))}
          </div>
          <p className="mt-6 text-xs leading-6 text-slate-500">Les fonctionnalités présentées résument les différences entre les formules. Les droits et capacités applicables sont ceux associés à l'abonnement actif de votre boutique.</p>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-slate-50 px-5 py-14 sm:px-8">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1fr_20rem] md:items-center">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-950">Vous gérez plusieurs points de vente ?</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600">Pour discuter d'une organisation particulière ou d'un besoin qui dépasse les formules présentées, notre équipe peut vous orienter.</p>
          </div>
          <Link to="/contact?subject=Demande%20sur%20les%20formules%20Jokko%20Business" className="inline-flex min-h-11 items-center justify-center gap-2 bg-slate-900 px-5 py-3 text-sm font-bold text-white transition hover:bg-slate-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2">
            <MessageCircle size={16} /> Contacter l'équipe
          </Link>
        </div>
      </section>

      <section className="px-5 py-14 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-700">Besoin d'une précision ?</p>
            <h2 className="mt-3 text-2xl font-bold tracking-tight text-slate-950">Questions fréquentes sur les tarifs</h2>
          </div>
          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {questions.map((item) => (
              <article key={item.question} className="py-5">
                <h3 className="flex items-start gap-2 font-semibold text-slate-900"><HelpCircle size={17} className="mt-0.5 shrink-0 text-emerald-600" />{item.question}</h3>
                <p className="mt-2 pl-6 text-sm leading-7 text-slate-600">{item.answer}</p>
              </article>
            ))}
          </div>
          <p className="mt-8 text-sm text-slate-600">Une autre question ? <Link to="/contact" className="font-semibold text-emerald-700 underline-offset-4 hover:underline">Contactez-nous</Link> ou consultez le <Link to="/help" className="font-semibold text-emerald-700 underline-offset-4 hover:underline">guide d'utilisation</Link>.</p>
        </div>
      </section>
    </main>
  );
}
