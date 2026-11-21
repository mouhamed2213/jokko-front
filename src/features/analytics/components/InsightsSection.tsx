import { insightLabels, readableStatus } from "../constants";
import { EmptyState, Pagination } from "./AnalyticsPrimitives";

export function InsightsSection({
  insights,
  pagination,
  onNavigate,
  onPageChange,
}: {
  insights: any[];
  pagination: any;
  onNavigate: (path: string) => void;
  onPageChange: (page: number) => void;
}) {
  return (
    <div className="space-y-3">
      {insights.length ? (
        insights.map((insight) => (
          <div
            key={`${insight.type}-${insight.message}`}
            className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="font-semibold text-slate-900">{insight.message}</p>
              <p className="mt-1 text-xs text-slate-500">
                {insightLabels[insight.type] ?? readableStatus(insight.type)} ·{" "}
                {readableStatus(insight.severity)}
              </p>
              {insight.type === "SALES_CONCENTRATION" &&
                Array.isArray(insight.context?.products) && (
                  <p className="mt-2 text-sm text-slate-600">
                    Produits concernés :{" "}
                    {insight.context.products
                      .map((product: { productName: string }) => product.productName)
                      .join(", ")}
                  </p>
                )}
            </div>
            {["OUT_OF_STOCK", "LOW_STOCK", "DORMANT_PRODUCTS"].includes(
              insight.type,
            ) && (
              <button
                type="button"
                onClick={() =>
                  onNavigate(
                    insight.type === "DORMANT_PRODUCTS" ? "/products" : "/stock",
                  )
                }
                className="rounded-xl border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
              >
                Voir les produits
              </button>
            )}
            {insight.type === "RECEIVABLES" && (
              <button
                type="button"
                onClick={() => onNavigate("/invoices")}
                className="rounded-xl border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
              >
                Voir les factures
              </button>
            )}
          </div>
        ))
      ) : (
        <EmptyState message="Aucune alerte ni conseil pour ce filtre et cette période." />
      )}
      <Pagination pagination={pagination} onPageChange={onPageChange} />
    </div>
  );
}
