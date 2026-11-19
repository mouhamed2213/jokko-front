import test from "node:test";
import assert from "node:assert/strict";
import { hasFeature, hasFeatures } from "./subscription.checker.ts";

test("hasFeature returns true when feature is included in subscription", () => {
  const sub: any = {
    features: ["EXPORT_PDF", "EXPORT_EXCEL", "MULTI_STORE"],
  };

  assert.equal(hasFeature(sub, "EXPORT_PDF"), true);
  assert.equal(hasFeature(sub, "ACCOUNTING"), false);
});

test("hasFeature returns false when subscription is null or undefined", () => {
  assert.equal(hasFeature(null as any, "EXPORT_PDF"), false);
  assert.equal(hasFeature(undefined as any, "EXPORT_PDF"), false);
});

test("hasFeatures returns mapping of all features with boolean flags", () => {
  const sub: any = {
    features: ["EXPORT_PDF", "LOW_STOCK_ALERT"],
  };

  const map = hasFeatures(sub);
  assert.equal(map.exportPdf, true);
  assert.equal(map.lowStockAlert, true);
  assert.equal(map.accounting, false);
});
