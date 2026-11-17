// Source unique des formules affichées sur les pages publiques (Landing + Tarifs).
export interface PublicPlan {
  id: "free" | "starter" | "pro" | "premium";
  name: string;
  eyebrow: string;
  price: string;
  period: string;
  summary: string;
  features: string[];
  action: string;
  highlighted: boolean;
}

export const plans: PublicPlan[] = [
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
