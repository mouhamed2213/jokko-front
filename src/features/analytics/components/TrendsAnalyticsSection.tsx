import { BarChart3, CreditCard } from "lucide-react";
import { useState } from "react";
import { Bar } from "react-chartjs-2";
import { formatMoney } from "../../../utils/format";
import { EmptyState, EntityTable, Kpi } from "./AnalyticsPrimitives";

export function TrendsAnalyticsSection({ detail }: { detail: any }) {
  const [viewMode, setViewMode] = useState<"bars" | "table">(() => {
    const saved = localStorage.getItem("jokko.analytics.trendsView");
    return saved === "bars" || saved === "table" ? saved : "bars";
  });

  const changeViewMode = (mode: "bars" | "table") => {
    setViewMode(mode);
    localStorage.setItem("jokko.analytics.trendsView", mode);
  };

  const byWeekday: Array<{
    weekday: number;
    day: string;
    revenue: number;
    salesCount: number;
    collected: number;
    quantitySold: number;
    averageBasket: number;
  }> = detail.byWeekday ?? [];

  const topRevenueDay = detail.topRevenueDay;
  const mostActiveDay = detail.mostActiveDay;

  return (
    <div className="space-y-4">
      {(topRevenueDay || mostActiveDay) && (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Kpi
            title="Meilleur jour en CA"
            value={
              topRevenueDay && topRevenueDay.revenue > 0
                ? `${topRevenueDay.day} · ${formatMoney(topRevenueDay.revenue)}`
                : "Aucune vente"
            }
            icon={<BarChart3 size={18} />}
          />
          <Kpi
            title="Jour le plus actif"
            value={
              mostActiveDay && mostActiveDay.salesCount > 0
                ? `${mostActiveDay.day} · ${mostActiveDay.salesCount} vente(s)`
                : "Aucune vente"
            }
            icon={<CreditCard size={18} />}
          />
        </div>
      )}

      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-semibold text-slate-900">
              Performance par jour de la semaine
            </h3>
            <p className="text-xs text-slate-500">
              Chiffre d'affaires et montants encaissés selon les jours d'activité
            </p>
          </div>
          <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
            {(
              [
                { id: "bars", label: "Barres" },
                { id: "table", label: "Tableau" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => changeViewMode(opt.id)}
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

        {!byWeekday.length ? (
          <EmptyState message="Aucune donnée de tendance pour cette période." />
        ) : viewMode === "bars" ? (
          <Bar
            data={{
              labels: byWeekday.map((row) => row.day),
              datasets: [
                {
                  label: "Chiffre d'affaires",
                  data: byWeekday.map((row) => row.revenue),
                  backgroundColor: "#059669",
                  borderRadius: 6,
                },
                {
                  label: "Encaissé",
                  data: byWeekday.map((row) => row.collected),
                  backgroundColor: "#94a3b8",
                  borderRadius: 6,
                },
              ],
            }}
            options={{
              responsive: true,
              plugins: {
                legend: { display: true, position: "bottom" },
                tooltip: {
                  callbacks: {
                    label: (ctx) =>
                      `${ctx.dataset.label}: ${formatMoney(Number(ctx.parsed.y ?? 0))}`,
                  },
                },
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: (value) =>
                      `${Number(value).toLocaleString("fr-FR")}`,
                  },
                },
              },
            }}
          />
        ) : (
          <EntityTable
            rows={byWeekday}
            columns={[
              "day",
              "salesCount",
              "revenue",
              "collected",
              "quantitySold",
              "averageBasket",
            ]}
            money={["revenue", "collected", "averageBasket"]}
          />
        )}
      </div>
    </div>
  );
}
