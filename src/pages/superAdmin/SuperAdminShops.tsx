// pages/superAdmin/SuperAdminShops.tsx
import { useEffect, useState, useCallback } from "react";
import { Search, Store, ChevronLeft, ChevronRight, Crown, Users, Package, ShoppingCart } from "lucide-react";
import { getShopsWithPagination } from "../../services";
import { Navigate, useNavigate } from "react-router-dom";

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
    plan: { code: string; name: string; price: number };
  } | null;
  counts: { users: number; products: number; sales: number };
};

type ShopsResponse = {
  data: ShopRow[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
};

const planBadge: Record<string, string> = {
  FREE: "bg-gray-100 text-gray-600",
  BASIC: "bg-sky-50 text-sky-600",
  PRO: "bg-emerald-50 text-emerald-600",
  PREMIUM: "bg-amber-50 text-amber-600",
};

const subStatusBadge: Record<string, string> = {
  ACTIVE: "bg-emerald-50 text-emerald-600",
  TRIAL: "bg-violet-50 text-violet-600",
  EXPIRED: "bg-red-50 text-red-600",
  TRIAL_EXPIRED: "bg-red-50 text-red-600",
  SUSPENDED: "bg-slate-100 text-slate-500",
};

export default function SuperAdminShops() {
  const [result, setResult] = useState<ShopsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [page, setPage] = useState(1);

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
  const pagination = result?.pagination;

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Boutiques</h2>
          <p className="mt-0.5 text-sm text-gray-500">
            {pagination ? `${pagination.total} boutique(s) au total` : "Chargement..."}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Rechercher par nom, email ou propriétaire..."
            className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-500"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500"
        >
          <option value="">Tous les statuts</option>
          <option value="ACTIVE">Actif</option>
          <option value="SUSPENDED">Suspendu</option>
        </select>

        <select
          value={planFilter}
          onChange={(e) => setPlanFilter(e.target.value)}
          className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-emerald-500"
        >
          <option value="">Tous les plans</option>
          <option value="FREE">Free</option>
          <option value="BASIC">Basic</option>
          <option value="PRO">Pro</option>
          <option value="PREMIUM">Premium</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400">
                <th className="px-5 py-3">Boutique</th>
                <th className="px-5 py-3">Contact</th>
                <th className="px-5 py-3">Statut</th>
                <th className="px-5 py-3">Abonnement</th>
                <th className="px-5 py-3">Fin</th>
                <th className="px-5 py-3">Activité</th>
              </tr>

            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-gray-400">
                    Chargement...
                  </td>
                </tr>
              )}

              {!loading && shops.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-gray-400">
                    Aucune boutique trouvée.
                  </td>
                </tr>
              )}

              {!loading &&
                shops.map((shop) => (
                    
                  <tr
                    key={shop.id}
                        onClick={() => navigate(`/admin/shops/${shop.id}`)}

                    className="border-b border-gray-50 transition hover:bg-slate-50/60 cursor-pointer"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                          <Store size={15} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-slate-900 truncate">{shop.name}</p>
                          <p className="text-xs text-gray-400 truncate">{shop.ownerName}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-3">
                      <p className="text-slate-700 truncate max-w-48">{shop.email}</p>
                      <p className="text-xs text-gray-400">{shop.phone}</p>
                    </td>

                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          shop.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {shop.status}
                      </span>
                    </td>

                    <td className="px-5 py-3">
                      {shop.subscription ? (
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-flex w-fit items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
                              planBadge[shop.subscription.plan.code] ?? "bg-gray-100 text-gray-600"
                            }`}
                          >
                            <Crown size={10} />
                            {shop.subscription.plan.name}
                          </span>
                          <span
                            className={`inline-flex w-fit rounded-full px-2 py-0.5 text-[10px] font-medium ${
                              subStatusBadge[shop.subscription.status] ?? "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {shop.subscription.status}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </td>

                    <td className="px-5 py-3 text-gray-500">
                      {shop.subscription?.endDate
                        ? new Date(shop.subscription.endDate).toLocaleDateString("fr-FR")
                        : "—"}
                    </td>

                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3 text-xs text-gray-500">
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
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3">
            <p className="text-xs text-gray-400">
              Page {pagination.page} sur {pagination.totalPages}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}