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
      "Jusqu'à 50 produits",
      "100 ventes par mois",
      "Clients & suivi des dettes illimités",
      "Caisse journalière complète",
      "Tickets thermiques",
    ],
    excluded: [
      "Alertes de stock (faible / rupture)",
      "Statistiques avancées (top produits, valeur du stock)",
      "Export PDF / Excel",
      "Gestion fournisseurs",
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
      "Jusqu'à 600 produits",
      "Ventes illimitées",
      "Clients & suivi des dettes illimités",
      "Alertes stock faible & rupture",
      "Top produits vendus",
      "Valeur du stock en temps réel",
      "Factures A4 export de donées en Excel et PDF",
    ],
    excluded: [
      "Export Excel",
      "Gestion fournisseurs",
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
      "Tout le Starter inclus",
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
    q: "Faut-il installer quelque chose ?",
    a: "Non. Jokko Business fonctionne entièrement en ligne depuis un navigateur web, sur ordinateur, tablette ou smartphone.",
  },
  {
    q: "Mes données sont-elles sécurisées ?",
    a: "Oui. Vos données sont chiffrées, sauvegardées automatiquement et accessibles uniquement depuis votre compte utilisateur.",
  },
  {
    q: "Puis-je changer de plan plus tard ?",
    a: "Absolument. Vous pouvez évoluer ou réduire votre plan à tout moment. Et si votre abonnement arrive à expiration, vous n'êtes jamais bloqué : votre compte repasse simplement au plan Gratuit, sans perte de données ni interruption de votre activité.",
  },
  {
    q: "Le plan gratuit est-il vraiment gratuit ?",
    a: "Oui, sans limite de durée. C'est idéal pour tester la plateforme avant de choisir un plan payant adapté.",
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

  const scrollToPricing = () => {
    document.querySelector("#pricing")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white font-sans antialiased text-slate-800">
      {/* ── HERO ── */}
      <section className="bg-emerald-50/60 border-b border-emerald-100 px-6 py-20 sm:py-28 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white border border-emerald-200 text-emerald-700 text-xs font-medium px-4 py-1.5 rounded-full mb-6 shadow-sm">
            <MapPin size={13} /> Conçu pour les commerçants sénégalais
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-tight mb-5">
            Gérez votre commerce
            <br />
            <span className="text-emerald-600">en toute simplicité</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto mb-8 leading-relaxed">
            Stocks, ventes, clients, caisse , fournisseurs — tout dans une seule
            application. Accessible 24h/24 depuis votre téléphone ou votre
            ordinateur.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
            <button
              onClick={() => navigate("/login")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-emerald-700 transition shadow-sm"
            >
              Commencer gratuitement <ArrowRight size={17} />
            </button>
            <button
              onClick={() => navigate("/help")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 font-semibold px-6 py-3 rounded-lg hover:bg-slate-50 transition shadow-sm"
            >
              <HelpCircle size={17} className="text-emerald-600" /> Guide
              d'utilisation
            </button>
          </div>

          {/* Stats */}
          <div className="mt-14 flex flex-wrap justify-center gap-10">
            {[
              { num: "8", label: "Modules complets" },
              { num: "24/7", label: "Disponibilité cloud" },
              { num: "4", label: "Plans tarifaires" },
              { num: "100%", label: "En ligne & mobile" },
            ].map(({ num, label }) => (
              <div key={label} className="text-center">
                <p className="text-3xl font-bold text-emerald-600">{num}</p>
                <p className="text-xs font-medium text-slate-500 mt-1">
                  {label}
                </p>
              </div>
            ))}
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
            <a
              href="tel:+221783333838"
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-emerald-700 transition text-xs shadow-sm"
            >
              <Phone size={14} /> +221 78 333 38 38
            </a>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
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
            <a
              href="tel:+221783333838"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 border border-white/30 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/10 transition text-sm"
            >
              <Phone size={15} /> Nous appeler
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-900 text-slate-400 px-6 py-12 text-left">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center shadow-md">
                  <Store size={18} className="text-white" />
                </div>
                <span className="text-white font-bold text-lg tracking-tight">
                  Jokko Business
                </span>
              </div>
              <p className="text-xs leading-relaxed max-w-xs text-slate-400">
                La solution cloud de gestion commerciale moderne entièrement
                pensée sur le terrain pour les commerçants du Sénégal.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
                Produit
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <a href="#features" className="hover:text-white transition">
                    Fonctionnalités
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white transition">
                    Tarification
                  </a>
                </li>
                <li>
                  <button
                    onClick={() => navigate("/help")}
                    className="hover:text-white transition text-left"
                  >
                    Centre d'aide & Guides
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
                Entreprise
              </h4>
              <ul className="space-y-2.5 text-xs">
                <li>
                  <a href="#" className="hover:text-white transition">
                    À propos
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Contactez-nous
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4">
                Contact
              </h4>
              <ul className="space-y-3 text-xs">
                <li className="flex items-center gap-2">
                  <Phone size={13} className="text-emerald-400 shrink-0" />
                  <a
                    href="tel:+221783333838"
                    className="hover:text-white transition"
                  >
                    +221 78 333 38 38
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail size={13} className="text-emerald-400 shrink-0" />
                  <a
                    href="mailto:contact@jokko.sn"
                    className="hover:text-white transition"
                  >
                    contact@jokko.sn
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin size={13} className="text-emerald-400 shrink-0" />
                  <span>Dakar, Sénégal</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 flex flex-wrap justify-between gap-3 text-[11px] text-slate-500 font-medium">
            <span>© 2026 Jokko Business. Tous droits réservés.</span>
            <span>Fait avec soin au Sénégal</span>
          </div>
        </div>
      </footer>
    </div>
  );
}