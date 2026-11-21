import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  dateFromInput,
  minimumPlan,
  planDisplayNames,
  planRank,
  shiftDate,
} from "./constants.ts";

describe("analytics constants & date helpers", () => {
  it("orders plans strictly from FREE to PREMIUM", () => {
    assert.ok(planRank.FREE < planRank.BASIC);
    assert.ok(planRank.BASIC < planRank.PRO);
    assert.ok(planRank.PRO < planRank.PREMIUM);
    assert.equal(planDisplayNames.PREMIUM, "Signature");
  });

  it("gates profit section to PREMIUM and insights to PRO", () => {
    assert.equal(minimumPlan.profit, "PREMIUM");
    assert.equal(minimumPlan.insights, "PRO");
    assert.equal(minimumPlan.overview, "FREE");
  });

  it("parses ISO date inputs and shifts dates accurately", () => {
    const base = dateFromInput("2026-11-20");
    assert.equal(base.getFullYear(), 2026);
    assert.equal(base.getMonth(), 10); // November (0-indexed)
    assert.equal(base.getDate(), 20);

    const shifted = shiftDate("2026-11-20", -5);
    assert.equal(shifted, "2026-11-15");
  });
});
