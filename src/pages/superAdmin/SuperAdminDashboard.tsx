import {
  BarChart3,
  Building2,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { getPlatformStats } from "../../services";
import type { PlatformStats } from "../../types";

function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = "slate",
}: {
  title: string;
  value: any;
  subtitle: string;
  icon: React.ReactNode;
  color?: "slate" | "emerald" | "yellow" | "red" | "blue" | "orange";
}) {
  const colors = {
    slate: "bg-slate-100 text-slate-700",
    emerald: "bg-emerald-100 text-emerald-700",
    yellow: "bg-yellow-100 text-yellow-700",
    red: "bg-red-100 text-red-700",
    blue: "bg-blue-100 text-blue-700",
    orange: "bg-orange-100 text-orange-700",
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <div className="mt-2 text-2xl font-bold text-slate-900">{value}</div>
          <p className="mt-1 text-xs text-gray-400">{subtitle}</p>
        </div>
        <div className={`rounded-xl p-3 shrink-0 ${colors[color]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getPlatformStats();
        setStats(data);
      } catch (error) {
        console.error(error);
        toast.error("Erreur lors du chargement des statistiques");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-emerald-600" />
          <p className="mt-4 text-sm text-gray-500">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="rounded-2xl bg-white px-6 py-8 shadow-sm text-center">
        <p className="text-sm text-gray-500">Impossible de charger les statistiques.</p>
      </div>
    );
  }

  const mrrDisplay = stats.mrr?.toLocaleString("fr-FR", {
    style: "currency",
    currency: "XOF",
  }) || "0 FCFA";

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Boutiques actives"
          value={stats.totalShops}
          subtitle="Total de boutiques"
          icon={<Building2 size={24} />}
          color="emerald"
        />
        <StatCard
          title="MRR Estimé"
          value={mrrDisplay}
          subtitle="Revenu mensuel récurrent"
          icon={<CreditCard size={24} />}
          color="blue"
        />
        <StatCard
          title="Abonnements actifs"
          value={stats.subscriptionsByStatus?.ACTIVE || 0}
          subtitle="Abonnements en cours"
          icon={<TrendingUp size={24} />}
          color="orange"
        />
        <StatCard
          title="En période d'essai"
          value={stats.subscriptionsByStatus?.TRIAL || 0}
          subtitle="Essai gratuit (14 jours)"
          icon={<BarChart3 size={24} />}
          color="yellow"
        />
      </div>

      {/* Status & Plan Breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Shops by Status */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Boutiques par statut
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.shopsByStatus).map(([status, count]: [string, number]) => (
              <div key={status} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{status}</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{
                        width: `${
                          (count / stats.totalShops) * 100
                        }%`,
                      }}
                    />
                  </div>
                  <span className="w-12 text-right font-semibold text-slate-900">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subscriptions by Plan */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Abonnements par plan
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.subscriptionsByPlan).map(([plan, count]: [string, number]) => (
              <div key={plan} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">{plan}</span>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-24 rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{
                        width: `${
                          (count /
                            Object.values(stats.subscriptionsByPlan).reduce(
                              (a: number, b: number) => a + b,
                              0
                            )) *
                          100
                        }%`,
                      }}
                    />
                  </div>
                  <span className="w-12 text-right font-semibold text-slate-900">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Shops */}
      {stats.recentShops && stats.recentShops.length > 0 && (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Récemment inscrites
          </h3>
          <div className="space-y-3">
            {stats.recentShops.slice(0, 5).map((shop: any) => (
              <div
                key={shop.id}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3"
              >
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{shop.name}</p>
                  <p className="text-xs text-gray-500">{shop.email}</p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    shop.status === "ACTIVE"
                      ? "bg-emerald-100 text-emerald-700"
                      : shop.status === "SUSPENDED"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                  }`}
                >
                  {shop.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Subscriptions */}
      {stats.recentSubscriptions && stats.recentSubscriptions.length > 0 && (
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Abonnements récents
          </h3>
          <div className="space-y-3">
            {stats.recentSubscriptions.slice(0, 5).map((sub: any) => (
              <div
                key={sub.id}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-4 py-3"
              >
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{sub.shop.name}</p>
                  <p className="text-xs text-gray-500">{sub.plan.name}</p>
                </div>
                <div className="text-right">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      sub.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-700"
                        : sub.status === "TRIAL"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {sub.status}
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
