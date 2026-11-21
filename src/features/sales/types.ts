import type { PackagingUnit } from "../../types/index";

export type CartItem = {
  productId: number;
  productName: string;
  imageUrl?: string | null;
  soldUnit: PackagingUnit;
  unitType: PackagingUnit;
  unitsPerPack: number;
  quantity: number; // quantité dans soldUnit
  unitPrice: number; // prix par soldUnit
  stock: number; // stock total du produit en pièces
  salePrice: number;
  packSalePrice?: number | null;
  semiWholesalePrice?: number | null;
  semiWholesaleMinQty?: number | null;
  wholesalePrice?: number | null;
  wholesaleMinQty?: number | null;
  priceOverridden?: boolean;
};

export const cartLineKey = (productId: number, soldUnit: PackagingUnit) =>
  `${productId}:${soldUnit}`;

export const SALE_STATUS_BADGE: Record<string, string> = {
  PAID: "bg-emerald-100 text-emerald-700",
  PARTIAL: "bg-yellow-100 text-yellow-700",
  UNPAID: "bg-red-100 text-red-700",
  CANCELLED: "bg-slate-200 text-slate-600 line-through",
};

export const SALE_STATUS_LABEL: Record<string, string> = {
  PAID: "Payée",
  PARTIAL: "Partielle",
  UNPAID: "Non réglée",
  CANCELLED: "Annulée",
};
