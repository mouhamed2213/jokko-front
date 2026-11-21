import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatDate, formatDateTime, formatMoney } from "./format.ts";

describe("format utils", () => {
  it("formats FCFA amounts cleanly", () => {
    assert.match(formatMoney(150000), /^150\s000 FCFA$/);
    assert.equal(formatMoney(0), "0 FCFA");
  });

  it("handles empty or invalid dates safely", () => {
    assert.equal(formatDateTime(null), "—");
    assert.equal(formatDateTime("invalid-date"), "—");
    assert.equal(formatDate(undefined), "—");
  });
});
