import { formatMoney } from "../utils/format";
import {
  getPaymentMethodBadgeClass,
  summarizePayments,
} from "../utils/paymentMethods";

interface PaymentMethodBadgesProps {
  payments?: Array<{ paymentMethod?: string | null; amount: number }>;
  showAmounts?: boolean;
  className?: string;
}

export function PaymentMethodBadges({
  payments,
  showAmounts = false,
  className = "",
}: PaymentMethodBadgesProps) {
  const { entries, isMixed } = summarizePayments(payments);
  if (entries.length === 0) return null;

  return (
    <span className={`inline-flex flex-wrap items-center gap-1 ${className}`}>
      {entries.map((entry) => (
        <span
          key={entry.paymentMethod}
          title={`${entry.label} : ${formatMoney(entry.amount)}`}
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${getPaymentMethodBadgeClass(
            entry.paymentMethod,
          )}`}
        >
          <span>{entry.label}</span>
          {(showAmounts || isMixed) && (
            <span className="opacity-80">
              {entry.amount.toLocaleString("fr-FR")} F
            </span>
          )}
        </span>
      ))}
    </span>
  );
}
