import type { Product } from "../products/types";
import type { Supplier } from "../suppliers/types";

export type StockMovement = {
  id: number;
  shopId: number;
  productId: number;
  userId?: number | null;
  supplierId?: number | null;
  type: "ENTRY" | "OUT" | "SALE" | "ADJUST";
  quantity: number;
  unitCost?: number | null;
  note?: string | null;
  createdAt: string;
  product: Product;
  user?: { name: string } | null;
  supplier?: Supplier | null;
};
