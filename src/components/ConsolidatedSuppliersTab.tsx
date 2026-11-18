import { Lock, Store } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getConsolidatedSuppliers,
  type ConsolidatedSuppliers,
} from "../services/index";

const fmt = (v: number) => `${v.toLocaleString("fr-FR")} FCFA`;

type Props = {
  locked: boolean;
  onUpgradeClick: () => void;
};

export default function ConsolidatedSuppliersTab({
  locked,
  onUpgradeClick,
}: Props) {
  const [data, setData] = useState<ConsolidatedSuppliers | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (locked) return;
    getConsolidatedSuppliers()
      .then(setData)
      .catch(() => toast.error("Erreur chargement vue consolidée"))
      .finally(() => setLoading(false));
  }, [locked]);

  if (locked) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-amber-300 bg-amber-50 px-6 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <Lock size={22} />
        </div>
        <p className="font-semibold text-slate-900">
          La vue consolidée multi-boutique est réservée aux plans Pro et
          Premium
        </p>
        <p className="max-w-md text-sm text-slate-500">
          Voyez la dette fournisseur totale sur toutes vos boutiques, chacune
          gardant sa propre comptabilité.
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

  if (loading) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center text-gray-400">
        Chargement...
      </div>
    );
  }

  if (!data || data.shops.length <= 1) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center text-gray-400">
        Vous ne gérez qu'une seule boutique pour le moment — la vue
        consolidée deviendra utile dès qu'une deuxième boutique sera créée.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-emerald-50 border border-emerald-200 px-5 py-4">
        <p className="text-sm font-semibold text-emerald-800">
          Dette fournisseur totale — {data.shops.length} boutique(s)
        </p>
        <p className="mt-1 text-2xl font-bold text-emerald-900">
          {fmt(data.grandTotalDebt)}
        </p>
        <p className="mt-1 text-xs text-emerald-700">
          {data.grandTotalSuppliers} fournisseur(s) au total
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {data.shops.map((shop) => (
          <div
            key={shop.shopId}
            className="rounded-2xl bg-white p-5 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Store size={16} className="text-slate-400" />
              <p className="font-semibold text-slate-900">{shop.shopName}</p>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-xs text-gray-400">Fournisseurs</p>
                <p className="font-semibold text-slate-700">
                  {shop.supplierCount}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Acheté</p>
                <p className="font-semibold text-slate-700">
                  {fmt(shop.totalPurchases)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400">Dette due</p>
                <p
                  className={`font-semibold ${shop.totalDebt > 0 ? "text-red-600" : "text-emerald-600"}`}
                >
                  {fmt(shop.totalDebt)}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
