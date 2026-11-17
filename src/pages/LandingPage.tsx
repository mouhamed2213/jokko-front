import {
  ArrowRight,
  BarChart3,
  Bell,
  Building2,
  Check,
  HelpCircle,
  Mail,
  MapPin,
  Package,
  Phone,
  ShoppingCart,
  Store,
  Truck,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SUPPORT_EMAIL } from "../services";

type Plan = {
  id: string;
  name: string;
  price: number | null;
  priceLabel?: string;
  description: string;
  badge: string;
  badgeClass: string;
  features: string[];
  excluded?: string[];
  cta: string;
  highlighted?: boolean;
  ctaVariant: "filled" | "outline";
};

const plans: Plan[] = [
  {
    id: "free",
    name: "Gratuit",
    price: 0,
    priceLabel: "/mois pour toujours",
    description:
      "Votre point de départ — et le plan sur lequel vous restez opérationnel même si votre abonnement arrive à expiration.",
    badge: "Gratuit",
    badgeClass: "bg-slate-100 text-slate-600",
    features: [
      "1 utilisateur (le propriétaire)",
      "Jusqu'à 20 produits",
      "10 ventes par mois",
      "Clients & suivi des dettes illimités",
      "Jusqu'à 2 fournisseurs",
      "Caisse journalière complète",
      "Tickets thermiques",
    ],
    excluded: [
      "Alertes de stock (faible / rupture)",
      "Statistiques avancées (top produits, valeur du stock)",
      "Export PDF / Excel",
    ],
    cta: "Commencer gratuitement",
    ctaVariant: "outline",
  },
  {
    id: "starter",
    name: "Starter",
    price: 6500,
    description:
      "Pour une boutique unique qui veut professionnaliser son suivi quotidien.",
    badge: "⭐ Starter",
    badgeClass: "bg-emerald-100 text-emerald-700",
    features: [
      "3 utilisateurs (rôles Administrateur / Employé)",
      "Produits illimités",
      "Ventes illimitées",
      "Clients & suivi des dettes illimités",
      "Alertes stock faible & rupture",
      "Top produits vendus",
      "Valeur du stock en temps réel",
      "Factures A4 export de donées en Excel et PDF",
      "Gestion fournisseurs jusqu'à 5 fournisseurs",
    ],
    excluded: [
      "Export Excel",
      "Rapports avancés",
      "Multi-boutiques",
    ],
    cta: "Essayer maintenant",
    highlighted: true,
    ctaVariant: "filled",
  },
  {
    id: "pro",
    name: "Pro",
    price: 14000,
    description:
      "Pour les boutiques en croissance avec plusieurs points de vente.",
    badge: "🚀 Recommandé",
    badgeClass: "bg-blue-100 text-blue-700",
    features: [
      "5 utilisateurs (rôles Administrateur / Employé)",
      "Produits illimités",
      "Ventes illimitées",
      "Tout le Basic inclus",
      "Gestion fournisseurs complète",
      "Rapports avancés",
      "Jusqu'à 2 boutiques ( Boutique principal & une supplementaire )",
    ],
    excluded: ["Utilisateurs illimités", "Multi-boutiques (jusqu'à 5)"],
    cta: "Essayer maintenant",
    ctaVariant: "outline",
  },
  {
    id: "premium",
    name: "Premium",
    price: 22000,
    description:
      "Pour les structures avec plusieurs boutiques et des équipes plus larges.",
    badge: "💎 Premium",
    badgeClass: "bg-purple-100 text-purple-700",
    features: [
      "Utilisateurs illimités (rôles Administrateur / Employé)",
      "Tout le Pro inclus",
      "Jusqu'à 5 boutiques",
      "Support prioritaire",
    ],
    cta: "Essayer maintenant",
    ctaVariant: "outline",
  },
];

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
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 py-20 sm:px-8 sm:py-28 lg:grid-cols-[1.05fr_0.95fr] lg:py-32">
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
              <button onClick={() => navigate("/register")} className="inline-flex items-center justify-center gap-3 rounded-full bg-emerald-600 px-7 py-4 text-sm font-extrabold text-white shadow-xl shadow-red-950/30 transition hover:-translate-y-0.5 hover:bg-emerald-700">
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

          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-5 rounded-[2rem] bg-emerald-600/20 blur-3xl" />
            <div className="relative overflow-hidden rounded-[1.7rem] border border-white/20 bg-white text-slate-900 shadow-2xl shadow-black/40">
              <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                <div className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-red-500" /><span className="h-2.5 w-2.5 rounded-full bg-amber-400" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-500" /></div>
                
                <Store size={17} className="text-emerald-700" />
              </div>
              <div className="bg-slate-50 p-5 sm:p-7">
                <div className="flex items-start justify-between gap-3">
                  <div><p className="text-xs font-semibold text-slate-500">Tableau de bord</p><h2 className="mt-1 text-xl font-extrabold tracking-tight">Vue d'ensemble</h2></div>
                  <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold text-emerald-700">En activité</span>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-100 bg-white p-4"><div className="flex items-center justify-between"><span className="text-[11px] font-semibold text-slate-500">Ventes du jour</span><ShoppingCart size={15} className="text-emerald-700" /></div><p className="mt-3 text-2xl font-black">128 500 <span className="text-xs font-bold text-slate-500">FCFA</span></p><p className="mt-1 text-[10px] text-slate-400">Suivi des encaissements</p></div>
                  <div className="rounded-2xl border border-slate-100 bg-white p-4"><div className="flex items-center justify-between"><span className="text-[11px] font-semibold text-slate-500">Produits</span><Package size={15} className="text-emerald-700" /></div><p className="mt-3 text-2xl font-black">248</p><p className="mt-1 text-[10px] text-slate-400">Catalogue de la boutique</p></div>
                </div>
                <div className="mt-3 rounded-2xl border border-slate-100 bg-white p-4">
                  <div className="flex items-center justify-between"><span className="text-xs font-bold text-slate-700">Activité commerciale</span><span className="text-[10px] font-semibold text-slate-400">Exemple d'interface</span></div>
                  <div className="mt-5 flex h-28 items-end gap-2">
                    {[38,56,45,72,60,88,67,100,78,91,70,84].map((height,index)=><div key={index} className="flex-1 rounded-t-md bg-gradient-to-t from-emerald-800 to-emerald-500" style={{height:`${height}%`}} />)}
                  </div>
                  <div className="mt-2 flex justify-between text-[9px] font-semibold text-slate-400"><span>Lun</span><span>Mar</span><span>Mer</span><span>Jeu</span><span>Ven</span><span>Sam</span><span>Dim</span></div>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-white p-3 text-center"><Wallet size={16} className="mx-auto text-emerald-700"/><p className="mt-1 text-[10px] font-bold">Caisse</p></div>
                  <div className="rounded-xl bg-white p-3 text-center"><Users size={16} className="mx-auto text-emerald-700"/><p className="mt-1 text-[10px] font-bold">Clients</p></div>
                  <div className="rounded-xl bg-white p-3 text-center"><BarChart3 size={16} className="mx-auto text-emerald-700"/><p className="mt-1 text-[10px] font-bold">Rapports</p></div>
                </div>
              </div>
            </div>
            <p className="relative mt-4 text-center text-[11px] font-medium text-white/60">Illustration indicative de l'interface Jokko Business</p>
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
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
              Opérationnel en moin de 3 minutes
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

      {/* ── PRICING ── */}
      <section id="pricing" className="px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">
              Tarification
            </p>
            <h2 className="text-3xl font-bold text-slate-900 mb-3 tracking-tight">
              Simple et transparent
            </h2>
            <p className="text-sm text-slate-500">
              Commencez gratuitement, évoluez selon vos besoins. Sans aucun
              frais caché.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 items-stretch">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`flex flex-col rounded-2xl overflow-hidden bg-white transition duration-200 ${
                  plan.highlighted
                    ? "border-2 border-emerald-500 shadow-xl scale-102"
                    : "border border-slate-200 shadow-sm hover:shadow-md"
                }`}
              >
                {/* Header */}
                <div className="p-5 border-b border-slate-100 flex flex-col min-h-55">
                  <div>
                    <span
                      className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-3 ${plan.badgeClass}`}
                    >
                      {plan.badge}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-slate-500 mb-4 line-clamp-2">
                    {plan.description}
                  </p>

                  <div className="mt-auto">
                    {plan.price === 0 ? (
                      <div>
                        <span className="text-2xl font-extrabold text-emerald-600">
                          Gratuit
                        </span>
                        <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                          /mois pour toujours
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                          {plan.price!.toLocaleString("fr-FR")}
                        </span>
                        <div className="flex flex-col text-left justify-center">
                          <span className="text-xs font-bold text-slate-500 leading-none">
                            FCFA / mois
                          </span>
                          <span className="text-[11px] text-emerald-600 font-semibold mt-1 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                            14 jours d'essai gratuit
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Features & Action */}
                <div className="p-5 flex flex-col flex-1 bg-white justify-between">
                  <div className="space-y-3 mb-6">
                    {plan.features.map((feat) => (
                      <div
                        key={feat}
                        className="flex items-start gap-2.5 text-left"
                      >
                        <Check
                          size={14}
                          className="text-emerald-600 mt-0.5 shrink-0"
                        />
                        <span className="text-xs text-slate-600 leading-relaxed">
                          {feat}
                        </span>
                      </div>
                    ))}

                    {plan.excluded && plan.excluded.length > 0 && (
                      <div className="pt-3 mt-3 border-t border-slate-100">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                          Non inclus
                        </p>
                        <div className="space-y-2">
                          {plan.excluded.map((feat) => (
                            <div
                              key={feat}
                              className="flex items-start gap-2.5 opacity-45 text-left"
                            >
                              <X
                                size={14}
                                className="text-slate-400 mt-0.5 shrink-0"
                              />
                              <span className="text-xs text-slate-500 leading-relaxed">
                                {feat}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => navigate(`/register?plan=${plan.id}`)}
                    className={`w-full py-2.5 rounded-xl text-xs font-bold transition mt-auto tracking-wide ${
                      plan.ctaVariant === "filled"
                        ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                        : "border border-emerald-600 text-emerald-600 hover:bg-emerald-50/50"
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Custom Contact Row */}
          <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-50 border border-slate-200 rounded-2xl px-6 py-5 text-left">
            <div>
              <p className="font-bold text-slate-900 text-sm md:text-base mb-1">
                Besoin d'une solution sur mesure ?
              </p>
              <p className="text-xs text-slate-500">
                Plus de 5 boutiques, intégration ou accompagnement spécifique —
                discutons-en directement.
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
              <button
                type="button"
                onClick={() => navigate("/contact?subject=Demande%20de%20solution%20sur%20mesure")}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-emerald-700 sm:w-auto"
              >
                <Mail size={14} /> Nous contacter
              </button>
              <a
                href="tel:+221783333838"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-5 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-white sm:w-auto"
              >
                <Phone size={14} /> +221 78 333 38 38
              </a>
            </div>
          </div>
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
            Rejoignez dès aujourd’hui les commerçants sénégalais qui font
            confiance à Jokko Business au quotidien.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              onClick={() => navigate("/login")}
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