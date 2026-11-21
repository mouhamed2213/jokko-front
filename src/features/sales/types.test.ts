import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  cartLineKey,
  SALE_STATUS_BADGE,
  SALE_STATUS_LABEL,
} from "./types.ts";

describe("sales types & helpers", () => {
  it("builds unique cart line keys per product and packaging unit", () => {
    assert.equal(cartLineKey(42, "PIECE"), "42:PIECE");
    assert.equal(cartLineKey(42, "CARTON"), "42:CARTON");
    assert.notEqual(cartLineKey(42, "PIECE"), cartLineKey(42, "DOZEN"));
  });

  it("defines labels and badge styles for all sale statuses", () => {
    for (const status of ["PAID", "PARTIAL", "UNPAID", "CANCELLED"]) {
      assert.ok(SALE_STATUS_LABEL[status], `missing label for ${status}`);
      assert.ok(SALE_STATUS_BADGE[status], `missing badge for ${status}`);
    }
  });
});
