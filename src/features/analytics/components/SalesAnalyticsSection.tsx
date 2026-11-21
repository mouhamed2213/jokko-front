import { useEffect, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import { formatMoney } from "../../../utils/format";
import { EmptyState, Pagination } from "./AnalyticsPrimitives";

export function SalesAnalyticsSection({ detail }: { detail: any }) {
  const [viewMode, setViewMode] = useState<"bars" | "summary" | "line">(() => {
    const saved = localStorage.getItem("analytics_sales_chart_mode");
    return saved === "summary" || saved === "line" || saved === "bars"
      ? saved
      : "bars";
  });

  const changeMode = (mode: "bars" | "summary" | "line") => {
    setViewMode(mode);
    localStorage.setItem("analytics_sales_chart_mode", mode);
  };

  const timeline: Array<{
    bucket: string;
    revenue: number;
    salesCount: number;
    collected: number;
    remaining: number;
  }> = detail.timeline ?? [];
  const granularity: string = detail.granularity ?? "day";
  const topProducts: Array<{
    productId: number | null;
    productName: string;
    quantity: number;
    revenue: number;
  }> = detail.topProductsByRevenue ?? [];

  const formatBucketLabel = (bucket: string) => {
    const date = new Date(bucket);
    if (granularity === "hour") {
      return date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    if (granularity === "month") {
      return date.toLocaleDateString("fr-FR", {
        month: "short",
        year: "numeric",
      });
    }
    return date.toLocaleDateString("fr-FR");
  };

  const labels = timeline.map((row) => formatBucketLabel(row.bucket));
  const totalRevenue = timeline.reduce((sum, r) => sum + (r.revenue || 0), 0);
  const totalSales = timeline.reduce((sum, r) => sum + (r.salesCount || 0), 0);
  const bestRow = timeline.reduce<(typeof timeline)[number] | null>(
    (best, row) => (!best || row.revenue > best.revenue ? row : best),
    null,
  );
  const maxRowRevenue = Math.max(...timeline.map((r) => r.revenue || 0), 1);

  const summaryPageSize = 10;
  const [summaryPage, setSummaryPage] = useState(1);
  const summaryTotalPages = Math.max(
    1,
    Math.ceil(timeline.length / summaryPageSize),
  );
  const safeSummaryPage = Math.min(summaryPage, summaryTotalPages);
  const pagedTimeline = timeline.slice(
    (safeSummaryPage - 1) * summaryPageSize,
    safeSummaryPage * summaryPageSize,
  );

  useEffect(() => {
    setSummaryPage(1);
  }, [detail]);

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { display: true, position: "top" as const },
      tooltip: {
        callbacks: {
          label: (ctx: any) =>
            `${ctx.dataset.label}: ${formatMoney(Number(ctx.raw) || 0)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) =>
            `${Number(value).toLocaleString("fr-FR")} F`,
        },
      },
    },
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-semibold text-slate-900">
              Évolution des ventes
            </h2>
            <p className="text-xs text-slate-500">
              Chiffre d'affaires et montants encaissés sur la période (données
              réelles)
            </p>
          </div>
          <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
            {(
              [
                { id: "bars", label: "Barres" },
                { id: "summary", label: "Synthèse" },
                { id: "line", label: "Courbe" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => changeMode(opt.id)}
                className={`rounded-lg px-3 py-1.5 transition ${
                  viewMode === opt.id
                    ? "bg-white text-emerald-700 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {!timeline.length ? (
          <EmptyState message="Aucune vente sur cette période." />
        ) : viewMode === "summary" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3.5">
                <p className="text-xs text-emerald-700">
                  Total CA sur la période
                </p>
                <p className="mt-1 text-lg font-bold text-emerald-950">
                  {formatMoney(totalRevenue)}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                <p className="text-xs text-slate-500">Nombre de ventes</p>
                <p className="mt-1 text-lg font-bold text-slate-900">
                  {totalSales} vente{totalSales > 1 ? "s" : ""}
                </p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5">
                <p className="text-xs text-slate-500">Meilleur pic</p>
                <p className="mt-1 text-sm font-bold text-slate-900">
                  {bestRow
                    ? `${formatBucketLabel(bestRow.bucket)} · ${formatMoney(bestRow.revenue)}`
                    : "—"}
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="py-2.5 pr-3">Période</th>
                    <th className="py-2.5 px-3 text-center">Ventes</th>
                    <th className="py-2.5 px-3">Chiffre d'affaires</th>
                    <th className="py-2.5 px-3 text-right">Encaissé</th>
                    <th className="py-2.5 pl-3 text-right">Reste dû</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pagedTimeline.map((row) => {
                    const pct = Math.round((row.revenue / maxRowRevenue) * 100);
                    return (
                      <tr key={row.bucket} className="hover:bg-slate-50/60">
                        <td className="py-2.5 pr-3 font-medium text-slate-700 whitespace-nowrap">
                          {formatBucketLabel(row.bucket)}
                        </td>
                        <td className="py-2.5 px-3 text-center text-slate-600">
                          {row.salesCount}
                        </td>
                        <td className="py-2.5 px-3 min-w-44">
                          <div className="flex items-center gap-2">
                            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-emerald-500"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <span className="font-semibold text-slate-900 whitespace-nowrap">
                              {formatMoney(row.revenue)}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right text-emerald-700 font-medium whitespace-nowrap">
                          {formatMoney(row.collected)}
                        </td>
                        <td
                          className={`py-2.5 pl-3 text-right font-medium whitespace-nowrap ${
                            row.remaining > 0
                              ? "text-amber-600"
                              : "text-slate-400"
                          }`}
                        >
                          {formatMoney(row.remaining)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <Pagination
              pagination={{
                page: safeSummaryPage,
                totalPages: summaryTotalPages,
                total: timeline.length,
              }}
              onPageChange={setSummaryPage}
            />
          </div>
        ) : viewMode === "bars" ? (
          <Bar
            data={{
              labels,
              datasets: [
                {
                  label: "Chiffre d'affaires",
                  data: timeline.map((row) => row.revenue),
                  backgroundColor: "#059669",
                  borderRadius: 6,
                },
                {
                  label: "Encaissé",
                  data: timeline.map((row) => row.collected),
                  backgroundColor: "#94a3b8",
                  borderRadius: 6,
                },
              ],
            }}
            options={chartOptions}
          />
        ) : (
          <Line
            data={{
              labels,
              datasets: [
                {
                  label: "Chiffre d'affaires",
                  data: timeline.map((row) => row.revenue),
                  borderColor: "#059669",
                  backgroundColor: "rgba(5, 150, 105, 0.12)",
                  fill: true,
                  tension: 0.3,
                },
                {
                  label: "Encaissé",
                  data: timeline.map((row) => row.collected),
                  borderColor: "#64748b",
                  borderDash: [5, 5],
                  fill: false,
                  tension: 0.3,
                },
              ],
            }}
            options={chartOptions}
          />
        )}
      </div>

      {topProducts.length > 0 && (
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="mb-3 font-semibold text-slate-900">
            Top produits par chiffre d'affaires
          </h3>
          <div className="divide-y divide-slate-100">
            {topProducts.map((p, idx) => (
              <div
                key={`${p.productId ?? p.productName}-${idx}`}
                className="flex items-center justify-between py-2.5 text-sm"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700">
                    {idx + 1}
                  </span>
                  <span className="truncate font-medium text-slate-800">
                    {p.productName}
                  </span>
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-xs text-slate-500">
                    {p.quantity} pcs
                  </span>
                  <span className="font-bold text-emerald-700">
                    {formatMoney(p.revenue)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
