import type { CashTransaction } from "../../types/index";

export type CashMethodTotals = {
  method: string;
  totalIn: number;
  totalOut: number;
  net: number;
};

export function aggregateCashByMethod(
  transactions: Array<CashTransaction & { paymentMethod?: string }>,
): CashMethodTotals[] {
  const byMethod: Record<string, { in: number; out: number }> = {};
  for (const tx of transactions) {
    const m = tx.paymentMethod || "CASH";
    if (!byMethod[m]) byMethod[m] = { in: 0, out: 0 };
    if (tx.type === "IN") byMethod[m].in += tx.amount;
    else byMethod[m].out += tx.amount;
  }
  return Object.entries(byMethod).map(([method, amounts]) => ({
    method,
    totalIn: amounts.in,
    totalOut: amounts.out,
    net: amounts.in - amounts.out,
  }));
}
