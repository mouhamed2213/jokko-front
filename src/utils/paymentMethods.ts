import { formatMoney } from "./format.ts";

export type PaymentMethodCode =
  | "CASH"
  | "WAVE"
  | "ORANGE_MONEY"
  | "FREE_MONEY"
  | "BANK"
  | "OTHER";

export type PaymentSplit = {
  paymentMethod: string;
  amount: number;
};

export const PAYMENT_METHOD_OPTIONS: Array<{
  value: PaymentMethodCode;
  label: string;
  badgeClass: string;
}> = [
  {
    value: "CASH",
    label: "Espèces",
    badgeClass: "bg-green-100 text-green-800 border-green-200",
  },
  {
    value: "WAVE",
    label: "Wave",
    badgeClass: "bg-blue-100 text-blue-800 border-blue-200",
  },
  {
    value: "ORANGE_MONEY",
    label: "Orange Money",
    badgeClass: "bg-orange-100 text-orange-800 border-orange-200",
  },
  {
    value: "FREE_MONEY",
    label: "Free Money",
    badgeClass: "bg-purple-100 text-purple-800 border-purple-200",
  },
  {
    value: "BANK",
    label: "Virement",
    badgeClass: "bg-slate-100 text-slate-800 border-slate-200",
  },
  {
    value: "OTHER",
    label: "Autre",
    badgeClass: "bg-gray-100 text-gray-700 border-gray-200",
  },
];

const METHOD_MAP = new Map(PAYMENT_METHOD_OPTIONS.map((m) => [m.value, m]));

export function getPaymentMethodLabel(method?: string | null): string {
  if (!method) return "Espèces";
  const key = method.toUpperCase() as PaymentMethodCode;
  return METHOD_MAP.get(key)?.label ?? method;
}

export function getPaymentMethodBadgeClass(method?: string | null): string {
  const key = (method || "CASH").toUpperCase() as PaymentMethodCode;
  return (
    METHOD_MAP.get(key)?.badgeClass ??
    "bg-gray-100 text-gray-700 border-gray-200"
  );
}

export function summarizePayments(
  payments?: Array<{ paymentMethod?: string | null; amount: number }>,
): {
  entries: Array<{ paymentMethod: string; label: string; amount: number }>;
  isMixed: boolean;
  summaryText: string;
  shortText: string;
} {
  if (!payments || payments.length === 0) {
    return { entries: [], isMixed: false, summaryText: "—", shortText: "—" };
  }

  const byMethod = new Map<string, number>();
  for (const p of payments) {
    const key = (p.paymentMethod || "CASH").toUpperCase();
    byMethod.set(key, (byMethod.get(key) ?? 0) + (Number(p.amount) || 0));
  }

  const entries = Array.from(byMethod.entries()).map(
    ([paymentMethod, amount]) => ({
      paymentMethod,
      label: getPaymentMethodLabel(paymentMethod),
      amount,
    }),
  );

  const isMixed = entries.length > 1;
  const summaryText = entries
    .map((e) => `${e.label} (${formatMoney(e.amount)})`)
    .join(" + ");
  const shortText = entries.map((e) => e.label).join(" + ");

  return { entries, isMixed, summaryText, shortText };
}

export function pickNextPaymentMethod(usedMethods: string[]): PaymentMethodCode {
  const used = new Set(usedMethods.map((m) => m.toUpperCase()));
  for (const opt of PAYMENT_METHOD_OPTIONS) {
    if (!used.has(opt.value)) return opt.value;
  }
  return "OTHER";
}
