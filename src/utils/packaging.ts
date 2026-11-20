export type PackagingUnit = "PIECE" | "DOZEN" | "CARTON";
export type PriceTier = "detail" | "semiWholesale" | "wholesale";

export function unitLabel(unit: PackagingUnit, plural = false): string {
  if (unit === "DOZEN") return plural ? "douzaines" : "douzaine";
  if (unit === "CARTON") return plural ? "cartons" : "carton";
  return plural ? "pièces" : "pièce";
}

export function unitShortLabel(unit: PackagingUnit): string {
  if (unit === "DOZEN") return "dz";
  if (unit === "CARTON") return "ctn";
  return "pcs";
}

/**
 * Formate un stock stocké en pièces de manière lisible selon le conditionnement du produit.
 * Ex: 120 pièces pour un carton de 24 -> "5 cartons (120 pcs)"
 * Ex: 125 pièces pour un carton de 24 -> "5 cartons + 5 pcs (125 pcs)"
 */
export function formatStockDisplay(
  quantityInPieces: number,
  unitType: PackagingUnit = "PIECE",
  unitsPerPack = 1,
): string {
  if (unitType === "PIECE" || unitsPerPack <= 1) {
    return `${quantityInPieces} ${unitLabel("PIECE", quantityInPieces > 1)}`;
  }

  const fullPacks = Math.floor(quantityInPieces / unitsPerPack);
  const remainder = quantityInPieces % unitsPerPack;

  if (fullPacks === 0) {
    return `${remainder} ${unitLabel("PIECE", remainder > 1)}`;
  }
  if (remainder === 0) {
    return `${fullPacks} ${unitLabel(unitType, fullPacks > 1)} (${quantityInPieces} pcs)`;
  }
  return `${fullPacks} ${unitLabel(unitType, fullPacks > 1)} + ${remainder} pcs (${quantityInPieces} pcs)`;
}

export type PricedProductLike = {
  unitType?: PackagingUnit;
  unitsPerPack?: number;
  salePrice: number;
  packSalePrice?: number | null;
  semiWholesalePrice?: number | null;
  semiWholesaleMinQty?: number | null;
  wholesalePrice?: number | null;
  wholesaleMinQty?: number | null;
};

export function computeUnitPrice(
  product: PricedProductLike,
  quantity: number,
  soldUnit?: PackagingUnit,
): { price: number; tier: PriceTier; piecesCount: number; soldUnit: PackagingUnit } {
  const productUnit: PackagingUnit = product.unitType || "PIECE";
  const unitsPerPack = product.unitsPerPack || 1;
  const effectiveUnit: PackagingUnit = soldUnit || productUnit;
  const multiplier = effectiveUnit === "PIECE" ? 1 : Math.max(1, unitsPerPack);
  const piecesCount = quantity * multiplier;

  if (effectiveUnit === "PIECE" && productUnit !== "PIECE") {
    return {
      price: product.salePrice,
      tier: "detail",
      piecesCount,
      soldUnit: "PIECE",
    };
  }

  if (
    product.wholesalePrice &&
    product.wholesaleMinQty &&
    quantity >= product.wholesaleMinQty
  ) {
    return {
      price: product.wholesalePrice,
      tier: "wholesale",
      piecesCount,
      soldUnit: effectiveUnit,
    };
  }

  if (
    product.semiWholesalePrice &&
    product.semiWholesaleMinQty &&
    quantity >= product.semiWholesaleMinQty
  ) {
    return {
      price: product.semiWholesalePrice,
      tier: "semiWholesale",
      piecesCount,
      soldUnit: effectiveUnit,
    };
  }

  const basePrice =
    effectiveUnit === "PIECE"
      ? product.salePrice
      : (product.packSalePrice ?? product.salePrice * multiplier);

  return {
    price: basePrice,
    tier: "detail",
    piecesCount,
    soldUnit: effectiveUnit,
  };
}

export function formatSaleItemQty(item: {
  quantity: number;
  soldUnit?: PackagingUnit;
  soldQuantity?: number | null;
}): string {
  if (item.soldUnit && item.soldUnit !== "PIECE" && item.soldQuantity) {
    return `${item.soldQuantity} ${unitLabel(item.soldUnit, item.soldQuantity > 1)} (${item.quantity} pcs)`;
  }
  return `${item.quantity}`;
}
