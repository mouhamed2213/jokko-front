// Source unique des formules affichées sur les pages publiques (Landing + Tarifs).
// Les limites et fonctionnalités reflètent exactement celles appliquées par le serveur (seed-db.ts).
export interface PublicPlan {
  id: "free" | "starter" | "pro" | "premium";
  code: "FREE" | "BASIC" | "PRO" | "PREMIUM";
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
    code: "FREE",
    name: "Gratuit",
    eyebrow: "Pour démarrer",
    price: "0",
    period: "FCFA",
    summary:
      "Testez Jokko Business en conditions réelles et organisez l'essentiel de votre boutique.",
    features: [
      "1 utilisateur · 1 boutique",
      "Jusqu'à 20 produits",
      "Jusqu'à 10 ventes par mois",
      "Clients illimités & suivi des créances",
      "Jusqu'à 2 fournisseurs",
      "Caisse journalière & alertes stock",
      "Factures, tickets & exports PDF / Excel",
    ],
    action: "Créer mon compte",
    highlighted: false,
  },
  {
    id: "starter",
    code: "BASIC",
    name: "Starter",
    eyebrow: "Pour structurer son activité",
    price: "6 500",
    period: "FCFA / mois",
    summary:
      "Levez les limites de catalogue et de ventes pour gérer votre boutique au quotidien en équipe.",
    features: [
      "Tout le forfait Gratuit, plus :",
      "Jusqu'à 3 utilisateurs · 1 boutique",
      "Produits illimités",
      "Ventes illimitées",
      "Clients illimités",
      "Jusqu'à 5 fournisseurs",
    ],
    action: "Choisir Starter",
    highlighted: true,
  },
  {
    id: "pro",
    code: "PRO",
    name: "Pro",
    eyebrow: "Pour piloter sa croissance",
    price: "14 000",
    period: "FCFA / mois",
    summary:
      "Analysez vos marges, gérez tous vos fournisseurs sans limite et ouvrez un second point de vente.",
    features: [
      "Tout le forfait Starter, plus :",
      "Jusqu'à 5 utilisateurs",
      "Jusqu'à 2 boutiques",
      "Fournisseurs illimités",
      "Analytics & rapports avancés",
      "Classement & performance fournisseurs",
    ],
    action: "Choisir Pro",
    highlighted: false,
  },
  {
    id: "premium",
    code: "PREMIUM",
    name: "Signature",
    eyebrow: "Pour les réseaux multi-boutiques",
    price: "22 000",
    period: "FCFA / mois",
    summary:
      "Centralisez jusqu'à 5 boutiques avec une équipe illimitée et une vision consolidée de votre réseau.",
    features: [
      "Tout le forfait Pro, plus :",
      "Utilisateurs illimités",
      "Jusqu'à 5 boutiques",
      "Vue consolidée multi-boutiques (analytics & CA)",
      "Suivi consolidé des dettes fournisseurs",
    ],
    action: "Choisir Signature",
    highlighted: false,
  },
];
