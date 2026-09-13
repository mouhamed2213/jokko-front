import { BarChart3, Lock, Package, Search } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getProducts,
  getSupplierPriceComparison,
  getSupplierProducts,
  getSupplierRanking,
  getSuppliers,
  type SupplierPriceComparison,
  type SupplierProducts,
  type SupplierRankingEntry,
} from "../services/index";
import type { Product, Supplier } from "../types/index";

const fmt = (v: number) => `${v.toLocaleString("fr-FR")} FCFA`;

type Props = {
  locked: boolean;
  onUpgradeClick: () => void;
};

export default function SupplierAnalyticsTab({ locked, onUpgradeClick }: Props) {
  const [productSearch, setProductSearch] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [comparison, setComparison] = useState<SupplierPriceComparison | null>(
    null,
  );
  const [loadingComparison, setLoadingComparison] = useState(false);

  const [ranking, setRanking] = useState<SupplierRankingEntry[]>([]);
  const [rankingSort, setRankingSort] = useState<
    "purchases" | "debt" | "deliveries"
  >("purchases");
  const [rankingPage, setRankingPage] = useState(1);
  const [rankingTotalPages, setRankingTotalPages] = useState(1);
  const [loadingRanking, setLoadingRanking] = useState(true);

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState<number | "">(
    "",
  );
  const [supplierProducts, setSupplierProducts] =
    useState<SupplierProducts | null>(null);
  const [loadingSupplierProducts, setLoadingSupplierProducts] =
    useState(false);

  useEffect(() => {
    if (locked) return;
    getSuppliers({ limit: 200 })
      .then((res) => setSuppliers(res.data))
      .catch(() => toast.error("Erreur chargement fournisseurs"));
  }, [locked]);

  useEffect(() => {
    if (locked || !selectedSupplierId) {
      return;
    }
    const fetchSupplierProducts = async () => {
      setLoadingSupplierProducts(true);
      try {
        const res = await getSupplierProducts(Number(selectedSupplierId));
        setSupplierProducts(res);
      } catch {
        toast.error("Erreur chargement des produits du fournisseur");
      } finally {
        setLoadingSupplierProducts(false);
      }
    };
    fetchSupplierProducts();
  }, [locked, selectedSupplierId]);

  useEffect(() => {
    if (locked) return;
    const fetchRanking = async () => {
      setLoadingRanking(true);
      try {
        const res = await getSupplierRanking(rankingSort, rankingPage, 10);
        setRanking(res.data);
        setRankingTotalPages(res.pagination.totalPages);
      } catch {
        toast.error("Erreur chargement classement fournisseurs");
      } finally {
        setLoadingRanking(false);
      }
    };
    fetchRanking();
  }, [locked, rankingSort, rankingPage]);

  useEffect(() => {
    if (locked || !productSearch.trim()) {
      return;
    }
    const timeout = window.setTimeout(() => {
      getProducts({ search: productSearch.trim(), limit: 8 })
        .then((res) => setProducts(res.data))
        .catch(() => toast.error("Erreur recherche produits"));
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [locked, productSearch]);

  const pickProduct = (product: Product) => {
    setSelectedProduct(product);
    setProductSearch("");
    setProducts([]);
    setLoadingComparison(true);
    getSupplierPriceComparison(product.id)
      .then(setComparison)
      .catch(() => toast.error("Erreur comparaison des prix"))
      .finally(() => setLoadingComparison(false));
  };

  if (locked) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-amber-300 bg-amber-50 px-6 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <Lock size={22} />
        </div>
        <p className="font-semibold text-slate-900">
          Les analyses fournisseurs sont réservées aux plans Pro et Premium
        </p>
        <p className="max-w-md text-sm text-slate-500">
          Comparez les prix entre fournisseurs et classez-les par volume
          d'achat ou par dette.
        </p>
        <button
          type="button"
          onClick={onUpgradeClick}
          className="mt-2 rounded-xl bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 transition"
        >
          Voir les plans
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Comparaison de prix */}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
          <BarChart3 size={18} className="text-emerald-600" />
          Comparaison de prix par produit
        </h3>
        <p className="mt-0.5 text-sm text-gray-500">
          Choisissez un produit pour voir le prix pratiqué par chacun de vos
          fournisseurs.
        </p>

        <div className="relative mt-4 max-w-sm">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={selectedProduct ? selectedProduct.name : productSearch}
            onChange={(e) => {
              setSelectedProduct(null);
              setComparison(null);
              setProductSearch(e.target.value);
            }}
            placeholder="Rechercher un produit..."
            className="w-full rounded-xl border border-gray-300 py-2.5 pl-9 pr-4 text-sm outline-none focus:border-emerald-500"
          />
          {productSearch.trim() && products.length > 0 && (
            <div className="absolute z-10 mt-1 w-full max-h-48 overflow-y-auto rounded-xl border bg-white shadow-lg">
              {products.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => pickProduct(p)}
                  className="block w-full px-4 py-2 text-left text-sm hover:bg-emerald-50"
                >
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {loadingComparison && (
          <p className="mt-4 text-sm text-gray-400">Chargement...</p>
        )}

        {!loadingComparison && comparison && (
          <div className="mt-4">
            {!comparison.suppliers.length ? (
              <p className="text-sm text-gray-400">
                Aucune livraison de ce produit n'a encore été liée à un
                fournisseur.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b text-gray-500 text-xs uppercase">
                      <th className="pb-2 pr-4">Fournisseur</th>
                      <th className="pb-2 pr-4">Dernier prix</th>
                      <th className="pb-2 pr-4">Min</th>
                      <th className="pb-2 pr-4">Max</th>
                      <th className="pb-2 pr-4">Moyenne</th>
                      <th className="pb-2">Livraisons</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comparison.suppliers.map((s, i) => (
                      <tr key={s.supplierId} className="border-b">
                        <td className="py-2 pr-4 font-medium text-slate-900">
                          {s.supplierName}
                          {i === 0 && (
                            <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                              Moins cher
                            </span>
                          )}
                        </td>
                        <td className="py-2 pr-4 font-semibold">
                          {fmt(s.lastUnitCost)}
                        </td>
                        <td className="py-2 pr-4 text-gray-500">
                          {fmt(s.minUnitCost)}
                        </td>
                        <td className="py-2 pr-4 text-gray-500">
                          {fmt(s.maxUnitCost)}
                        </td>
                        <td className="py-2 pr-4 text-gray-500">
                          {fmt(Math.round(s.avgUnitCost))}
                        </td>
                        <td className="py-2 text-gray-500">{s.deliveries}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Classement fournisseurs */}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-base font-bold text-slate-900">
            Classement des fournisseurs
          </h3>
          <select
            value={rankingSort}
            onChange={(e) => {
              setRankingSort(e.target.value as typeof rankingSort);
              setRankingPage(1);
            }}
            className="rounded-xl border border-gray-300 px-3 py-2 text-sm outline-none focus:border-emerald-500"
          >
            <option value="purchases">Par montant acheté</option>
            <option value="debt">Par dette due</option>
            <option value="deliveries">Par nombre de livraisons</option>
          </select>
        </div>

        {loadingRanking ? (
          <p className="mt-4 text-sm text-gray-400">Chargement...</p>
        ) : !ranking.length ? (
          <p className="mt-4 text-sm text-gray-400">Aucun fournisseur.</p>
        ) : (
          <div className="mt-4 space-y-2">
            {ranking.map((s, i) => (
              <div
                key={s.id}
                className="flex items-center justify-between rounded-xl border border-gray-100 px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                    {(rankingPage - 1) * 10 + i + 1}
                  </span>
                  <p className="font-medium text-slate-900">{s.name}</p>
                </div>
                <div className="flex gap-6 text-right text-sm">
                  <div>
                    <p className="text-xs text-gray-400">Acheté</p>
                    <p className="font-semibold text-slate-700">
                      {fmt(s.totalPurchases)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Dette</p>
                    <p
                      className={`font-semibold ${s.totalDebt > 0 ? "text-red-600" : "text-emerald-600"}`}
                    >
                      {fmt(s.totalDebt)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Livraisons</p>
                    <p className="font-semibold text-slate-700">
                      {s.deliveries}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loadingRanking && rankingTotalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setRankingPage((p) => Math.max(1, p - 1))}
              disabled={rankingPage === 1}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
            >
              ← Précédent
            </button>
            <span className="text-sm text-gray-500">
              Page {rankingPage} / {rankingTotalPages}
            </span>
            <button
              type="button"
              onClick={() =>
                setRankingPage((p) => Math.min(rankingTotalPages, p + 1))
              }
              disabled={rankingPage === rankingTotalPages}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
            >
              Suivant →
            </button>
          </div>
        )}
      </div>

      {/* Produits par fournisseur */}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
          <Package size={18} className="text-emerald-600" />
          Produits par fournisseur
        </h3>
        <p className="mt-0.5 text-sm text-gray-500">
          Choisissez un fournisseur pour voir quels produits il vous a déjà
          livrés.
        </p>

        <select
          value={selectedSupplierId}
          onChange={(e) =>
            setSelectedSupplierId(
              e.target.value ? Number(e.target.value) : "",
            )
          }
          className="mt-4 w-full max-w-sm rounded-xl border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-emerald-500"
        >
          <option value="">Sélectionner un fournisseur...</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {loadingSupplierProducts && (
          <p className="mt-4 text-sm text-gray-400">Chargement...</p>
        )}

        {!loadingSupplierProducts && selectedSupplierId && supplierProducts && (
          <div className="mt-4">
            {!supplierProducts.products.length ? (
              <p className="text-sm text-gray-400">
                Aucune livraison enregistrée pour ce fournisseur pour
                l'instant.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b text-gray-500 text-xs uppercase">
                      <th className="pb-2 pr-4">Produit</th>
                      <th className="pb-2 pr-4">Dernier prix</th>
                      <th className="pb-2 pr-4">Qté totale livrée</th>
                      <th className="pb-2 pr-4">Livraisons</th>
                      <th className="pb-2">Dernière livraison</th>
                    </tr>
                  </thead>
                  <tbody>
                    {supplierProducts.products.map((p) => (
                      <tr key={p.productId} className="border-b">
                        <td className="py-2 pr-4 font-medium text-slate-900">
                          {p.productName}
                        </td>
                        <td className="py-2 pr-4">
                          {p.lastUnitCost !== null
                            ? fmt(p.lastUnitCost)
                            : "-"}
                        </td>
                        <td className="py-2 pr-4 text-gray-500">
                          {p.totalQuantity}
                        </td>
                        <td className="py-2 pr-4 text-gray-500">
                          {p.deliveries}
                        </td>
                        <td className="py-2 text-gray-500">
                          {new Date(p.lastDate).toLocaleDateString("fr-FR")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
