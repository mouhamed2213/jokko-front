import { AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { formatDateTime, formatMoney } from "../../../utils/format";
import { readableStatus } from "../constants";
import { EmptyState, Pagination } from "./AnalyticsPrimitives";
export function ProfitAnalyticsSection({
  detail,
  onNavigate,
  onPageChange,
}: {
  detail: any;
  onNavigate: (path: string) => void;
  onPageChange: (page: number) => void;
}) {
  const [tab, setTab] = useState<"products" | "categories" | "sales" | "expenses">(
    "products",
  );
  const [productPage, setProductPage] = useState(1);
  const [expensePage, setExpensePage] = useState(1);
  const localPageSize = 10;

  useEffect(() => {
    setProductPage(1);
    setExpensePage(1);
  }, [detail]);

  const summary = detail.summary ?? {
    revenue: 0,
    costOfGoodsSold: 0,
    grossProfit: 0,
    marginRate: null,
    operatingExpenses: 0,
    netProfit: 0,
    salesCount: 0,
    itemsCount: 0,
    itemsWithoutCost: 0,
    historicalCostRate: 100,
  };

  const byProduct: Array<{
    productId: number | null;
    productName: string;
    categoryName: string;
    quantitySold: number;
    revenue: number;
    costOfGoodsSold: number;
    grossProfit: number;
    marginRate: number | null;
    profitShare: number | null;
    costSource: "HISTORICAL" | "PRODUCT_PRICE" | "MISSING";
  }> = detail.byProduct ?? [];

  const byCategory: Array<{
    categoryName: string;
    productCount: number;
    quantitySold: number;
    revenue: number;
    costOfGoodsSold: number;
    grossProfit: number;
    marginRate: number | null;
    profitShare: number | null;
  }> = detail.byCategory ?? [];

  const sales: Array<{
    saleId: number;
    invoiceNumber: string;
    createdAt: string;
    customerName: string;
    status: string;
    itemsCount: number;
    revenue: number;
    costOfGoodsSold: number;
    grossProfit: number;
    marginRate: number | null;
    hasMissingCost: boolean;
  }> = detail.sales ?? [];

  const expenses: Array<{
    id: number;
    createdAt: string;
    label: string;
    paymentMethod: string;
    amount: number;
    reference: string | null;
  }> = detail.expenses ?? [];

  const alerts = detail.alerts ?? {
    lossProducts: [],
    lowMarginProducts: [],
    missingCostProducts: [],
  };
  const hasAlerts =
    (alerts.lossProducts?.length ?? 0) > 0 ||
    (alerts.lowMarginProducts?.length ?? 0) > 0 ||
    (alerts.missingCostProducts?.length ?? 0) > 0;

  const productTotalPages = Math.max(1, Math.ceil(byProduct.length / localPageSize));
  const safeProductPage = Math.min(productPage, productTotalPages);
  const pagedProducts = byProduct.slice(
    (safeProductPage - 1) * localPageSize,
    safeProductPage * localPageSize,
  );

  const expenseTotalPages = Math.max(1, Math.ceil(expenses.length / localPageSize));
  const safeExpensePage = Math.min(expensePage, expenseTotalPages);
  const pagedExpenses = expenses.slice(
    (safeExpensePage - 1) * localPageSize,
    safeExpensePage * localPageSize,
  );

  const maxProductProfit = Math.max(
    ...byProduct.map((p) => Math.abs(p.grossProfit)),
    1,
  );
  const maxCategoryProfit = Math.max(
    ...byCategory.map((c) => Math.abs(c.grossProfit)),
    1,
  );

  const costSourceBadge = (source: "HISTORICAL" | "PRODUCT_PRICE" | "MISSING") => {
    if (source === "HISTORICAL") {
      return (
        <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
          Entrée stock
        </span>
      );
    }
    if (source === "PRODUCT_PRICE") {
      return (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
          Fiche produit
        </span>
      );
    }
    return (
      <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
        Prix d'achat manquant
      </span>
    );
  };

  return (
    <div className="space-y-5">
      {/* 1. Cascade transparente du bénéfice */}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="font-semibold text-slate-900">
              Origine de vos bénéfices
            </h2>
            <p className="text-xs text-slate-500">
              Décomposition exacte sur {summary.salesCount} vente(s) non annulée(s) ·{" "}
              {summary.historicalCostRate}% des lignes basées sur le coût d'entrée en stock
            </p>
          </div>
          {summary.marginRate !== null && summary.marginRate !== undefined && (
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              Taux de marge global : {summary.marginRate}%
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500">
              1. Chiffre d'affaires
            </p>
            <p className="mt-1 text-lg font-bold text-slate-900">
              {formatMoney(summary.revenue)}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Total facturé (hors annulées)
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500">
              2. − Coût d'achat (CMV)
            </p>
            <p className="mt-1 text-lg font-bold text-slate-900">
              − {formatMoney(summary.costOfGoodsSold)}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Coût des marchandises vendues
            </p>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
            <p className="text-xs font-medium text-emerald-700">
              3. = Bénéfice brut
            </p>
            <p className="mt-1 text-lg font-bold text-emerald-950">
              {formatMoney(summary.grossProfit)}
            </p>
            <p className="mt-1 text-[11px] text-emerald-700/80">
              {summary.marginRate !== null ? `Marge de ${summary.marginRate}%` : "Aucune vente"}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-500">
              4. − Autres dépenses
            </p>
            <p className="mt-1 text-lg font-bold text-slate-900">
              − {formatMoney(summary.operatingExpenses)}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              {expenses.length} sortie(s) caisse hors fournisseurs
            </p>
          </div>
          <div
            className={`rounded-xl border p-4 ${
              summary.netProfit >= 0
                ? "border-emerald-300 bg-white"
                : "border-rose-200 bg-rose-50/60"
            }`}
          >
            <p className="text-xs font-medium text-slate-600">
              5. = Résultat net
            </p>
            <p
              className={`mt-1 text-lg font-bold ${
                summary.netProfit >= 0 ? "text-emerald-700" : "text-rose-700"
              }`}
            >
              {formatMoney(summary.netProfit)}
            </p>
            <p className="mt-1 text-[11px] text-slate-500">
              Bénéfice brut − autres dépenses
            </p>
          </div>
        </div>

        {summary.itemsWithoutCost > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
            <span className="flex items-center gap-2">
              <AlertTriangle size={14} className="shrink-0 text-amber-600" />
              <span>
                <strong>{summary.itemsWithoutCost} ligne(s) vendue(s)</strong> n'avaient pas de prix d'achat renseigné (0 FCFA). Complétez-les dans votre catalogue pour garantir un bénéfice exact au franc près.
              </span>
            </span>
            <button
              type="button"
              onClick={() => onNavigate("/products")}
              className="rounded-lg border border-amber-300 bg-white px-3 py-1.5 font-semibold text-amber-800 hover:bg-amber-100"
            >
              Compléter les prix d'achat
            </button>
          </div>
        )}
      </div>

      {/* 2. Points d'attention actionnables */}
      {hasAlerts && (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {alerts.lossProducts.length > 0 && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-4">
              <p className="text-xs font-semibold uppercase text-rose-700">
                Vendus à perte ({alerts.lossProducts.length})
              </p>
              <ul className="mt-2 space-y-1.5 text-xs text-rose-900">
                {alerts.lossProducts.slice(0, 4).map((p: any) => (
                  <li key={`${p.productId}-${p.productName}`} className="flex justify-between gap-2">
                    <span className="truncate font-medium">{p.productName}</span>
                    <span className="shrink-0 font-bold">{formatMoney(p.grossProfit)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {alerts.lowMarginProducts.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4">
              <p className="text-xs font-semibold uppercase text-amber-700">
                Marge faible &lt; 10% ({alerts.lowMarginProducts.length})
              </p>
              <ul className="mt-2 space-y-1.5 text-xs text-amber-900">
                {alerts.lowMarginProducts.slice(0, 4).map((p: any) => (
                  <li key={`${p.productId}-${p.productName}`} className="flex justify-between gap-2">
                    <span className="truncate font-medium">{p.productName}</span>
                    <span className="shrink-0 font-bold">{p.marginRate}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {alerts.missingCostProducts.length > 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase text-slate-600">
                Prix d'achat à renseigner ({alerts.missingCostProducts.length})
              </p>
              <ul className="mt-2 space-y-1.5 text-xs text-slate-700">
                {alerts.missingCostProducts.slice(0, 4).map((p: any) => (
                  <li key={`${p.productId}-${p.productName}`} className="flex justify-between gap-2">
                    <span className="truncate font-medium">{p.productName}</span>
                    <span className="shrink-0 text-amber-700">CA {formatMoney(p.revenue)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 3. Sous-onglets de traçabilité */}
      <div className="rounded-2xl bg-white p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex flex-wrap rounded-xl bg-slate-100 p-1 text-xs font-semibold">
            {(
              [
                { id: "products", label: `Par produit (${byProduct.length})` },
                { id: "categories", label: `Par catégorie (${byCategory.length})` },
                { id: "sales", label: `Par vente (${detail.salesPagination?.total ?? sales.length})` },
                { id: "expenses", label: `Dépenses déduites (${expenses.length})` },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTab(opt.id)}
                className={`rounded-lg px-3 py-1.5 transition ${
                  tab === opt.id
                    ? "bg-white text-emerald-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {tab === "products" && (
          !byProduct.length ? (
            <EmptyState message="Aucune vente sur cette période." />
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
                    <tr>
                      <th className="py-2.5 pr-3">Produit</th>
                      <th className="py-2.5 px-3 text-center">Qté</th>
                      <th className="py-2.5 px-3 text-right">CA</th>
                      <th className="py-2.5 px-3 text-right">Coût d'achat</th>
                      <th className="py-2.5 px-3">Bénéfice brut</th>
                      <th className="py-2.5 px-3 text-center">Marge</th>
                      <th className="py-2.5 pl-3 text-right">Source du coût</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pagedProducts.map((p) => {
                      const pct = Math.round(
                        (Math.abs(p.grossProfit) / maxProductProfit) * 100,
                      );
                      const isLoss = p.grossProfit < 0;
                      return (
                        <tr key={`${p.productId ?? "deleted"}-${p.productName}`} className="hover:bg-slate-50/60">
                          <td className="py-2.5 pr-3">
                            <p className="font-semibold text-slate-800">{p.productName}</p>
                            <p className="text-xs text-slate-400">{p.categoryName}</p>
                          </td>
                          <td className="py-2.5 px-3 text-center text-slate-600">
                            {p.quantitySold}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-700 whitespace-nowrap">
                            {formatMoney(p.revenue)}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-500 whitespace-nowrap">
                            {formatMoney(p.costOfGoodsSold)}
                          </td>
                          <td className="py-2.5 px-3 min-w-48">
                            <div className="flex items-center gap-2">
                              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                                <div
                                  className={`h-full rounded-full ${
                                    isLoss ? "bg-rose-500" : "bg-emerald-500"
                                  }`}
                                  style={{ width: `${Math.max(pct, 3)}%` }}
                                />
                              </div>
                              <span
                                className={`font-semibold whitespace-nowrap ${
                                  isLoss ? "text-rose-600" : "text-emerald-700"
                                }`}
                              >
                                {formatMoney(p.grossProfit)}
                              </span>
                              {p.profitShare !== null && (
                                <span className="text-xs text-slate-400 whitespace-nowrap">
                                  ({p.profitShare}%)
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            {p.marginRate === null ? "—" : `${p.marginRate}%`}
                          </td>
                          <td className="py-2.5 pl-3 text-right whitespace-nowrap">
                            {costSourceBadge(p.costSource)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <Pagination
                pagination={{
                  page: safeProductPage,
                  totalPages: productTotalPages,
                  total: byProduct.length,
                }}
                onPageChange={setProductPage}
              />
            </div>
          )
        )}

        {tab === "categories" && (
          !byCategory.length ? (
            <EmptyState message="Aucune catégorie vendue sur cette période." />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="py-2.5 pr-3">Catégorie</th>
                    <th className="py-2.5 px-3 text-center">Produits</th>
                    <th className="py-2.5 px-3 text-right">CA</th>
                    <th className="py-2.5 px-3 text-right">Coût d'achat</th>
                    <th className="py-2.5 px-3">Bénéfice brut</th>
                    <th className="py-2.5 pl-3 text-center">Marge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {byCategory.map((c) => {
                    const pct = Math.round(
                      (Math.abs(c.grossProfit) / maxCategoryProfit) * 100,
                    );
                    const isLoss = c.grossProfit < 0;
                    return (
                      <tr key={c.categoryName} className="hover:bg-slate-50/60">
                        <td className="py-2.5 pr-3 font-semibold text-slate-800">
                          {c.categoryName}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-600">
                          {c.productCount}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-700 whitespace-nowrap">
                          {formatMoney(c.revenue)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-500 whitespace-nowrap">
                          {formatMoney(c.costOfGoodsSold)}
                        </td>
                        <td className="py-2.5 px-3 min-w-48">
                          <div className="flex items-center gap-2">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className={`h-full rounded-full ${
                                  isLoss ? "bg-rose-500" : "bg-emerald-500"
                                }`}
                                style={{ width: `${Math.max(pct, 3)}%` }}
                              />
                            </div>
                            <span
                              className={`font-semibold whitespace-nowrap ${
                                isLoss ? "text-rose-600" : "text-emerald-700"
                              }`}
                            >
                              {formatMoney(c.grossProfit)}
                            </span>
                            {c.profitShare !== null && (
                              <span className="text-xs text-slate-400 whitespace-nowrap">
                                ({c.profitShare}%)
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 pl-3 text-center whitespace-nowrap">
                          {c.marginRate === null ? "—" : `${c.marginRate}%`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        )}

        {tab === "sales" && (
          !sales.length ? (
            <EmptyState message="Aucune vente enregistrée sur cette période." />
          ) : (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
                    <tr>
                      <th className="py-2.5 pr-3">Facture</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Client</th>
                      <th className="py-2.5 px-3 text-right">Montant</th>
                      <th className="py-2.5 px-3 text-right">Coût d'achat</th>
                      <th className="py-2.5 px-3 text-right">Bénéfice brut</th>
                      <th className="py-2.5 pl-3 text-center">Marge</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {sales.map((s) => (
                      <tr key={s.saleId} className="hover:bg-slate-50/60">
                        <td className="py-2.5 pr-3 font-semibold text-slate-800 whitespace-nowrap">
                          {s.invoiceNumber}
                          {s.hasMissingCost && (
                            <span
                              title="Un ou plusieurs articles de cette vente n'avaient pas de prix d'achat"
                              className="ml-1.5 inline-flex align-middle text-amber-600"
                            >
                              <AlertTriangle size={13} />
                            </span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">
                          {formatDateTime(s.createdAt)}
                        </td>
                        <td className="py-2.5 px-3 text-slate-700">
                          {s.customerName}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-700 whitespace-nowrap">
                          {formatMoney(s.revenue)}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-500 whitespace-nowrap">
                          {formatMoney(s.costOfGoodsSold)}
                        </td>
                        <td
                          className={`py-2.5 px-3 text-right font-semibold whitespace-nowrap ${
                            s.grossProfit < 0 ? "text-rose-600" : "text-emerald-700"
                          }`}
                        >
                          {formatMoney(s.grossProfit)}
                        </td>
                        <td className="py-2.5 pl-3 text-center whitespace-nowrap">
                          {s.marginRate === null ? "—" : `${s.marginRate}%`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Pagination
                pagination={detail.salesPagination}
                onPageChange={onPageChange}
              />
            </div>
          )
        )}

        {tab === "expenses" && (
          <div className="space-y-3">
            <p className="rounded-xl bg-slate-50 px-3.5 py-2.5 text-xs text-slate-600">
              Seules les sorties de caisse de fonctionnement (loyer, transport, électricité, frais divers…) apparaissent ici. Les paiements fournisseurs sont déjà comptés dans le <strong>Coût d'achat (CMV)</strong> pour éviter de les déduire deux fois.
            </p>
            {!expenses.length ? (
              <EmptyState message="Aucune autre dépense de caisse déduite sur cette période." />
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full text-left text-sm">
                    <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
                      <tr>
                        <th className="py-2.5 pr-3">Date</th>
                        <th className="py-2.5 px-3">Libellé</th>
                        <th className="py-2.5 px-3">Mode de paiement</th>
                        <th className="py-2.5 pl-3 text-right">Montant déduit</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {pagedExpenses.map((e) => (
                        <tr key={e.id} className="hover:bg-slate-50/60">
                          <td className="py-2.5 pr-3 text-slate-600 whitespace-nowrap">
                            {formatDateTime(e.createdAt)}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-800">
                            {e.label}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600">
                            {readableStatus(e.paymentMethod)}
                          </td>
                          <td className="py-2.5 pl-3 text-right font-semibold text-rose-600 whitespace-nowrap">
                            − {formatMoney(e.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Pagination
                  pagination={{
                    page: safeExpensePage,
                    totalPages: expenseTotalPages,
                    total: expenses.length,
                  }}
                  onPageChange={setExpensePage}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
