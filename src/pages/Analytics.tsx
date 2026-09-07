import {
  AlertTriangle,
  BarChart3,
  Boxes,
  CreditCard,
  Lightbulb,
  PackageSearch,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  Bar,
  Line,
} from "react-chartjs-2";
import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  BarElement,
  PointElement,
  Tooltip,
} from "chart.js";
import {
  getAnalyticsCash,
  getAnalyticsCustomers,
  getAnalyticsInsights,
  getAnalyticsOverview,
  getAnalyticsProducts,
  getAnalyticsSales,
  getAnalyticsStock,
  getAnalyticsTrends,
  type AnalyticsOverview,
} from "../services";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
  Filler,
);

type Section =
  | "overview"
  | "sales"
  | "products"
  | "stock"
  | "customers"
  | "cash"
  | "trends"
  | "insights";

const sections: Array<{ id: Section; label: string; icon: React.ReactNode }> = [
  { id: "overview", label: "Vue générale", icon: <BarChart3 size={16} /> },
  { id: "sales", label: "Ventes", icon: <CreditCard size={16} /> },
  { id: "products", label: "Produits", icon: <PackageSearch size={16} /> },
  { id: "stock", label: "Stock", icon: <Boxes size={16} /> },
  { id: "customers", label: "Clients", icon: <Users size={16} /> },
  { id: "cash", label: "Trésorerie", icon: <Wallet size={16} /> },
  { id: "trends", label: "Tendances", icon: <BarChart3 size={16} /> },
  { id: "insights", label: "Insights", icon: <Lightbulb size={16} /> },
];

const formatMoney = (value: number) => `${value.toLocaleString("fr-FR")} FCFA`;
const defaultEnd = new Date().toISOString().slice(0, 10);
const defaultStart = new Date(Date.now() - 29 * 86400000)
  .toISOString()
  .slice(0, 10);

function Kpi({
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
        <div className="rounded-xl bg-emerald-50 p-2 text-emerald-700">{icon}</div>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <div className="rounded-2xl bg-white p-8 text-center text-sm text-slate-400">{message}</div>;
}

export default function Analytics() {
  const [section, setSection] = useState<Section>("overview");
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const params = useMemo(() => ({ startDate, endDate, limit: 50 }), [startDate, endDate]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      if (section === "overview") {
        setData(await getAnalyticsOverview({ ...params, compare: true }));
        setDetail(null);
      } else {
        const loaders: Record<Exclude<Section, "overview">, () => Promise<any>> = {
          sales: () => getAnalyticsSales(params),
          products: () => getAnalyticsProducts(params),
          stock: () => getAnalyticsStock(params),
          customers: () => getAnalyticsCustomers(params),
          cash: () => getAnalyticsCash(params),
          trends: () => getAnalyticsTrends(params),
          insights: () => getAnalyticsInsights(params),
        };
        setDetail(await loaders[section]());
      }
    } catch {
      setError("Impossible de charger cette analyse.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [section]);

  const overviewChart = data
    ? {
        labels: ["Période sélectionnée", "Période précédente"],
        datasets: [
          {
            label: "Chiffre d'affaires",
            data: [
              data.kpis.revenue,
              data.comparison?.revenueChange === null
                ? 0
                : data.kpis.revenue / (1 + (data.comparison?.revenueChange ?? 0) / 100),
            ],
            borderColor: "#059669",
            backgroundColor: "rgba(5, 150, 105, 0.12)",
            fill: true,
            tension: 0.35,
          },
        ],
      }
    : null;

  return (
    <section className="space-y-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-medium text-emerald-600">Pilotage approfondi</p>
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="mt-1 text-sm text-slate-500">
            Analysez vos résultats au lieu de simplement consulter vos indicateurs opérationnels.
          </p>
        </div>
        <form
          className="flex flex-wrap items-end gap-2"
          onSubmit={(event) => {
            event.preventDefault();
            load();
          }}
        >
          <label className="text-xs font-medium text-slate-500">
            Du
            <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="mt-1 block rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
          </label>
          <label className="text-xs font-medium text-slate-500">
            Au
            <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="mt-1 block rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
          </label>
          <button className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Actualiser</button>
        </form>
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-slate-200 pb-2">
        {sections.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setSection(item.id)}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${
              section === item.id ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {loading ? (
        <EmptyState message="Chargement de l'analyse..." />
      ) : section === "overview" ? (
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <Kpi title="CA de la période" value={formatMoney(data?.kpis.revenue ?? 0)} icon={<BarChart3 size={18} />} />
            <Kpi title="Ventes" value={data?.kpis.salesCount ?? 0} icon={<CreditCard size={18} />} />
            <Kpi title="Panier moyen" value={formatMoney(data?.kpis.averageBasket ?? 0)} icon={<Wallet size={18} />} />
            <Kpi title="Variation CA" value={data?.comparison?.revenueChange === null || data?.comparison?.revenueChange === undefined ? "N/D" : `${data.comparison.revenueChange >= 0 ? "+" : ""}${data.comparison.revenueChange}%`} icon={<BarChart3 size={18} />} />
          </div>
          <div className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-semibold text-slate-900">Comparaison du chiffre d'affaires</h2>
              {overviewChart ? <Line data={overviewChart} options={{ responsive: true, plugins: { legend: { display: false } } }} /> : <EmptyState message="Aucune donnée disponible." />}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Kpi title="Encaissé" value={formatMoney(data?.kpis.collected ?? 0)} icon={<Wallet size={18} />} />
              <Kpi title="Créances" value={formatMoney(data?.kpis.receivables ?? 0)} icon={<AlertTriangle size={18} />} />
              <Kpi title="Valeur stock" value={formatMoney(data?.kpis.stockValue ?? 0)} icon={<Boxes size={18} />} />
              <Kpi title="Alertes stock" value={(data?.kpis.outOfStockProducts ?? 0) + (data?.kpis.lowStockProducts ?? 0)} icon={<AlertTriangle size={18} />} />
            </div>
          </div>
        </div>
      ) : (
        <DetailSection section={section} detail={detail} />
      )}
    </section>
  );
}

function DetailSection({ section, detail }: { section: Exclude<Section, "overview">; detail: any }) {
  if (!detail) return <EmptyState message="Aucune donnée disponible." />;
  if (section === "insights") {
    return (
      <div className="space-y-3">
        {detail.insights?.length ? detail.insights.map((insight: any) => (
          <div key={`${insight.type}-${insight.message}`} className="rounded-2xl bg-white p-5 shadow-sm">
            <p className="font-semibold text-slate-900">{insight.message}</p>
            <p className="mt-1 text-xs text-slate-500">{insight.type} · {insight.severity}</p>
          </div>
        )) : <EmptyState message="Aucun insight à signaler pour cette période." />}
      </div>
    );
  }
  if (section === "sales") {
    const timeline = detail.timeline ?? [];
    return (
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-semibold text-slate-900">Évolution des ventes</h2>
        {timeline.length ? <Bar data={{ labels: timeline.map((row: any) => new Date(row.bucket).toLocaleDateString("fr-FR")), datasets: [{ label: "CA", data: timeline.map((row: any) => row.revenue), backgroundColor: "#10b981" }] }} options={{ responsive: true }} /> : <EmptyState message="Aucune vente sur cette période." />}
      </div>
    );
  }
  if (section === "stock") {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Kpi title="Valeur stock" value={formatMoney(detail.summary?.totalStockValue ?? 0)} icon={<Boxes size={18} />} />
          <Kpi title="Ruptures" value={detail.summary?.outOfStock ?? 0} icon={<AlertTriangle size={18} />} />
          <Kpi title="Stock faible" value={detail.summary?.lowStock ?? 0} icon={<AlertTriangle size={18} />} />
          <Kpi title="Dormants" value={detail.summary?.dormant ?? 0} icon={<PackageSearch size={18} />} />
        </div>
        <EntityTable rows={detail.products ?? []} columns={["productName", "currentStock", "stockValue", "status"]} />
      </div>
    );
  }
  if (section === "products") return <EntityTable rows={detail.products ?? []} columns={["productName", "soldQuantity", "revenue", "grossMargin", "status"]} money={["revenue", "grossMargin"]} />;
  if (section === "customers") return <EntityTable rows={detail.customers ?? []} columns={["customerName", "orderCount", "purchasedAmount", "receivable", "status"]} money={["purchasedAmount", "receivable"]} />;
  if (section === "cash") return <EntityTable rows={detail.transactions ?? []} columns={["createdAt", "type", "paymentMethod", "amount", "label"]} money={["amount"]} />;
  return <EntityTable rows={detail.byWeekday ?? []} columns={["day", "salesCount", "revenue", "quantitySold", "averageBasket"]} money={["revenue", "averageBasket"]} />;
}

function EntityTable({ rows, columns, money = [] }: { rows: any[]; columns: string[]; money?: string[] }) {
  if (!rows.length) return <EmptyState message="Aucune donnée disponible pour cette période." />;
  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
          <tr>{columns.map((column) => <th key={column} className="px-4 py-3">{column}</th>)}</tr>
        </thead>
        <tbody>{rows.map((row, index) => <tr key={row.id ?? row.productId ?? row.customerId ?? index} className="border-b border-slate-50 last:border-0">
          {columns.map((column) => <td key={column} className="px-4 py-3 text-slate-700">{money.includes(column) ? formatMoney(Number(row[column] ?? 0)) : String(row[column] ?? "—")}</td>)}
        </tr>)}</tbody>
      </table>
    </div>
  );
}
