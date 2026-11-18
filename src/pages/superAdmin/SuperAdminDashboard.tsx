import { useEffect, useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getPlatformStats, getSubscriptionOverviewStats, type SubscriptionOverviewStats } from "../../services";

interface PlatformStats {
  totalShops: number;
  shopsByStatus: Record<string, number>;
  subscriptionsByStatus: Record<string, number>;
  subscriptionsByPlan: Record<string, number>;
  mrr: number;
  recentShops: {
    id: number;
    name: string;
    email: string;
    createdAt: string;
    status: string;
  }[];
  recentSubscriptions: {
    id: number;
    shopId: number;
    status: string;
    startDate: string;
    endDate: string | null;
    plan: { code: string; name: string; price: number };
    shop: { id: number; name: string; email: string };
  }[];
}

const planLabels: Record<string, string> = { FREE: "Gratuit", BASIC: "Starter", PRO: "Pro", PREMIUM: "Premium" };
const planColors: Record<string, string> = {
  FREE: "bg-ink/25",
  BASIC: "bg-jokko",
  PRO: "bg-jokko-deep",
  PREMIUM: "bg-sun",
};

const subscriptionStatusLabels: Record<string, string> = {
  ACTIVE: "Actif",
  TRIAL: "Essai",
  GRACE_PERIOD: "Période de grâce",
  EXPIRED: "Expiré",
  TRIAL_EXPIRED: "Essai terminé",
  SUSPENDED: "Suspendu",
};

const statusTone = (status: string) =>
  status === "TRIAL"
    ? "bg-sun/25 text-ink"
    : status === "GRACE_PERIOD"
      ? "bg-sun/40 text-ink"
      : status === "EXPIRED" || status === "TRIAL_EXPIRED"
        ? "bg-red-100 text-red-800"
        : status === "SUSPENDED"
          ? "bg-ink/10 text-ink/70"
          : "bg-jokko/10 text-jokko-deep";

const Pill = ({ tone, children }: { tone: string; children: string }) => (
  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${tone}`}>{children}</span>
);

const Panel = ({ title, aside, children, className = "" }: { title: string; aside?: string; children: React.ReactNode; className?: string }) => (
  <section className={`min-w-0 rounded-3xl border border-ink/10 bg-paper p-6 ${className}`}>
    <div className="mb-5 flex items-baseline justify-between gap-4">
      <h2 className="text-base font-extrabold tracking-tight">{title}</h2>
      {aside && <span className="text-xs font-semibold text-ink/50">{aside}</span>}
    </div>
    {children}
  </section>
);

const th = "pb-3 text-left text-[11px] font-extrabold uppercase tracking-[0.14em] text-ink/45";

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [subscriptionOverview, setSubscriptionOverview] = useState<SubscriptionOverviewStats | null>(null);

  useEffect(() => {
    getPlatformStats().then(setStats).catch(() => setStats(null));
    getSubscriptionOverviewStats()
      .then(setSubscriptionOverview)
      .catch(() => setSubscriptionOverview(null));
  }, []);

  if (!stats) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-ink/45">
        Chargement des statistiques...
      </div>
    );
  }

  const totalShops = stats.totalShops;
  const subscriptionsByPlan = subscriptionOverview?.subscriptionsByPlan ?? stats.subscriptionsByPlan;
  const freeCount = subscriptionsByPlan.FREE ?? 0;
  const billingShops = Object.values(subscriptionsByPlan).reduce((total, count) => total + count, 0);
  const payingShops = subscriptionOverview?.activePaidCount ?? Math.max(0, billingShops - freeCount);
  const mrr = subscriptionOverview?.mrr ?? stats.mrr;
  const arpu = payingShops > 0 ? Math.round(mrr / payingShops) : 0;
  const trialCount = subscriptionOverview?.subscriptionsByStatus.TRIAL ?? stats.subscriptionsByStatus.TRIAL ?? 0;
  const activeCount = subscriptionOverview?.subscriptionsByStatus.ACTIVE ?? stats.subscriptionsByStatus.ACTIVE ?? 0;
  const gracePeriodCount = subscriptionOverview?.gracePeriodCount ?? stats.subscriptionsByStatus.GRACE_PERIOD ?? 0;
  const expiredCount = subscriptionOverview?.expiredCount ?? 0;
  const pendingPaymentsCount = subscriptionOverview?.pendingSubscriptionPayments ?? 0;
  const trialShare = billingShops > 0 ? Math.round((trialCount / billingShops) * 100) : 0;

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const newThisWeek = stats.recentShops.filter(
    (s) => new Date(s.createdAt) >= sevenDaysAgo,
  ).length;

  const recentSubscriptions = subscriptionOverview?.recentSubscriptions ?? stats.recentSubscriptions;
  const planEntries = Object.entries(subscriptionsByPlan);
  const maxPlanCount = Math.max(...planEntries.map(([, c]) => c), 1);

  const todo = [
    { label: "Paiements en attente", hint: "Demandes de renouvellement à traiter", count: pendingPaymentsCount },
    { label: "En période de grâce", hint: `Délai configuré : ${subscriptionOverview?.gracePeriodDays ?? 5} jour(s)`, count: gracePeriodCount },
    { label: "Abonnements expirés", hint: "Passés au forfait gratuit", count: expiredCount },
  ];
  const figures = [
    { label: "Boutiques", value: String(totalShops), hint: `+${newThisWeek} cette semaine` },
    { label: "Abonnements actifs", value: String(activeCount), hint: `${payingShops} boutique(s) payante(s)` },
    { label: "En essai", value: String(trialCount), hint: `${trialShare} % de la base` },
    { label: "ARPU", value: `${arpu.toLocaleString("fr-FR").replace(/\u202f/g, " ")}`, hint: "FCFA par boutique payante" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        {/* Revenu récurrent */}
        <section className="relative overflow-hidden rounded-3xl bg-jokko p-8 text-white sm:p-10">
          <svg aria-hidden viewBox="0 0 200 200" className="pointer-events-none absolute -bottom-16 -right-10 h-80 w-80 overflow-visible text-white/10">
            <path d="M120 10V120A70 70 0 0 1 50 190H40" fill="none" stroke="currentColor" strokeWidth="46" strokeLinecap="round" />
          </svg>
          <p className="relative inline-flex items-center gap-2.5 text-xs font-extrabold uppercase tracking-[0.2em] text-sun">
            <span className="h-2.5 w-2.5 rounded-full bg-sun" /> Revenu mensuel récurrent
          </p>
          <p className="relative mt-5 text-5xl font-extrabold leading-none tracking-[-0.045em] sm:text-7xl">
            {mrr.toLocaleString("fr-FR").replace(/\u202f/g, " ")} <span className="text-2xl font-bold tracking-tight text-white/80 sm:text-3xl">FCFA</span>
          </p>
          <p className="relative mt-5 max-w-md text-sm leading-7 text-white/80">
            {payingShops > 0
              ? `Porté par ${payingShops} boutique(s) payante(s), soit ${arpu.toLocaleString("fr-FR").replace(/\u202f/g, " ")} FCFA en moyenne par boutique.`
              : "Aucune boutique payante pour le moment."}
          </p>
        </section>

        {/* À traiter */}
        <Panel title="À traiter" aside="Abonnements">
          <ul className="divide-y divide-ink/10">
            {todo.map(({ label, hint, count }) => (
              <li key={label}>
                <Link to="/admin/subscriptions" className="group flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                  <div>
                    <p className="text-sm font-extrabold">{label}</p>
                    <p className="mt-0.5 text-xs text-ink/55">{hint}</p>
                  </div>
                  <span className="flex items-center gap-2">
                    <span className={`text-3xl font-extrabold tabular-nums tracking-tight ${count > 0 ? "" : "text-ink/30"}`}>{count}</span>
                    <ArrowUpRight size={16} className="text-ink/30 transition group-hover:text-jokko" />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Panel>
      </div>

      {/* Chiffres clés à plat */}
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-ink/10 bg-ink/10 lg:grid-cols-4">
        {figures.map(({ label, value, hint }) => (
          <div key={label} className="bg-paper p-6">
            <dt className="text-xs font-extrabold uppercase tracking-[0.14em] text-ink/50">{label}</dt>
            <dd className="mt-2 text-4xl font-extrabold tabular-nums tracking-[-0.04em]">{value}</dd>
            <p className="mt-1 text-xs text-ink/55">{hint}</p>
          </div>
        ))}
      </dl>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Répartition par formule">
          <ul className="flex flex-col gap-4">
            {planEntries.map(([plan, count]) => (
              <li key={plan}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-bold">{planLabels[plan] ?? plan}</span>
                  <span className="font-extrabold tabular-nums">{count}</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-ink/10">
                  <div className={`h-2.5 rounded-full ${planColors[plan] ?? "bg-ink/40"}`} style={{ width: `${Math.max((count / maxPlanCount) * 100, count > 0 ? 4 : 0)}%` }} />
                </div>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Nouvelles boutiques" aside={`${stats.recentShops.length} récente(s)`} className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className={th}>Boutique</th>
                  <th className={th}>E-mail</th>
                  <th className={th}>Statut</th>
                  <th className={th}>Créée le</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentShops.slice(0, 6).map((shop) => (
                  <tr key={shop.id} className="border-t border-ink/10">
                    <td className="py-3 pr-4 font-bold">
                      <Link to={`/admin/shops/${shop.id}`} className="hover:text-jokko hover:underline">{shop.name}</Link>
                    </td>
                    <td className="py-3 pr-4 text-ink/60">{shop.email}</td>
                    <td className="py-3 pr-4"><Pill tone={statusTone(shop.status)}>{subscriptionStatusLabels[shop.status] ?? shop.status}</Pill></td>
                    <td className="py-3 tabular-nums text-ink/55">{new Date(shop.createdAt).toLocaleDateString("fr-FR")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      <Panel title="Abonnements récents" aside="Du plus récent au plus ancien">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className={th}>Boutique</th>
                <th className={th}>Formule</th>
                <th className={th}>Statut</th>
                <th className={th}>Prix</th>
                <th className={th}>Fin</th>
              </tr>
            </thead>
            <tbody>
              {recentSubscriptions.slice(0, 8).map((sub) => (
                <tr key={sub.id} className="border-t border-ink/10">
                  <td className="py-3 pr-4 font-bold">
                    <Link to={`/admin/shops/${sub.shop.id}`} className="hover:text-jokko hover:underline">{sub.shop.name}</Link>
                  </td>
                  <td className="py-3 pr-4 text-ink/60">{sub.plan.name}</td>
                  <td className="py-3 pr-4"><Pill tone={statusTone(sub.status)}>{subscriptionStatusLabels[sub.status] ?? sub.status}</Pill></td>
                  <td className="py-3 pr-4 tabular-nums text-ink/60">{sub.plan.price.toLocaleString("fr-FR").replace(/\u202f/g, " ")} FCFA</td>
                  <td className="py-3 tabular-nums text-ink/55">{sub.endDate ? new Date(sub.endDate).toLocaleDateString("fr-FR") : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>
    </div>
  );
}
