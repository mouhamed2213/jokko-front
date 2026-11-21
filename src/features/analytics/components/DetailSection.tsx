import {
  AlertTriangle,
  BarChart3,
  Boxes,
  CreditCard,
  PackageSearch,
  Users,
  Wallet,
} from "lucide-react";
import { isAdmin } from "../../../types/auth";
import { formatMoney } from "../../../utils/format";
import { type AnalyticsSectionId, readableStatus } from "../constants";
import {
  CashTable,
  EmptyState,
  EntityTable,
  Kpi,
  Pagination,
} from "./AnalyticsPrimitives";
import { InsightsSection } from "./InsightsSection";
import { ProfitAnalyticsSection } from "./ProfitAnalyticsSection";
import { SalesAnalyticsSection } from "./SalesAnalyticsSection";
import { TrendsAnalyticsSection } from "./TrendsAnalyticsSection";

export function DetailSection({
  section,
  detail,
  onNavigate,
  onPageChange,
}: {
  section: Exclude<AnalyticsSectionId, "overview">;
  detail: any;
  onNavigate: (path: string) => void;
  onPageChange: (page: number) => void;
}) {
  if (!detail) return <EmptyState message="Aucune donnée disponible." />;
  if (section === "profit") {
    return (
      <ProfitAnalyticsSection
        detail={detail}
        onNavigate={onNavigate}
        onPageChange={onPageChange}
      />
    );
  }
  if (section === "insights") {
    return (
      <InsightsSection
        insights={detail.insights ?? []}
        pagination={detail.pagination}
        onNavigate={onNavigate}
        onPageChange={onPageChange}
      />
    );
  }
  if (section === "sales") {
    return <SalesAnalyticsSection detail={detail} />;
  }
  if (section === "stock") {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Kpi
            title="Valeur stock"
            value={formatMoney(detail.summary?.totalStockValue ?? 0)}
            icon={<Boxes size={18} />}
          />
          <Kpi
            title="Ruptures"
            value={detail.summary?.outOfStock ?? 0}
            icon={<AlertTriangle size={18} />}
          />
          <Kpi
            title="Stock faible"
            value={detail.summary?.lowStock ?? 0}
            icon={<AlertTriangle size={18} />}
          />
          <Kpi
            title="Dormants"
            value={detail.summary?.dormant ?? 0}
            icon={<PackageSearch size={18} />}
          />
        </div>
        <EntityTable
          rows={detail.products ?? []}
          columns={["productName", "currentStock", "stockValue", "status"]}
          money={["stockValue"]}
        />
        <Pagination pagination={detail.pagination} onPageChange={onPageChange} />
      </div>
    );
  }
  if (section === "products") {
    const canSeeProfit =
      isAdmin() && detail.summary?.totalGrossMargin !== undefined;
    return (
      <div className="space-y-4">
        {canSeeProfit && (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <Kpi
              title="CA Produits"
              value={formatMoney(detail.summary.totalRevenue ?? 0)}
              icon={<BarChart3 size={18} />}
            />
            <Kpi
              title="Coût d'achat (CMV)"
              value={formatMoney(detail.summary.totalCostOfGoodsSold ?? 0)}
              icon={<Boxes size={18} />}
            />
            <Kpi
              title="Bénéfice brut"
              value={formatMoney(detail.summary.totalGrossMargin ?? 0)}
              icon={<Wallet size={18} />}
            />
            <Kpi
              title="Taux de marge"
              value={
                detail.summary.averageMarginRate !== null &&
                detail.summary.averageMarginRate !== undefined
                  ? `${detail.summary.averageMarginRate}%`
                  : "N/D"
              }
              icon={<BarChart3 size={18} />}
            />
          </div>
        )}
        <EntityTable
          rows={detail.products ?? []}
          columns={
            canSeeProfit
              ? [
                  "productName",
                  "soldQuantity",
                  "revenue",
                  "grossMargin",
                  "marginRate",
                  "status",
                ]
              : ["productName", "soldQuantity", "revenue", "status"]
          }
          money={canSeeProfit ? ["revenue", "grossMargin"] : ["revenue"]}
        />
        <Pagination pagination={detail.pagination} onPageChange={onPageChange} />
      </div>
    );
  }
  if (section === "customers") {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Kpi
            title="Nouveaux"
            value={detail.summary?.newCustomers ?? 0}
            icon={<Users size={18} />}
          />
          <Kpi
            title="Actifs"
            value={detail.summary?.activeCustomers ?? 0}
            icon={<Users size={18} />}
          />
          <Kpi
            title="Récurrents"
            value={detail.summary?.recurrentCustomers ?? 0}
            icon={<Users size={18} />}
          />
          <Kpi
            title="Inactifs"
            value={detail.summary?.inactiveCustomers ?? 0}
            icon={<Users size={18} />}
          />
        </div>
        <EntityTable
          rows={detail.customers ?? []}
          columns={[
            "customerName",
            "orderCount",
            "purchasedAmount",
            "receivable",
            "status",
          ]}
          money={["purchasedAmount", "receivable"]}
        />
        <Pagination pagination={detail.pagination} onPageChange={onPageChange} />
      </div>
    );
  }
  if (section === "cash") {
    const byPaymentMethod: Array<{ paymentMethod: string; amount: number }> =
      detail.byPaymentMethod ?? [];
    const maxMethodAbs = Math.max(
      ...byPaymentMethod.map((item) => Math.abs(item.amount)),
      1,
    );
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Kpi
            title="Entrées"
            value={formatMoney(detail.summary?.cashIn ?? 0)}
            icon={<Wallet size={18} />}
          />
          <Kpi
            title="Sorties"
            value={formatMoney(detail.summary?.cashOut ?? 0)}
            icon={<Wallet size={18} />}
          />
          <Kpi
            title="Flux net"
            value={formatMoney(detail.summary?.netCashFlow ?? 0)}
            icon={<BarChart3 size={18} />}
          />
          <Kpi
            title="Encaissé (ventes)"
            value={formatMoney(detail.summary?.commercialCollected ?? 0)}
            icon={<CreditCard size={18} />}
          />
        </div>
        {byPaymentMethod.length > 0 && (
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="mb-3 font-semibold text-slate-900">
              Flux net par mode de paiement
            </h3>
            <div className="space-y-3">
              {byPaymentMethod.map((item) => {
                const pct = Math.round(
                  (Math.abs(item.amount) / maxMethodAbs) * 100,
                );
                const isNegative = item.amount < 0;
                return (
                  <div key={item.paymentMethod}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">
                        {readableStatus(item.paymentMethod)}
                      </span>
                      <span
                        className={`font-semibold ${
                          isNegative ? "text-rose-600" : "text-emerald-700"
                        }`}
                      >
                        {formatMoney(item.amount)}
                      </span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full ${
                          isNegative ? "bg-rose-500" : "bg-emerald-500"
                        }`}
                        style={{ width: `${Math.max(pct, 3)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        <CashTable rows={detail.transactions ?? []} onNavigate={onNavigate} />
        <Pagination pagination={detail.pagination} onPageChange={onPageChange} />
      </div>
    );
  }
  return <TrendsAnalyticsSection detail={detail} />;
}
