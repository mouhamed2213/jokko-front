import { ArrowRight, Check, HelpCircle, MessageCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import PageHero from "../components/public/PageHero";
import { plans } from "../data/plans";
import { images } from "../data/publicImages";

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
    answer: "Les montants affichés pour Starter, Pro et Signature correspondent au tarif mensuel en FCFA.",
  },
  {
    question: "Puis-je changer de formule plus tard ?",
    answer: "Vous pouvez choisir une formule adaptée à l'évolution de votre activité. Pour une situation particulière, contactez notre équipe.",
  },
];

export default function PricingPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen bg-paper text-ink/80">
      <PageHero
        align="center"
        image={images.pricing}
        eyebrow="Tarifs Jokko Business"
        title="Choisissez la formule qui vous ressemble."
        subtitle="Des outils pour organiser votre commerce au quotidien. Commencez gratuitement et faites évoluer votre formule selon vos besoins."
      >
        <p className="text-sm font-semibold text-sun">14 jours d'essai sur les formules payantes</p>
      </PageHero>

      <section className="px-5 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-7 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-jokko-deep">Nos formules</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-ink">Un tarif clair, sans détour</h2>
            </div>
            <p className="text-xs font-medium text-ink/60">Tarifs mensuels en francs CFA (FCFA)</p>
          </div>

          <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan) => (
              <article
                key={plan.id}
                className={`relative flex min-w-0 flex-col border p-5 sm:p-6 ${plan.highlighted
                  ? "border-jokko bg-jokko/10"
                  : "border-ink/10 bg-paper"}`}
              >
                {plan.highlighted && (
                  <span className="absolute right-4 top-0 -translate-y-1/2 bg-jokko px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
                    Mise en avant
                  </span>
                )}
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-jokko-deep">{plan.eyebrow}</p>
                  <h3 className="mt-2 text-xl font-bold tracking-tight text-ink">{plan.name}</h3>
                  <p className="mt-3 min-h-[4.5rem] text-sm leading-6 text-ink/70">{plan.summary}</p>
                </div>

                <div className="mt-5 border-y border-ink/10 py-5">
                  <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-3xl font-bold tracking-[-0.04em] text-ink">{plan.price}</span>
                    <span className="text-xs font-semibold text-ink/60">{plan.period}</span>
                  </div>
                  <p className="mt-2 text-xs font-medium text-jokko-deep">
                    {plan.id === "free" ? "Gratuit" : "14 jours d'essai gratuit"}
                  </p>
                </div>

                <p className="mb-4 mt-5 text-[11px] font-bold uppercase tracking-[0.14em] text-ink/60">Inclus dans la formule</p>
                <ul className="mb-7 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm leading-6 text-ink/70">
                      <Check size={16} strokeWidth={2.5} className="mt-1 shrink-0 text-jokko" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() => navigate(`/register?plan=${plan.id}`)}
                  className={`mt-auto inline-flex min-h-12 w-full items-center justify-center gap-2 px-4 py-3 text-sm font-bold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-jokko focus-visible:ring-offset-2 ${plan.highlighted
                    ? "bg-jokko text-white hover:bg-jokko-deep"
                    : "border border-ink/20 bg-paper text-ink/80 hover:border-jokko hover:bg-jokko/10"}`}
                >
                  {plan.action} <ArrowRight size={15} />
                </button>
              </article>
            ))}
          </div>
          <p className="mt-5 text-xs leading-6 text-ink/60">
            Les fonctionnalités présentées résument les différences entre les formules. Les droits et capacités applicables sont ceux associés à l'abonnement actif de votre boutique.
          </p>
        </div>
      </section>

      <section className="border-y border-ink/10 bg-cream px-5 py-6 sm:px-8">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm font-medium text-ink/70">
          <span className="inline-flex items-center gap-2"><Check size={16} className="text-jokko" /> Une formule gratuite disponible</span>
          <span className="inline-flex items-center gap-2"><Check size={16} className="text-jokko" /> Tarifs affichés en FCFA</span>
          <span className="inline-flex items-center gap-2"><Check size={16} className="text-jokko" /> Essai de 14 jours sur les offres payantes</span>
        </div>
      </section>

      <section className="px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-jokko-deep">Questions fréquentes</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-ink">Toutes vos questions. Des réponses claires.</h2>
            <p className="mt-4 text-sm leading-7 text-ink/70">
              Vous souhaitez en savoir plus sur une formule ou discuter de votre organisation ?
            </p>
            <Link
              to="/contact?subject=Question%20sur%20les%20formules%20Jokko%20Business"
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-jokko-deep underline-offset-4 hover:underline"
            >
              <MessageCircle size={16} /> Contacter notre équipe <ArrowRight size={15} />
            </Link>
            <p className="mt-4 text-xs text-ink/60">
              Vous pouvez aussi consulter notre <Link to="/help" className="font-semibold text-jokko-deep underline-offset-4 hover:underline">guide d'utilisation</Link>.
            </p>
          </div>
          <div className="divide-y divide-ink/10 border-y border-ink/10">
            {questions.map((item) => (
              <details key={item.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 font-semibold text-ink marker:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-jokko">
                  <span className="flex items-start gap-3">
                    <HelpCircle size={17} className="mt-0.5 shrink-0 text-jokko" />
                    {item.question}
                  </span>
                  <span aria-hidden="true" className="text-xl font-normal leading-none text-jokko-deep transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 pl-8 text-sm leading-7 text-ink/70">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
