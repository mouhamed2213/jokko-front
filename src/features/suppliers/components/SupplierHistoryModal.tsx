import { X } from "lucide-react";
import type { SupplierHistoryResponse } from "../../../types/index";
import { formatMoney } from "../../../utils/format";

interface SupplierHistoryModalProps {
  supplier: SupplierHistoryResponse;
  page: number;
  loading: boolean;
  onPageChange: (page: number) => void;
  onClose: () => void;
}

export function SupplierHistoryModal({
  supplier,
  page,
  loading,
  onPageChange,
  onClose,
}: SupplierHistoryModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="flex items-start justify-between border-b px-5 py-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Historique des achats — {supplier.name}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Détail des approvisionnements enregistrés
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
        <div className="space-y-5 p-5">
          <div className="grid grid-cols-1 gap-3 text-center sm:grid-cols-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-gray-400">Total achats</p>
              <p className="font-bold text-slate-900">
                {formatMoney(supplier.totalPurchases)}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-gray-400">Total payé</p>
              <p className="font-bold text-emerald-700">
                {formatMoney(supplier.totalPaid)}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-gray-400">Reste dû</p>
              <p className="font-bold text-red-600">
                {formatMoney(supplier.totalDebt ?? 0)}
              </p>
            </div>
          </div>
          {loading ? (
            <p className="py-8 text-center text-sm text-gray-400">
              Chargement de l’historique...
            </p>
          ) : supplier.stockMovements.length === 0 ? (
            <p className="py-8 text-center text-sm text-gray-400">
              Aucun approvisionnement enregistré.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-xl border">
              <table className="w-full min-w-[700px] text-left text-sm">
                <thead className="border-b bg-slate-50 text-xs text-gray-500">
                  <tr>
                    <th className="px-4 py-3">Date</th>
                    <th className="px-4 py-3">Produit</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Quantité</th>
                    <th className="px-4 py-3">Prix unitaire</th>
                    <th className="px-4 py-3">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {supplier.stockMovements.map((movement) => (
                    <tr key={movement.id} className="border-b last:border-0">
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(movement.createdAt).toLocaleDateString(
                          "fr-FR",
                        )}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {movement.product.name}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {{
                          ENTRY: "Entrée",
                          OUT: "Sortie",
                          SALE: "Vente",
                          ADJUST: "Ajustement",
                        }[movement.type] || movement.type}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {movement.quantity}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {movement.unitCost == null
                          ? "—"
                          : formatMoney(movement.unitCost)}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {movement.unitCost == null
                          ? "—"
                          : formatMoney(movement.unitCost * movement.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {supplier.stockMovementsPagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-4">
              <button
                type="button"
                disabled={page === 1 || loading}
                onClick={() => onPageChange(page - 1)}
                className="rounded-lg border px-3 py-1.5 text-xs disabled:opacity-40"
              >
                ← Précédent
              </button>
              <span className="text-xs text-gray-500">
                Page {page} / {supplier.stockMovementsPagination.totalPages}
              </span>
              <button
                type="button"
                disabled={
                  page === supplier.stockMovementsPagination.totalPages ||
                  loading
                }
                onClick={() => onPageChange(page + 1)}
                className="rounded-lg border px-3 py-1.5 text-xs disabled:opacity-40"
              >
                Suivant →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
