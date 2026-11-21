import {
  AlertTriangle,
  BarChart3,
  Boxes,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Lightbulb,
  PackageSearch,
  RotateCcw,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bar, Line } from "react-chartjs-2";
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import {
  getAnalyticsCash,
  getAnalyticsCustomers,
  getAnalyticsInsights,
  getAnalyticsMultiStoreOverview,
  getAnalyticsOverview,
  getAnalyticsProducts,
  getAnalyticsProfit,
  getAnalyticsSales,
  getAnalyticsStock,
  getAnalyticsTrends,
  type AnalyticsOverview,
} from "../features/analytics/api";
import {
  AnalyticsFilters,
  EmptyState,
  Kpi,
} from "../features/analytics/components/AnalyticsPrimitives";
import { DetailSection } from "../features/analytics/components/DetailSection";
import {
  type AnalyticsSectionId as Section,
  dateFromInput,
  defaultEnd,
  defaultStart,
  minimumPlan,
  planDisplayNames,
  planRank,
  shiftDate,
} from "../features/analytics/constants";
import { getSubscription } from "../features/shops/api";
import type { SubscriptionInfo } from "../types";
import { isAdmin } from "../types/auth";
import { formatMoney } from "../utils/format";
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

const sections: Array<{
  id: Section;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}> = [
  { id: "overview", label: "Vue générale", icon: <BarChart3 size={16} /> },
  { id: "sales", label: "Ventes", icon: <CreditCard size={16} /> },
  { id: "products", label: "Produits", icon: <PackageSearch size={16} /> },
  { id: "stock", label: "Stock", icon: <Boxes size={16} /> },
  { id: "customers", label: "Clients", icon: <Users size={16} /> },
  { id: "cash", label: "Trésorerie", icon: <Wallet size={16} /> },
  { id: "trends", label: "Tendances", icon: <BarChart3 size={16} /> },
  { id: "insights", label: "Alertes & Conseils", icon: <Lightbulb size={16} /> },
  { id: "profit", label: "Bénéfices", icon: <TrendingUp size={16} />, adminOnly: true },
];

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
          ? "Les alertes et conseils automatiques nécessitent le plan Pro et les rapports avancés."
          : `Cette analyse est disponible à partir du plan ${planDisplayNames[minimumPlan[section]]}.`,
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
          profit: () => getAnalyticsProfit(requestedParams),
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
  }, [section, subscription, multiStoreMode, page, filters]);

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
            setPage(1);
            void load({ ...params, page: 1 });
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
          {section === "overview" &&
            isAdmin() &&
            subscription &&
            hasFeature(subscription, "MULTI_STORE") &&
            subscription.plan.code === "PREMIUM" && (
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
        {sections
          .filter((item) => !item.adminOnly || isAdmin())
          .map((item) => (
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
                    ? "Les alertes et conseils automatiques nécessitent le plan Pro et les rapports avancés."
                    : `Cette analyse est disponible à partir du plan ${planDisplayNames[minimumPlan[item.id]]}.`,
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
          {isAdmin() && activeKpis?.grossProfit !== undefined && (
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-semibold text-slate-900">
                    Rentabilité &amp; Bénéfice
                  </h2>
                  <p className="text-xs text-slate-500">
                    Calculé sur les ventes non annulées et les sorties de caisse hors achats fournisseurs
                  </p>
                </div>
                {activeKpis.marginRate !== null &&
                  activeKpis.marginRate !== undefined && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Taux de marge : {activeKpis.marginRate}%
                    </span>
                  )}
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4">
                  <p className="text-xs font-medium text-emerald-700">
                    Bénéfice brut
                  </p>
                  <p className="mt-1 text-xl font-bold text-emerald-950">
                    {formatMoney(activeKpis.grossProfit)}
                  </p>
                  <p className="mt-1 text-xs text-emerald-700/80">
                    Ventes − coût d'achat
                    {activeComparison?.profitChange !== null &&
                    activeComparison?.profitChange !== undefined
                      ? ` · ${activeComparison.profitChange >= 0 ? "+" : ""}${activeComparison.profitChange}%`
                      : ""}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Coût d'achat (CMV)
                  </p>
                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {formatMoney(activeKpis.costOfGoodsSold ?? 0)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Coût des articles vendus
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <p className="text-xs font-medium text-slate-500">
                    Autres dépenses
                  </p>
                  <p className="mt-1 text-xl font-bold text-slate-900">
                    {formatMoney(activeKpis.operatingExpenses ?? 0)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Sorties caisse hors fournisseurs
                  </p>
                </div>
                <div
                  className={`rounded-xl border p-4 ${
                    (activeKpis.netProfit ?? 0) >= 0
                      ? "border-emerald-200 bg-white"
                      : "border-rose-200 bg-rose-50/60"
                  }`}
                >
                  <p className="text-xs font-medium text-slate-500">
                    Résultat net
                  </p>
                  <p
                    className={`mt-1 text-xl font-bold ${
                      (activeKpis.netProfit ?? 0) >= 0
                        ? "text-emerald-700"
                        : "text-rose-700"
                    }`}
                  >
                    {formatMoney(activeKpis.netProfit ?? 0)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Bénéfice brut − autres dépenses
                  </p>
                </div>
              </div>
              {(activeKpis.itemsWithoutCost ?? 0) > 0 && (
                <p className="mt-3 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-2 text-xs text-amber-800">
                  ⚠️ {activeKpis.itemsWithoutCost} ligne(s) vendue(s) sur cette période avaient un prix d'achat à 0 FCFA. Renseignez les prix d'achat de vos produits pour un bénéfice encore plus précis.
                </p>
              )}
            </div>
          )}
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
          {multiStoreMode && multiStoreData && multiStoreData.shops.length > 0 && (
            <div className="rounded-2xl bg-white p-5 shadow-sm">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-semibold text-slate-900">
                    Comparatif par boutique
                  </h2>
                  <p className="text-xs text-slate-500">
                    Détail des performances de chacune de vos {multiStoreData.shops.length} boutique(s) active(s) sur la période
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="border-b border-slate-100 text-xs uppercase text-slate-400">
                    <tr>
                      <th className="py-2.5 pr-3">Boutique</th>
                      <th className="py-2.5 px-3">Chiffre d'affaires</th>
                      <th className="py-2.5 px-3 text-right">Bénéfice brut</th>
                      <th className="py-2.5 px-3 text-center">Variation</th>
                      <th className="py-2.5 px-3 text-center">Ventes</th>
                      <th className="py-2.5 px-3 text-right">Encaissé</th>
                      <th className="py-2.5 px-3 text-right">Créances</th>
                      <th className="py-2.5 px-3 text-right">Valeur stock</th>
                      <th className="py-2.5 pl-3 text-center">Alertes stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[...multiStoreData.shops]
                      .sort((a, b) => b.overview.kpis.revenue - a.overview.kpis.revenue)
                      .map(({ shop, overview }) => {
                        const kpis = overview.kpis;
                        const share =
                          multiStoreData.consolidated.revenue > 0
                            ? Math.round(
                                (kpis.revenue / multiStoreData.consolidated.revenue) * 100,
                              )
                            : 0;
                        const change = overview.comparison?.revenueChange;
                        const stockAlerts =
                          (kpis.outOfStockProducts ?? 0) + (kpis.lowStockProducts ?? 0);
                        return (
                          <tr key={shop.id} className="hover:bg-slate-50/60">
                            <td className="py-2.5 pr-3 font-semibold text-slate-800 whitespace-nowrap">
                              {shop.name}
                            </td>
                            <td className="py-2.5 px-3 min-w-48">
                              <div className="flex items-center gap-2">
                                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                                  <div
                                    className="h-full rounded-full bg-emerald-500"
                                    style={{ width: `${share}%` }}
                                  />
                                </div>
                                <span className="font-semibold text-slate-900 whitespace-nowrap">
                                  {formatMoney(kpis.revenue)}
                                </span>
                                <span className="text-xs text-slate-400 whitespace-nowrap">
                                  ({share}%)
                                </span>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-right whitespace-nowrap">
                              <span className="font-semibold text-emerald-700">
                                {formatMoney(kpis.grossProfit ?? 0)}
                              </span>
                              {kpis.marginRate !== null &&
                                kpis.marginRate !== undefined && (
                                  <span className="ml-1 text-xs text-slate-400">
                                    ({kpis.marginRate}%)
                                  </span>
                                )}
                            </td>
                            <td className="py-2.5 px-3 text-center whitespace-nowrap">
                              {change === null || change === undefined ? (
                                <span className="text-xs text-slate-400">N/D</span>
                              ) : (
                                <span
                                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                    change >= 0
                                      ? "bg-emerald-50 text-emerald-700"
                                      : "bg-rose-50 text-rose-700"
                                  }`}
                                >
                                  {change >= 0 ? "+" : ""}
                                  {change}%
                                </span>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-center text-slate-700">
                              {kpis.salesCount}
                            </td>
                            <td className="py-2.5 px-3 text-right font-medium text-emerald-700 whitespace-nowrap">
                              {formatMoney(kpis.collected)}
                            </td>
                            <td
                              className={`py-2.5 px-3 text-right font-medium whitespace-nowrap ${
                                kpis.receivables > 0 ? "text-amber-600" : "text-slate-400"
                              }`}
                            >
                              {formatMoney(kpis.receivables)}
                            </td>
                            <td className="py-2.5 px-3 text-right text-slate-700 whitespace-nowrap">
                              {formatMoney(kpis.stockValue)}
                            </td>
                            <td className="py-2.5 pl-3 text-center">
                              <span
                                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                  stockAlerts > 0
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {stockAlerts}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      ) : (
        <DetailSection section={section} detail={detail} onNavigate={navigate} onPageChange={setPage} />
      )}
    </section>
  );
}
