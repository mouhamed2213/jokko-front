import { ArrowUpRight } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getDashboardStats, getSubscription } from "../services/index";
import { getStoredUser } from "../types/auth";
import type { DashboardStats, SubscriptionInfo } from "../types/index";

const fmt = (v: number) => `${v.toLocaleString("fr-FR").replace(/\u202f/g, " ")} FCFA`;
const num = (v: number) => v.toLocaleString("fr-FR").replace(/\u202f/g, " ");

const Panel = ({ title, aside, children, className = "" }: { title: string; aside?: string; children: React.ReactNode; className?: string }) => (
  <section className={`min-w-0 rounded-3xl border border-ink/10 bg-paper p-6 ${className}`}>
    <div className="mb-5 flex items-baseline justify-between gap-4">
      <h2 className="text-base font-extrabold tracking-tight">{title}</h2>
      {aside && <span className="text-xs font-semibold text-ink/50">{aside}</span>}
    </div>
    {children}
  </section>
);

export default function Dashboard() {
  const user = getStoredUser();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);

  useEffect(() => {
    getSubscription().then(setSubscription);
    getDashboardStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (!subscription) {
    return;
  }

  if (loading) {
    return <div className="rounded-3xl border border-ink/10 bg-paper p-8 text-center text-sm text-ink/50">Chargement du tableau de bord...</div>;
  }

  if (!user) {
    return null;
  }

  const currentMonthCA = stats?.currentMonthSalesAmount ?? 0;
  const lowStock = stats?.lowStockProducts ?? 0;
  const outOfStock = stats?.outOfStockProducts ?? 0;
  const clientDebt = stats?.totalClientDebt ?? 0;
  const supplierDebt = stats?.totalSupplierDebt ?? 0;
  const topProducts = stats?.topProducts ?? [];
  const maxQty = Math.max(...topProducts.map((p) => p.totalQuantity ?? 0), 1);

  // Éléments qui demandent une action, du plus urgent au moins urgent
  const watch: { label: string; hint: string; value: string; to: string; alert: boolean }[] = [
    stats?.cashOpen
      ? { label: "Caisse ouverte", hint: "Solde actuel", value: fmt(stats.currentBalance ?? 0), to: "/cash", alert: false }
      : { label: "Caisse fermée", hint: "À ouvrir avant toute transaction", value: "Ouvrir", to: "/cash", alert: true },
    { label: "Rupture de stock", hint: "Produits épuisés", value: String(outOfStock), to: "/products", alert: outOfStock > 0 },
    { label: "Stock faible", hint: "Sous le seuil d'alerte", value: String(lowStock), to: "/products", alert: lowStock > 0 },
    { label: "Créances clients", hint: "Montants non encaissés", value: fmt(clientDebt), to: "/clients", alert: clientDebt > 0 },
    { label: "Dettes fournisseurs", hint: "Montants à payer", value: fmt(supplierDebt), to: "/suppliers", alert: supplierDebt > 0 },
  ];

  const figures = [
    { label: "Produits", value: num(stats?.totalProducts ?? 0), hint: "Produits actifs" },
    { label: "Ventes", value: num(stats?.totalSales ?? 0), hint: "Ventes enregistrées" },
    { label: "Clients", value: num(stats?.totalClients ?? 0), hint: "Clients enregistrés" },
    { label: "Fournisseurs", value: num(stats?.totalSuppliers ?? 0), hint: "Fournisseurs enregistrés" },
  ];

  const finance: [string, string][] = [
    ["Valeur du stock", fmt(stats?.stockValue ?? 0)],
    ["Chiffre d'affaires global", fmt(stats?.totalSalesAmount ?? 0)],
    ["Ventes des 7 derniers jours", fmt(stats?.recentSalesAmount ?? 0)],
  ];

  return (
    <section className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        {/* Chiffre d'affaires du mois */}
        <div className="relative overflow-hidden rounded-3xl bg-jokko p-8 text-white sm:p-10">
          <svg aria-hidden viewBox="0 0 200 200" className="pointer-events-none absolute -bottom-16 -right-10 h-80 w-80 overflow-visible text-white/10">
            <path d="M120 10V120A70 70 0 0 1 50 190H40" fill="none" stroke="currentColor" strokeWidth="46" strokeLinecap="round" />
          </svg>
          <p className="relative inline-flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-[0.2em] text-sun">
            <span className="h-2.5 w-2.5 rounded-full bg-sun" /> Chiffre d'affaires du mois
          </p>
          <p className="relative mt-5 break-words text-5xl font-extrabold leading-none tracking-[-0.045em] sm:text-7xl">
            {num(currentMonthCA)} <span className="text-2xl font-bold tracking-tight text-white/80 sm:text-3xl">FCFA</span>
          </p>
          <p className="relative mt-5 max-w-md text-sm leading-7 text-white/80">
            {num(stats?.recentSalesAmount ?? 0)} FCFA sur les 7 derniers jours, pour {num(stats?.totalSalesAmount ?? 0)} FCFA facturés depuis le début.
          </p>
        </div>

        {/* À surveiller */}
        <Panel title="À surveiller" aside="Aujourd'hui">
          <ul className="divide-y divide-ink/10">
            {watch.map(({ label, hint, value, to, alert }) => (
              <li key={label}>
                <Link to={to} className="group flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 text-sm font-extrabold">
                      {alert && <span className="h-2 w-2 shrink-0 rounded-full bg-sun" />}
                      {label}
                    </p>
                    <p className="mt-0.5 text-xs text-ink/55">{hint}</p>
                  </div>
                  <span className="flex shrink-0 items-center gap-2">
                    <span className={`text-lg font-extrabold tabular-nums tracking-tight ${alert ? "" : "text-ink/40"}`}>{value}</span>
                    <ArrowUpRight size={15} className="text-ink/30 transition group-hover:text-jokko" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* Chiffres clés */}
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-ink/10 bg-ink/10 lg:grid-cols-4">
        {figures.map(({ label, value, hint }) => (
          <div key={label} className="bg-paper p-6">
            <dt className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/50">{label}</dt>
            <dd className="mt-2 text-4xl font-extrabold tabular-nums tracking-[-0.04em]">{value}</dd>
            <p className="mt-1 text-xs text-ink/55">{hint}</p>
          </div>
        ))}
      </dl>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title="Situation financière">
          <dl className="divide-y divide-ink/10">
            {finance.map(([label, value]) => (
              <div key={label} className="flex items-baseline justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
                <dt className="text-sm text-ink/65">{label}</dt>
                <dd className="text-lg font-extrabold tabular-nums tracking-tight">{value}</dd>
              </div>
            ))}
          </dl>
        </Panel>

        <Panel title="Top 5 produits vendus" aside="En quantité">
          {!topProducts.length ? (
            <p className="text-sm text-ink/55">Aucune vente enregistrée pour le moment.</p>
          ) : (
            <ol className="space-y-4">
              {topProducts.map((p, i) => (
                <li key={i}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-4 text-sm">
                    <span className="flex min-w-0 items-baseline gap-3 font-bold">
                      <span className="text-xs font-extrabold tabular-nums text-jokko">{String(i + 1).padStart(2, "0")}</span>
                      <span className="truncate">{p.productName}</span>
                    </span>
                    <span className="shrink-0 font-extrabold tabular-nums">{num(p.totalQuantity ?? 0)} <span className="text-xs font-semibold text-ink/50">unités</span></span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-ink/10">
                    <div className="h-2 rounded-full bg-jokko" style={{ width: `${Math.max(((p.totalQuantity ?? 0) / maxQty) * 100, 4)}%` }} />
                  </div>
                </li>
              ))}
            </ol>
          )}
        </Panel>
      </div>
    </section>
  );
}
