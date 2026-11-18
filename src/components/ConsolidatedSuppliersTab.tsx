import { Lock, Store } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  getConsolidatedSuppliers,
  type ConsolidatedSuppliers,
} from "../services/index";

const fmt = (v: number) => `${v.toLocaleString("fr-FR").replace(/\u202f/g, " ")} FCFA`;

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
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-sun/60 bg-sun/20 px-6 py-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sun/20 text-ink">
          <Lock size={22} />
        </div>
        <p className="font-semibold text-ink">
          La vue consolidée multi-boutique est réservée aux plans Pro et
          Premium
        </p>
        <p className="max-w-md text-sm text-ink/60">
          Voyez la dette fournisseur totale sur toutes vos boutiques, chacune
          gardant sa propre comptabilité.
        </p>
        <button
          type="button"
          onClick={onUpgradeClick}
          className="mt-2 rounded-full bg-sun px-4 py-2 text-sm font-medium text-white hover:bg-sun transition"
        >
          Voir les plans
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-2xl bg-paper p-8 text-center text-ink/45">
        Chargement...
      </div>
    );
  }

  if (!data || data.shops.length <= 1) {
    return (
      <div className="rounded-2xl bg-paper p-8 text-center text-ink/45">
        Vous ne gérez qu'une seule boutique pour le moment — la vue
        consolidée deviendra utile dès qu'une deuxième boutique sera créée.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-jokko/10 border border-jokko/25 px-5 py-4">
        <p className="text-sm font-semibold text-jokko-deep">
          Dette fournisseur totale — {data.shops.length} boutique(s)
        </p>
        <p className="mt-1 text-2xl font-bold text-jokko-deep">
          {fmt(data.grandTotalDebt)}
        </p>
        <p className="mt-1 text-xs text-jokko-deep">
          {data.grandTotalSuppliers} fournisseur(s) au total
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {data.shops.map((shop) => (
          <div
            key={shop.shopId}
            className="rounded-3xl border border-ink/10 bg-paper p-5"
          >
            <div className="flex items-center gap-2">
              <Store size={16} className="text-ink/45" />
              <p className="font-semibold text-ink">{shop.shopName}</p>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
              <div>
                <p className="text-xs text-ink/45">Fournisseurs</p>
                <p className="font-semibold text-ink/75">
                  {shop.supplierCount}
                </p>
              </div>
              <div>
                <p className="text-xs text-ink/45">Acheté</p>
                <p className="font-semibold text-ink/75">
                  {fmt(shop.totalPurchases)}
                </p>
              </div>
              <div>
                <p className="text-xs text-ink/45">Dette due</p>
                <p
                  className={`font-semibold ${shop.totalDebt > 0 ? "text-red-600" : "text-jokko-deep"}`}
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
