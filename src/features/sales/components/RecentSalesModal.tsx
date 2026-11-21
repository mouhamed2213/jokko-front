import { X } from "lucide-react";
import { Link } from "react-router-dom";
import type { Sale } from "../../../types/index";
import { formatMoney } from "../../../utils/format";
import { SALE_STATUS_BADGE, SALE_STATUS_LABEL } from "../types";

interface RecentSalesModalProps {
  loading: boolean;
  sales: Sale[];
  onClose: () => void;
}

export function RecentSalesModal({
  loading,
  sales,
  onClose,
}: RecentSalesModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
      <div className="flex max-h-[85vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">
            Dernières ventes
          </h2>
          <button type="button" onClick={onClose}>
            <X size={20} className="text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="rounded-2xl bg-gray-50 p-8 text-center text-gray-400">
              Chargement...
            </div>
          ) : !sales.length ? (
            <div className="rounded-2xl bg-gray-50 p-8 text-center text-gray-400">
              Aucune vente trouvée.
            </div>
          ) : (
            sales.map((sale) => (
              <div
                key={sale.id}
                className="rounded-2xl border border-gray-100 px-4 py-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-slate-900">
                        {sale.items.map((item) => item.productName).join(", ")}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${SALE_STATUS_BADGE[sale.status]}`}
                      >
                        {SALE_STATUS_LABEL[sale.status]}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {sale.client?.name ||
                        sale.customerName ||
                        "Client non précisé"}{" "}
                      • {new Date(sale.createdAt).toLocaleDateString("fr-FR")}
                    </p>
                    <div className="mt-1 text-xs text-gray-400">
                      {sale.items.reduce((sum, item) => sum + item.quantity, 0)}{" "}
                      article(s) • Total :{" "}
                      <strong className="text-slate-700">
                        {formatMoney(sale.totalAmount)}
                      </strong>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      window.location.href = `/invoices?search=${encodeURIComponent(sale.invoiceNumber || String(sale.id))}`;
                    }}
                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
                  >
                    Voir la facture
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-gray-100 px-6 py-4">
          <Link
            to="/sales/history"
            className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
          >
            Voir tout l'historique →
          </Link>
        </div>
      </div>
    </div>
  );
}
