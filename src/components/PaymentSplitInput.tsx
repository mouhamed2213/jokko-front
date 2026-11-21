import { Plus, Split, Trash2 } from "lucide-react";
import { formatMoney } from "../utils/format";
import {
  pickNextPaymentMethod,
  type PaymentSplit,
} from "../utils/paymentMethods";
import PaymentMethodSelect from "./Paymentmethodselect";

interface PaymentSplitInputProps {
  /** Montant cible (ex: total panier ou reste à payer facture). Optionnel pour caisse manuelle. */
  targetAmount?: number;
  /** Mode mixte activé ou non */
  splitMode: boolean;
  onToggleSplitMode: (next: boolean) => void;
  /** Mode simple */
  singleMethod: string;
  onSingleMethodChange: (method: string) => void;
  /** Mode mixte */
  splits: PaymentSplit[];
  onSplitsChange: (splits: PaymentSplit[]) => void;
  /** Masquer le sélecteur quand le montant payé en mode simple est 0 (vente à crédit) */
  hideWhenZero?: boolean;
  singleAmount?: number;
}

export function PaymentSplitInput({
  targetAmount,
  splitMode,
  onToggleSplitMode,
  singleMethod,
  onSingleMethodChange,
  splits,
  onSplitsChange,
  hideWhenZero = false,
  singleAmount = 0,
}: PaymentSplitInputProps) {
  const splitsTotal = splits.reduce(
    (sum, s) => sum + (Number(s.amount) || 0),
    0,
  );
  const remaining =
    targetAmount !== undefined ? Math.max(0, targetAmount - splitsTotal) : 0;

  const handleEnableSplit = () => {
    const firstAmount =
      singleAmount > 0 && targetAmount !== undefined
        ? Math.min(singleAmount, targetAmount)
        : targetAmount !== undefined && targetAmount > 0
          ? Math.floor(targetAmount / 2)
          : 0;
    const secondAmount =
      targetAmount !== undefined
        ? Math.max(0, targetAmount - firstAmount)
        : 0;
    const secondMethod = pickNextPaymentMethod([singleMethod]);
    onSplitsChange([
      { paymentMethod: singleMethod, amount: firstAmount },
      { paymentMethod: secondMethod, amount: secondAmount },
    ]);
    onToggleSplitMode(true);
  };

  const handleDisableSplit = () => {
    if (splits[0]?.paymentMethod) {
      onSingleMethodChange(splits[0].paymentMethod);
    }
    onToggleSplitMode(false);
  };

  const updateRow = (idx: number, patch: Partial<PaymentSplit>) => {
    onSplitsChange(
      splits.map((row, i) => (i === idx ? { ...row, ...patch } : row)),
    );
  };

  const removeRow = (idx: number) => {
    const next = splits.filter((_, i) => i !== idx);
    if (next.length <= 1) {
      if (next[0]?.paymentMethod) onSingleMethodChange(next[0].paymentMethod);
      onToggleSplitMode(false);
    } else {
      onSplitsChange(next);
    }
  };

  const addRow = () => {
    const nextMethod = pickNextPaymentMethod(
      splits.map((s) => s.paymentMethod),
    );
    onSplitsChange([
      ...splits,
      {
        paymentMethod: nextMethod,
        amount: remaining > 0 ? remaining : 0,
      },
    ]);
  };

  if (!splitMode) {
    if (hideWhenZero && singleAmount <= 0) {
      return (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleEnableSplit}
            className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:underline"
          >
            <Split size={12} /> Paiement mixte (plusieurs moyens)
          </button>
        </div>
      );
    }

    return (
      <div>
        <div className="mb-1 flex items-center justify-between gap-2">
          <label className="block text-xs font-medium text-gray-700">
            Méthode de paiement
          </label>
          <button
            type="button"
            onClick={handleEnableSplit}
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
          >
            <Split size={12} /> Paiement mixte
          </button>
        </div>
        <PaymentMethodSelect
          value={singleMethod}
          onChange={onSingleMethodChange}
          className="w-full"
        />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-3 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-900">
          <Split size={13} className="text-emerald-600" />
          Paiement mixte
        </span>
        <button
          type="button"
          onClick={handleDisableSplit}
          className="text-xs text-gray-500 hover:text-slate-800 underline"
        >
          Mode simple
        </button>
      </div>

      <div className="space-y-2">
        {splits.map((row, idx) => (
          <div key={idx} className="flex items-center gap-2">
            <PaymentMethodSelect
              value={row.paymentMethod}
              onChange={(method) => updateRow(idx, { paymentMethod: method })}
              className="flex-1 bg-white !py-2 text-xs"
            />
            <input
              type="number"
              min={0}
              max={targetAmount}
              value={row.amount}
              onFocus={(e) => e.target.select()}
              onChange={(e) =>
                updateRow(idx, { amount: Math.max(0, Number(e.target.value)) })
              }
              className="w-28 rounded-xl border border-gray-300 bg-white px-2.5 py-2 text-right text-sm font-medium outline-none focus:border-emerald-500"
              placeholder="Montant"
            />
            <button
              type="button"
              onClick={() => removeRow(idx)}
              className="rounded-lg p-1.5 text-red-400 hover:bg-red-50 hover:text-red-600"
              title="Retirer ce moyen"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-emerald-200/70">
        <button
          type="button"
          onClick={addRow}
          className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
        >
          <Plus size={13} /> Ajouter un moyen
        </button>
        <div className="text-right text-xs">
          <span className="text-slate-600">Total encaissé : </span>
          <strong
            className={
              targetAmount !== undefined && splitsTotal > targetAmount
                ? "text-red-600"
                : "text-emerald-700"
            }
          >
            {formatMoney(splitsTotal)}
          </strong>
          {targetAmount !== undefined && remaining > 0 && (
            <span className="ml-1.5 text-amber-700">
              (reste {formatMoney(remaining)})
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
