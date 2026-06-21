import { useNavigate } from "react-router-dom";
import { ArrowRight, Check, Package, ShoppingCart, Users, Wallet, BarChart3, Bell, Truck, FileText } from "lucide-react";
import logo from "../assets/logo.svg";

type Plan = {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  badge?: string;
  badgeColor?: string;
  features: string[];
  cta: string;
  highlighted?: boolean;
};

const plans: Plan[] = [
  {
    id: "free",
    name: "Gratuit",
    price: 0,
    period: "/mois",
    description: "Parfait pour tester la plateforme",
    badge: "Débutant",
    badgeColor: "bg-slate-100 text-slate-700",
    features: [
      "1 utilisateur uniquement",
      "Max 50 produits",
      "Max 30 ventes/mois",
      "Gestion stock basique",
      "Pas d'export PDF/Excel",
      "Pas de gestion clients/fournisseurs",
      "Pas de caisse",
    ],
    cta: "Commencer gratuitement",
  },
  {
    id: "starter",
    name: "Starter",
    price: 10000,
    period: "/mois",
    description: "Pour les petites boutiques",
    badge: "⭐ Populaire",
    badgeColor: "bg-emerald-100 text-emerald-700",
    features: [
      "2 utilisateurs",
      "Produits illimités",
      "Ventes illimitées",
      "Caisse journalière",
      "Gestion clients basique",
      "Factures PDF",
      "Alertes de stock",
      "Pas d'export Excel",
      "Pas de gestion fournisseurs",
      "1 boutique uniquement",
    ],
    cta: "Essayer maintenant",
    highlighted: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: 15000,
    period: "/mois",
    description: "Pour les boutiques en croissance",
    badge: "🚀 Recommandé",
    badgeColor: "bg-blue-100 text-blue-700",
    features: [
      "2 utilisateurs",
      "Tout le Starter +",
      "Gestion fournisseurs complète",
      "Export Excel",
      "Paiements par tranches",
      "Rapports & statistiques",
      "Historique complet",
      "1 boutique uniquement",
    ],
    cta: "Essayer maintenant",
  },
  {
    id: "premium",
    name: "Premium",
    price: 25000,
    period: "/mois",
    description: "Pour les commerçants sérieux",
    badge: "💎 Premium",
    badgeColor: "bg-purple-100 text-purple-700",
    features: [
      "Utilisateurs illimités",
      "Tout le Pro +",
      "Multi-boutiques (jusqu'à 5)",
      "Rôles & permissions avancés",
      "Support prioritaire",
      "Tableau de bord avancé",
    ],
    cta: "Contacter ventes",
  },
];

const features = [
  {
    icon: Package,
    title: "Gestion des stocks",
    description: "Suivi en temps réel, alertes de rupture et mouvements automatisés",
  },
  {
    icon: ShoppingCart,
    title: "Ventes & facturation",
    description: "Factures professionnelles, tickets de caisse et historique complet",
  },
  {
    icon: Wallet,
    title: "Gestion de caisse",
    description: "Encaissements, décaissements et suivi quotidien de la trésorerie",
  },
  {
    icon: Users,
    title: "Gestion des clients",
    description: "Fiches clients, historique d'achats et suivi des dettes",
  },
  {
    icon: Truck,
    title: "Fournisseurs & achats",
    description: "Commandes, approvisionnements et suivi des dettes fournisseurs",
  },
  {
    icon: BarChart3,
    title: "Rapports & statistiques",
    description: "Chiffre d'affaires, produits les plus vendus et analyses détaillées",
  },
  {
    icon: Bell,
    title: "Alertes & notifications",
    description: "Stocks faibles, factures impayées et échéances importantes",
  },
  {
    icon: FileText,
    title: "Factures A4 & tickets",
    description: "Impressions professionnelles et format ticket de caisse",
  },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={logo} alt="Jokko Business" className="h-10 w-10" />
              <div>
                <h1 className="text-xl font-bold text-slate-900">Jokko Business</h1>
                <p className="text-xs text-gray-500">Gestion commerciale simplifée</p>
              </div>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 transition"
            >
              Se connecter
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-emerald-50 via-white to-blue-50 px-4 py-20 sm:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6 inline-block rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-700">
            ✨ La solution de gestion pensée pour les commerçants sénégalais
          </div>
          <h2 className="mb-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
            Gérez votre commerce <br />
            <span className="text-emerald-600">en toute simplicité</span>
          </h2>
          <p className="mb-8 text-lg text-gray-600 sm:text-xl">
            Une application complète pour gérer vos stocks, ventes, clients et caisse. Accessible 24h/24 et 7j/7 depuis votre ordinateur ou smartphone.
          </p>
          <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
            <button
              onClick={() => navigate("/login")}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-base font-semibold text-white hover:bg-emerald-700 transition"
            >
              Commencer gratuitement
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => document.querySelector("#pricing")?.scrollIntoView({ behavior: "smooth" })}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-6 py-3 text-base font-semibold text-slate-900 hover:border-slate-400 hover:bg-slate-50 transition"
            >
              Voir les plans
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-20 sm:py-32">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <h3 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">
              Toutes les fonctionnalités essentielles
            </h3>
            <p className="text-lg text-gray-600">Tout ce dont vous avez besoin pour gérer votre commerce efficacement</p>
          </div>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="rounded-xl border border-slate-200 p-6 hover:border-emerald-300 hover:shadow-lg transition">
                  <div className="mb-4 inline-flex rounded-lg bg-emerald-100 p-3">
                    <Icon size={24} className="text-emerald-600" />
                  </div>
                  <h4 className="mb-2 text-lg font-semibold text-slate-900">{feature.title}</h4>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="bg-slate-50 px-4 py-20 sm:py-32">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h3 className="mb-4 text-3xl font-bold text-slate-900 sm:text-4xl">
              Tarification simple et transparente
            </h3>
            <p className="text-lg text-gray-600">Choisissez le plan qui correspond à votre besoins</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl transition ${
                  plan.highlighted
                    ? "border-2 border-emerald-500 bg-white shadow-xl lg:scale-105"
                    : "border border-slate-200 bg-white shadow-sm hover:shadow-md"
                }`}
              >
                {plan.badgeColor && (
                  <div className={`absolute -top-4 left-6 inline-block rounded-full ${plan.badgeColor} px-3 py-1 text-xs font-semibold`}>
                    {plan.badge}
                  </div>
                )}

                <div className="p-8">
                  <h4 className="mb-2 text-2xl font-bold text-slate-900">{plan.name}</h4>
                  <p className="mb-6 text-sm text-gray-600">{plan.description}</p>

                  <div className="mb-6">
                    <span className="text-4xl font-bold text-slate-900">{plan.price.toLocaleString("fr-FR")}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>

                  <button
                    onClick={() => navigate("/login")}
                    className={`w-full rounded-lg px-4 py-3 font-semibold transition ${
                      plan.highlighted
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "border border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>

                <div className="border-t border-slate-200 p-8">
                  <div className="space-y-4">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <Check size={20} className="mt-0.5 flex-shrink-0 text-emerald-600" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 rounded-xl bg-white p-8 text-center shadow-sm border border-slate-200">
            <h4 className="mb-2 text-xl font-bold text-slate-900">Besoin de plus ?</h4>
            <p className="mb-6 text-gray-600">Contactez notre équipe pour des solutions personnalisées</p>
            <a
              href="tel:+221783333838"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 font-semibold text-white hover:bg-emerald-700 transition"
            >
              📞 +221 78 333 38 38
            </a>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-emerald-600 to-blue-600 px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-4xl text-center text-white">
          <h3 className="mb-4 text-3xl font-bold sm:text-4xl">
            Prêt à transformer votre gestion commerciale ?
          </h3>
          <p className="mb-8 text-lg opacity-90">
            Rejoignez des milliers de commerçants sénégalais qui font confiance à Jokko Business
          </p>
          <button
            onClick={() => navigate("/login")}
            className="inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-emerald-600 hover:bg-slate-100 transition"
          >
            Démarrer gratuitement
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-slate-900 px-4 py-12 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src={logo} alt="Jokko Business" className="h-10 w-10" />
                <div>
                  <h4 className="font-bold">Jokko Business</h4>
                  <p className="text-xs text-gray-400">Gestion commerciale</p>
                </div>
              </div>
              <p className="text-sm text-gray-400">
                La solution de gestion pensée pour les commerçants sénégalais
              </p>
            </div>
            <div>
              <h5 className="mb-4 font-semibold">Produit</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">Fonctionnalités</a></li>
                <li><a href="#pricing" className="hover:text-white transition">Tarification</a></li>
                <li><a href="#" className="hover:text-white transition">Sécurité</a></li>
              </ul>
            </div>
            <div>
              <h5 className="mb-4 font-semibold">Entreprise</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><a href="#" className="hover:text-white transition">À propos</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h5 className="mb-4 font-semibold">Contact</h5>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-center gap-2">
                  📞 <a href="tel:+221783333838" className="hover:text-white transition">+221 78 333 38 38</a>
                </li>
                <li className="flex items-center gap-2">
                  📧 <a href="mailto:momoseye2017@gmail.com" className="hover:text-white transition">contact@jokko.sn</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-slate-700 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 Jokko Business. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
