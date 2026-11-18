import { motion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowRight, Mail, Phone, Plus } from "lucide-react";
import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Photo from "../components/public/Photo";
import Receipt from "../components/public/Receipt";
import Reveal from "../components/public/Reveal";
import { faqs, features, paymentMethods, sectors, workflow } from "../data/publicContent";
import { images } from "../data/publicImages";
import { plans } from "../data/plans";

const Dot = () => <span className="-ml-[0.06em] text-sun">.</span>;
const Eyebrow = ({ children, dark = false }: { children: string; dark?: boolean }) => (
  <p className={`inline-flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-[0.2em] ${dark ? "text-sun" : "text-jokko"}`}>
    <span className={`h-2.5 w-2.5 rounded-full ${dark ? "bg-sun" : "bg-jokko"}`} /> {children}
  </p>
);
const h2 = "text-4xl font-extrabold leading-[1.05] tracking-[-0.035em] sm:text-5xl";

/** Grande courbe du « j » de la marque, utilisée comme motif graphique. */
const Curve = ({ className = "" }: { className?: string }) => (
  <svg aria-hidden viewBox="0 0 200 200" className={`pointer-events-none overflow-visible ${className}`}>
    <path d="M120 10V120A70 70 0 0 1 50 190H40" fill="none" stroke="currentColor" strokeWidth="46" strokeLinecap="round" />
  </svg>
);

export default function LandingPage() {
  const navigate = useNavigate();

  // Parallaxe douce de la photo du hero
  const { scrollY } = useScroll();
  const photoY = useTransform(scrollY, [0, 600], [0, 60]);

  // Ligne de progression de la section « journée »
  const dayRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: dayRef, offset: ["start 75%", "end 70%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });

  const [activeSector, setActiveSector] = useState(0);
  const marquee = [...sectors, ...sectors];

  return (
    <div className="text-ink">
      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden">
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-20 pt-14 sm:px-8 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6 lg:pb-28">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-ink/15 px-4 py-1.5 text-xs font-bold text-ink/75">
              <span className="h-2 w-2 rounded-full bg-sun" /> Gestion commerciale pensée pour le Sénégal
            </p>
            <h1 className="mt-7 text-5xl font-extrabold leading-[0.98] tracking-[-0.045em] sm:text-7xl">
              Votre commerce mérite une gestion <span className="text-jokko">plus claire</span><Dot />
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-ink/70">
              Ventes, stock, caisse, clients et fournisseurs : tout votre commerce dans un seul espace, sur ordinateur comme sur téléphone.
            </p>
            <div className="mt-9 flex flex-col items-start gap-5 sm:flex-row sm:items-center">
              <button onClick={() => navigate("/register")} className="group inline-flex items-center gap-3 rounded-full bg-jokko py-4 pl-7 pr-5 text-sm font-extrabold text-white transition hover:bg-jokko-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-jokko focus-visible:ring-offset-2 focus-visible:ring-offset-cream">
                Créer mon compte gratuitement
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-sun text-ink transition group-hover:translate-x-1"><ArrowRight size={16} /></span>
              </button>
              <a href="#features" className="text-sm font-extrabold underline decoration-sun decoration-[3px] underline-offset-[6px] transition hover:text-jokko">
                Découvrir les fonctionnalités
              </a>
            </div>
            <p className="mt-8 text-xs font-semibold text-ink/55">Offre gratuite · Sans installation · Sans carte bancaire</p>
          </div>

          <div className="relative mx-auto h-[32rem] w-full max-w-xl lg:max-w-none">
            <motion.div style={{ y: photoY }} className="absolute inset-y-0 right-0 w-[82%]">
              <Photo src={images.hero} className="h-full w-full rounded-[2.5rem] rounded-bl-[7rem]" />
            </motion.div>
            <Receipt className="absolute -left-1 bottom-2 w-[17.5rem] -rotate-3 sm:left-2 sm:w-[19rem]" />
            <span aria-hidden className="absolute right-[8%] top-6 h-14 w-14 rounded-full bg-sun" />
          </div>
        </div>
      </section>

      {/* ─── BANDEAU DÉFILANT ─── */}
      <div className="overflow-hidden bg-ink py-5 text-white" aria-label="Types de commerces">
        <div className="flex w-max animate-marquee motion-reduce:animate-none">
          {marquee.map((s, i) => (
            <span key={i} aria-hidden={i >= sectors.length} className="flex items-center gap-8 pr-8 text-lg font-extrabold tracking-tight">
              {s.name}
              <span className="h-2.5 w-2.5 rounded-full bg-sun" />
            </span>
          ))}
        </div>
      </div>

      {/* ─── SECTEURS ─── */}
      <section id="secteurs" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <Reveal className="max-w-3xl">
          <Eyebrow>Pour qui</Eyebrow>
          <h2 className={`mt-4 ${h2}`}>Votre façon de vendre, pas l'inverse<Dot /></h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-ink/70">Petite boutique, officine ou plusieurs points de vente : Jokko Business s'ajuste à votre activité.</p>
        </Reveal>

        <div className="mt-14 flex flex-col gap-3 lg:h-[30rem] lg:flex-row">
          {sectors.map(({ name, icon: Icon, image, text }, i) => {
            const active = activeSector === i;
            return (
              <article
                key={name}
                tabIndex={0}
                onMouseEnter={() => setActiveSector(i)}
                onFocus={() => setActiveSector(i)}
                className={`group relative min-w-0 overflow-hidden rounded-[1.75rem] text-white outline-none transition-[flex-grow] duration-500 ease-out focus-visible:ring-2 focus-visible:ring-jokko focus-visible:ring-offset-2 focus-visible:ring-offset-cream lg:flex-1 ${active ? "lg:grow-[3.4]" : ""}`}
              >
                <Photo src={image} tone="ink" className="h-64 w-full lg:absolute lg:inset-0 lg:h-full">
                  <div className="absolute inset-0 -z-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
                </Photo>
                <div className="absolute inset-0 flex flex-col justify-end p-6">
                  <Icon size={22} className="mb-3 text-sun" />
                  <h3 className="text-xl font-extrabold tracking-tight lg:hidden">{name}</h3>
                  <p className="mt-1 text-sm leading-6 text-white/85 lg:hidden">{text}</p>
                  {/* Bureau : nom vertical quand replié, détail quand déplié */}
                  <h3 className={`hidden text-xl font-extrabold tracking-tight transition-opacity duration-300 lg:block ${active ? "opacity-100" : "opacity-0"}`}>{name}</h3>
                  <p className={`mt-1 hidden max-w-sm text-sm leading-6 text-white/85 transition-opacity duration-300 lg:block ${active ? "opacity-100 delay-150" : "opacity-0"}`}>{text}</p>
                  <span aria-hidden className={`absolute bottom-6 left-6 hidden rotate-180 whitespace-nowrap text-base font-extrabold tracking-tight transition-opacity duration-300 [writing-mode:vertical-rl] lg:block ${active ? "opacity-0" : "opacity-100"}`}>
                    {name}
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ─── MODULES ─── */}
      <section id="features" className="bg-paper">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <Eyebrow>Fonctionnalités</Eyebrow>
            <h2 className={`mt-4 ${h2}`}>Tout ce qu'il faut pour tenir sa boutique<Dot /></h2>
            <p className="mt-5 max-w-md text-base leading-8 text-ink/70">Huit modules reliés entre eux : une vente met à jour le stock et la caisse, et s'ajoute à l'historique du client.</p>
            <Link to="/help" className="mt-8 inline-flex items-center gap-2 text-sm font-extrabold underline decoration-sun decoration-[3px] underline-offset-[6px] hover:text-jokko">
              Lire les guides d'utilisation <ArrowRight size={16} />
            </Link>
          </div>

          <ol className="border-b border-ink/15">
            {features.map(({ title, description, points }, i) => (
              <Reveal key={title}>
                <li className="group grid gap-x-8 gap-y-3 border-t border-ink/15 py-8 transition-colors hover:bg-cream/70 sm:grid-cols-[3.5rem_1fr] sm:px-4">
                  <span className="text-sm font-extrabold tabular-nums text-jokko">{String(i + 1).padStart(2, "0")}</span>
                  <div>
                    <h3 className="text-2xl font-extrabold tracking-[-0.025em]">{title}</h3>
                    <p className="mt-1 text-base text-ink/65">{description}</p>
                    <ul className="mt-4 flex flex-wrap gap-2">
                      {points.map((p) => (
                        <li key={p} className="rounded-full border border-ink/15 px-3.5 py-1.5 text-xs font-semibold text-ink/75">{p}</li>
                      ))}
                    </ul>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ─── UNE JOURNÉE ─── */}
      <section ref={dayRef} className="relative overflow-hidden bg-ink py-24 text-white sm:py-32">
        <Curve className="absolute -right-32 top-10 h-[40rem] w-[40rem] text-white/[0.04]" />
        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal className="max-w-3xl">
            <Eyebrow dark>Une journée avec Jokko</Eyebrow>
            <h2 className={`mt-4 ${h2}`}>Du matin au soir, chaque mouvement est tracé<Dot /></h2>
          </Reveal>

          <div className="relative mt-16">
            <div className="absolute left-0 right-0 top-[1.15rem] hidden h-px bg-white/15 lg:block" />
            <motion.div style={{ scaleX: progress }} className="absolute left-0 right-0 top-[1.15rem] hidden h-px origin-left bg-sun lg:block" />
            <ol className="grid gap-10 lg:grid-cols-4 lg:gap-8">
              {workflow.map(({ time, title, text }, i) => (
                <Reveal key={title} delay={i * 0.08}>
                  <li>
                    <span className="relative z-10 flex h-[2.3rem] w-[2.3rem] items-center justify-center rounded-full bg-sun text-xs font-extrabold text-ink">{i + 1}</span>
                    <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-white/55">{time}</p>
                    <h3 className="mt-2 text-2xl font-extrabold tracking-[-0.025em]">{title}</h3>
                    <p className="mt-3 text-sm leading-7 text-white/70">{text}</p>
                  </li>
                </Reveal>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ─── PAIEMENTS ─── */}
      <section className="relative overflow-hidden bg-jokko py-24 text-white sm:py-32">
        <Curve className="absolute -bottom-24 -left-20 h-[34rem] w-[34rem] text-white/[0.08]" />
        <div className="relative mx-auto grid max-w-7xl items-end gap-12 px-5 sm:px-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <Eyebrow dark>Moyens de paiement</Eyebrow>
            <ul className="mt-6 text-5xl font-extrabold leading-[1.02] tracking-[-0.045em] sm:text-7xl">
              {paymentMethods.slice(0, 4).map((m, i) => (
                <Reveal key={m} delay={i * 0.07}><li className={i % 2 ? "text-white/55" : ""}>{m}<Dot /></li></Reveal>
              ))}
            </ul>
          </div>
          <Reveal delay={0.15}>
            <p className="max-w-md text-lg leading-8 text-white/85">
              Chaque encaissement et chaque décaissement est classé par moyen de paiement. À la fermeture de la caisse, le rapport vous donne la répartition de la journée.
            </p>
            <p className="mt-5 text-sm font-bold text-sun">Sans installation · navigateur sur ordinateur, tablette et téléphone</p>
          </Reveal>
        </div>
      </section>

      {/* ─── FORMULES ─── */}
      <section id="pricing" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
        <Reveal className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <Eyebrow>Nos formules</Eyebrow>
            <h2 className={`mt-4 ${h2}`}>Commencez gratuitement, grandissez à votre rythme<Dot /></h2>
          </div>
          <p className="max-w-xs text-sm font-semibold text-ink/65">14 jours d'essai sur les formules payantes. Tarifs mensuels en FCFA.</p>
        </Reveal>

        <div className="mt-14 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {plans.map((plan, i) => (
            <Reveal key={plan.id} delay={i * 0.06} className="h-full">
              <article className={`flex h-full flex-col rounded-[1.75rem] p-7 ${plan.highlighted ? "bg-jokko text-white" : "border border-ink/15 bg-paper"}`}>
                <p className={`min-h-9 text-xs font-bold uppercase tracking-[0.14em] ${plan.highlighted ? "text-sun" : "text-jokko"}`}>{plan.eyebrow}</p>
                <h3 className="mt-3 text-2xl font-extrabold tracking-tight">{plan.name}</h3>
                <p className="mt-6 flex items-baseline gap-2">
                  <span className="text-5xl font-extrabold tracking-[-0.045em]">{plan.price}</span>
                  <span className={`text-xs font-bold ${plan.highlighted ? "text-white/75" : "text-ink/55"}`}>{plan.period}</span>
                </p>
                <ul className="mt-7 flex-1 space-y-3 border-t border-current/15 pt-6">
                  {plan.features.slice(0, 4).map((f) => (
                    <li key={f} className={`flex items-start gap-3 text-sm leading-6 ${plan.highlighted ? "text-white/90" : "text-ink/75"}`}>
                      <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sun" />{f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => navigate(`/register?plan=${plan.id}`)} className={`mt-8 inline-flex items-center justify-between rounded-full px-5 py-3 text-sm font-extrabold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-sun focus-visible:ring-offset-2 ${plan.highlighted ? "bg-white text-jokko-deep hover:bg-cream focus-visible:ring-offset-jokko" : "bg-ink text-white hover:bg-jokko-deep focus-visible:ring-offset-paper"}`}>
                  {plan.action} <ArrowRight size={16} />
                </button>
              </article>
            </Reveal>
          ))}
        </div>
        <p className="mt-8 text-sm">
          <Link to="/tarifs" className="font-extrabold underline decoration-sun decoration-[3px] underline-offset-[6px] hover:text-jokko">Voir le détail des formules</Link>
        </p>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="bg-paper">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 py-24 sm:px-8 sm:py-32 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
          <div>
            <Eyebrow>Questions fréquentes</Eyebrow>
            <h2 className={`mt-4 ${h2}`}>Avant de vous lancer<Dot /></h2>
            <Link to="/contact" className="mt-8 inline-flex items-center gap-2 text-sm font-extrabold underline decoration-sun decoration-[3px] underline-offset-[6px] hover:text-jokko">
              Une autre question ? Écrivez-nous <ArrowRight size={16} />
            </Link>
          </div>
          <div className="border-b border-ink/15">
            {faqs.map(({ q, a }) => (
              <details key={q} className="group border-t border-ink/15 py-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6 text-lg font-extrabold tracking-tight marker:hidden [&::-webkit-details-marker]:hidden">
                  {q}
                  <Plus size={20} className="shrink-0 text-jokko transition-transform duration-300 group-open:rotate-45" />
                </summary>
                <p className="mt-4 max-w-2xl text-base leading-8 text-ink/70">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ─── APPEL À L'ACTION ─── */}
      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <Photo src={images.cta} tone="ink" className="rounded-[2.5rem] text-white">
          <Curve className="absolute -bottom-16 right-8 h-[26rem] w-[26rem] text-white/10" />
          <div className="relative px-8 py-20 sm:px-16 sm:py-24">
            <h2 className="max-w-3xl text-4xl font-extrabold leading-[1.02] tracking-[-0.04em] sm:text-6xl">Prêt à y voir plus clair<span className="text-sun">&nbsp;?</span></h2>
            <p className="mt-6 max-w-lg text-base leading-8 text-white/80">Créez votre compte en quelques secondes et organisez votre commerce dès aujourd'hui.</p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <button onClick={() => navigate("/register")} className="inline-flex items-center justify-center gap-2 rounded-full bg-sun px-7 py-4 text-sm font-extrabold text-ink transition hover:bg-white">Démarrer gratuitement <ArrowRight size={17} /></button>
              <button onClick={() => navigate("/contact")} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-7 py-4 text-sm font-extrabold transition hover:bg-white/10"><Mail size={15} /> Nous contacter</button>
              <a href="tel:+221783333838" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/40 px-7 py-4 text-sm font-extrabold transition hover:bg-white/10"><Phone size={15} /> Nous appeler</a>
            </div>
          </div>
        </Photo>
      </section>
    </div>
  );
}
