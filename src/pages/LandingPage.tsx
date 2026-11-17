import { ArrowRight, Check, MapPin, Mail, Phone, Smartphone } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Reveal from "../components/public/Reveal";
import { bgImage, images } from "../data/publicImages";
import { faqs, features, paymentMethods, sectors, workflow } from "../data/publicContent";
import { plans } from "../data/plans";

const Eyebrow = ({ children, light = false }: { children: string; light?: boolean }) => (
  <p className={`text-xs font-extrabold uppercase tracking-[0.2em] ${light ? "text-emerald-300" : "text-emerald-700"}`}>{children}</p>
);

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="bg-white font-sans text-slate-800 antialiased">
      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 -z-20 bg-cover bg-center" style={{ backgroundImage: bgImage(images.hero) }} />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/50" />
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:py-32">
          <div>
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold tracking-wide backdrop-blur">
              <MapPin size={14} className="text-emerald-300" /> La gestion commerciale pensée pour les commerces du Sénégal
            </div>
            <h1 className="text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Votre commerce mérite une gestion <span className="text-emerald-400">plus claire.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-200 sm:text-lg">
              Ventes, stocks, caisse, clients et fournisseurs : tous les outils de votre boutique dans un seul espace, sur ordinateur comme sur téléphone.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => navigate("/register")} className="inline-flex items-center justify-center gap-3 rounded-full bg-emerald-600 px-7 py-4 text-sm font-extrabold shadow-xl shadow-emerald-950/20 transition hover:-translate-y-0.5 hover:bg-emerald-700">
                Créer mon compte gratuitement <ArrowRight size={17} />
              </button>
              <a href="#features" className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-4 text-sm font-bold backdrop-blur transition hover:bg-white/15">
                Découvrir les fonctionnalités
              </a>
            </div>
            <ul className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-xs font-semibold text-slate-300">
              {["Démarrage simple", "Offre gratuite disponible", "Sans installation"].map((t) => (
                <li key={t} className="inline-flex items-center gap-2"><Check size={15} className="text-emerald-300" /> {t}</li>
              ))}
            </ul>
          </div>

          {/* Aperçu de la journée */}
          <div className="hidden lg:block">
            <div className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-md">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">Une journée type</p>
              <ol className="mt-5 space-y-4">
                {workflow.map(({ time, title, icon: Icon }) => (
                  <li key={title} className="flex items-center gap-4 rounded-2xl bg-slate-950/40 p-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-300"><Icon size={20} /></span>
                    <span>
                      <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400">{time}</span>
                      <span className="block text-sm font-bold">{title}</span>
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </section>

      {/* SECTEURS */}
      <section id="secteurs" className="px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mx-auto mb-12 max-w-2xl text-center">
            <Eyebrow>Pour qui ?</Eyebrow>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Adapté à votre type de commerce</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">Que vous ayez une petite boutique ou plusieurs points de vente, Jokko Business s'ajuste à votre façon de vendre.</p>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sectors.map(({ name, icon: Icon, image, gradient, text }, i) => (
              <Reveal key={name} delay={i * 0.05}>
                <article className="group relative isolate flex min-h-72 flex-col justify-end overflow-hidden rounded-3xl text-white">
                  <div className="absolute inset-0 -z-20 bg-cover bg-center transition duration-500 group-hover:scale-105" style={{ backgroundImage: bgImage(image, gradient) }} />
                  <div className="absolute inset-0 -z-10 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/10" />
                  <div className="p-6">
                    <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 backdrop-blur"><Icon size={21} /></span>
                    <h3 className="text-lg font-extrabold">{name}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-200">{text}</p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FONCTIONNALITÉS */}
      <section id="features" className="border-y border-slate-200 bg-slate-50 px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mx-auto mb-14 max-w-2xl text-center">
            <Eyebrow>Fonctionnalités</Eyebrow>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Tout ce dont vous avez besoin, rien de superflu</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">Des modules pensés pour le terrain, avec une prise en main immédiate.</p>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, description, points }, i) => (
              <Reveal key={title} delay={(i % 4) * 0.06}>
                <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 transition duration-200 hover:-translate-y-1 hover:border-emerald-300 hover:shadow-lg">
                  <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-emerald-100 bg-emerald-50 text-emerald-600"><Icon size={22} /></span>
                  <h3 className="font-extrabold text-slate-950">{title}</h3>
                  <p className="mt-1 text-sm text-slate-500">{description}</p>
                  <ul className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                    {points.map((p) => (
                      <li key={p} className="flex items-start gap-2 text-xs leading-5 text-slate-600"><Check size={14} className="mt-0.5 shrink-0 text-emerald-600" />{p}</li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PAIEMENTS MOBILES */}
      <section className="relative isolate overflow-hidden bg-slate-950 px-5 py-20 text-white sm:px-8 sm:py-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.25),transparent_60%)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <Eyebrow light>Pensé pour ici</Eyebrow>
            <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Vos moyens de paiement, dans votre caisse</h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">Chaque encaissement et décaissement est classé par moyen de paiement. À la fermeture, le rapport de caisse vous donne la répartition de la journée.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              {paymentMethods.map((m) => (
                <span key={m} className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-bold backdrop-blur">{m}</span>
              ))}
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="rounded-3xl border border-white/15 bg-white/5 p-8 backdrop-blur">
              <Smartphone size={28} className="text-emerald-300" />
              <h3 className="mt-4 text-xl font-extrabold">Sur ordinateur, tablette ou téléphone</h3>
              <p className="mt-2 text-sm leading-7 text-slate-300">Aucune installation : ouvrez votre navigateur et retrouvez votre boutique, où que vous soyez.</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ÉTAPES */}
      <section className="px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto mb-14 max-w-2xl text-center">
            <Eyebrow>Comment ça marche</Eyebrow>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Démarrez en quelques étapes</h2>
          </Reveal>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["1", "Créez votre compte", "Inscription gratuite en quelques secondes, aucune carte bancaire requise."],
              ["2", "Ajoutez vos produits", "Importez votre catalogue avec catégories, photos et niveaux de prix."],
              ["3", "Commencez à vendre", "Enregistrez vos ventes, générez des factures et suivez votre caisse."],
              ["4", "Analysez & grandissez", "Consultez vos statistiques et prenez les meilleures décisions."],
            ].map(([num, title, text], i) => (
              <Reveal key={num} delay={i * 0.07}>
                <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                  <span className="mb-4 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">{num}</span>
                  <h3 className="font-extrabold text-slate-950">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TARIFS */}
      <section id="pricing" className="border-y border-slate-200 bg-slate-50 px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <Reveal className="mx-auto mb-12 max-w-2xl text-center">
            <Eyebrow>Nos formules</Eyebrow>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Une formule adaptée à votre activité</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">Commencez gratuitement. 14 jours d'essai sur les formules payantes.</p>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {plans.map((plan) => (
              <article key={plan.id} className={`relative flex flex-col rounded-2xl border p-6 ${plan.highlighted ? "border-emerald-600 bg-white shadow-xl ring-1 ring-emerald-600" : "border-slate-200 bg-white"}`}>
                {plan.highlighted && <span className="absolute right-4 top-0 -translate-y-1/2 rounded-full bg-emerald-600 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">Mise en avant</span>}
                <h3 className="text-lg font-extrabold text-slate-950">{plan.name}</h3>
                <p className="mt-1 text-xs font-semibold text-emerald-700">{plan.eyebrow}</p>
                <p className="mt-4 flex items-baseline gap-2"><span className="text-3xl font-black tracking-tight text-slate-950">{plan.price}</span><span className="text-xs font-semibold text-slate-500">{plan.period}</span></p>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {plan.features.slice(0, 3).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm leading-6 text-slate-600"><Check size={15} className="mt-1 shrink-0 text-emerald-600" />{f}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
          <div className="mt-8 text-center">
            <button type="button" onClick={() => navigate("/tarifs")} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2">
              Comparer les formules en détail <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-5 py-20 sm:px-8 sm:py-24">
        <div className="mx-auto max-w-4xl">
          <Reveal className="mb-10 text-center">
            <Eyebrow>Questions fréquentes</Eyebrow>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Les réponses avant de vous lancer</h2>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2">
            {faqs.map(({ q, a }) => (
              <article key={q} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="font-extrabold text-slate-900">{q}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{a}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-5 pb-20 sm:px-8">
        <div className="relative isolate mx-auto max-w-6xl overflow-hidden rounded-3xl px-8 py-16 text-center text-white shadow-xl">
          <div className="absolute inset-0 -z-20 bg-cover bg-center" style={{ backgroundImage: bgImage(images.cta, "linear-gradient(135deg,#047857,#064e3b)") }} />
          <div className="absolute inset-0 -z-10 bg-emerald-700/85" />
          <h2 className="text-3xl font-black tracking-tight sm:text-4xl">Prêt à simplifier votre gestion ?</h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-emerald-50 md:text-base">Créez votre compte en quelques secondes et organisez votre commerce dès aujourd'hui.</p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button onClick={() => navigate("/register")} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-emerald-700 shadow-md transition hover:bg-emerald-50 sm:w-auto">Démarrer gratuitement <ArrowRight size={17} /></button>
            <button type="button" onClick={() => navigate("/contact")} className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/40 px-6 py-3 text-sm font-bold transition hover:bg-white/10 sm:w-auto"><Mail size={15} /> Nous contacter</button>
            <a href="tel:+221783333838" className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/40 px-6 py-3 text-sm font-bold transition hover:bg-white/10 sm:w-auto"><Phone size={15} /> Nous appeler</a>
          </div>
        </div>
      </section>
    </div>
  );
}
