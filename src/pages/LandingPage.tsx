import {
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  Check,
  Mail,
  MapPin,
  Package,
  Phone,
  ShoppingCart,
  Truck,
  Users,
  Wallet,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const features = [
  {
    icon: Package,
    title: "Gestion des stocks",
    description:
      "Suivi en temps réel, inventaires, alertes de rupture et mouvements automatisés.",
  },
  {
    icon: ShoppingCart,
    title: "Ventes & facturation",
    description:
      "Tickets de caisse, factures A4 professionnelles, devis et bons de livraison.",
  },
  {
    icon: Building2,
    title: "Multi-boutiques",
    description:
      "Gérez plusieurs points de vente depuis un seul compte avec rôles et permissions.",
  },

  {
    icon: Wallet,
    title: "Gestion de caisse",
    description:
      "Encaissements, décaissements et suivi quotidien strict de la trésorerie.",
  },
  {
    icon: Users,
    title: "Gestion clients",
    description: "Fiches clients, historique d'achats et  suivi des dettes .",
  },
  {
    icon: Truck,
    title: "Fournisseurs & achats",
    description:
      "Commandes, approvisionnements et suivi des dettes envers vos fournisseurs.",
  },
  {
    icon: BarChart3,
    title: "Rapports & statistiques",
    description: "Chiffre d'affaires, produits les plus vendus.",
  },
  {
    icon: Bell,
    title: "Alertes & notifications",
    description:
      "Stocks faibles, factures impayées et échéances importantes à suivre.",
  },
];

const steps = [
  {
    num: "1",
    title: "Créez votre compte",
    description:
      "Inscription gratuite en quelques secondes, aucune carte bancaire requise.",
  },
  {
    num: "2",
    title: "Ajoutez vos produits",
    description: "Ajouter  votre catalogue avec catégories et prix de gros.",
  },
  {
    num: "3",
    title: "Commencez à vendre",
    description:
      "Enregistrez vos ventes, générez des factures et suivez votre caisse.",
  },
  {
    num: "4",
    title: "Analysez & grandissez",
    description:
      "Consultez vos statistiques et prenez les meilleures décisions.",
  },
];

const faqs = [
  {
    q: "Faut-il installer un logiciel ?",
    a: "Non. Jokko Business est accessible depuis un navigateur web, sur ordinateur, tablette ou smartphone.",
  },
  {
    q: "Puis-je gérer ma boutique depuis mon téléphone ?",
    a: "Oui. Vous pouvez accéder à votre espace depuis un navigateur mobile pour consulter et gérer votre activité.",
  },
  {
    q: "Puis-je commencer sans payer ?",
    a: "Oui. Un plan Gratuit est disponible pour démarrer et découvrir les fonctions essentielles de gestion commerciale.",
  },
  {
    q: "Puis-je faire évoluer mon abonnement ?",
    a: "Oui. Les offres permettent de choisir un niveau adapté à la taille de votre activité et à vos besoins.",
  },

];

const proofTags = [
  "Boutiques & magasins",
  "Supermarchés",
  "Pharmacies",
  "Quincailleries",
  "Restaurants",
  "PME & TPE",
  "Multi-boutiques",
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans antialiased text-slate-800">
      {/* ── HERO ── */}
      <section className="relative isolate overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 -z-20 bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=2200&q=85')" }} />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/55" />
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-1 lg:py-32">
          <div className="max-w-2xl">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold tracking-wide text-white backdrop-blur">
              <MapPin size={14} className="text-emerald-300" /> La gestion commerciale pensée pour les commerces du Sénégal
            </div>
            <h1 className="text-4xl font-black leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              Votre commerce mérite une gestion <span className="text-emerald-400">plus claire.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-slate-200 sm:text-lg">
              Ventes, stocks, caisse, clients et fournisseurs : retrouvez les outils essentiels de votre boutique dans un seul espace, accessible depuis votre ordinateur ou votre téléphone.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button onClick={() => navigate("/register")} className="inline-flex items-center justify-center gap-3 rounded-full bg-emerald-600 px-7 py-4 text-sm font-extrabold text-white shadow-xl shadow-emerald-950/20 transition hover:-translate-y-0.5 hover:bg-emerald-700">
                Créer mon compte gratuitement <ArrowRight size={17} />
              </button>
              <button onClick={() => navigate("/help")} className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-white/10 px-7 py-4 text-sm font-bold text-white backdrop-blur transition hover:bg-white/15">
                Découvrir les fonctionnalités
              </button>
            </div>
            <div className="mt-10 flex flex-wrap gap-x-7 gap-y-3 text-xs font-semibold text-slate-300">
              <span className="inline-flex items-center gap-2"><Check size={15} className="text-emerald-300" /> Démarrage simple</span>
              <span className="inline-flex items-center gap-2"><Check size={15} className="text-emerald-300" /> Offre gratuite disponible</span>
              <span className="inline-flex items-center gap-2"><Check size={15} className="text-emerald-300" /> Sans installation</span>
            </div>
          </div>


        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <div className="border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-center gap-3 bg-slate-50/50">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Adapté pour :
        </span>
        {proofTags.map((tag) => (
          <span
            key={tag}
            className="text-xs font-medium text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-md shadow-sm"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* ── FEATURES ── */}
      <section id="features" className="px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">
              Fonctionnalités
            </p>
            <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
              Tout ce dont vous avez besoin, rien de superflu
            </h2>
            <p className="text-sm text-slate-500 max-w-lg mx-auto leading-relaxed">
              Une plateforme complète pensée pour le terrain — prise en main
              immédiate et intuitive.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex flex-col bg-white border border-slate-200 rounded-xl p-5 hover:border-emerald-300 hover:shadow-md transition duration-200"
              >
                <div className="w-10 h-10 bg-emerald-50 border border-emerald-100 rounded-xl flex items-center justify-center mb-4 shrink-0">
                  <Icon size={20} className="text-emerald-600" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">
                  {title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed text-left mt-auto">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="bg-slate-50 border-y border-slate-200 px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">
              Comment ça marche
            </p>
            <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
              Démarrez en quelques étapes
            </h2>
            <p className="text-sm text-slate-500">
              Pas d'installation, pas de configuration complexe. Juste votre
              navigateur.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
            {steps.map(({ num, title, description }) => (
              <div
                key={num}
                className="p-6 flex flex-col items-start text-left"
              >
                <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-xs font-bold mb-4 shadow-sm">
                  {num}
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-2">
                  {title}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING PREVIEW ── */}
      <section id="pricing" className="border-y border-slate-200 bg-slate-50 px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-7 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-700">Nos formules</p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950">Une formule adaptée à votre activité</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">Commencez avec l'offre gratuite, puis choisissez le niveau d'accompagnement et de gestion qui correspond à votre commerce.</p>
          </div>
          <button type="button" onClick={() => navigate("/tarifs")} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-emerald-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2">
            Comparer les formules <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ── FAQ ──
      <section
        id="faq"
        className="bg-slate-50 border-y border-slate-200 px-6 py-20 sm:py-24"
      >
        <div className="mx-auto max-w-3xl">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">
              FAQ
            </p>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Questions fréquentes
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 text-left">
            {faqs.map(({ q, a }) => (
              <div
                key={q}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm"
              >
                <h3 className="text-sm font-bold text-slate-900 mb-2">{q}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      <section id="faq" className="border-y border-slate-200 bg-slate-50 px-5 py-20 sm:px-8">
        <div className="mx-auto max-w-4xl">
          <div className="mb-10 text-center">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-emerald-700">Questions fréquentes</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950">Les réponses avant de vous lancer</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {faqs.map(({q,a})=><article key={q} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><h3 className="font-extrabold text-slate-900">{q}</h3><p className="mt-3 text-sm leading-7 text-slate-600">{a}</p></article>)}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-5xl bg-emerald-600 rounded-2xl px-8 py-14 text-center text-white shadow-xl">
          <h2 className="text-3xl font-bold mb-3 tracking-tight">
            Prêt à simplifier votre gestion ?
          </h2>
          <p className="text-emerald-100 mb-8 text-sm md:text-base max-w-lg mx-auto opacity-90">
            Découvrez les outils pour mieux organiser votre activité et suivre votre commerce au quotidien.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              onClick={() => navigate("/register")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white text-emerald-600 font-bold px-6 py-3 rounded-xl hover:bg-emerald-50 transition shadow-md text-sm"
            >
              Démarrer gratuitement <ArrowRight size={17} />
            </button>
            <button
              type="button"
              onClick={() => navigate("/contact")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-white/30 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/10 transition text-sm"
            >
              <Mail size={15} /> Nous contacter
            </button>
            <a
              href="tel:+221783333838"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-white/30 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/10 transition text-sm"
            >
              <Phone size={15} /> Nous appeler
            </a>
          </div>
        </div>
      </section>


    </div>
  );
}