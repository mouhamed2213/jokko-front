import type React from "react";
import { isAdmin } from "../../../types/auth";
import { formatDateTime, formatMoney } from "../../../utils/format";
import {
  type AnalyticsSectionId,
  cashCategoryLabels,
  columnLabels,
  readableStatus,
} from "../constants";

export function Kpi({
  title,
  value,
  icon,
}: {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-500">{title}</p>
          <p className="mt-1 text-lg font-bold text-slate-900">{value}</p>
        </div>
        <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700">
          {icon}
        </div>
      </div>
    </div>
  );
}

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl bg-white p-8 text-center text-sm text-slate-400">
      {message}
    </div>
  );
}

export function Pagination({
  pagination,
  onPageChange,
}: {
  pagination?: { page: number; totalPages: number; total: number };
  onPageChange: (page: number) => void;
}) {
  if (!pagination || pagination.totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between rounded-xl bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
      <span>{pagination.total} résultat(s)</span>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={pagination.page <= 1}
          onClick={() => onPageChange(pagination.page - 1)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Précédent
        </button>
        <span>
          Page {pagination.page} / {pagination.totalPages}
        </span>
        <button
          type="button"
          disabled={pagination.page >= pagination.totalPages}
          onClick={() => onPageChange(pagination.page + 1)}
          className="rounded-lg border border-slate-200 px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}

export function AnalyticsFilters({
  section,
  filters,
  onChange,
}: {
  section: AnalyticsSectionId;
  filters: Record<string, string>;
  onChange: (key: string, value: string) => void;
}) {
  const select = (
    key: string,
    label: string,
    options: Array<[string, string]>,
  ) => (
    <label key={key} className="text-xs font-medium text-slate-500">
      {label}
      <select
        value={filters[key] ?? ""}
        onChange={(event) => onChange(key, event.target.value)}
        className="mt-1 block rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
      >
        <option value="">Tous</option>
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );

  const controls =
    section === "products"
      ? [
          select("status", "Statut", [
            ["NEW", "Nouveau"],
            ["FAST", "Rotation rapide"],
            ["SLOW", "Rotation lente"],
            ["REGULAR", "Rotation normale"],
            ["DORMANT", "Dormant"],
          ]),
          select("stockStatus", "État du stock", [
            ["IN_STOCK", "En stock"],
            ["LOW_STOCK", "Stock faible"],
            ["OUT_OF_STOCK", "Rupture"],
          ]),
          ...(isAdmin()
            ? [
                select("costSource", "Coût", [
                  ["HISTORICAL", "Historique"],
                  ["ESTIMATED", "Estimé"],
                ]),
              ]
            : []),
        ]
      : section === "stock"
        ? [
            select("status", "Statut", [
              ["NEW", "Nouveau"],
              ["FAST", "Rotation rapide"],
              ["SLOW", "Rotation lente"],
              ["REGULAR", "Rotation normale"],
              ["DORMANT", "Dormant"],
            ]),
            select("stockStatus", "État du stock", [
              ["IN_STOCK", "En stock"],
              ["LOW_STOCK", "Stock faible"],
              ["OUT_OF_STOCK", "Rupture"],
            ]),
          ]
        : section === "customers"
          ? [
              select("status", "Statut client", [
                ["NEW", "Nouveau"],
                ["ACTIVE", "Actif"],
                ["INACTIVE", "Inactif"],
              ]),
              select("recurrent", "Fidélité", [
                ["true", "Récurrent"],
                ["false", "Non récurrent"],
              ]),
            ]
          : section === "cash"
            ? [
                select("type", "Flux", [
                  ["IN", "Entrées"],
                  ["OUT", "Sorties"],
                ]),
                select("category", "Catégorie", [
                  ["SALE_PAYMENT", "Paiement vente"],
                  ["SUPPLIER_DEPOSIT", "Acompte fournisseur"],
                  ["SUPPLIER_PAYMENT", "Paiement fournisseur"],
                  ["PAYMENT_REVERSAL", "Annulation"],
                ]),
              ]
            : section === "insights"
              ? [
                  select("severity", "Sévérité", [
                    ["POSITIVE", "Positive"],
                    ["INFO", "Information"],
                    ["WARNING", "Alerte"],
                  ]),
                  select("type", "Type", [
                    ["REVENUE_GROWTH", "Hausse du CA"],
                    ["REVENUE_DECLINE", "Baisse du CA"],
                    ["OUT_OF_STOCK", "Rupture"],
                    ["LOW_STOCK", "Stock faible"],
                    ["DORMANT_PRODUCTS", "Produits dormants"],
                    ["SALES_CONCENTRATION", "Concentration"],
                    ["RECEIVABLES", "Créances"],
                  ]),
                ]
              : [];

  if (!controls.length) return null;
  return (
    <div className="flex flex-wrap items-end gap-3 rounded-2xl bg-slate-50 p-4">
      {controls}
    </div>
  );
}

export function CashTable({
  rows,
  onNavigate,
}: {
  rows: Array<{
    createdAt: string;
    type: string;
    paymentMethod: string;
    amount: number;
    label: string;
    reference?: string | null;
    category?: string;
    target?: { path: string; reference: string | null } | null;
  }>;
  onNavigate: (path: string) => void;
}) {
  if (!rows.length) {
    return (
      <EmptyState message="Aucun mouvement de trésorerie pour cette période." />
    );
  }
  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
          <tr>
            <th className="px-4 py-3">Date</th>
            <th className="px-4 py-3">Nature</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Mode de paiement</th>
            <th className="px-4 py-3">Montant</th>
            <th className="px-4 py-3">Détail</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={`${row.createdAt}-${row.reference ?? index}`}
              className="border-b border-slate-50 last:border-0"
            >
              <td className="px-4 py-3 text-slate-700">
                {formatDateTime(row.createdAt)}
              </td>
              <td className="px-4 py-3 text-slate-700">
                {cashCategoryLabels[row.category ?? "OTHER"] ??
                  "Autre mouvement"}
              </td>
              <td className="px-4 py-3 text-slate-700">
                {readableStatus(row.type)}
              </td>
              <td className="px-4 py-3 text-slate-700">
                {readableStatus(row.paymentMethod)}
              </td>
              <td className="px-4 py-3 font-medium text-slate-700">
                {formatMoney(row.amount)}
              </td>
              <td className="px-4 py-3">
                {row.target ? (
                  <button
                    type="button"
                    onClick={() => onNavigate(row.target!.path)}
                    className="text-left text-emerald-700 hover:underline"
                  >
                    {row.label}
                  </button>
                ) : (
                  <span className="text-slate-700">{row.label}</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function EntityTable({
  rows,
  columns,
  money = [],
}: {
  rows: any[];
  columns: string[];
  money?: string[];
}) {
  if (!rows.length) {
    return <EmptyState message="Aucune donnée disponible pour cette période." />;
  }
  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
          <tr>
            {columns.map((column) => (
              <th key={column} className="px-4 py-3">
                {columnLabels[column] ?? column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={row.id ?? row.productId ?? row.customerId ?? index}
              className="border-b border-slate-50 last:border-0"
            >
              {columns.map((column) => (
                <td key={column} className="px-4 py-3 text-slate-700">
                  {money.includes(column)
                    ? formatMoney(Number(row[column] ?? 0))
                    : column === "marginRate"
                      ? row[column] === null || row[column] === undefined
                        ? "—"
                        : `${row[column]}%`
                      : column.toLowerCase().includes("date")
                        ? formatDateTime(row[column])
                        : column === "status" ||
                            column === "type" ||
                            column === "severity"
                          ? readableStatus(row[column])
                          : String(row[column] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
