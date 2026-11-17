import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Search, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  getSuperAdminSubscriptions,
  type SuperAdminSubscriptionsResponse,
} from "../../services";

const statusLabels: Record<string, string> = {
  ACTIVE: "Actif",
  TRIAL: "Essai",
  GRACE_PERIOD: "Période de grâce",
  EXPIRED: "Expiré",
  TRIAL_EXPIRED: "Essai terminé",
  SUSPENDED: "Suspendu",
};

const statusClasses: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-700",
  TRIAL: "bg-violet-50 text-violet-700",
  GRACE_PERIOD: "bg-amber-50 text-amber-800",
  EXPIRED: "bg-red-50 text-red-700",
  TRIAL_EXPIRED: "bg-red-50 text-red-700",
  SUSPENDED: "bg-slate-100 text-slate-600",
};

const formatDate = (value: string | null) =>
  value
    ? new Date(value).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

export default function SuperAdminSubscriptions() {
  const navigate = useNavigate();
  const [result, setResult] = useState<SuperAdminSubscriptionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [plan, setPlan] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 350);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => setPage(1), [debouncedSearch, status, plan]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSuperAdminSubscriptions({
        page,
        limit: 20,
        q: debouncedSearch || undefined,
        status: status || undefined,
        plan: plan || undefined,
      });
      setResult(data);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Impossible de charger les abonnements.");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, status, plan]);

  useEffect(() => {
    void load();
  }, [load]);

  const rows = result?.data ?? [];
  const pagination = result?.pagination;

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Abonnements</h1>
          <p className="mt-1 text-sm text-slate-500">
            Suivi des abonnements facturables des boutiques principales. Les boutiques secondaires héritent du forfait de leur boutique principale.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Actualiser
        </button>
      </div>

      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-[minmax(220px,1fr)_180px_160px]">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Boutique, propriétaire, email..."
            className="w-full rounded-xl border border-slate-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-500"
          />
        </div>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
        >
          <option value="">Tous les statuts</option>
          <option value="ACTIVE">Actif</option>
          <option value="TRIAL">Essai</option>
          <option value="GRACE_PERIOD">Période de grâce</option>
          <option value="EXPIRED">Expiré</option>
          <option value="TRIAL_EXPIRED">Essai terminé</option>
          <option value="SUSPENDED">Suspendu</option>
        </select>
        <select
          value={plan}
          onChange={(event) => setPlan(event.target.value)}
          className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-emerald-500"
        >
          <option value="">Tous les forfaits</option>
          <option value="FREE">Essentielle</option>
          <option value="BASIC">Basic</option>
          <option value="PRO">Pro</option>
          <option value="PREMIUM">Premium</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Boutique / propriétaire</th>
                <th className="px-5 py-3">Forfait</th>
                <th className="px-5 py-3">Statut</th>
                <th className="px-5 py-3">Expiration</th>
                <th className="px-5 py-3">Fin de grâce</th>
                <th className="px-5 py-3">Dernier paiement</th>
                <th className="px-5 py-3">Détail</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-400">Chargement des abonnements...</td></tr>
              ) : rows.length === 0 ? (
                <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-400">Aucun abonnement trouvé.</td></tr>
              ) : rows.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-slate-900">{row.shop.name}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{row.owner.name} · {row.owner.email}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-medium text-slate-800">{row.plan.name}</p>
                    <p className="text-xs text-slate-500">{row.plan.price.toLocaleString("fr-FR")} FCFA</p>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses[row.status] ?? "bg-slate-100 text-slate-600"}`}>
                      {statusLabels[row.status] ?? row.status}
                    </span>
                    {row.status === "GRACE_PERIOD" && (
                      <p className="mt-1 text-xs text-amber-700">{row.gracePeriodDaysRemaining} jour(s) restant(s)</p>
                    )}
                  </td>
                  <td className="px-5 py-4 text-slate-600">{formatDate(row.endDate)}</td>
                  <td className="px-5 py-4 text-slate-600">{row.gracePeriodEndsAt ? formatDate(row.gracePeriodEndsAt) : "—"}</td>
                  <td className="px-5 py-4">
                    {row.latestPayment ? (
                      <>
                        <p className="font-medium text-slate-700">{row.latestPayment.amount.toLocaleString("fr-FR")} FCFA · {row.latestPayment.provider}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{row.latestPayment.status} · {formatDate(row.latestPayment.paidAt ?? row.latestPayment.createdAt)}</p>
                      </>
                    ) : <span className="text-slate-400">Aucun paiement</span>}
                  </td>
                  <td className="px-5 py-4">
                    <button
                      type="button"
                      onClick={() => navigate(`/admin/shops/${row.shopId}`)}
                      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-white"
                    >
                      Voir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-slate-500">
            {pagination ? `${pagination.total} abonnement(s) · Page ${pagination.page} sur ${Math.max(1, pagination.totalPages)}` : "—"}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!pagination || page <= 1 || loading}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:opacity-40"
              aria-label="Page précédente"
            ><ChevronLeft size={16} /></button>
            <button
              type="button"
              disabled={!pagination || page >= pagination.totalPages || loading}
              onClick={() => setPage((value) => value + 1)}
              className="rounded-lg border border-slate-200 p-2 text-slate-600 disabled:opacity-40"
              aria-label="Page suivante"
            ><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
    </section>
  );
}
