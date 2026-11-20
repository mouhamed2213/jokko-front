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
  const [overviewViewMode, setOverviewViewMode] = useState<
    "bars" | "summary" | "line"
  >(() => {
    const saved = localStorage.getItem("analytics_overview_chart_mode");
    return saved === "summary" || saved === "line" || saved === "bars"
      ? saved
      : "bars";
  });

  const changeOverviewViewMode = (mode: "bars" | "summary" | "line") => {
    setOverviewViewMode(mode);
    localStorage.setItem("analytics_overview_chart_mode", mode);
  };

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

  const activeKpis = multiStoreMode ? multiStoreData?.consolidated : data?.kpis;
  const activeComparison = multiStoreMode
    ? (multiStoreData?.comparison ?? null)
    : (data?.comparison ?? null);
  const currentRevenue = activeKpis?.revenue ?? 0;
  const previousRevenue = activeComparison?.previousRevenue ?? 0;
  const hasPreviousData = activeComparison?.previousRevenue !== undefined;
  const revenueDelta = currentRevenue - previousRevenue;

  // Ordre chronologique exact : Période précédente (gauche) -> Période actuelle (droite)
  const overviewChartLabels = ["Période précédente", "Période actuelle"];
  const overviewBarChart = activeKpis
    ? {
        labels: overviewChartLabels,
        datasets: [
          {
            label: "Chiffre d'affaires (FCFA)",
            data: [previousRevenue, currentRevenue],
            backgroundColor: ["#cbd5e1", "#059669"],
            borderRadius: 10,
            maxBarThickness: 72,
          },
        ],
      }
    : null;

  const overviewLineChart = activeKpis
    ? {
        labels: overviewChartLabels,
        datasets: [
          {
            label: "Chiffre d'affaires (FCFA)",
            data: [previousRevenue, currentRevenue],
            borderColor: "#059669",
            backgroundColor: "rgba(5, 150, 105, 0.12)",
            pointBackgroundColor: ["#64748b", "#059669"],
            pointRadius: 5,
            fill: true,
            tension: 0.3,
          },
        ],
      }
    : null;

  const overviewChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => formatMoney(Number(ctx.raw) || 0),
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
              <p className="font-semibold text-emerald-900">Vue consolidée Signature</p>
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
            <Kpi title="CA de la période" value={formatMoney(activeKpis?.revenue ?? 0)} icon={<BarChart3 size={18} />} />
            <Kpi title="Ventes" value={activeKpis?.salesCount ?? 0} icon={<CreditCard size={18} />} />
            <Kpi title="Panier moyen" value={formatMoney(activeKpis?.averageBasket ?? 0)} icon={<Wallet size={18} />} />
            <Kpi
              title="Variation CA"
              value={
                activeComparison?.revenueChange === null ||
                activeComparison?.revenueChange === undefined
                  ? "N/D"
                  : `${activeComparison.revenueChange >= 0 ? "+" : ""}${activeComparison.revenueChange}%`
              }
              icon={<BarChart3 size={18} />}
            />
          </div>
          <div className="grid gap-5 lg:grid-cols-[1.4fr_0.6fr]">
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-slate-900">
                    Comparaison du chiffre d'affaires
                  </h2>
                  <p className="text-xs text-slate-500">
                    Période précédente comparée à la période sélectionnée (chiffres réels)
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
                      onClick={() => changeOverviewViewMode(opt.id)}
                      className={`rounded-lg px-3 py-1.5 transition ${
                        overviewViewMode === opt.id
                          ? "bg-white text-emerald-700 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {!activeKpis ? (
                <EmptyState message="Aucune donnée disponible." />
              ) : overviewViewMode === "summary" ? (
                <div className="space-y-5 py-2">
                  {/* Résumé en français simple */}
                  <div
                    className={`rounded-xl border px-4 py-3 text-sm ${
                      revenueDelta > 0
                        ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                        : revenueDelta < 0
                          ? "border-amber-200 bg-amber-50 text-amber-900"
                          : "border-slate-200 bg-slate-50 text-slate-800"
                    }`}
                  >
                    {!hasPreviousData ? (
                      <span>
                        Chiffre d'affaires sur la période :{" "}
                        <strong>{formatMoney(currentRevenue)}</strong>.
                      </span>
                    ) : revenueDelta > 0 ? (
                      <span>
                        Vos ventes sont en <strong>hausse de {formatMoney(revenueDelta)}</strong>
                        {activeComparison?.revenueChange !== null &&
                        activeComparison?.revenueChange !== undefined
                          ? ` (+${activeComparison.revenueChange}%)`
                          : ""}{" "}
                        par rapport à la période précédente.
                      </span>
                    ) : revenueDelta < 0 ? (
                      <span>
                        Vos ventes sont en{" "}
                        <strong>baisse de {formatMoney(Math.abs(revenueDelta))}</strong>
                        {activeComparison?.revenueChange !== null &&
                        activeComparison?.revenueChange !== undefined
                          ? ` (${activeComparison.revenueChange}%)`
                          : ""}{" "}
                        par rapport à la période précédente.
                      </span>
                    ) : (
                      <span>
                        Chiffre d'affaires <strong>stable</strong> par rapport à la période précédente (
                        {formatMoney(currentRevenue)}).
                      </span>
                    )}
                  </div>

                  {/* Comparaison visuelle par barres horizontales */}
                  {(() => {
                    const maxRev = Math.max(currentRevenue, previousRevenue, 1);
                    const prevPct = Math.round((previousRevenue / maxRev) * 100);
                    const currPct = Math.round((currentRevenue / maxRev) * 100);
                    return (
                      <div className="space-y-3">
                        <div>
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="font-medium text-slate-500">
                              Période précédente
                            </span>
                            <span className="font-semibold text-slate-700">
                              {formatMoney(previousRevenue)}
                            </span>
                          </div>
                          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-slate-400 transition-all"
                              style={{ width: `${prevPct}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="font-semibold text-emerald-800">
                              Période actuelle
                            </span>
                            <span className="font-bold text-emerald-700">
                              {formatMoney(currentRevenue)}
                            </span>
                          </div>
                          <div className="h-3 w-full overflow-hidden rounded-full bg-emerald-100">
                            <div
                              className="h-full rounded-full bg-emerald-600 transition-all"
                              style={{ width: `${currPct}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Jauge Encaissé vs Créances (données réelles) */}
                  {(() => {
                    const collected = activeKpis.collected ?? 0;
                    const receivables = activeKpis.receivables ?? 0;
                    const totalBilled = collected + receivables;
                    const collectedPct =
                      totalBilled > 0
                        ? Math.round((collected / totalBilled) * 100)
                        : 0;
                    const receivablesPct =
                      totalBilled > 0 ? 100 - collectedPct : 0;
                    return (
                      <div className="border-t border-slate-100 pt-4">
                        <div className="mb-2 flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-600">
                            Répartition des encaissements
                          </span>
                          <span className="text-slate-500">
                            {totalBilled > 0
                              ? `${collectedPct}% encaissé · ${receivablesPct}% à recouvrer`
                              : "Aucun mouvement sur la période"}
                          </span>
                        </div>
                        <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full bg-emerald-500 transition-all"
                            style={{ width: `${collectedPct}%` }}
                          />
                          <div
                            className="h-full bg-amber-400 transition-all"
                            style={{ width: `${receivablesPct}%` }}
                          />
                        </div>
                        <div className="mt-2 flex flex-wrap justify-between gap-2 text-xs text-slate-600">
                          <span>
                            <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-emerald-500" />
                            Encaissé : <strong>{formatMoney(collected)}</strong>
                          </span>
                          <span>
                            <span className="mr-1.5 inline-block h-2 w-2 rounded-full bg-amber-400" />
                            Créances : <strong>{formatMoney(receivables)}</strong>
                          </span>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              ) : overviewViewMode === "bars" && overviewBarChart ? (
                <Bar data={overviewBarChart} options={overviewChartOptions} />
              ) : overviewLineChart ? (
                <Line data={overviewLineChart} options={overviewChartOptions} />
              ) : (
                <EmptyState message="Aucune donnée disponible." />
              )}
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

function SalesAnalyticsSection({ detail }: { detail: any }) {
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
  const bestRow = timeline.reduce<typeof timeline[number] | null>(
    (best, row) => (!best || row.revenue > best.revenue ? row : best),
    null,
  );
  const maxRowRevenue = Math.max(...timeline.map((r) => r.revenue || 0), 1);

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
              Chiffre d'affaires et montants encaissés sur la période (données réelles)
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
            {/* 3 repères immédiats pour lecture rapide */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3.5">
                <p className="text-xs text-emerald-700">Total CA sur la période</p>
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

            {/* Tableau clair par période */}
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
                  {timeline.map((row) => {
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
                            row.remaining > 0 ? "text-amber-600" : "text-slate-400"
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
    return <SalesAnalyticsSection detail={detail} />;
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
