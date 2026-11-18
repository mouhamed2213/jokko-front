import { Download, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { deleteSale, getSales } from "../services/index";
import { getStoredUser, isAdmin } from "../types/auth";
import type { Sale } from "../types/index";
import { exportSalesToExcel } from "../utils/exportExcel";
import { exportSalesPDF } from "../utils/exportPDF";

const fmt = (v: number) => `${v.toLocaleString("fr-FR")} FCFA`;

const statusBadge: Record<string, string> = {
  PAID: "bg-emerald-100 text-emerald-700",
  PARTIAL: "bg-yellow-100 text-yellow-700",
  UNPAID: "bg-red-100 text-red-700",
};
const statusLabel: Record<string, string> = {
  PAID: "Payée",
  PARTIAL: "Partielle",
  UNPAID: "Non réglée",
};

export default function SalesHistory() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const admin = isAdmin();
  const user = getStoredUser();

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const salesRes = await getSales({
        status: statusFilter || undefined,
        search: search.trim() || undefined,
        page,
        limit: 10,
      });
      setSales(salesRes.data);
      setTotal(salesRes.pagination.total);
      setTotalPages(salesRes.pagination.totalPages);
    } catch {
      toast.error("Erreur chargement ventes");
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, page]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteSale = async (id: number) => {
    if (!confirm("Annuler cette vente ? Le stock sera restauré.")) return;
    try {
      await deleteSale(id);
      toast.success("Vente annulée");
      await fetchData();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Erreur");
    }
  };

  if (!user) {
    toast.error("User not found");
    return null;
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Historique des ventes
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Retrouvez toutes vos ventes et leurs factures.
          </p>
        </div>
        <Link
          to="/sales"
          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
        >
          + Nouvelle vente
        </Link>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-45">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="N° facture, client..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-xl border border-gray-300 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-emerald-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
        >
          <option value="">Toutes les ventes</option>
          <option value="PAID">Payées</option>
          <option value="PARTIAL">Partielles</option>
          <option value="UNPAID">Non réglées</option>
        </select>
        <div className="flex gap-2">
          <button
            onClick={() => exportSalesToExcel(sales, user)}
            className="flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm transition border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            <Download size={15} />
            <span>Excel</span>
          </button>
          <button
            onClick={() => exportSalesPDF(sales, user)}
            className="flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm transition border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
          >
            <Download size={15} />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* Stats */}
      <p className="text-sm text-gray-500">{total} vente(s)</p>

      {/* Liste ventes */}
      {loading ? (
        <div className="rounded-2xl bg-white p-8 text-center text-gray-400">
          Chargement...
        </div>
      ) : !sales.length ? (
        <div className="rounded-2xl bg-white p-8 text-center text-gray-400">
          Aucune vente trouvée.
        </div>
      ) : (
        <div className="space-y-3">
          {sales.map((sale) => (
            <div
              key={sale.id}
              className="rounded-2xl bg-white px-5 py-4 shadow-sm"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900">
                      {sale.items.map((item) => item.productName).join(", ")}
                    </p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge[sale.status]}`}
                    >
                      {statusLabel[sale.status]}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {sale.client?.name ||
                      sale.customerName ||
                      "Client non précisé"}{" "}
                    • {new Date(sale.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                  <div className="mt-1 text-xs text-gray-400">
                    {sale.items.reduce((sum, item) => sum + item.quantity, 0)} article(s) • Total :{" "}
                    <strong className="text-slate-700">
                      {fmt(sale.totalAmount)}
                    </strong>{" "}
                    • Payé :{" "}
                    <strong className="text-emerald-600">
                      {fmt(sale.paidAmount)}
                    </strong>
                    {sale.remaining > 0 && (
                      <>
                        {" "}
                        • Reste :{" "}
                        <strong className="text-red-600">
                          {fmt(sale.remaining)}
                        </strong>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => {
                      window.location.href = `/invoices?search=${encodeURIComponent(sale.invoiceNumber || String(sale.id))}`;
                    }}
                    className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700 transition hover:bg-emerald-100"
                  >
                    Voir la facture
                  </button>
                  {admin && (
                    <button
                      onClick={() => handleDeleteSale(sale.id)}
                      className="rounded-lg border border-red-200 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50"
                    >
                      Annuler
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="flex items-center justify-between rounded-2xl bg-white px-5 py-3 shadow-sm">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
          className="flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          ← Précédent
        </button>
        <span className="text-sm text-gray-500">
          Page <strong className="text-slate-900">{page}</strong> sur{" "}
          <strong className="text-slate-900">{totalPages}</strong>
          <span className="ml-2 text-gray-400">({total} au total)</span>
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page === totalPages}
          className="flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          Suivant →
        </button>
      </div>
    </section>
  );
}
