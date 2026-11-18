import { Download } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { getProducts, getStockMovements } from "../services/index";
import { getStoredUser } from "../types/auth";
import type { Product, StockMovement } from "../types/index";
import { exportStockToExcel } from "../utils/exportExcel";

const fmt = (v: number) => v.toLocaleString("fr-FR");

const typeLabel: Record<string, { label: string; color: string }> = {
  ENTRY: { label: "Entrée", color: "bg-emerald-100 text-emerald-700" },
  OUT: { label: "Sortie", color: "bg-red-100 text-red-700" },
  SALE: { label: "Vente", color: "bg-blue-100 text-blue-700" },
  ADJUST: { label: "Ajustement", color: "bg-yellow-100 text-yellow-700" },
};

export default function Stock() {
  const user = getStoredUser();
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [totalMovements, setTotalMovements] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [productFilter, setProductFilter] = useState<number | "">("");
  const [typeFilter, setTypeFilter] = useState("");

  const fetchMovements = useCallback(async () => {
    setLoading(true);
    try {
      const movRes = await getStockMovements({
        page,
        limit: 15,
        productId: productFilter || undefined,
        type: typeFilter || undefined,
      });
      setMovements(movRes.data || []);
      setTotalMovements(movRes.pagination?.total || 0);
      setTotalPages(movRes.pagination?.totalPages || 1);
    } catch {
      toast.error("Erreur chargement des mouvements");
    } finally {
      setLoading(false);
    }
  }, [page, productFilter, typeFilter]);

  useEffect(() => {
    getProducts({ limit: 500 })
      .then((res) => setProducts(res.data))
      .catch(() => toast.error("Erreur chargement des produits"));
  }, []);

  useEffect(() => {
    fetchMovements();
  }, [fetchMovements]);

  if (!user) {
    toast.error("User Not found");
    return null;
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Mouvements de stock
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Historique complet des entrées, sorties et ventes.
          </p>
        </div>
        <Link
          to="/products"
          className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700"
        >
          + Gérer les produits
        </Link>
      </div>

      <p className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-sm text-slate-600">
        Pour ajouter ou retirer du stock, utilisez les boutons{" "}
        <strong>Entrée</strong> / <strong>Sortie</strong> sur la fiche de
        chaque produit, dans la page{" "}
        <Link to="/products" className="text-emerald-700 hover:underline">
          Produits
        </Link>
        .
      </p>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={productFilter}
          onChange={(e) => {
            setProductFilter(e.target.value ? Number(e.target.value) : "");
            setPage(1);
          }}
          className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
        >
          <option value="">Tous les produits</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
        >
          <option value="">Tous les types</option>
          <option value="ENTRY">Entrées</option>
          <option value="OUT">Sorties</option>
          <option value="SALE">Ventes</option>
          <option value="ADJUST">Ajustements</option>
        </select>
        <button
          onClick={() => exportStockToExcel(movements, user)}
          className="flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm transition border-gray-300 text-gray-700 hover:bg-gray-50 cursor-pointer"
        >
          <Download size={15} />
          <span>Excel</span>
        </button>
      </div>

      {/* Historique */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900">
            {totalMovements} mouvement(s)
          </h3>
        </div>

        {loading ? (
          <p className="text-center text-gray-400 py-8">Chargement...</p>
        ) : !movements.length ? (
          <p className="text-center text-gray-400 py-8">
            Aucun mouvement enregistré.
          </p>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto lg:block">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-gray-500 text-xs uppercase">
                    <th className="pb-3 pr-4">Produit</th>
                    <th className="pb-3 pr-4">Type</th>
                    <th className="pb-3 pr-4">Qté</th>
                    <th className="pb-3 pr-4">Fournisseur</th>
                    <th className="pb-3 pr-4">Utilisateur</th>
                    <th className="pb-3 pr-4">Note</th>
                    <th className="pb-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {movements.map((m) => (
                    <tr key={m.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 pr-4 font-medium text-slate-900">
                        {m.product?.name || "-"}
                      </td>
                      <td className="py-3 pr-4">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-medium ${typeLabel[m.type]?.color}`}
                        >
                          {typeLabel[m.type]?.label || m.type}
                        </span>
                      </td>
                      <td className="py-3 pr-4 font-medium">
                        {fmt(m.quantity)}
                      </td>
                      <td className="py-3 pr-4 text-gray-500">
                        {m.supplier?.name || "-"}
                      </td>
                      <td className="py-3 pr-4 text-gray-500">
                        {m.user?.name || "-"}
                      </td>
                      <td className="py-3 pr-4 text-gray-500 max-w-40 truncate">
                        {m.note || "-"}
                      </td>
                      <td className="py-3 text-gray-500">
                        {new Date(m.createdAt).toLocaleString("fr-FR")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="space-y-3 lg:hidden">
              {movements.map((m) => (
                <div
                  key={m.id}
                  className="rounded-xl border border-gray-200 p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {m.product?.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(m.createdAt).toLocaleString("fr-FR")}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${typeLabel[m.type]?.color}`}
                    >
                      {typeLabel[m.type]?.label}
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-xs text-gray-400">Quantité</p>
                      <p className="font-medium">{fmt(m.quantity)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400">Fournisseur</p>
                      <p className="font-medium">{m.supplier?.name || "-"}</p>
                    </div>
                    {m.note && (
                      <div className="col-span-2">
                        <p className="text-xs text-gray-400">Note</p>
                        <p className="font-medium">{m.note}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-5 flex items-center justify-center gap-3">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                >
                  ← Précédent
                </button>
                <span className="text-sm text-gray-500">
                  Page {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                >
                  Suivant →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}
