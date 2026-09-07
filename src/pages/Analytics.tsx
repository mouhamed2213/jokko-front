import {
  AlertTriangle,
  BarChart3,
  Boxes,
  CreditCard,
  Lightbulb,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  PackageSearch,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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

const statusLabels: Record<string, string> = {
  NEW: "Nouveau",
  ACTIVE: "Actif",
  INACTIVE: "Inactif",
  FAST: "Rotation rapide",
  SLOW: "Rotation lente",
  REGULAR: "Rotation normale",
  DORMANT: "Dormant",
  HISTORICAL: "Historique",
  ESTIMATED: "Estimé",
  IN_STOCK: "En stock",
  LOW_STOCK: "Stock faible",
  OUT_OF_STOCK: "Rupture",
  PAID: "Payé",
  PARTIAL: "Partiel",
  UNPAID: "Impayé",
  POSITIVE: "Positif",
  INFO: "Information",
  WARNING: "Alerte",
  IN: "Entrée",
  OUT: "Sortie",
};

const columnLabels: Record<string, string> = {
  productName: "Produit",
  customerName: "Client",
  currentStock: "Stock actuel",
  stockValue: "Valeur du stock",
  soldQuantity: "Quantité vendue",
  quantity: "Quantité",
  revenue: "Chiffre d'affaires",
  grossMargin: "Marge brute",
  purchasedAmount: "Montant acheté",
  receivable: "Créance",
  orderCount: "Commandes",
  averageBasket: "Panier moyen",
  status: "Statut",
  createdAt: "Date de création",
  lastSaleAt: "Dernière vente",
  lastOrderAt: "Dernière commande",
  type: "Type",
  paymentMethod: "Mode de paiement",
  amount: "Montant",
  label: "Libellé",
  day: "Jour",
  salesCount: "Nombre de ventes",
  quantitySold: "Quantité vendue",
};

const dateFromInput = (value: string) => {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
};

const inputDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const shiftDate = (value: string, days: number) => {
  const date = dateFromInput(value);
  date.setDate(date.getDate() + days);
  return inputDate(date);
};

const readableStatus = (value: unknown) =>
  typeof value === "string" ? statusLabels[value] ?? value : String(value ?? "—");

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
  const navigate = useNavigate();
  const [section, setSection] = useState<Section>("overview");
  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [data, setData] = useState<AnalyticsOverview | null>(null);
  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const params = useMemo(() => ({ startDate, endDate, limit: 50 }), [startDate, endDate]);
  const dateError =
    dateFromInput(startDate).getTime() > dateFromInput(endDate).getTime()
      ? "La date de début doit être antérieure ou égale à la date de fin."
      : "";

  const load = async (
    requestedParams = params,
  ) => {
    if (
      dateFromInput(requestedParams.startDate).getTime() >
      dateFromInput(requestedParams.endDate).getTime()
    ) {
      setError("La date de début doit être antérieure ou égale à la date de fin.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      if (section === "overview") {
        setData(await getAnalyticsOverview({ ...requestedParams, compare: true }));
        setDetail(null);
      } else {
        const loaders: Record<Exclude<Section, "overview">, () => Promise<any>> = {
          sales: () => getAnalyticsSales(requestedParams),
          products: () => getAnalyticsProducts(requestedParams),
          stock: () => getAnalyticsStock(requestedParams),
          customers: () => getAnalyticsCustomers(requestedParams),
          cash: () => getAnalyticsCash(requestedParams),
          trends: () => getAnalyticsTrends(requestedParams),
          insights: () => getAnalyticsInsights(requestedParams),
        };
        setDetail(await loaders[section]());
      }
    } catch (requestError: any) {
      setError(
        requestError?.response?.data?.message ||
          "Impossible de charger cette analyse. Vérifiez les dates et réessayez.",
      );
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
            <div className="mt-1 flex items-center gap-1">
              <button type="button" title="Jour précédent" onClick={() => setStartDate(shiftDate(startDate, -1))} className="rounded-lg border border-slate-200 p-2 hover:bg-slate-100"><ChevronLeft size={15} /></button>
              <input type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} className="block rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
              <button type="button" title="Jour suivant" onClick={() => setStartDate(shiftDate(startDate, 1))} className="rounded-lg border border-slate-200 p-2 hover:bg-slate-100"><ChevronRight size={15} /></button>
            </div>
          </label>
          <label className="text-xs font-medium text-slate-500">
            Au
            <div className="mt-1 flex items-center gap-1">
              <button type="button" title="Jour précédent" onClick={() => setEndDate(shiftDate(endDate, -1))} className="rounded-lg border border-slate-200 p-2 hover:bg-slate-100"><ChevronLeft size={15} /></button>
              <input type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} className="block rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm" />
              <button type="button" title="Jour suivant" onClick={() => setEndDate(shiftDate(endDate, 1))} className="rounded-lg border border-slate-200 p-2 hover:bg-slate-100"><ChevronRight size={15} /></button>
            </div>
          </label>
          <button type="button" onClick={() => { setStartDate(defaultStart); setEndDate(defaultEnd); void load({ startDate: defaultStart, endDate: defaultEnd, limit: 50 }); }} title="Réinitialiser la période" className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"><RotateCcw size={18} /></button>
          <button disabled={Boolean(dateError)} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">Actualiser</button>
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
      {dateError && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{dateError}</div>}
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
        <DetailSection section={section} detail={detail} onNavigate={navigate} />
      )}
    </section>
  );
}

function DetailSection({
  section,
  detail,
  onNavigate,
}: {
  section: Exclude<Section, "overview">;
  detail: any;
  onNavigate: (path: string) => void;
}) {
  if (!detail) return <EmptyState message="Aucune donnée disponible." />;
  if (section === "insights") {
    return <InsightsSection insights={detail.insights ?? []} onNavigate={onNavigate} />;
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

  function InsightsSection({
    insights,
    onNavigate,
  }: {
    insights: any[];
    onNavigate: (path: string) => void;
  }) {
    const insightLabels: Record<string, string> = {
      ALL: "Toutes",
      REVENUE_GROWTH: "Croissance du chiffre d'affaires",
      REVENUE_DECLINE: "Baisse du chiffre d'affaires",
      OUT_OF_STOCK: "Ruptures de stock",
      LOW_STOCK: "Stock faible",
      DORMANT_PRODUCTS: "Produits dormants",
      SALES_CONCENTRATION: "Concentration des ventes",
      RECEIVABLES: "Créances",
    };
    const [filter, setFilter] = useState("ALL");
    const filteredInsights = insights.filter(
      (insight) => filter === "ALL" || insight.type === filter,
    );

    return (
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {["ALL", ...new Set(insights.map((insight) => insight.type))].map((type) => (
            <button key={type} type="button" onClick={() => setFilter(type)} className={`rounded-xl px-3 py-2 text-sm ${filter === type ? "bg-emerald-600 text-white" : "bg-white text-slate-600 shadow-sm"}`}>
              {insightLabels[type] ?? readableStatus(type)}
            </button>
          ))}
        </div>
        {filteredInsights.length ? filteredInsights.map((insight) => (
          <div key={`${insight.type}-${insight.message}`} className="flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold text-slate-900">{insight.message}</p>
              <p className="mt-1 text-xs text-slate-500">
                {insightLabels[insight.type] ?? readableStatus(insight.type)} · {readableStatus(insight.severity)}
              </p>
            </div>
            {["OUT_OF_STOCK", "LOW_STOCK", "DORMANT_PRODUCTS"].includes(insight.type) && (
              <button type="button" onClick={() => onNavigate(insight.type === "DORMANT_PRODUCTS" ? "/products" : "/stock")} className="rounded-xl border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50">
                Voir les produits
              </button>
            )}
            {insight.type === "RECEIVABLES" && (
              <button type="button" onClick={() => onNavigate("/invoices")} className="rounded-xl border border-emerald-200 px-3 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50">
                Voir les factures
              </button>
            )}
          </div>
        )) : <EmptyState message="Aucun insight pour ce filtre et cette période." />}
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
          <tr>{columns.map((column) => <th key={column} className="px-4 py-3">{columnLabels[column] ?? column}</th>)}</tr>
        </thead>
        <tbody>{rows.map((row, index) => <tr key={row.id ?? row.productId ?? row.customerId ?? index} className="border-b border-slate-50 last:border-0">
          {columns.map((column) => <td key={column} className="px-4 py-3 text-slate-700">{money.includes(column) ? formatMoney(Number(row[column] ?? 0)) : column.toLowerCase().includes("date") ? (row[column] ? new Date(row[column]).toLocaleDateString("fr-FR") : "—") : column === "status" || column === "type" || column === "severity" ? readableStatus(row[column]) : String(row[column] ?? "—")}</td>)}
        </tr>)}</tbody>
      </table>
    </div>
  );
}
