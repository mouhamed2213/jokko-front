import type { Client } from "../clients/types";
import type { PackagingUnit, Product } from "../products/types";

export type SaleItem = {
  id: number;
  saleId: number;
  productId?: number | null;
  productName: string;
  productImageUrl?: string | null;
  quantity: number;
  unitPrice: number;
  soldUnit?: PackagingUnit;
  soldQuantity?: number | null;
  soldUnitPrice?: number | null;
  totalAmount: number;
  product?: Product | null;
};

export type SalePayment = {
  id: number;
  saleId: number;
  amount: number;
  note?: string | null;
  paidAt: string;
};

export type Sale = {
  id: number;
  shopId: number;
  userId?: number | null;
  clientId?: number | null;
  shop?: { phone: string };
  invoiceNumber?: string | null;
  customerName?: string | null;
  totalAmount: number;
  paidAmount: number;
  remaining: number;
  status: "PAID" | "PARTIAL" | "UNPAID" | "CANCELLED";
  note?: string | null;
  createdAt: string;
  updatedAt: string;
  client?: Client | null;
  items: SaleItem[];
  payments: SalePayment[];
  meta: any;
};

export type CartItem = {
  productId: number;
  productName: string;
  imageUrl?: string | null;
  soldUnit: PackagingUnit;
  unitType: PackagingUnit;
  unitsPerPack: number;
  quantity: number;
  unitPrice: number;
  stock: number;
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
