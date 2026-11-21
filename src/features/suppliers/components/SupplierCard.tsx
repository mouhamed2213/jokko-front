import { AlertTriangle, ChevronDown, ChevronUp, CreditCard, Lightbulb } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { addSupplierDebt } from "../api";
import type { Supplier, SupplierDebt } from "../../../types/index";
import { formatMoney } from "../../../utils/format";

interface SupplierCardProps {
  supplier: Supplier;
  expanded: boolean;
  cashOpen: boolean | null;
  onToggleExpand: () => void;
  onEdit: (supplier: Supplier) => void;
  onDelete: (id: number) => void;
  onPayDebt: (supplierId: number, debt: SupplierDebt) => void;
  onOpenHistory: (supplierId: number) => void;
  onDebtAdded: () => Promise<void>;
}

export function SupplierCard({
  supplier: s,
  expanded,
  cashOpen,
  onToggleExpand,
  onEdit,
  onDelete,
  onPayDebt,
  onOpenHistory,
  onDebtAdded,
}: SupplierCardProps) {
  const [showDebtForm, setShowDebtForm] = useState(false);
  const [debtTotal, setDebtTotal] = useState("");
  const [debtPaid, setDebtPaid] = useState("0");
  const [debtNote, setDebtNote] = useState("");

  const unpaidDebts =
    s.supplierDebts?.filter((d) => d.status !== "PAID") || [];

  const handleAddDebt = async () => {
    if (!debtTotal || Number(debtTotal) <= 0) {
      return toast.error("Montant total invalide");
    }
    if (Number(debtPaid) > Number(debtTotal)) {
      return toast.error("L'acompte ne peut pas dépasser le total");
    }
    if (Number(debtPaid) > 0 && !cashOpen) {
      return toast.error(
        "La caisse est fermée. Impossible de verser un acompte.",
        { duration: 5000 },
      );
    }
    try {
      await addSupplierDebt(s.id, {
        totalAmount: Number(debtTotal),
        paidAmount: Number(debtPaid) || 0,
        note: debtNote || undefined,
      });
      toast.success(
        Number(debtPaid) > 0
          ? "Dette et acompte enregistrés — caisse mise à jour"
          : "Dette enregistrée",
      );
      setShowDebtForm(false);
      setDebtTotal("");
      setDebtPaid("0");
      setDebtNote("");
      await onDebtAdded();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erreur");
    }
  };

  return (
    <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
      {/* En-tête fournisseur */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
            {s.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-slate-900">{s.name}</p>
            <p className="text-sm text-gray-500">
              {s.phone || "Pas de téléphone"}
              {s.email ? ` • ${s.email}` : ""}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(s.totalDebt ?? 0) > 0 && (
            <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700">
              Doit : {formatMoney(s.totalDebt ?? 0)}
            </span>
          )}
          {(s.totalDebt ?? 0) === 0 && (s as any).totalPurchases > 0 && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
              Tout réglé
            </span>
          )}

          {unpaidDebts.length > 0 && (
            <button
              onClick={() => {
                if (!cashOpen) {
                  toast.error("La caisse est fermée.", { duration: 4000 });
                  return;
                }
                onPayDebt(s.id, unpaidDebts[0]);
              }}
              className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-white transition ${
                cashOpen
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              <CreditCard size={13} /> Payer
            </button>
          )}

          <button
            onClick={() => onEdit(s)}
            className="rounded-lg border border-gray-300 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
          >
            Modifier
          </button>
          <button
            onClick={() => onDelete(s.id)}
            className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
          >
            Supprimer
          </button>
          <button
            onClick={onToggleExpand}
            className="text-gray-400 hover:text-gray-600"
          >
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Section expandée */}
      {expanded && (
        <div className="border-t bg-slate-50 px-5 py-4 space-y-4">
          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div className="rounded-xl bg-white p-3">
              <p className="text-xs text-gray-400">Total achats</p>
              <p className="font-bold text-slate-900">
                {formatMoney((s as any).totalPurchases ?? 0)}
              </p>
            </div>
            <div className="rounded-xl bg-white p-3">
              <p className="text-xs text-gray-400">Total payé</p>
              <p className="font-bold text-emerald-700">
                {formatMoney((s as any).totalPaid ?? 0)}
              </p>
            </div>
            <div className="rounded-xl bg-white p-3">
              <p className="text-xs text-gray-400">Reste dû</p>
              <p
                className={`font-bold ${
                  (s.totalDebt ?? 0) > 0 ? "text-red-600" : "text-emerald-600"
                }`}
              >
                {formatMoney(s.totalDebt ?? 0)}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <button
              onClick={() => setShowDebtForm((v) => !v)}
              className="text-sm font-medium text-red-600 hover:text-red-700"
            >
              {showDebtForm
                ? "▲ Annuler"
                : "+ Ajouter une dette / approvisionnement"}
            </button>
            <button
              type="button"
              onClick={() => onOpenHistory(s.id)}
              className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
            >
              Voir l’historique des achats
            </button>
          </div>

          {showDebtForm && (
            <div className="rounded-xl bg-white p-4 space-y-3">
              <p className="text-sm font-semibold text-slate-800">
                Nouvelle dette fournisseur
              </p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs text-gray-600">
                    Montant total (FCFA) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={debtTotal}
                    onChange={(e) => setDebtTotal(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                    placeholder="Ex: 100000"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-600">
                    Acompte versé (FCFA)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={debtPaid}
                    onChange={(e) => setDebtPaid(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-gray-600">
                    Note
                  </label>
                  <input
                    type="text"
                    value={debtNote}
                    onChange={(e) => setDebtNote(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
                    placeholder="Ex: Tissu, farine..."
                  />
                </div>
              </div>
              {debtTotal && Number(debtPaid) > 0 && (
                <p className="flex items-center gap-1.5 text-xs text-yellow-600">
                  <AlertTriangle size={13} className="shrink-0" />
                  Reste dû après acompte :{" "}
                  {formatMoney(Number(debtTotal) - Number(debtPaid))}
                </p>
              )}
              <p className="flex items-center gap-1.5 text-xs text-emerald-600">
                <Lightbulb size={13} className="shrink-0" />
                Si acompte &gt; 0, il sera automatiquement décaissé de la caisse si elle est ouverte.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleAddDebt}
                  className="rounded-xl bg-red-500 px-4 py-2 text-xs font-medium text-white hover:bg-red-600"
                >
                  Enregistrer la dette
                </button>
                <button
                  onClick={() => setShowDebtForm(false)}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-xs text-gray-700"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}

          {/* Liste des dettes */}
          {s.supplierDebts?.length ? (
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400 mb-2">
                Dettes ({s.supplierDebts.length})
              </p>
              <div className="space-y-2">
                {s.supplierDebts.map((d: SupplierDebt) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between rounded-xl bg-white px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-800">
                        Total : {formatMoney(d.totalAmount)}
                        {d.note && (
                          <span className="ml-2 text-xs text-gray-400">
                            — {d.note}
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        Payé : {formatMoney(d.paidAmount)} • Reste :{" "}
                        <span
                          className={
                            d.remaining > 0
                              ? "text-red-600 font-medium"
                              : "text-emerald-600 font-medium"
                          }
                        >
                          {formatMoney(d.remaining)}
                        </span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${
                          d.status === "PAID"
                            ? "bg-emerald-100 text-emerald-700"
                            : d.status === "PARTIAL"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                        }`}
                      >
                        {d.status === "PAID"
                          ? "Soldée"
                          : d.status === "PARTIAL"
                            ? "Partielle"
                            : "Non payée"}
                      </span>
                      {d.status !== "PAID" && (
                        <button
                          onClick={() => {
                            if (!cashOpen) {
                              toast.error("La caisse est fermée.", {
                                duration: 4000,
                              });
                              return;
                            }
                            onPayDebt(s.id, d);
                          }}
                          className={`flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium text-white transition ${
                            cashOpen
                              ? "bg-emerald-600 hover:bg-emerald-700"
                              : "bg-gray-400 cursor-not-allowed"
                          }`}
                        >
                          <CreditCard size={12} /> Payer
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Aucune dette enregistrée.</p>
          )}
        </div>
      )}
    </div>
  );
}
