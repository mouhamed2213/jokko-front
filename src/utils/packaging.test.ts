import test from "node:test";
import assert from "node:assert/strict";
import { computeUnitPrice, formatStockDisplay } from "./packaging.ts";

test("formatStockDisplay formats PIECE, DOZEN and CARTON stocks cleanly", () => {
  assert.equal(formatStockDisplay(15, "PIECE", 1), "15 pièces");
  assert.equal(formatStockDisplay(36, "DOZEN", 12), "3 douzaines (36 pcs)");
  assert.equal(formatStockDisplay(41, "DOZEN", 12), "3 douzaines + 5 pcs (41 pcs)");
  assert.equal(formatStockDisplay(120, "CARTON", 24), "5 cartons (120 pcs)");
  assert.equal(formatStockDisplay(7, "CARTON", 24), "7 pièces");
});

test("computeUnitPrice mirrors backend pricing for pack and piece modes", () => {
  const product = {
    unitType: "CARTON" as const,
    unitsPerPack: 24,
    salePrice: 700,
    packSalePrice: 14400,
    semiWholesaleMinQty: 5,
    semiWholesalePrice: 13500,
    wholesaleMinQty: 10,
    wholesalePrice: 12500,
  };

  assert.equal(computeUnitPrice(product, 2, "CARTON").price, 14400);
  assert.equal(computeUnitPrice(product, 2, "CARTON").piecesCount, 48);
  assert.equal(computeUnitPrice(product, 5, "CARTON").price, 13500);
  assert.equal(computeUnitPrice(product, 10, "CARTON").price, 12500);
  assert.equal(computeUnitPrice(product, 4, "PIECE").price, 700);
  assert.equal(computeUnitPrice(product, 4, "PIECE").piecesCount, 4);
});
