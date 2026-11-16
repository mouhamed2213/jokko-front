// pages/superAdmin/SuperAdminOwners.tsx
import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { getOwners } from "../../services";
import type { OwnersResponse } from "../../types/owner";

const planBadge: Record<string, string> = {
  FREE: "bg-gray-100 text-gray-600",
  BASIC: "bg-sky-50 text-sky-600",
  PRO: "bg-emerald-50 text-emerald-600",
  PREMIUM: "bg-amber-50 text-amber-600",
};

export default function SuperAdminOwners() {
  const [result, setResult] = useState<OwnersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(t);
  }, [search]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  const fetchOwners = useCallback(() => {
    setLoading(true);
    getOwners({ page, limit: 15, q: debouncedSearch || undefined })
      .then(setResult)
      .catch(() => toast.error("Impossible de charger les propriétaires"))
      .finally(() => setLoading(false));
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchOwners();
  }, [fetchOwners]);

  const owners = result?.data ?? [];
  const pagination = result?.pagination;

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher par nom, email ou boutique..."
          className="w-full rounded-xl border border-gray-200 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-emerald-500"
        />
      </div>

      <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-400">
                <th className="px-5 py-3">Propriétaire</th>
                <th className="px-5 py-3">Téléphone</th>
                <th className="px-5 py-3">Réseau</th>
                <th className="px-5 py-3">Plans</th>
                <th className="px-5 py-3">Prochaine échéance</th>
                <th className="px-5 py-3">Alertes</th>
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
              {!loading && owners.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-gray-400">
                    Aucun propriétaire trouvé.
                  </td>
                </tr>
              )}
              {!loading &&
                owners.map((o) => {
                  const expiry = o.nextExpiry ? new Date(o.nextExpiry) : null;
                  const expired = !!expiry && expiry.getTime() < Date.now();
                  return (
                    <tr
                      key={o.id}
                      onClick={() => navigate(`/admin/owners/${o.id}`)}
                      className="cursor-pointer border-b border-gray-50 transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-3.5">
                        <p className="font-semibold text-slate-900">{o.name}</p>
                        <p className="text-xs text-gray-400">{o.email}</p>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">{o.phone ?? "—"}</td>
                      <td className="px-5 py-3.5">
                        <p className="text-slate-800">
                          {o.shopsCount} boutique{o.shopsCount > 1 ? "s" : ""}
                        </p>
                        <p className="text-xs text-gray-400">
                          {o.primaryShopName ?? "—"}
                          {o.archivedShops > 0 && ` · ${o.archivedShops} archivée(s)`}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          {o.plans.length === 0 && <span className="text-gray-400">—</span>}
                          {o.plans.map((p) => (
                            <span
                              key={p}
                              className={`rounded-full px-2 py-0.5 text-xs font-medium ${planBadge[p] ?? "bg-gray-100 text-gray-600"}`}
                            >
                              {p}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className={`px-5 py-3.5 ${expired ? "font-medium text-red-600" : "text-gray-600"}`}>
                        {expiry ? expiry.toLocaleDateString("fr-FR") : "—"}
                      </td>
                      <td className="px-5 py-3.5">
                        {o.expiredShops > 0 ? (
                          <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-600">
                            {o.expiredShops} expirée(s)
                          </span>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-gray-100 px-5 py-3 text-xs text-gray-500">
            <span>
              Page {pagination.page} / {pagination.totalPages} · {pagination.total} propriétaires
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                type="button"
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 text-gray-500 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
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
