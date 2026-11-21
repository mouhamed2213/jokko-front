import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getPaymentMethodLabel,
  pickNextPaymentMethod,
  summarizePayments,
} from "./paymentMethods.ts";

describe("paymentMethods utils", () => {
  it("resolves human-readable French labels", () => {
    assert.equal(getPaymentMethodLabel("CASH"), "Espèces");
    assert.equal(getPaymentMethodLabel("WAVE"), "Wave");
    assert.equal(getPaymentMethodLabel("ORANGE_MONEY"), "Orange Money");
    assert.equal(getPaymentMethodLabel(undefined), "Espèces");
  });

  it("identifies single vs mixed payments and aggregates amounts by method", () => {
    const single = summarizePayments([
      { paymentMethod: "CASH", amount: 1000 },
    ]);
    assert.equal(single.isMixed, false);
    assert.equal(single.shortText, "Espèces");
    assert.equal(single.entries.length, 1);

    const mixed = summarizePayments([
      { paymentMethod: "CASH", amount: 500 },
      { paymentMethod: "WAVE", amount: 500 },
    ]);
    assert.equal(mixed.isMixed, true);
    assert.equal(mixed.shortText, "Espèces + Wave");
    assert.equal(mixed.entries.length, 2);
    assert.equal(mixed.entries[0].amount, 500);
    assert.equal(mixed.entries[1].amount, 500);
  });

  it("merges multiple payments of the same method into one summary entry", () => {
    const merged = summarizePayments([
      { paymentMethod: "WAVE", amount: 400 },
      { paymentMethod: "WAVE", amount: 600 },
    ]);
    assert.equal(merged.isMixed, false);
    assert.equal(merged.entries.length, 1);
    assert.equal(merged.entries[0].amount, 1000);
  });

  it("picks the next unused payment method cleanly", () => {
    assert.equal(pickNextPaymentMethod(["CASH"]), "WAVE");
    assert.equal(pickNextPaymentMethod(["CASH", "WAVE"]), "ORANGE_MONEY");
  });
});
