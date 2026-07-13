import { useEffect, useState } from "react";
import {
  Store,
  Wallet,
  Clock,
  Crown,
  TrendingUp,
  Users,
} from "lucide-react";
import { getPlatformStats } from "../../services";

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

function StatCard({
  icon: Icon,
  label,
  value,
  sublabel,
  accent,
}: {
  icon: any;
  label: string;
  value: string;
  sublabel?: string;
  accent: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${accent}`}>
          <Icon size={16} />
        </div>
      </div>
      <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
      {sublabel && <p className="mt-1 text-xs text-gray-400">{sublabel}</p>}
    </div>
  );
}

const planColors: Record<string, string> = {
  FREE: "bg-gray-300",
  BASIC: "bg-sky-500",
  PREMIUM: "bg-amber-500",
};

export default function SuperAdminDashboard() {
  const [stats, setStats] = useState<PlatformStats | null>(null);

  useEffect(() => {
    getPlatformStats().then(setStats).catch(() => setStats(null));
  }, []);

  if (!stats) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-gray-400">
        Chargement des statistiques...
      </div>
    );
  }

  const totalShops = stats.totalShops;
  const freeCount = stats.subscriptionsByPlan.FREE ?? 0;
  const payingShops = totalShops - freeCount;
  const arpu = payingShops > 0 ? Math.round(stats.mrr / payingShops) : 0;
  const trialCount = stats.subscriptionsByStatus.TRIAL ?? 0;
  const activeCount = stats.subscriptionsByStatus.ACTIVE ?? 0;
  const trialShare = totalShops > 0 ? Math.round((trialCount / totalShops) * 100) : 0;

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const newThisWeek = stats.recentShops.filter(
    (s) => new Date(s.createdAt) >= sevenDaysAgo,
  ).length;

  const planEntries = Object.entries(stats.subscriptionsByPlan);
  const maxPlanCount = Math.max(...planEntries.map(([, c]) => c), 1);

  return (
    <div className="flex flex-col gap-6">
      {/* Top stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Store}
          label="Boutiques totales"
          value={String(totalShops)}
          sublabel={`+${newThisWeek} cette semaine`}
          accent="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          icon={Wallet}
          label="MRR"
          value={`${stats.mrr.toLocaleString("fr-FR")} FCFA`}
          sublabel={`ARPU : ${arpu.toLocaleString("fr-FR")} FCFA / boutique`}
          accent="bg-sky-50 text-sky-600"
        />
        <StatCard
          icon={Crown}
          label="Abonnements actifs"
          value={String(activeCount)}
          sublabel={`${payingShops} boutiques payantes`}
          accent="bg-amber-50 text-amber-600"
        />
        <StatCard
          icon={Clock}
          label="En période d'essai"
          value={String(trialCount)}
          sublabel={`${trialShare}% de la base`}
          accent="bg-violet-50 text-violet-600"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Plan distribution */}
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-sm font-semibold text-slate-900">
            Répartition par plan
          </h3>
          <div className="flex flex-col gap-3">
            {planEntries.map(([plan, count]) => (
              <div key={plan}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-600">{plan}</span>
                  <span className="text-gray-400">{count}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-slate-100">
                  <div
                    className={`h-2 rounded-full ${planColors[plan] ?? "bg-slate-400"}`}
                    style={{ width: `${(count / maxPlanCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent shops */}
        <div className="rounded-2xl bg-white p-5 shadow-sm lg:col-span-2">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
            <Users size={15} /> Nouvelles boutiques
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-wider text-gray-400">
                  <th className="pb-2">Boutique</th>
                  <th className="pb-2">Email</th>
                  <th className="pb-2">Statut</th>
                  <th className="pb-2">Créée le</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentShops.slice(0, 6).map((shop) => (
                  <tr key={shop.id} className="border-t border-gray-50">
                    <td className="py-2 font-medium text-slate-900">{shop.name}</td>
                    <td className="py-2 text-gray-500">{shop.email}</td>
                    <td className="py-2">
                      <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
                        {shop.status}
                      </span>
                    </td>
                    <td className="py-2 text-gray-400">
                      {new Date(shop.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Recent subscriptions */}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
          <TrendingUp size={15} /> Abonnements récents
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wider text-gray-400">
                <th className="pb-2">Boutique</th>
                <th className="pb-2">Plan</th>
                <th className="pb-2">Statut</th>
                <th className="pb-2">Prix</th>
                <th className="pb-2">Fin</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentSubscriptions.slice(0, 8).map((sub) => (
                <tr key={sub.id} className="border-t border-gray-50">
                  <td className="py-2 font-medium text-slate-900">{sub.shop.name}</td>
                  <td className="py-2 text-gray-500">{sub.plan.name}</td>
                  <td className="py-2">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        sub.status === "TRIAL"
                          ? "bg-violet-50 text-violet-600"
                          : "bg-emerald-50 text-emerald-600"
                      }`}
                    >
                      {sub.status}
                    </span>
                  </td>
                  <td className="py-2 text-gray-500">
                    {sub.plan.price.toLocaleString("fr-FR")} FCFA
                  </td>
                  <td className="py-2 text-gray-400">
                    {sub.endDate ? new Date(sub.endDate).toLocaleDateString("fr-FR") : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}