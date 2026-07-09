export const upgradeFeatures = {
  // MAX USER
  maxUserReached: {
    title: "Multi-utilisateurs",
    description:
      "Le plan Free est limité à un seul utilisateur. Passez au plan supérieur pour ajouter des collaborateurs.",

    requiredPlan: "Starter • Pro • Premium",

    benefits: [
      "Ajouter plusieurs utilisateurs",
      "Gestion des rôles",
      "Inviter des collaborateurs",
    ],

    cta: "Découvrir les plans",

    redirect: "/settings",
  },

  // EXPORT AND HISTORY FOR CASH
  cashExportAndhistoique: {
    title: "Historique des Ventes & Rapports PDF",
    description: `
    La consultation détaillée et l'export au format PDF des sessions de caisse archivées sont réservés aux
    utilisateurs des plans supérieurs.`,
    requiredPlan: "Starter • Pro • Premium",

    benefits: [
      `Historique complet et exports PDF illimités`,
      " Historique des caisses cloturer",
    ],

    cta: "Découvrir les plans",

    redirect: "/settings",
  },

  // Max product reached
  maxProductReached: {
    title: "Limite de Catalogue Atteinte",
    description: `Ce plan est limité à un maximum de produits.\n  Passez au plan supérieur pour continuer à agrandir votre catalogue.`,
    requiredPlan: "Starter • Pro • Premium",

    benefits: [
      `Ajouter jusqu'a 600 produits avec le plan Starter`,
      `Nombre de produits illimités a partir du  plan Pro`,
      "Ajouter le fournisseur de votre produit  plan Pro",
      "Alertes de stock pour ne jamais manquer d'articles",
    ],

    cta: "Découvrir les plans",

    redirect: "/settings",
  },


  // Max product reached
  supplierFeatures: {
    title: "Gestion fournisseur",
    description: `La gestion des fournisseurs est disponible a partir du plan Pro `,
    requiredPlan: "Pro • Premium",

    benefits: [
      `Gestion fournisseurs complète`,
      `Liason de vos produit avec vo fournisseur`,
      `Suivis des dette vise a vis vos fournisseurs`
    ],

    cta: "Découvrir les plans",

    redirect: "/settings",
  },

  // MAX USER
  maxProductsReached: {
    title: "Limite de produits atteinte",
    description: "Vous avez atteint le nombre maximal de produits autorisés.",

    requiredPlan: "Starter • Pro • Premium",

    benefits: [
      "Ajouter davantage de produits",
      "Gestion avancée du stock",
      "Aucune limite selon votre plan",
    ],

    cta: "Découvrir les plans",

    redirect: "/settings",
  },


  // DATA EXPORT
  exportPdfOrExcel: {
    title: "Export de données",
    description: `L'exportation de vos base de données au format Excel ou PDF 
    est disponible à partire du plan Starter.

    `,

    requiredPlan: "Starter • Pro • Premium",

    benefits: [
      ` Export de données illimité   (Clients, Stocks, Ventes, Historique...)`,
    ],

    cta: "Découvrir les plans",

    redirect: "/settings",
  },


  // Invoice
  invoiceFeatures: {
    title: "Facturation Professionnelle A4",
    description: `La génération et l'impression des factures 
    au format officiel A4 est disponible  à partire du plan Starter.`,

    requiredPlan: "Starter Pro • Premium",

    benefits: [
      ` Factures Format A4`,
    ],

    cta: "Découvrir les plans",

    redirect: "/settings",
  },













} as const;

export type UpgradeFeature = keyof typeof upgradeFeatures;
