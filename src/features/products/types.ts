export type PackagingUnit = "PIECE" | "DOZEN" | "CARTON";

export type Product = {
  id: number;
  shopId: number;
  categoryId?: number | null;
  name: string;
  description?: string | null;
  reference?: string | null;
  unitType?: PackagingUnit;
  unitsPerPack?: number;
  quantity: number;
  purchasePrice: number;
  salePrice: number;
  packPurchasePrice?: number | null;
  packSalePrice?: number | null;
  alertThreshold: number;
  imageUrl?: string | null;
  isActive: boolean;
  semiWholesalePrice?: number | null;
  semiWholesaleMinQty?: number | null;
  wholesalePrice?: number | null;
  wholesaleMinQty?: number | null;
  createdAt: string;
  updatedAt: string;
  category?: { id: number; name: string } | null;
  totalProducts: number;
};

export type Category = {
  id: number;
  shopId: number;
  name: string;
  createdAt: string;
  _count?: { products: number };
};
