export const upgradeFeatures = {
  // MAX USER
  maxUserReached: {
    title: "Multi-utilisateurs",
    description:
      "Vous avez atteint le nombre maximum d'utilisateurs de votre formule (1 en Gratuit, 3 en Starter, 5 en Pro, illimité en Signature).",
    requiredPlan: "Starter • Pro • Signature",
    benefits: [
      "Jusqu'à 3 utilisateurs en Starter, 5 en Pro",
      "Utilisateurs illimités avec le forfait Signature",
      "Gestion des rôles (Admin / Employé)",
    ],
    cta: "Découvrir les plans",
    redirect: "/settings",
  },

  // EXPORT AND HISTORY FOR CASH
  cashExportAndhistoique: {
    title: "Historique de Caisse & Exports",
    description:
      "Passez au forfait supérieur pour étendre vos capacités d'exploitation et de suivi financier.",
    requiredPlan: "Starter • Pro • Signature",
    benefits: [
      "Historique complet des sessions de caisse",
      "Exports PDF et Excel sans limite",
    ],
    cta: "Découvrir les plans",
    redirect: "/settings",
  },

  // Max product reached
  maxProductReached: {
    title: "Limite de catalogue atteinte",
    description:
      "Le forfait Gratuit est limité à 20 produits actifs. Passez au forfait Starter pour un catalogue illimité.",
    requiredPlan: "Starter • Pro • Signature",
    benefits: [
      "Produits illimités dès le forfait Starter",
      "Ventes illimitées sans plafond mensuel",
      "Jusqu'à 5 fournisseurs en Starter, illimités dès Pro",
    ],
    cta: "Découvrir les plans",
    redirect: "/settings",
  },

  // Supplier quota / management
  supplierFeatures: {
    title: "Capacité fournisseurs",
    description:
      "Le nombre de fournisseurs dépend de votre formule (2 en Gratuit, 5 en Starter, illimité dès Pro).",
    requiredPlan: "Starter • Pro • Signature",
    benefits: [
      "Jusqu'à 5 fournisseurs avec Starter",
      "Fournisseurs illimités dès le forfait Pro",
      "Suivi complet des approvisionnements et dettes",
    ],
    cta: "Découvrir les plans",
    redirect: "/settings",
  },

  maxProductsReached: {
    title: "Limite de produits atteinte",
    description: "Le forfait Gratuit est limité à 20 produits actifs.",
    requiredPlan: "Starter • Pro • Signature",
    benefits: [
      "Produits illimités dès le forfait Starter",
      "Ventes illimitées par mois",
      "Jusqu'à 3 utilisateurs en Starter",
    ],
    cta: "Découvrir les plans",
    redirect: "/settings",
  },

  // DATA EXPORT
  exportPdfOrExcel: {
    title: "Export de données",
    description:
      "Exportez vos données (Clients, Stocks, Ventes, Factures) aux formats PDF et Excel.",
    requiredPlan: "Starter • Pro • Signature",
    benefits: [
      "Exports PDF et Excel illimités",
    ],
    cta: "Découvrir les plans",
    redirect: "/settings",
  },

  // Invoice
  invoiceFeatures: {
    title: "Facturation professionnelle A4",
    description:
      "Générez et imprimez vos factures au format A4 et vos tickets thermiques.",
    requiredPlan: "Starter • Pro • Signature",
    benefits: [
      "Factures format A4 & tickets de caisse",
    ],
    cta: "Découvrir les plans",
    redirect: "/settings",
  },

  // Supplier analytics (ADVANCED_REPORTS)
  supplierAnalytics: {
    title: "Performance fournisseurs",
    description:
      "Le classement des fournisseurs et le détail des produits livrés par chacun sont disponibles à partir du forfait Pro.",
    requiredPlan: "Pro • Signature",
    benefits: [
      "Classement des fournisseurs par volume d'achats ou dette",
      "Détail des produits livrés par chaque fournisseur",
      "Analytics & rapports avancés inclus",
    ],
    cta: "Découvrir les plans",
    redirect: "/settings",
  },

  // Consolidated suppliers across shops (MULTI_STORE)
  multiStoreSuppliers: {
    title: "Vue consolidée multi-boutiques",
    description:
      "La vue consolidée des fournisseurs et des analytics sur l'ensemble de vos boutiques est incluse dans le forfait Signature.",
    requiredPlan: "Signature",
    benefits: [
      "Jusqu'à 5 boutiques et utilisateurs illimités",
      "Dette fournisseur totale consolidée sur tout le réseau",
      "Analytics multi-boutiques consolidés",
    ],
    cta: "Découvrir les plans",
    redirect: "/settings",
  },
} as const;

export type UpgradeFeature = keyof typeof upgradeFeatures;
