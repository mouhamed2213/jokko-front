// pages/superAdmin/SuperAdminShops.tsx
import {
  ChevronLeft,
  ChevronRight,
  Crown,
  Package,
  Search,
  Loader2,
  CalendarPlus,
  ShoppingCart,
  Store,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { extendTrialPeriod, getShopsWithPagination } from "../../services";

type ShopRow = {
  id: number;
  name: string;
  ownerName: string;
  email: string;
  phone: string;
  status: string;
  createdAt: string;
  subscription: {
    status: string;
    endDate: string | null;
    gracePeriodEndsAt?: string | null;
    gracePeriodDaysRemaining?: number;
    plan: { code: string; name: string; price: number };
  } | null;
  counts: { users: number; products: number; sales: number };
};

type ShopsResponse = {
  data: ShopRow[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
};

const planBadge: Record<string, string> = {
  FREE: "bg-ink/5 text-ink/70",
  BASIC: "bg-jokko/10 text-jokko-deep",
  PRO: "bg-jokko/10 text-jokko",
  PREMIUM: "bg-sun/20 text-ink",
};

const subStatusBadge: Record<string, string> = {
  ACTIVE: "bg-jokko/10 text-jokko",
  TRIAL: "bg-ink/5 text-ink",
  GRACE_PERIOD: "bg-sun/20 text-ink",
  EXPIRED: "bg-red-50 text-red-600",
  TRIAL_EXPIRED: "bg-red-50 text-red-600",
  SUSPENDED: "bg-ink/5 text-ink/60",
};

export default function SuperAdminShops() {
  const [result, setResult] = useState<ShopsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [page, setPage] = useState(1);
  const [renewalShop, setRenewalShop] = useState<ShopRow | null>(null);
  const [renewalDays, setRenewalDays] = useState(30);
  const [renewing, setRenewing] = useState(false);

  const navigate = useNavigate();

  // Debounce search input
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, statusFilter, planFilter]);

  const fetchShops = useCallback(() => {
    setLoading(true);
    getShopsWithPagination({
      page,
      limit: 20,
      q: debouncedSearch || undefined,
      status: statusFilter || undefined,
      plan: planFilter || undefined,
    })
      .then(setResult)
      .finally(() => setLoading(false));
  }, [page, debouncedSearch, statusFilter, planFilter]);

  useEffect(() => {
    fetchShops();
  }, [fetchShops]);

  const shops = result?.data ?? [];

  const handleRenewal = async () => {
    if (!renewalShop || !Number.isInteger(renewalDays) || renewalDays <= 0) {
      toast.error("Le nombre de jours doit être supérieur à 0");
      return;
    }

    setRenewing(true);
    try {
      await extendTrialPeriod(renewalShop.id, renewalDays);
      toast.success("Abonnement prolongé de " + renewalDays + " jour(s)");
      setRenewalShop(null);
      setRenewalDays(30);
      fetchShops();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erreur lors du prolongement de l'abonnement");
    } finally {
      setRenewing(false);
    }
  };
  const pagination = result?.pagination;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-ink/60">
            {pagination
              ? `${pagination.total} boutique(s) au total`
              : "Chargement..."}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-3xl border border-ink/10 bg-paper p-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/45"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email ou propriétaire..."
            className="w-full rounded-xl border border-ink/10 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-jokko/100"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-ink/10 px-3 py-2.5 text-sm text-ink/75 outline-none focus:border-jokko/100"
        >
          <option value="">Tous les statuts</option>
          <option value="ACTIVE">Actif</option>
          <option value="SUSPENDED">Suspendu</option>
          <option value="ARCHIVED">Archivée</option>
        </select>

        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="rounded-xl border border-ink/10 px-3 py-2.5 text-sm text-ink/75 outline-none focus:border-jokko/100"
        >
          <option value="">Tous les plans</option>
          <option value="FREE">Free</option>
          <option value="BASIC">Basic</option>
          <option value="PRO">Pro</option>
          <option value="PREMIUM">Premium</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-3xl border border-ink/10 bg-paper overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-ink/10 text-xs uppercase tracking-wider text-ink/45">
                <th className="px-5 py-3">Boutique</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Statut</th>
                <th className="px-5 py-3">Abonnement</th>
                <th className="px-5 py-3">Fin</th>
                <th className="px-5 py-3">Activité</th>
                <th className="px-5 py-3">Prolongement</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-8 text-center text-ink/45"
                  >
                    Chargement...
                  </td>
                </tr>
              )}

              {!loading && shops.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-5 py-8 text-center text-ink/45"
                  >
                    Aucune boutique trouvée.
                  </td>
                </tr>
              )}

              {!loading &&
                shops.map((shop) => (
                  <tr
                    key={shop.id}
                    onClick={() => navigate(`/admin/shops/${shop.id}`)}
                    className="border-b border-ink/10 transition hover:bg-cream cursor-pointer"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-jokko/10 text-jokko shrink-0">
                          <Store size={15} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-ink truncate">
                            {shop.name}
                          </p>
                          <p className="text-xs text-ink/45 truncate">
                            {shop.ownerName}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3">
                      <p className="text-ink/75 truncate max-w-48">
                        {shop.email}
                      </p>
                      <p className="text-xs text-ink/45">{shop.phone}</p>
                    </td>

                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          shop.status === "ACTIVE"
                            ? "bg-jokko/10 text-jokko"
                            : shop.status === "ARCHIVED"
                              ? "bg-red-50 text-red-600"
                              : "bg-ink/5 text-ink/60"
                        }`}
                      >
                        {shop.status === "ARCHIVED" ? "ARCHIVÉE" : shop.status}
                      </span>
                    </td>

                    <td className="px-5 py-3">
                      {shop.subscription ? (
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                              planBadge[shop.subscription.plan.code] ??
                              "bg-ink/5 text-ink/70"
                            }`}
                          >
                            <Crown size={10} />
                            {shop.subscription.plan.name}
                          </span>
                          <span
                            className={`inline-flex w-fit rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              subStatusBadge[shop.subscription.status] ??
                              "bg-ink/5 text-ink/60"
                            }`}
                          >
                            {shop.subscription.status === "GRACE_PERIOD" ? "Période de grâce" : shop.subscription.status}
                          </span>
                          {shop.subscription.status === "GRACE_PERIOD" && (
                            <span className="text-[10px] text-ink">
                              {shop.subscription.gracePeriodDaysRemaining ?? 0} jour(s) restant(s)
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-ink/25">—</span>
                      )}
                    </td>

                    <td className="px-5 py-3 text-ink/60">
                      {shop.subscription?.endDate
                        ? new Date(shop.subscription.endDate).toLocaleDateString("fr-FR")
                        : "—"}
                      {shop.subscription?.status === "GRACE_PERIOD" && shop.subscription.gracePeriodEndsAt && (
                        <span className="mt-1 block text-[10px] text-ink">
                          Grâce jusqu'au {new Date(shop.subscription.gracePeriodEndsAt).toLocaleString("fr-FR").replace(/\u202f/g, " ")}
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3 text-xs text-ink/60">
                        <span className="flex items-center gap-1">
                          <Users size={12} /> {shop.counts.users}
                        </span>
                        <span className="flex items-center gap-1">
                          <Package size={12} /> {shop.counts.products}
                        </span>
                        <span className="flex items-center gap-1">
                          <ShoppingCart size={12} /> {shop.counts.sales}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-3">
                      <button
                        type="button"
                        disabled={!shop.subscription?.endDate || shop.subscription.plan.code === "FREE"}
                        onClick={(event) => {
                          event.stopPropagation();
                          setRenewalShop(shop);
                        }}
                        className="inline-flex items-center gap-1.5 rounded-full bg-jokko/10 px-3 py-1.5 text-xs font-medium text-jokko-deep transition hover:bg-jokko/15 disabled:cursor-not-allowed disabled:opacity-40"
                        title={!shop.subscription?.endDate || shop.subscription.plan.code === "FREE" ? "Cette boutique ne peut pas être prolongée" : "Prolonger l'abonnement"}
                      >
                        <CalendarPlus size={13} />
                        Prolonger
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-ink/10 px-5 py-3">
            <p className="text-xs text-ink/45">
              Page {pagination.page} sur {pagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/10 text-ink/60 transition hover:bg-ink/5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() =>
                  setPage((p) => Math.min(pagination.totalPages, p + 1))
                }
                className="flex h-8 w-8 items-center justify-center rounded-full border border-ink/10 text-ink/60 transition hover:bg-ink/5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
      {renewalShop && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm" onClick={() => !renewing && setRenewalShop(null)}>
          <div className="w-full max-w-sm rounded-3xl bg-paper p-6 shadow-xl" onClick={(event) => event.stopPropagation()}>
            <h3 className="mb-1 text-lg font-bold text-ink">Prolonger l'abonnement</h3>
            <p className="mb-5 text-sm text-ink/60">Boutique : <span className="font-medium text-ink/75">{renewalShop.name}</span></p>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-ink/45">Nombre de jours</label>
            <input type="number" min={1} step={1} value={renewalDays} onChange={(event) => setRenewalDays(Number(event.target.value))} className="mb-2 w-full rounded-xl border border-ink/10 px-3 py-2.5 text-sm text-ink/75 outline-none focus:border-jokko/100 focus:ring-2 focus:ring-jokko/15" />
            <p className="mb-5 text-xs text-ink/45">Fin actuelle : {renewalShop.subscription?.endDate ? new Date(renewalShop.subscription.endDate).toLocaleDateString("fr-FR") : "—"}</p>
            <div className="flex gap-2">
              <button type="button" disabled={renewing} onClick={() => setRenewalShop(null)} className="flex-1 rounded-full border border-ink/10 px-4 py-2.5 text-sm text-ink/75 hover:bg-ink/5 disabled:opacity-50">Annuler</button>
              <button type="button" disabled={renewing || !Number.isInteger(renewalDays) || renewalDays <= 0} onClick={handleRenewal} className="flex flex-1 items-center justify-center gap-2 rounded-full bg-jokko px-4 py-2.5 text-sm font-semibold text-white hover:bg-jokko-deep disabled:cursor-not-allowed disabled:opacity-50">
                {renewing && <Loader2 size={14} className="animate-spin" />}
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
