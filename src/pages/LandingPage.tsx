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
  Store,
  Truck,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/logo.svg";

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
    description: "Pour tester la plateforme",
    badge: "Gratuit",
    badgeClass: "bg-slate-100 text-slate-600",
    features: [
      "1 utilisateur ( proriétaire )",
      "Jusqu'à 50 produits max",
      "100 ventes par mois",
      "20 clients max",
      "Tickets thermiques uniquement",
      "Caisses ( limitée )",
    ],
    excluded: ["Alertes stock", "Export PDF / Excel", "Fournisseurs"],
    cta: "Commencer gratuitement",
    ctaVariant: "outline",
  },
  {
    id: "starter",
    name: "Starter",
    price: 7500,
    description: "Pour les petites boutiques",
    badge: "⭐",
    badgeClass: "bg-emerald-100 text-emerald-700",
    features: [
      "2 utilisateurs (proriétaire + 1 employé)", // important ✅  
      "Jusqu'à 500 produits", // important ✅  
      "Ventes illimité", // important ✅
      "Alertes stock faibles & ruptures", // important
      "Clients illimités", // important
      "Suivi dettes client", // important
      "Caisse journalière & Historique complete", // important
      "Top produits vendus",
      "Factures PDF A4",
      "Export Excel / PDF",
    ],
    excluded: ["Fournisseurs", "Rapports & statistiques"],
    cta: "Essayer maintenant",
    highlighted: true,
    ctaVariant: "filled",
  },
  {
    id: "pro",
    name: "Pro",
    price: 14500,
    description: "Pour les boutiques en croissance",
    badge: "🚀 Recommandé",
    badgeClass: "bg-blue-100 text-blue-700",
    features: [
      "5 utilisateurs", // ✅
      "Tout le Starter inclus", // ✅
      "Produits illimités", // ✅
      "Ventes illimités", // ✅
      "Gestion fournisseurs complète", // ✅
      "Suivi dettes fournisseurs", //❌
      "Relance clients débiteurs (WhatsApp)", //❌
      // "Paiements par tranches",
      "Rapports & statistiques", //❌
      "Historique complet achats par client", //❌
      "Multi-boutiques (jusqu'à 2)"
    ],
    cta: "Essayer maintenant",
    ctaVariant: "outline",
  },
  // {
  //   id: "premium",
  //   name: "Premium",
  //   price: 25000,
  //   description: "Pour les structures sérieuses",
  //   badge: "💎 Premium",
  //   badgeClass: "bg-purple-100 text-purple-700",
  //   features: [
  //     "Utilisateurs illimités",
  //     "Tout le Pro inclus",
  //     "Multi-boutiques (jusqu'à 5)",
  //     "Clients partagés entre boutiques",
  //     "Rôles & permissions avancés",
  //     "Suivi activité employés",
  //     "Support prioritaire",
  //   ],
  //   cta: "Contacter l'équipe",
  //   ctaVariant: "outline",
  // },
];

const features = [
  {
    icon: Package,
    title: "Gestion des stocks",
    description:
      "Suivi en temps réel, inventaires, alertes de rupture et mouvements automatisés",
  },
  {
    icon: ShoppingCart,
    title: "Ventes & facturation",
    description:
      "Tickets de caisse, factures A4 professionnelles, devis et bons de livraison",
  },
  {
    icon: Wallet,
    title: "Gestion de caisse",
    description:
      "Encaissements, décaissements et suivi quotidien de la trésorerie",
  },
  {
    icon: Users,
    title: "Gestion clients",
    description:
      "Fiches clients, historique d'achats, suivi des dettes et fidélisation",
  },
  {
    icon: Truck,
    title: "Fournisseurs & achats",
    description:
      "Commandes, approvisionnements et suivi des dettes fournisseurs",
  },
  {
    icon: BarChart3,
    title: "Rapports & statistiques",
    description:
      "Chiffre d'affaires, produits les plus vendus, analyses de rentabilité",
  },
  {
    icon: Bell,
    title: "Alertes & notifications",
    description: "Stocks faibles, factures impayées et échéances importantes",
  },
  {
    icon: Building2,
    title: "Multi-boutiques",
    description:
      "Gérez plusieurs points de vente depuis un seul compte avec rôles & permissions",
  },
];

const steps = [
  {
    num: "1",
    title: "Créez votre compte",
    description:
      "Inscription gratuite en quelques secondes, aucune carte bancaire requise",
  },
  {
    num: "2",
    title: "Ajoutez vos produits",
    description:
      "Importez ou saisissez votre catalogue avec catégories et prix",
  },
  {
    num: "3",
    title: "Commencez à vendre",
    description:
      "Enregistrez vos ventes, générez des factures et suivez votre caisse",
  },
  {
    num: "4",
    title: "Analysez & grandissez",
    description: "Consultez vos statistiques et prenez les bonnes décisions",
  },
];

const faqs = [
  {
    q: "Faut-il installer quelque chose ?",
    a: "Non. Jokko Business fonctionne entièrement en ligne depuis un navigateur web, sur ordinateur ou smartphone.",
  },
  {
    q: "Mes données sont-elles sécurisées ?",
    a: "Oui. Vos données sont chiffrées, sauvegardées automatiquement et accessibles uniquement depuis votre compte.",
  },
  {
    q: "Puis-je changer de plan plus tard ?",
    a: "Absolument. Vous pouvez évoluer ou réduire votre plan à tout moment sans perdre vos données.",
  },
  {
    q: "Le plan gratuit est-il vraiment gratuit ?",
    a: "Oui, sans limite de durée. Idéal pour tester la plateforme avant de choisir un plan payant.",
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
    <div className="min-h-screen bg-white font-sans">
      {/* ── NAVIGATION ── */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/90 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Jokko Business" className="h-9 w-9" />
            <div>
              <p className="text-base font-semibold text-slate-900 leading-tight">
                Jokko Business
              </p>
              <p className="text-xs text-slate-500">Gestion commerciale</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a
              href="#features"
              className="text-sm text-slate-600 hover:text-slate-900 transition"
            >
              Fonctionnalités
            </a>
            <a
              href="#pricing"
              className="text-sm text-slate-600 hover:text-slate-900 transition"
            >
              Tarifs
            </a>
            <a
              href="#faq"
              className="text-sm text-slate-600 hover:text-slate-900 transition"
            >
              FAQ
            </a>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center gap-2 bg-emerald-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
          >
            Se connecter <ArrowRight size={15} />
          </button>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="bg-emerald-50 border-b border-emerald-100 px-6 py-20 sm:py-28 text-center">
        <div className="mx-auto max-w-3xl">
          <div className="inline-flex items-center gap-2 bg-white border border-emerald-200 text-emerald-700 text-xs font-medium px-4 py-1.5 rounded-full mb-6">
            <MapPin size={13} /> Conçu pour les commerçants sénégalais
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-tight mb-5">
            Gérez votre commerce
            <br />
            <span className="text-emerald-600">en toute simplicité</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto mb-8 leading-relaxed">
            Stocks, ventes, clients, caisse — tout dans une seule application.
            Accessible 24h/24 depuis votre téléphone ou ordinateur.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-emerald-700 transition"
            >
              Commencer gratuitement <ArrowRight size={17} />
            </button>
            <button
              onClick={scrollToPricing}
              className="inline-flex items-center justify-center gap-2 border border-slate-300 text-slate-800 font-semibold px-6 py-3 rounded-lg hover:bg-slate-50 transition"
            >
              Voir les plans
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
              <div key={label}>
                <p className="text-3xl font-bold text-emerald-600">{num}</p>
                <p className="text-sm text-slate-500 mt-1">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <div className="border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-center gap-3">
        <span className="text-xs text-slate-500 whitespace-nowrap">
          Adapté pour :
        </span>
        {proofTags.map((tag) => (
          <span
            key={tag}
            className="text-xs font-medium text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1 rounded-md"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* ── FEATURES ── */}
      <section id="features" className="px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-2">
              Fonctionnalités
            </p>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">
              Tout ce dont vous avez besoin, rien de superflu
            </h2>
            <p className="text-slate-600 max-w-lg mx-auto">
              Une plateforme complète pensée pour le terrain — prise en main en
              quelques minutes.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="border border-slate-200 rounded-xl p-5 hover:border-emerald-300 hover:shadow-sm transition"
              >
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
                  <Icon size={20} className="text-emerald-600" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1.5">
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

      {/* ── HOW IT WORKS ── */}
      <section className="bg-slate-50 border-y border-slate-200 px-6 py-20 sm:py-24">
        <div className="mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-2">
              Comment ça marche
            </p>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">
              Opérationnel en 3 minutes
            </h2>
            <p className="text-slate-600">
              Pas d'installation, pas de serveur. Juste un navigateur.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 border border-slate-200 rounded-xl overflow-hidden bg-white">
            {steps.map(({ num, title, description }) => (
              <div key={num} className="p-6">
                <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mb-4">
                  {num}
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mb-2">
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
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-2">
              Tarification
            </p>
            <h2 className="text-3xl font-bold text-slate-900 mb-3">
              Simple et transparent
            </h2>
            <p className="text-slate-600">
              Commencez gratuitement, évoluez selon vos besoins. Pas de frais
              cachés.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-start">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`flex flex-col rounded-2xl overflow-hidden transition ${
                  plan.highlighted
                    ? "border-2 border-emerald-500 shadow-lg"
                    : "border border-slate-200 shadow-sm hover:shadow-md"
                }`}
              >
                {/* Header */}
                <div className="p-5 border-b border-slate-100">
                  <span
                    className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3 ${plan.badgeClass}`}
                  >
                    {plan.badge}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">
                    {plan.name}
                  </h3>
                  <p className="text-xs text-slate-500 mb-4">
                    {plan.description}
                  </p>

                  {plan.price === 0 ? (
                    <div>
                      <span className="text-2xl font-bold text-emerald-600">
                        Gratuit
                      </span>
                      <p className="text-xs text-slate-400 mt-0.5">
                        /mois pour toujours
                      </p>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-slate-900">
                        {plan.price!.toLocaleString("fr-FR")}
                      </span>
                      <span className="text-sm text-slate-500">FCFA/mois</span>
                    </div>
                  )}

                  <button
                    onClick={() => navigate("/login")}
                    className={`mt-4 w-full py-2.5 rounded-lg text-sm font-semibold transition ${
                      plan.ctaVariant === "filled"
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "border border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>

                {/* Features */}
                <div className="p-5 flex-1 bg-white space-y-3">
                  {plan.features.map((feat) => (
                    <div key={feat} className="flex items-start gap-2.5">
                      <Check
                        size={15}
                        className="text-emerald-600 mt-0.5 shrink-0"
                      />
                      <span className="text-xs text-slate-700 leading-relaxed">
                        {feat}
                      </span>
                    </div>
                  ))}

                  {plan.excluded && plan.excluded.length > 0 && (
                    <>
                      <p className="text-xs font-semibold text-slate-400 pt-2 mt-2 border-t border-slate-100">
                        Non inclus
                      </p>
                      {plan.excluded.map((feat) => (
                        <div
                          key={feat}
                          className="flex items-start gap-2.5 opacity-40"
                        >
                          <X
                            size={15}
                            className="text-slate-400 mt-0.5 shrink-0"
                          />
                          <span className="text-xs text-slate-500 leading-relaxed">
                            {feat}
                          </span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Custom */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-4 bg-slate-50 border border-slate-200 rounded-xl px-6 py-5">
            <div>
              <p className="font-semibold text-slate-900 mb-1">
                Besoin d'une solution sur mesure ?
              </p>
              <p className="text-sm text-slate-500">
                Plus de 5 boutiques, intégration spécifique — discutons-en.
              </p>
            </div>
            <a
              href="tel:+221783333838"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white font-semibold px-5 py-2.5 rounded-lg hover:bg-emerald-700 transition text-sm"
            >
              <Phone size={15} /> +221 78 333 38 38
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
          <div className="text-center mb-12">
            <p className="text-xs font-semibold text-emerald-600 uppercase tracking-widest mb-2">
              FAQ
            </p>
            <h2 className="text-3xl font-bold text-slate-900">
              Questions fréquentes
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {faqs.map(({ q, a }) => (
              <div
                key={q}
                className="bg-white border border-slate-200 rounded-xl p-5"
              >
                <h3 className="text-sm font-semibold text-slate-900 mb-2">
                  {q}
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">{a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-5xl bg-emerald-600 rounded-2xl px-8 py-14 text-center text-white">
          <h2 className="text-3xl font-bold mb-3">
            Prêt à simplifier votre gestion ?
          </h2>
          <p className="text-emerald-100 mb-8 text-base">
            Rejoignez des commerçants sénégalais qui font confiance à Jokko
            Business au quotidien
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center justify-center gap-2 bg-white text-emerald-600 font-semibold px-6 py-3 rounded-lg hover:bg-emerald-50 transition"
            >
              Démarrer gratuitement <ArrowRight size={17} />
            </button>
            <a
              href="tel:+221783333838"
              className="inline-flex items-center justify-center gap-2 border border-white/40 text-white font-semibold px-6 py-3 rounded-lg hover:bg-white/10 transition"
            >
              <Phone size={16} /> Nous appeler
            </a>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="bg-slate-900 text-slate-400 px-6 py-12">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4 mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-9 h-9 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <Store size={18} className="text-white" />
                </div>
                <span className="text-white font-semibold">Jokko Business</span>
              </div>
              <p className="text-sm leading-relaxed">
                La solution de gestion commerciale pensée pour les commerçants
                sénégalais
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Produit</h4>
              <ul className="space-y-2.5 text-sm">
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
                  <a href="#" className="hover:text-white transition">
                    Sécurité
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Mises à jour
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">
                Entreprise
              </h4>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    À propos
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white mb-4">Contact</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <Phone size={14} className="text-emerald-400 shrink-0" />
                  <a
                    href="tel:+221783333838"
                    className="hover:text-white transition"
                  >
                    +221 78 333 38 38
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <Mail size={14} className="text-emerald-400 shrink-0" />
                  <a
                    href="mailto:contact@jokko.sn"
                    className="hover:text-white transition"
                  >
                    contact@jokko.sn
                  </a>
                </li>
                <li className="flex items-center gap-2">
                  <MapPin size={14} className="text-emerald-400 shrink-0" />
                  <span>Dakar, Sénégal</span>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 flex flex-wrap justify-between gap-3 text-xs">
            <span>© 2025 Jokko Business. Tous droits réservés.</span>
            <span>Fait avec soin au Sénégal</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
