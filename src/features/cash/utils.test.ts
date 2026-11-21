import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { aggregateCashByMethod } from "./utils.ts";

describe("aggregateCashByMethod", () => {
  it("aggregates IN, OUT and net amounts per payment method", () => {
    const result = aggregateCashByMethod([
      {
        id: 1,
        cashRegisterId: 1,
        type: "IN",
        amount: 15000,
        label: "Vente 1",
        createdAt: "2026-11-20T10:00:00Z",
        paymentMethod: "CASH",
      },
      {
        id: 2,
        cashRegisterId: 1,
        type: "OUT",
        amount: 4000,
        label: "Achat fournitures",
        createdAt: "2026-11-20T11:00:00Z",
        paymentMethod: "CASH",
      },
      {
        id: 3,
        cashRegisterId: 1,
        type: "IN",
        amount: 25000,
        label: "Vente Wave",
        createdAt: "2026-11-20T12:00:00Z",
        paymentMethod: "WAVE",
      },
      {
        id: 4,
        cashRegisterId: 1,
        type: "IN",
        amount: 10000,
        label: "Vente OM",
        createdAt: "2026-11-20T13:00:00Z",
        paymentMethod: "ORANGE_MONEY",
      },
    ]);

    const cash = result.find((r) => r.method === "CASH");
    const wave = result.find((r) => r.method === "WAVE");
    const om = result.find((r) => r.method === "ORANGE_MONEY");

    assert.deepEqual(cash, {
      method: "CASH",
      totalIn: 15000,
      totalOut: 4000,
      net: 11000,
    });
    assert.deepEqual(wave, {
      method: "WAVE",
      totalIn: 25000,
      totalOut: 0,
      net: 25000,
    });
    assert.deepEqual(om, {
      method: "ORANGE_MONEY",
      totalIn: 10000,
      totalOut: 0,
      net: 10000,
    });
  });

  it("defaults missing paymentMethod to CASH", () => {
    const result = aggregateCashByMethod([
      {
        id: 1,
        cashRegisterId: 1,
        type: "IN",
        amount: 5000,
        label: "Encaissement",
        createdAt: "2026-11-20T10:00:00Z",
      },
    ]);
    assert.equal(result.length, 1);
    assert.equal(result[0].method, "CASH");
    assert.equal(result[0].net, 5000);
  });

  it("returns empty array for no transactions", () => {
    assert.deepEqual(aggregateCashByMethod([]), []);
  });
});
