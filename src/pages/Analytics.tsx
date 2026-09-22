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
  getAnalyticsMultiStoreOverview,
  getAnalyticsProducts,
  getAnalyticsSales,
  getAnalyticsStock,
  getAnalyticsTrends,
  getSubscription,
  type AnalyticsOverview,
} from "../services";
import type { PlanCode, SubscriptionInfo } from "../types";
import { hasFeature } from "../utils/subscription.checker";

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

const minimumPlan: Record<Section, PlanCode> = {
  overview: "FREE",
  sales: "FREE",
  stock: "FREE",
  cash: "FREE",
  products: "BASIC",
  customers: "BASIC",
  trends: "BASIC",
  insights: "PRO",
};

const planRank: Record<PlanCode, number> = { FREE: 0, BASIC: 1, PRO: 2, PREMIUM: 3 };

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

const formatDateTime = (value: unknown) => {
  if (!value) return "—";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleString("fr-FR", {
        dateStyle: "medium",
        timeStyle: "short",
      });
};

const cashCategoryLabels: Record<string, string> = {
  SALE_PAYMENT: "Paiement d'une vente",
  SUPPLIER_DEPOSIT: "Acompte fournisseur",
  SUPPLIER_PAYMENT: "Paiement fournisseur",
  PAYMENT_REVERSAL: "Annulation de paiement",
  OTHER: "Autre mouvement",
};

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

function Pagination({
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
        <span>Page {pagination.page} / {pagination.totalPages}</span>
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

function AnalyticsFilters({
  section,
  filters,
  onChange,
}: {
  section: Section;
  filters: Record<string, string>;
  onChange: (key: string, value: string) => void;
}) {
  const select = (key: string, label: string, options: Array<[string, string]>) => (
    <label className="text-xs font-medium text-slate-500">
      {label}
      <select
        value={filters[key] ?? ""}
        onChange={(event) => onChange(key, event.target.value)}
        className="mt-1 block rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
      >
        <option value="">Tous</option>
        {options.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
      </select>
    </label>
  );

  const controls =
    section === "products"
      ? [
          select("status", "Statut", [["NEW", "Nouveau"], ["FAST", "Rotation rapide"], ["SLOW", "Rotation lente"], ["REGULAR", "Rotation normale"], ["DORMANT", "Dormant"]]),
          select("stockStatus", "État du stock", [["IN_STOCK", "En stock"], ["LOW_STOCK", "Stock faible"], ["OUT_OF_STOCK", "Rupture"]]),
          select("costSource", "Coût", [["HISTORICAL", "Historique"], ["ESTIMATED", "Estimé"]]),
        ]
      : section === "stock"
        ? [
            select("status", "Statut", [["NEW", "Nouveau"], ["FAST", "Rotation rapide"], ["SLOW", "Rotation lente"], ["REGULAR", "Rotation normale"], ["DORMANT", "Dormant"]]),
            select("stockStatus", "État du stock", [["IN_STOCK", "En stock"], ["LOW_STOCK", "Stock faible"], ["OUT_OF_STOCK", "Rupture"]]),
          ]
        : section === "customers"
          ? [
              select("status", "Statut client", [["NEW", "Nouveau"], ["ACTIVE", "Actif"], ["INACTIVE", "Inactif"]]),
              select("recurrent", "Fidélité", [["true", "Récurrent"], ["false", "Non récurrent"]]),
            ]
          : section === "cash"
            ? [
                select("type", "Flux", [["IN", "Entrées"], ["OUT", "Sorties"]]),
                select("category", "Catégorie", [["SALE_PAYMENT", "Paiement vente"], ["SUPPLIER_DEPOSIT", "Acompte fournisseur"], ["SUPPLIER_PAYMENT", "Paiement fournisseur"], ["PAYMENT_REVERSAL", "Annulation"]]),
              ]
            : section === "insights"
              ? [
                  select("severity", "Sévérité", [["POSITIVE", "Positive"], ["INFO", "Information"], ["WARNING", "Alerte"]]),
                  select("type", "Type", [["REVENUE_GROWTH", "Hausse du CA"], ["REVENUE_DECLINE", "Baisse du CA"], ["OUT_OF_STOCK", "Rupture"], ["LOW_STOCK", "Stock faible"], ["DORMANT_PRODUCTS", "Produits dormants"], ["SALES_CONCENTRATION", "Concentration"], ["RECEIVABLES", "Créances"]]),
                ]
              : [];

  if (!controls.length) return null;
  return <div className="flex flex-wrap items-end gap-3 rounded-2xl bg-slate-50 p-4">{controls}</div>;
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
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [multiStoreMode, setMultiStoreMode] = useState(false);
  const [multiStoreData, setMultiStoreData] = useState<Awaited<ReturnType<typeof getAnalyticsMultiStoreOverview>> | null>(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const params = useMemo(() => ({ startDate, endDate, limit: 50, page, pageSize: 20, ...filters }), [startDate, endDate, page, filters]);
  const dateError =
    dateFromInput(startDate).getTime() > dateFromInput(endDate).getTime()
      ? "La date de début doit être antérieure ou égale à la date de fin."
      : "";
  const sectionLocked =
    !subscription ||
    planRank[subscription.plan.code] < planRank[minimumPlan[section]] ||
    (section === "insights" && !hasFeature(subscription, "ADVANCED_REPORTS"));

  const load = async (
    requestedParams = params,
  ) => {
    if (sectionLocked) {
      setError(
        section === "insights"
          ? "Les insights automatiques nécessitent le plan PRO et les rapports avancés."
          : `Cette analyse est disponible à partir du plan ${minimumPlan[section]}.`,
      );
      setLoading(false);
      return;
    }
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
        const compare = Boolean(subscription && planRank[subscription.plan.code] >= planRank.BASIC);
        if (multiStoreMode) {
          setMultiStoreData(await getAnalyticsMultiStoreOverview({ ...requestedParams, compare }));
        } else {
          setData(await getAnalyticsOverview({ ...requestedParams, compare }));
        }
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
    getSubscription()
      .then(setSubscription)
      .catch(() => setError("Impossible de vérifier votre abonnement."));
  }, []);

  useEffect(() => {
    if (subscription) void load();
  }, [section, subscription, multiStoreMode, page]);

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
          <button type="button" onClick={() => { setStartDate(defaultStart); setEndDate(defaultEnd); setPage(1); void load({ startDate: defaultStart, endDate: defaultEnd, limit: 50, page: 1, pageSize: 20 }); }} title="Réinitialiser la période" className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100"><RotateCcw size={18} /></button>
          <button disabled={Boolean(dateError)} className="rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50">Actualiser</button>
          {subscription && hasFeature(subscription, "MULTI_STORE") && subscription.plan.code === "PREMIUM" && (
            <button
              type="button"
              onClick={() => setMultiStoreMode((enabled) => !enabled)}
              className={`rounded-xl border px-3 py-2 text-sm font-semibold ${
                multiStoreMode
                  ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                  : "border-slate-200 text-slate-600"
              }`}
            >
              {multiStoreMode ? "Vue boutique active" : "Vue consolidée"}
            </button>
          )}
        </form>
      </div>

      <div className="flex gap-2 overflow-x-auto border-b border-slate-200 pb-2">
        {sections.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              const locked =
                !subscription ||
                planRank[subscription.plan.code] < planRank[minimumPlan[item.id]] ||
                (item.id === "insights" &&
                  !hasFeature(subscription, "ADVANCED_REPORTS"));
              if (locked) {
                setError(
                  item.id === "insights"
                    ? "Les insights automatiques nécessitent le plan PRO et les rapports avancés."
                    : `Cette analyse est disponible à partir du plan ${minimumPlan[item.id]}.`,
                );
                return;
              }
              setError("");
              setPage(1);
              setFilters({});
              setSection(item.id);
            }}
            className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium ${
              section === item.id ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {item.icon}
            {item.label}
            {subscription &&
              (planRank[subscription.plan.code] < planRank[minimumPlan[item.id]] ||
                (item.id === "insights" &&
                  !hasFeature(subscription, "ADVANCED_REPORTS"))) &&
              " 🔒"}
          </button>
        ))}
      </div>

      {error && <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>}
      {dateError && <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{dateError}</div>}
      {!loading && section !== "overview" && (
        <AnalyticsFilters
          section={section}
          filters={filters}
          onChange={(key, value) => {
            setPage(1);
            setFilters((current) => ({ ...current, [key]: value }));
          }}
        />
      )}
      {loading ? (
        <EmptyState message="Chargement de l'analyse..." />
      ) : section === "overview" ? (
        <div className="space-y-5">
          {multiStoreMode && multiStoreData && (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
              <p className="font-semibold text-emerald-900">Vue consolidée Premium</p>
              <p className="mt-1 text-sm text-emerald-800">
                Données agrégées uniquement pour les boutiques autorisées de votre compte.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {multiStoreData.shops.map(({ shop }) => (
                  <span key={shop.id} className="rounded-full bg-white px-3 py-1 text-xs text-slate-600">
                    {shop.name}
                  </span>
                ))}
              </div>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
            <Kpi title="CA de la période" value={formatMoney((multiStoreMode ? multiStoreData?.consolidated.revenue : data?.kpis.revenue) ?? 0)} icon={<BarChart3 size={18} />} />
            <Kpi title="Ventes" value={(multiStoreMode ? multiStoreData?.consolidated.salesCount : data?.kpis.salesCount) ?? 0} icon={<CreditCard size={18} />} />
            <Kpi title="Panier moyen" value={formatMoney((multiStoreMode ? multiStoreData?.consolidated.averageBasket : data?.kpis.averageBasket) ?? 0)} icon={<Wallet size={18} />} />
            <Kpi title="Variation CA" value={data?.comparison?.revenueChange === null || data?.comparison?.revenueChange === undefined ? "N/D" : `${data.comparison.revenueChange >= 0 ? "+" : ""}${data.comparison.revenueChange}%`} icon={<BarChart3 size={18} />} />
          </div>
          <div className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-semibold text-slate-900">Comparaison du chiffre d'affaires</h2>
              {overviewChart ? <Line data={overviewChart} options={{ responsive: true, plugins: { legend: { display: false } } }} /> : <EmptyState message="Aucune donnée disponible." />}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Kpi title="Encaissé" value={formatMoney((multiStoreMode ? multiStoreData?.consolidated.collected : data?.kpis.collected) ?? 0)} icon={<Wallet size={18} />} />
              <Kpi title="Créances" value={formatMoney((multiStoreMode ? multiStoreData?.consolidated.receivables : data?.kpis.receivables) ?? 0)} icon={<AlertTriangle size={18} />} />
              <Kpi title="Valeur stock" value={formatMoney((multiStoreMode ? multiStoreData?.consolidated.stockValue : data?.kpis.stockValue) ?? 0)} icon={<Boxes size={18} />} />
              <Kpi title="Alertes stock" value={((multiStoreMode ? multiStoreData?.consolidated.outOfStockProducts : data?.kpis.outOfStockProducts) ?? 0) + ((multiStoreMode ? multiStoreData?.consolidated.lowStockProducts : data?.kpis.lowStockProducts) ?? 0)} icon={<AlertTriangle size={18} />} />
            </div>
          </div>
        </div>
      ) : (
        <DetailSection section={section} detail={detail} onNavigate={navigate} onPageChange={setPage} />
      )}
    </section>
  );
}

function DetailSection({
  section,
  detail,
  onNavigate,
  onPageChange,
}: {
  section: Exclude<Section, "overview">;
  detail: any;
  onNavigate: (path: string) => void;
  onPageChange: (page: number) => void;
}) {
  if (!detail) return <EmptyState message="Aucune donnée disponible." />;
  if (section === "insights") {
    return <InsightsSection insights={detail.insights ?? []} pagination={detail.pagination} onNavigate={onNavigate} onPageChange={onPageChange} />;
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
    pagination,
    onNavigate,
    onPageChange,
  }: {
    insights: any[];
      pagination: any;
      onNavigate: (path: string) => void;
      onPageChange: (page: number) => void;
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
        <Pagination pagination={pagination} onPageChange={onPageChange} />
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
        <Pagination pagination={detail.pagination} onPageChange={onPageChange} />
      </div>
    );
  }
  if (section === "products") return <><EntityTable rows={detail.products ?? []} columns={["productName", "soldQuantity", "revenue", "grossMargin", "status"]} money={["revenue", "grossMargin"]} /><Pagination pagination={detail.pagination} onPageChange={onPageChange} /></>;
  if (section === "customers") return <><EntityTable rows={detail.customers ?? []} columns={["customerName", "orderCount", "purchasedAmount", "receivable", "status"]} money={["purchasedAmount", "receivable"]} /><Pagination pagination={detail.pagination} onPageChange={onPageChange} /></>;
  if (section === "cash") {
    return (
      <>
        <CashTable
          rows={detail.transactions ?? []}
          onNavigate={onNavigate}
        />
        <Pagination pagination={detail.pagination} onPageChange={onPageChange} />
      </>
    );
  }
  return <EntityTable rows={detail.byWeekday ?? []} columns={["day", "salesCount", "revenue", "quantitySold", "averageBasket"]} money={["revenue", "averageBasket"]} />;
}

function CashTable({
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
  if (!rows.length) return <EmptyState message="Aucun mouvement de trésorerie pour cette période." />;
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
            <tr key={`${row.createdAt}-${row.reference ?? index}`} className="border-b border-slate-50 last:border-0">
              <td className="px-4 py-3 text-slate-700">{formatDateTime(row.createdAt)}</td>
              <td className="px-4 py-3 text-slate-700">{cashCategoryLabels[row.category ?? "OTHER"] ?? "Autre mouvement"}</td>
              <td className="px-4 py-3 text-slate-700">{readableStatus(row.type)}</td>
              <td className="px-4 py-3 text-slate-700">{readableStatus(row.paymentMethod)}</td>
              <td className="px-4 py-3 font-medium text-slate-700">{formatMoney(row.amount)}</td>
              <td className="px-4 py-3">
                {row.target ? (
                  <button type="button" onClick={() => onNavigate(row.target!.path)} className="text-left text-emerald-700 hover:underline">
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

function EntityTable({ rows, columns, money = [] }: { rows: any[]; columns: string[]; money?: string[] }) {
  if (!rows.length) return <EmptyState message="Aucune donnée disponible pour cette période." />;
  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
          <tr>{columns.map((column) => <th key={column} className="px-4 py-3">{columnLabels[column] ?? column}</th>)}</tr>
        </thead>
        <tbody>{rows.map((row, index) => <tr key={row.id ?? row.productId ?? row.customerId ?? index} className="border-b border-slate-50 last:border-0">
          {columns.map((column) => <td key={column} className="px-4 py-3 text-slate-700">{money.includes(column) ? formatMoney(Number(row[column] ?? 0)) : column.toLowerCase().includes("date") ? formatDateTime(row[column]) : column === "status" || column === "type" || column === "severity" ? readableStatus(row[column]) : String(row[column] ?? "—")}</td>)}
        </tr>)}</tbody>
      </table>
    </div>
  );
}
