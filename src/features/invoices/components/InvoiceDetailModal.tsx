import { CreditCard, Pencil, Printer, X } from "lucide-react";
import { useState } from "react";
import type { PackagingUnit, Sale } from "../../../types/index";
import { formatMoney } from "../../../utils/format";
import { unitLabel } from "../../../utils/packaging";
import { SALE_STATUS_BADGE, SALE_STATUS_LABEL } from "../../sales/types";

interface InvoiceDetailModalProps {
  invoice: Sale;
  canEdit: boolean;
  onPrintA4: (invoice: Sale) => void;
  onPrintThermal: (invoice: Sale) => void;
  onEdit: (invoice: Sale) => void;
  onPay: (invoice: Sale) => void;
  onClose: () => void;
}

export function InvoiceDetailModal({
  invoice,
  canEdit,
  onPrintA4,
  onPrintThermal,
  onEdit,
  onPay,
  onClose,
}: InvoiceDetailModalProps) {
  const [showPrintMenu, setShowPrintMenu] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              {invoice.invoiceNumber}
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">
              {new Date(invoice.createdAt).toLocaleString("fr-FR")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${SALE_STATUS_BADGE[invoice.status]}`}
            >
              {SALE_STATUS_LABEL[invoice.status]}
            </span>
            <button type="button" onClick={onClose}>
              <X size={20} className="text-gray-400 hover:text-gray-600" />
            </button>
          </div>
        </div>

        {/* Client */}
        <div className="rounded-xl bg-slate-50 px-4 py-3 mb-4">
          <p className="text-xs text-gray-400">Client</p>
          <p className="font-semibold text-slate-900">
            {invoice.client?.name ||
              invoice.customerName ||
              "Client non précisé"}
          </p>
          {invoice.client?.phone && (
            <p className="text-sm text-gray-500">{invoice.client.phone}</p>
          )}
        </div>

        {/* Articles */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-100 text-sm mb-4">
            <thead>
              <tr className="border-b text-gray-500 text-xs">
                <th className="pb-2 text-left">Produit</th>
                <th className="pb-2 text-right">Qté</th>
                <th className="pb-2 text-right">P.U</th>
                <th className="pb-2 text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => {
                const soldUnit: PackagingUnit = item.soldUnit ?? "PIECE";
                const soldQty = item.soldQuantity ?? item.quantity;
                const soldPrice = item.soldUnitPrice ?? item.unitPrice;
                return (
                  <tr key={item.id} className="border-b">
                    <td className="py-2">{item.productName}</td>
                    <td className="py-2 text-right">
                      {soldQty} {unitLabel(soldUnit, soldQty > 1)}
                    </td>
                    <td className="py-2 text-right">
                      {formatMoney(soldPrice)}
                    </td>
                    <td className="py-2 text-right font-semibold">
                      {formatMoney(item.totalAmount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totaux */}
        <div className="rounded-xl bg-slate-50 p-4 space-y-2 text-sm mb-4">
          <div className="flex justify-between">
            <span className="text-gray-500">Total</span>
            <span className="font-bold">
              {formatMoney(invoice.totalAmount)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Payé</span>
            <span className="font-bold text-emerald-600">
              {formatMoney(invoice.paidAmount)}
            </span>
          </div>
          {invoice.remaining > 0 && (
            <div className="flex justify-between border-t pt-2">
              <span className="text-red-600">Reste</span>
              <span className="font-bold text-red-600">
                {formatMoney(invoice.remaining)}
              </span>
            </div>
          )}
        </div>

        {/* Historique paiements */}
        {invoice.payments.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-semibold uppercase text-gray-400 mb-2">
              Historique des paiements
            </p>
            <div className="space-y-2">
              {invoice.payments.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between rounded-xl bg-emerald-50 px-4 py-2.5"
                >
                  <div>
                    <p className="text-sm font-medium text-emerald-800">
                      {formatMoney(p.amount)}
                    </p>
                    <p className="text-xs text-emerald-600">
                      {new Date(p.paidAt).toLocaleString("fr-FR")}
                    </p>
                  </div>
                  {p.note && <p className="text-xs text-gray-500">{p.note}</p>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <div className="hidden relative">
            <button
              type="button"
              onClick={() => setShowPrintMenu((v) => !v)}
              className="flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
            >
              <Printer size={15} /> Imprimer ▾
            </button>
            {showPrintMenu && (
              <div className="absolute left-0 top-12 z-10 w-44 rounded-xl bg-white shadow-lg border border-gray-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => {
                    onPrintA4(invoice);
                    setShowPrintMenu(false);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-slate-50 transition"
                >
                  <Printer size={14} />
                  <div className="text-left">
                    <p className="font-medium">Format A4</p>
                    <p className="text-xs text-gray-400">
                      Facture professionnelle
                    </p>
                  </div>
                </button>
                <div className="border-t border-gray-100" />
                <button
                  type="button"
                  onClick={() => {
                    onPrintThermal(invoice);
                    setShowPrintMenu(false);
                  }}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-slate-50 transition"
                >
                  <Printer size={14} />
                  <div className="text-left">
                    <p className="font-medium">Ticket thermique</p>
                    <p className="text-xs text-gray-400">
                      Imprimante de caisse 80mm
                    </p>
                  </div>
                </button>
              </div>
            )}
          </div>
          {canEdit && (
            <button
              type="button"
              onClick={() => onEdit(invoice)}
              className="flex items-center gap-2 rounded-xl border border-gray-300 px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Pencil size={15} /> Modifier
            </button>
          )}
          {invoice.status !== "PAID" && (
            <button
              type="button"
              onClick={() => onPay(invoice)}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
            >
              <CreditCard size={15} /> Paiement
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-gray-300 px-5 py-2.5 text-sm text-gray-700 hover:bg-gray-50"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}
