import { X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import PaymentMethodSelect from "../../../components/Paymentmethodselect";
import { addInvoicePayment } from "../../sales/api";
import type { Sale } from "../../../types/index";
import { formatMoney } from "../../../utils/format";

interface InvoicePaymentCardProps {
  invoice: Sale;
  cashOpen: boolean | null;
  onClose: () => void;
  onSuccess: (invoiceId: number) => Promise<void>;
}

export function InvoicePaymentCard({
  invoice,
  cashOpen,
  onClose,
  onSuccess,
}: InvoicePaymentCardProps) {
  const [payAmount, setPayAmount] = useState(String(invoice.remaining));
  const [payNote, setPayNote] = useState("");
  const [payMethod, setPayMethod] = useState("CASH");
  const [submitting, setSubmitting] = useState(false);

  const handlePayment = async () => {
    if (!cashOpen) {
      return toast.error(
        "⚠️ La caisse est fermée. Ouvrez la caisse avant d'enregistrer un paiement.",
        { duration: 5000 },
      );
    }
    if (!payAmount || Number(payAmount) <= 0) {
      return toast.error("Montant invalide");
    }
    setSubmitting(true);
    try {
      await addInvoicePayment(
        invoice.id,
        Number(payAmount),
        payNote || undefined,
        payMethod,
      );
      toast.success("Paiement enregistré — caisse mise à jour");
      onClose();
      await onSuccess(invoice.id);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erreur paiement");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm border-l-4 border-emerald-500">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Enregistrer un paiement — {invoice.invoiceNumber}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Client : {invoice.client?.name || invoice.customerName} • Reste :{" "}
            <strong className="text-red-600">
              {formatMoney(invoice.remaining)}
            </strong>
          </p>
        </div>
        <button type="button" onClick={onClose}>
          <X size={20} className="text-gray-400 hover:text-gray-600" />
        </button>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Montant reçu (FCFA)
          </label>
          <input
            type="number"
            min={1}
            max={invoice.remaining}
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-emerald-500"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Mode de paiement
          </label>
          <PaymentMethodSelect
            value={payMethod}
            onChange={setPayMethod}
            className="w-full"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">
            Note (optionnel)
          </label>
          <input
            type="text"
            value={payNote}
            onChange={(e) => setPayNote(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-emerald-500"
            placeholder="Ex: Versement espèces..."
          />
        </div>
        <div className="flex items-end">
          <button
            type="button"
            onClick={handlePayment}
            disabled={submitting}
            className="w-full rounded-xl bg-emerald-600 py-3 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60 transition"
          >
            {submitting ? "Enregistrement..." : "✓ Confirmer le paiement"}
          </button>
        </div>
      </div>
      <p className="mt-3 text-xs text-emerald-600">
        💡 Ce paiement sera automatiquement enregistré dans la caisse si elle
        est ouverte.
      </p>
    </div>
  );
}
