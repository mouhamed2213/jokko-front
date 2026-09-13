import { ChevronDown, ChevronUp, Lock, Package } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getSupplierProducts,
  getSupplierRanking,
  type SupplierProducts,
  type SupplierRankingEntry,
} from "../services/index";

const fmt = (v: number) => `${v.toLocaleString("fr-FR")} FCFA`;

type Props = {
  locked: boolean;
  onUpgradeClick: () => void;
};

export default function SupplierAnalyticsTab({ locked, onUpgradeClick }: Props) {
  const [ranking, setRanking] = useState<SupplierRankingEntry[]>([]);
  const [rankingSort, setRankingSort] = useState<
    "purchases" | "debt" | "deliveries"
  >("purchases");
  const [rankingPage, setRankingPage] = useState(1);
  const [rankingTotalPages, setRankingTotalPages] = useState(1);
  const [loadingRanking, setLoadingRanking] = useState(true);

  // Fournisseur déplié pour voir ses produits
  const [expandedSupplierId, setExpandedSupplierId] = useState<number | null>(
    null,
  );
  const [supplierProducts, setSupplierProducts] =
    useState<SupplierProducts | null>(null);
  const [loadingSupplierProducts, setLoadingSupplierProducts] =
    useState(false);

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

  const toggleSupplier = async (supplierId: number) => {
    if (expandedSupplierId === supplierId) {
      setExpandedSupplierId(null);
      return;
    }
    setExpandedSupplierId(supplierId);
    setSupplierProducts(null);
    setLoadingSupplierProducts(true);
    try {
      const res = await getSupplierProducts(supplierId);
      setSupplierProducts(res);
    } catch {
      toast.error("Erreur chargement des produits du fournisseur");
    } finally {
      setLoadingSupplierProducts(false);
    }
  };

  if (locked) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-amber-300 bg-amber-50 px-6 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <Lock size={22} />
        </div>
        <p className="font-semibold text-slate-900">
          La performance fournisseurs est réservée aux plans Pro et Premium
        </p>
        <p className="max-w-md text-sm text-slate-500">
          Classez vos fournisseurs par volume d'achat ou par dette, et voyez
          quels produits viennent de chacun.
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
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Classement des fournisseurs
            </h3>
            <p className="mt-0.5 text-sm text-gray-500">
              Cliquez sur un fournisseur pour voir les produits qu'il vous a
              livrés.
            </p>
          </div>
          <select
            value={rankingSort}
            onChange={(e) => {
              setRankingSort(e.target.value as typeof rankingSort);
              setRankingPage(1);
              setExpandedSupplierId(null);
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
                className="rounded-xl border border-gray-100 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleSupplier(s.id)}
                  className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-50"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                      {(rankingPage - 1) * 10 + i + 1}
                    </span>
                    <p className="font-medium text-slate-900">{s.name}</p>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right text-sm">
                      <p className="text-xs text-gray-400">Acheté</p>
                      <p className="font-semibold text-slate-700">
                        {fmt(s.totalPurchases)}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-xs text-gray-400">Dette</p>
                      <p
                        className={`font-semibold ${s.totalDebt > 0 ? "text-red-600" : "text-emerald-600"}`}
                      >
                        {fmt(s.totalDebt)}
                      </p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-xs text-gray-400">Livraisons</p>
                      <p className="font-semibold text-slate-700">
                        {s.deliveries}
                      </p>
                    </div>
                    {expandedSupplierId === s.id ? (
                      <ChevronUp size={16} className="text-gray-400" />
                    ) : (
                      <ChevronDown size={16} className="text-gray-400" />
                    )}
                  </div>
                </button>

                {expandedSupplierId === s.id && (
                  <div className="border-t border-gray-100 bg-slate-50 px-4 py-3">
                    <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <Package size={13} />
                      Produits livrés par {s.name}
                    </div>
                    {loadingSupplierProducts ? (
                      <p className="text-sm text-gray-400">Chargement...</p>
                    ) : !supplierProducts?.products.length ? (
                      <p className="text-sm text-gray-400">
                        Aucune livraison enregistrée pour ce fournisseur pour
                        l'instant.
                      </p>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                          <thead>
                            <tr className="border-b border-gray-200 text-gray-500 text-xs uppercase">
                              <th className="pb-2 pr-4">Produit</th>
                              <th className="pb-2 pr-4">Dernier prix</th>
                              <th className="pb-2 pr-4">Qté totale livrée</th>
                              <th className="pb-2 pr-4">Livraisons</th>
                              <th className="pb-2">Dernière livraison</th>
                            </tr>
                          </thead>
                          <tbody>
                            {supplierProducts.products.map((p) => (
                              <tr
                                key={p.productId}
                                className="border-b border-gray-200 last:border-0"
                              >
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
                                  {new Date(p.lastDate).toLocaleDateString(
                                    "fr-FR",
                                  )}
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
            ))}
          </div>
        )}

        {!loadingRanking && rankingTotalPages > 1 && (
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setExpandedSupplierId(null);
                setRankingPage((p) => Math.max(1, p - 1));
              }}
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
              onClick={() => {
                setExpandedSupplierId(null);
                setRankingPage((p) => Math.min(rankingTotalPages, p + 1));
              }}
              disabled={rankingPage === rankingTotalPages}
              className="rounded-xl border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
            >
              Suivant →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
