import type { PlanCode } from "../../types";

export type AnalyticsSectionId =
  | "overview"
  | "sales"
  | "products"
  | "stock"
  | "customers"
  | "cash"
  | "trends"
  | "insights"
  | "profit";

export const minimumPlan: Record<AnalyticsSectionId, PlanCode> = {
  overview: "FREE",
  sales: "FREE",
  stock: "FREE",
  cash: "FREE",
  products: "BASIC",
  customers: "BASIC",
  trends: "BASIC",
  insights: "PRO",
  profit: "PREMIUM",
};

export const planDisplayNames: Record<PlanCode, string> = {
  FREE: "Gratuit",
  BASIC: "Starter",
  PRO: "Pro",
  PREMIUM: "Signature",
};

export const planRank: Record<PlanCode, number> = {
  FREE: 0,
  BASIC: 1,
  PRO: 2,
  PREMIUM: 3,
};

export const defaultEnd = new Date().toISOString().slice(0, 10);
export const defaultStart = new Date(Date.now() - 29 * 86400000)
  .toISOString()
  .slice(0, 10);

export const statusLabels: Record<string, string> = {
  NEW: "Nouveau",
  ACTIVE: "Actif",
  INACTIVE: "Inactif",
  FAST: "Rotation rapide",
  SLOW: "Rotation lente",
  REGULAR: "Rotation normale",
  DORMANT: "Dormant",
  HISTORICAL: "Historique",
  ESTIMATED: "Estimé",
  IN_STOCK: "En stock",
  LOW_STOCK: "Stock faible",
  OUT_OF_STOCK: "Rupture",
  PAID: "Payé",
  PARTIAL: "Partiel",
  UNPAID: "Impayé",
  POSITIVE: "Positif",
  INFO: "Information",
  WARNING: "Alerte",
  IN: "Entrée",
  OUT: "Sortie",
  CASH: "Espèces",
  WAVE: "Wave",
  ORANGE_MONEY: "Orange Money",
  MOBILE_MONEY: "Mobile Money",
  CARD: "Carte",
  BANK_TRANSFER: "Virement",
};

export const columnLabels: Record<string, string> = {
  productName: "Produit",
  customerName: "Client",
  currentStock: "Stock actuel",
  stockValue: "Valeur du stock",
  soldQuantity: "Quantité vendue",
  quantity: "Quantité",
  revenue: "Chiffre d'affaires",
  collected: "Encaissé",
  grossMargin: "Bénéfice brut",
  marginRate: "Marge %",
  purchasedAmount: "Montant acheté",
  receivable: "Créance",
  orderCount: "Commandes",
  averageBasket: "Panier moyen",
  status: "Statut",
  createdAt: "Date de création",
  lastSaleAt: "Dernière vente",
  lastOrderAt: "Dernière commande",
  type: "Type",
  paymentMethod: "Mode de paiement",
  amount: "Montant",
  label: "Libellé",
  day: "Jour",
  salesCount: "Nombre de ventes",
  quantitySold: "Quantité vendue",
};

export const cashCategoryLabels: Record<string, string> = {
  SALE_PAYMENT: "Paiement d'une vente",
  SUPPLIER_DEPOSIT: "Acompte fournisseur",
  SUPPLIER_PAYMENT: "Paiement fournisseur",
  PAYMENT_REVERSAL: "Annulation de paiement",
  OTHER: "Autre mouvement",
};

export const insightLabels: Record<string, string> = {
  REVENUE_GROWTH: "Croissance du chiffre d'affaires",
  REVENUE_DECLINE: "Baisse du chiffre d'affaires",
  OUT_OF_STOCK: "Ruptures de stock",
  LOW_STOCK: "Stock faible",
  DORMANT_PRODUCTS: "Produits dormants",
  SALES_CONCENTRATION: "Concentration des ventes",
  RECEIVABLES: "Créances",
};

export const dateFromInput = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

export const inputDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const shiftDate = (value: string, days: number) => {
  const date = dateFromInput(value);
  date.setDate(date.getDate() + days);
  return inputDate(date);
};

export const readableStatus = (value: unknown) =>
  typeof value === "string"
    ? statusLabels[value] ?? value
    : String(value ?? "—");
